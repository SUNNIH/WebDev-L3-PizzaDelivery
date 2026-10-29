import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../server/src/app.js';
import User from '../../server/src/models/User.js';

describe('Authentication - Login', () => {
  let replSet;
  let csrfToken;
  let agent;
  let verifiedCustomer;
  let unverifiedCustomer;
  let adminUser;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-jwt-secret-min-32-characters-long-for-testing';
    process.env.CSRF_SECRET = 'test-csrf-secret-min-32-characters-long-for-testing';

    replSet = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    });

    const uri = replSet.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await replSet.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});

    // Create test users
    verifiedCustomer = await User.create({
      email: 'verified@example.com',
      password: 'password123',
      role: 'customer',
      isVerified: true,
    });

    unverifiedCustomer = await User.create({
      email: 'unverified@example.com',
      password: 'password123',
      role: 'customer',
      isVerified: false,
    });

    adminUser = await User.create({
      email: 'admin@example.com',
      password: 'adminpass123',
      role: 'admin',
      isVerified: true,
    });

    // Preserve CSRF session cookies across requests in each test.
    agent = request.agent(app);

    const response = await agent
      .get('/api/auth/csrf-token')
      .expect(200);

    csrfToken = response.body.csrfToken;
  });

  describe('Customer Login', () => {
    it('should login verified customer with correct credentials', async () => {
      const response = await agent
        .post('/api/auth/login')
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'verified@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.message).toContain('Login successful');
      expect(response.body.user.email).toBe('verified@example.com');
      expect(response.body.user.role).toBe('customer');
      expect(response.body.csrfToken).toBeDefined();

      // Check cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(c => c.startsWith('token='))).toBe(true);
    });

    it('should reject login with wrong password', async () => {
      const response = await agent
        .post('/api/auth/login')
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'verified@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.error).toContain('Invalid email or password');
    });

    it('should reject login with non-existent email', async () => {
      const response = await agent
        .post('/api/auth/login')
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.error).toContain('Invalid email or password');
    });

    it('should reject unverified customer login', async () => {
      const response = await agent
        .post('/api/auth/login')
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'unverified@example.com',
          password: 'password123',
        })
        .expect(403);

      expect(response.body.error).toContain('verify your email');
    });

    it('should prevent admin from using customer login', async () => {
      const response = await agent
        .post('/api/auth/login')
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'admin@example.com',
          password: 'adminpass123',
        })
        .expect(403);

      expect(response.body.error).toContain('admin login');
    });

    it('should set HttpOnly cookie', async () => {
      const response = await agent
        .post('/api/auth/login')
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'verified@example.com',
          password: 'password123',
        })
        .expect(200);

      const cookies = response.headers['set-cookie'];
      const tokenCookie = cookies.find(c => c.startsWith('token='));
      expect(tokenCookie).toContain('HttpOnly');
    });
  });

  describe('Admin Login', () => {
    it('should login admin with correct credentials at admin endpoint', async () => {
      const response = await agent
        .post('/api/auth/admin-login')
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'admin@example.com',
          password: 'adminpass123',
        })
        .expect(200);

      expect(response.body.message).toContain('Admin login successful');
      expect(response.body.user.role).toBe('admin');
    });

    it('should reject customer login at admin endpoint', async () => {
      const response = await agent
        .post('/api/auth/admin-login')
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'verified@example.com',
          password: 'password123',
        })
        .expect(403);

      expect(response.body.error).toContain('Access denied');
    });

    it('should reject wrong admin password', async () => {
      const response = await agent
        .post('/api/auth/admin-login')
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'admin@example.com',
          password: 'wrongpass',
        })
        .expect(401);

      expect(response.body.error).toContain('Invalid credentials');
    });
  });

  describe('Logout', () => {
    it('should clear auth cookie on logout', async () => {
      // Login first
      const loginResponse = await agent
        .post('/api/auth/login')
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'verified@example.com',
          password: 'password123',
        })
        .expect(200);

      const loginCookies = loginResponse.headers['set-cookie'];
      expect(loginCookies.some(c => c.startsWith('token='))).toBe(true);

      // Use the same agent so session cookies survive the login/logout flow.
      const logoutResponse = await agent
        .post('/api/auth/logout')
        .set('x-csrf-token', loginResponse.body.csrfToken)
        .expect(200);

      expect(logoutResponse.body.message).toContain('Logout successful');

      const logoutCookies = logoutResponse.headers['set-cookie'];
      expect(logoutCookies.some(c => c.includes('token=;'))).toBe(true);
    });
  });
});
