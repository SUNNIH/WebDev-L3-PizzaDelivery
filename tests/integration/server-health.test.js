import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../server/src/app.js';

describe('Server Health Endpoint Tests', () => {
  let replSet;

  beforeAll(async () => {
    // Set up test environment
    process.env.NODE_ENV = 'test';
    process.env.PORT = '5001';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    process.env.CLIENT_URL = 'http://localhost:5173';

    // Create in-memory replica set
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

  it('should return 200 and status ok on GET /health', async () => {
    const response = await request(app)
      .get('/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('database');
    expect(response.body).toHaveProperty('uptime');
  });

  it('should report database connection status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.database).toBe('connected');
  });

  it('should return 404 for unknown routes', async () => {
    const response = await request(app)
      .get('/unknown-route')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body).toHaveProperty('error', 'Not found');
  });
});
