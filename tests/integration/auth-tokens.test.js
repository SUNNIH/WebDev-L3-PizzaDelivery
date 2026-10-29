import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../server/src/app.js';
import User from '../../server/src/models/User.js';
import AuthToken from '../../server/src/models/AuthToken.js';

describe('Authentication - Email Verification & Password Reset', () => {
  let replSet;
  let csrfToken;
  let agent;
  let testUser;

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

    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      role: 'customer',
      isVerified: false,
    });

    // Maintain the same browser session for CSRF-protected password requests.
    agent = request.agent(app);
    const response = await agent
      .get('/api/auth/csrf-token')
      .expect(200);
    csrfToken = response.body.csrfToken;
  });

  describe('Email Verification', () => {
    it('should verify email with valid token', async () => {
      const token = await AuthToken.createVerificationToken(testUser._id);

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token })
        .expect(200);

      expect(response.body.message).toContain('verified successfully');

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.isVerified).toBe(true);
    });

    it('should reject invalid verification token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'invalid-token-123' })
        .expect(400);

      expect(response.body.error).toContain('Invalid or expired');
    });

    it('should reject reused verification token', async () => {
      const token = await AuthToken.createVerificationToken(testUser._id);

      // Use token once
      await request(app)
        .post('/api/auth/verify-email')
        .send({ token })
        .expect(200);

      // Try to use again
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token })
        .expect(400);

      expect(response.body.error).toContain('Invalid or expired');
    });

    it('should reject expired verification token', async () => {
      const token = await AuthToken.createVerificationToken(testUser._id);

      // Manually expire the token
      await AuthToken.updateOne(
        { userId: testUser._id },
        { expiresAt: new Date(Date.now() - 1000) }
      );

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token })
        .expect(400);

      expect(response.body.error).toContain('Invalid or expired');
    });

    it('should handle already verified email', async () => {
      testUser.isVerified = true;
      await testUser.save();

      const token = await AuthToken.createVerificationToken(testUser._id);

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token })
        .expect(400);

      expect(response.body.error).toContain('already verified');
    });
  });

  describe('Password Reset', () => {
    it('should send generic response for forgot-password regardless of email', async () => {
      const response = await agent
        .post('/api/auth/forgot-password')
        .set('x-csrf-token', csrfToken)
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.message).toContain('If the email exists');
    });

    it('should create password reset token for existing user', async () => {
      await agent
        .post('/api/auth/forgot-password')
        .set('x-csrf-token', csrfToken)
        .send({ email: testUser.email })
        .expect(200);

      const token = await AuthToken.findOne({
        userId: testUser._id,
        type: 'passwordReset',
      });

      expect(token).toBeDefined();
      expect(token.used).toBe(false);
    });

    it('should reset password with valid token', async () => {
      const token = await AuthToken.createPasswordResetToken(testUser._id);
      const oldPasswordHash = testUser.password;

      const response = await agent
        .post('/api/auth/reset-password')
        .set('x-csrf-token', csrfToken)
        .send({
          token,
          password: 'newpassword123',
        })
        .expect(200);

      expect(response.body.message).toContain('Password reset successful');

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.password).not.toBe(oldPasswordHash);
      expect(await updatedUser.comparePassword('newpassword123')).toBe(true);
    });

    it('should increment token version on password reset', async () => {
      const oldVersion = testUser.tokenVersion;
      const token = await AuthToken.createPasswordResetToken(testUser._id);

      await agent
        .post('/api/auth/reset-password')
        .set('x-csrf-token', csrfToken)
        .send({
          token,
          password: 'newpassword123',
        })
        .expect(200);

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.tokenVersion).toBe(oldVersion + 1);
    });

    it('should invalidate old reset tokens when creating new one', async () => {
      const oldToken = await AuthToken.createPasswordResetToken(testUser._id);
      const newToken = await AuthToken.createPasswordResetToken(testUser._id);

      // Old token should be marked as used
      const oldTokenDoc = await AuthToken.findOne({
        userId: testUser._id,
        type: 'passwordReset',
        used: true,
      });
      expect(oldTokenDoc).toBeDefined();

      // Try to use old token
      const response = await agent
        .post('/api/auth/reset-password')
        .set('x-csrf-token', csrfToken)
        .send({
          token: oldToken,
          password: 'newpass123',
        })
        .expect(400);

      expect(response.body.error).toContain('Invalid or expired');
    });

    it('should enforce minimum password length on reset', async () => {
      const token = await AuthToken.createPasswordResetToken(testUser._id);

      const response = await agent
        .post('/api/auth/reset-password')
        .set('x-csrf-token', csrfToken)
        .send({
          token,
          password: 'short',
        })
        .expect(400);

      expect(response.body.error).toContain('at least 8 characters');
    });
  });
});
