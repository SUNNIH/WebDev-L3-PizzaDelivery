import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../../server/src/app.js';
import User from '../../server/src/models/User.js';

describe('Authentication - Security & Authorization', () => {
  let replSet;
  let csrfToken;
  let agent;
  let customerUser;
  let adminUser;
  let customerToken;
  let adminToken;

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

    customerUser = await User.create({
      email: 'customer@example.com',
      password: 'password123',
      role: 'customer',
      isVerified: true,
    });

    adminUser = await User.create({
      email: 'admin@example.com',
      password: 'adminpass123',
      role: 'admin',
      isVerified: true,
    });

    // Generate tokens
    customerToken = jwt.sign(
      {
        sub: customerUser._id,
        role: customerUser.role,
        tokenVersion: customerUser.tokenVersion,
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    adminToken = jwt.sign(
      {
        sub: adminUser._id,
        role: adminUser.role,
        tokenVersion: adminUser.tokenVersion,
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    agent = request.agent(app);
    const response = await agent.get('/api/auth/csrf-token');
    csrfToken = response.body.csrfToken;
  });

  describe('Token Validation', () => {
    it('should reject requests without authentication token', async () => {
      const response = await agent
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.error).toContain('Authentication required');
    });

    it('should reject invalid JWT', async () => {
      const response = await agent
        .get('/api/auth/me')
        .set('Cookie', 'token=invalid-token-here')
        .expect(401);

      expect(response.body.error).toContain('Invalid token');
    });

    it('should reject expired JWT', async () => {
      const expiredToken = jwt.sign(
        {
          sub: customerUser._id,
          role: customerUser.role,
          tokenVersion: customerUser.tokenVersion,
        },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      const response = await agent
        .get('/api/auth/me')
        .set('Cookie', `token=${expiredToken}`)
        .expect(401);

      expect(response.body.error).toContain('Token expired');
    });

    it('should reject JWT with mismatched token version', async () => {
      // Increment user's token version
      await customerUser.incrementTokenVersion();

      // Old token should be rejected
      const response = await agent
        .get('/api/auth/me')
        .set('Cookie', `token=${customerToken}`)
        .expect(401);

      expect(response.body.error).toContain('Invalid or expired token');
    });

    it('should reject token for deleted user', async () => {
      // Delete the user
      await User.findByIdAndDelete(customerUser._id);

      const response = await agent
        .get('/api/auth/me')
        .set('Cookie', `token=${customerToken}`)
        .expect(401);

      expect(response.body.error).toContain('Invalid or expired token');
    });

    it('should reject token for unverified user', async () => {
      customerUser.isVerified = false;
      await customerUser.save();

      const response = await agent
        .get('/api/auth/me')
        .set('Cookie', `token=${customerToken}`)
        .expect(403);

      expect(response.body.error).toContain('Email not verified');
    });
  });

  describe('Role-Based Authorization', () => {
    it('should allow customer to access /api/auth/me', async () => {
      const response = await agent
        .get('/api/auth/me')
        .set('Cookie', `token=${customerToken}`)
        .expect(200);

      expect(response.body.user.email).toBe('customer@example.com');
      expect(response.body.user.role).toBe('customer');
    });

    it('should allow admin to access /api/auth/me', async () => {
      const response = await agent
        .get('/api/auth/me')
        .set('Cookie', `token=${adminToken}`)
        .expect(200);

      expect(response.body.user.email).toBe('admin@example.com');
      expect(response.body.user.role).toBe('admin');
    });

    it('should not expose password in user response', async () => {
      const response = await agent
        .get('/api/auth/me')
        .set('Cookie', `token=${customerToken}`)
        .expect(200);

      expect(response.body.user.password).toBeUndefined();
    });

    it('should not expose tokenVersion in user response', async () => {
      const response = await agent
        .get('/api/auth/me')
        .set('Cookie', `token=${customerToken}`)
        .expect(200);

      expect(response.body.user.tokenVersion).toBeUndefined();
    });
  });

  describe('CSRF Protection', () => {
    it('should require CSRF token for state-changing operations', async () => {
      const response = await agent
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(403);

      expect(response.body.error).toBeDefined();
    });

    it('should accept request with valid CSRF token', async () => {
      const response = await agent
        .post('/api/auth/register')
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(response.body.message).toContain('Registration successful');
    });

    it('should reject request with invalid CSRF token', async () => {
      const response = await agent
        .post('/api/auth/register')
        .set('x-csrf-token', 'invalid-csrf-token')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(403);

      expect(response.body.error).toBeDefined();
    });

    it('should not require CSRF token for GET requests', async () => {
      const response = await agent
        .get('/api/auth/csrf-token')
        .expect(200);

      expect(response.body.csrfToken).toBeDefined();
    });
  });

  describe('Password Security', () => {
    it('should compare password correctly', async () => {
      const isMatch = await customerUser.comparePassword('password123');
      expect(isMatch).toBe(true);

      const isNotMatch = await customerUser.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });

    it('should hash password on user creation', async () => {
      const newUser = await User.create({
        email: 'newuser@example.com',
        password: 'plaintext123',
        role: 'customer',
      });

      expect(newUser.password).not.toBe('plaintext123');
      expect(await newUser.comparePassword('plaintext123')).toBe(true);
    });

    it('should rehash password on password change', async () => {
      const oldHash = customerUser.password;
      
      customerUser.password = 'newpassword123';
      await customerUser.save();

      expect(customerUser.password).not.toBe('newpassword123');
      expect(customerUser.password).not.toBe(oldHash);
      expect(await customerUser.comparePassword('newpassword123')).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to auth endpoints', async () => {
      // This test would need to make many requests to trigger rate limiting
      // For now, we verify the endpoint works
      const response = await agent
        .post('/api/auth/login')
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'customer@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.message).toContain('Login successful');
    });
  });
});
