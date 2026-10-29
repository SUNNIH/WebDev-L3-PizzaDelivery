import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import User from '../../server/src/models/User.js';
import { provisionAdmin } from '../../server/src/scripts/createAdmin.js';

const execFileAsync = promisify(execFile);
const cliPath = fileURLToPath(new URL('../../server/src/scripts/createAdmin.js', import.meta.url));

// These tests only ever write to a temporary MongoDB replica set.
describe('Private admin provisioning', () => {
  let replSet;

  beforeAll(async () => {
    replSet = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    });
    await mongoose.connect(replSet.getUri());
  }, 30000);

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (replSet) await replSet.stop();
  }, 30000);

  it('creates an admin that is verified and has a hashed password', async () => {
    const result = await provisionAdmin({
      email: 'admin@example.com',
      password: 'SecureAdmin123!',
    });

    const admin = await User.findOne({ email: 'admin@example.com' });
    expect(result).toMatchObject({ status: 'created', role: 'admin' });
    expect(admin).not.toBeNull();
    expect(admin.role).toBe('admin');
    expect(admin.isVerified).toBe(true);
    expect(admin.password).not.toBe('SecureAdmin123!');
    expect(await admin.comparePassword('SecureAdmin123!')).toBe(true);
  });

  it('is idempotent when an admin already exists with the same password', async () => {
    await provisionAdmin({ email: 'admin@example.com', password: 'SecureAdmin123!' });
    const first = await User.findOne({ email: 'admin@example.com' });
    const oldHash = first.password;
    const oldVersion = first.tokenVersion;

    const result = await provisionAdmin({ email: 'admin@example.com', password: 'SecureAdmin123!' });

    expect(result).toMatchObject({
      status: 'existing',
      passwordUpdated: false,
      verificationUpdated: false,
    });
    expect(await User.countDocuments({ email: 'admin@example.com' })).toBe(1);
    const existing = await User.findOne({ email: 'admin@example.com' });
    expect(existing.password).toBe(oldHash);
    expect(existing.tokenVersion).toBe(oldVersion);
  });

  it('rehashes a changed admin password and invalidates previous JWT versions', async () => {
    await provisionAdmin({ email: 'admin@example.com', password: 'OldAdminPassword1!' });
    const before = await User.findOne({ email: 'admin@example.com' });
    const originalVersion = before.tokenVersion;
    const originalHash = before.password;

    const result = await provisionAdmin({ email: 'admin@example.com', password: 'NewAdminPassword2!' });

    const after = await User.findOne({ email: 'admin@example.com' });
    expect(result.passwordUpdated).toBe(true);
    expect(after.password).not.toBe(originalHash);
    expect(await after.comparePassword('NewAdminPassword2!')).toBe(true);
    expect(await after.comparePassword('OldAdminPassword1!')).toBe(false);
    expect(after.tokenVersion).toBe(originalVersion + 1);
  });

  it('marks an existing unverified admin as verified without rotating their password', async () => {
    const admin = await User.create({
      email: 'admin@example.com',
      password: 'SecureAdmin123!',
      role: 'admin',
      isVerified: false,
    });
    const hash = admin.password;

    const result = await provisionAdmin({ email: 'admin@example.com', password: 'SecureAdmin123!' });

    expect(result).toMatchObject({ verificationUpdated: true, passwordUpdated: false });
    const updated = await User.findById(admin._id);
    expect(updated.isVerified).toBe(true);
    expect(updated.password).toBe(hash);
  });

  it('refuses to promote an existing customer into an admin', async () => {
    await User.create({
      email: 'customer@example.com',
      password: 'CustomerPass123!',
      role: 'customer',
      isVerified: true,
    });

    await expect(provisionAdmin({
      email: 'customer@example.com',
      password: 'SecureAdmin123!',
    })).rejects.toThrow('not an admin');

    const customer = await User.findOne({ email: 'customer@example.com' });
    expect(customer.role).toBe('customer');
    expect(await customer.comparePassword('CustomerPass123!')).toBe(true);
  });

  it('rejects missing credentials without creating accounts', async () => {
    await expect(provisionAdmin({})).rejects.toThrow('ADMIN_EMAIL');
    expect(await User.countDocuments()).toBe(0);
  });

  it('rejects an invalid admin email', async () => {
    await expect(provisionAdmin({
      email: 'invalid-email',
      password: 'SecureAdmin123!',
    })).rejects.toThrow('ADMIN_EMAIL');
    expect(await User.countDocuments()).toBe(0);
  });

  it('rejects a short admin password', async () => {
    await expect(provisionAdmin({
      email: 'admin@example.com',
      password: 'short',
    })).rejects.toThrow('ADMIN_PASSWORD');
    expect(await User.countDocuments()).toBe(0);
  });

  it('runs the private CLI successfully with an isolated temporary database', async () => {
    const { stdout } = await execFileAsync(process.execPath, [cliPath], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: 'test',
        MONGODB_URI: replSet.getUri(),
        CLIENT_URL: 'http://localhost:5173',
        JWT_SECRET: 'test-jwt-secret-min-32-characters-long-for-testing',
        CSRF_SECRET: 'test-csrf-secret-min-32-characters-long-for-testing',
        ADMIN_EMAIL: 'cli-admin@example.com',
        ADMIN_PASSWORD: 'SecureAdmin123!',
      },
      timeout: 20000,
    });

    expect(stdout).toContain('Admin created');
    const admin = await User.findOne({ email: 'cli-admin@example.com' });
    expect(admin).not.toBeNull();
    expect(admin.role).toBe('admin');
    expect(admin.isVerified).toBe(true);
    expect(await admin.comparePassword('SecureAdmin123!')).toBe(true);
  }, 25000);
});
