import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../server/src/app.js';
import User from '../../server/src/models/User.js';
import AuthToken from '../../server/src/models/AuthToken.js';

describe('Authentication - Registration', () => {
  let replSet;
  let csrfToken;
  let agent;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-jwt-secret-min-32-characters-long-for-testing';
    process.env.CSRF_SECRET = 'test-csrf-secret-min-32-characters-long-for-testing';
    process.env.EMAIL_HOST = 'test';

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
    await AuthToken.deleteMany({});
    
    // Keep CSRF session cookies with the token for each test.
    agent = request.agent(app);
    const response = await agent.get('/api/auth/csrf-token');
    csrfToken = response.body.csrfToken;
  });

  it('should register a new customer with valid data', async () => {
    const response = await agent
      .post('/api/auth/register')
      .set('x-csrf-token', csrfToken)
      .send({
        email: 'customer@example.com',
        password: 'password123',
      })
      .expect(201);

    expect(response.body.message).toContain('Registration successful');
    expect(response.body.email).toBe('customer@example.com');

    const user = await User.findOne({ email: 'customer@example.com' });
    expect(user).toBeDefined();
    expect(user.role).toBe('customer');
    expect(user.isVerified).toBe(false);
  });

  it('should reject registration with existing email', async () => {
    await User.create({
      email: 'existing@example.com',
      password: 'password123',
      role: 'customer',
    });

    const response = await agent
      .post('/api/auth/register')
      .set('x-csrf-token', csrfToken)
      .send({
        email: 'existing@example.com',
        password: 'password123',
      })
      .expect(400);

    expect(response.body.error).toContain('already registered');
  });

  it('should reject registration with short password', async () => {
    const response = await agent
      .post('/api/auth/register')
      .set('x-csrf-token', csrfToken)
      .send({
        email: 'test@example.com',
        password: 'short',
      })
      .expect(400);

    expect(response.body.error).toContain('at least 8 characters');
  });

  it('should reject registration with invalid email', async () => {
    const response = await agent
      .post('/api/auth/register')
      .set('x-csrf-token', csrfToken)
      .send({
        email: 'invalid-email',
        password: 'password123',
      })
      .expect(400);

    expect(response.body.error).toContain('Invalid email');
  });

  it('should prevent role escalation to admin', async () => {
    const response = await agent
      .post('/api/auth/register')
      .set('x-csrf-token', csrfToken)
      .send({
        email: 'hacker@example.com',
        password: 'password123',
        role: 'admin', // Attempt to set admin role
      })
      .expect(400);

    expect(response.body.error).toContain('Invalid role');

    const user = await User.findOne({ email: 'hacker@example.com' });
    expect(user).toBeNull();
  });

  it('should hash password before storing', async () => {
    await agent
      .post('/api/auth/register')
      .set('x-csrf-token', csrfToken)
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201);

    const user = await User.findOne({ email: 'test@example.com' });
    expect(user.password).not.toBe('password123');
    expect(user.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
  });

  it('should create verification token after registration', async () => {
    await agent
      .post('/api/auth/register')
      .set('x-csrf-token', csrfToken)
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201);

    const user = await User.findOne({ email: 'test@example.com' });
    const token = await AuthToken.findOne({ userId: user._id, type: 'verification' });
    
    expect(token).toBeDefined();
    expect(token.used).toBe(false);
    expect(token.expiresAt).toBeInstanceOf(Date);
  });

  it('should reject registration without CSRF token', async () => {
    const response = await agent
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(403);

    expect(response.body.error).toBeDefined();
  });
});
