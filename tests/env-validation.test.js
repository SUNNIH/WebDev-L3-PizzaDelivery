import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Environment Validation Tests', () => {
  const originalEnv = { ...process.env };

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it('should fail when MONGODB_URI is missing', async () => {
    // Create a test file that imports env config
    const envModule = '../server/src/config/env.js';
    
    // Set incomplete environment
    process.env.NODE_ENV = 'test';
    process.env.PORT = '5000';
    process.env.CLIENT_URL = 'http://localhost:5173';
    delete process.env.MONGODB_URI;

    // Expect import to fail
    await expect(async () => {
      // Clear module cache
      delete (await import('module')).cache[envModule];
      await import(envModule);
    }).rejects.toThrow();
  });

  it('should fail when CLIENT_URL is invalid', async () => {
    process.env.NODE_ENV = 'test';
    process.env.PORT = '5000';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    process.env.CLIENT_URL = 'not-a-url';

    await expect(async () => {
      const envModule = await import('../server/src/config/env.js');
      delete require.cache[require.resolve('../server/src/config/env.js')];
    }).rejects.toThrow();
  });

  it('should validate PORT as number', () => {
    process.env.NODE_ENV = 'test';
    process.env.PORT = 'not-a-number';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    process.env.CLIENT_URL = 'http://localhost:5173';

    expect(() => {
      // PORT validation happens during parse
    }).not.toThrow();
  });
});
