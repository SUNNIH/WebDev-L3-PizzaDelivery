#!/usr/bin/env node

/**
 * Private CLI for provisioning SUNNYS Pizza administrators.
 *
 * Usage (from the server workspace): node src/scripts/createAdmin.js
 * Requires ADMIN_EMAIL and ADMIN_PASSWORD in the environment.
 * Never expose this operation as a public HTTP endpoint.
 */

import mongoose from 'mongoose';
import { z } from 'zod';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import User from '../models/User.js';
import env from '../config/env.js';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * Provision an admin using an ALREADY-CONNECTED Mongoose instance.
 * Exporting this operation lets Vitest exercise the real User model against
 * an isolated in-memory MongoDB without triggering the CLI or process.exit.
 */
export async function provisionAdmin({ email, password } = {}) {
  const validated = credentialsSchema.safeParse({ email, password });
  if (!validated.success) {
    throw new Error('Valid ADMIN_EMAIL and ADMIN_PASSWORD (minimum 8 characters) are required');
  }

  const existingUser = await User.findOne({ email: validated.data.email });

  if (!existingUser) {
    const admin = await User.create({
      email: validated.data.email,
      password: validated.data.password,
      role: 'admin',
      isVerified: true,
    });

    return { status: 'created', email: admin.email, role: admin.role };
  }

  if (existingUser.role !== 'admin') {
    throw new Error('An account with this email exists but is not an admin');
  }

  const passwordUpdated = !(await existingUser.comparePassword(validated.data.password));
  const verificationUpdated = !existingUser.isVerified;

  if (passwordUpdated) {
    existingUser.password = validated.data.password;
    // Existing JWTs must be revoked when an admin password is rotated.
    existingUser.tokenVersion = (existingUser.tokenVersion ?? 0) + 1;
  }

  if (verificationUpdated) {
    existingUser.isVerified = true;
  }

  if (passwordUpdated || verificationUpdated) {
    await existingUser.save();
  }

  return {
    status: 'existing',
    email: existingUser.email,
    role: existingUser.role,
    passwordUpdated,
    verificationUpdated,
  };
}

/** Run when invoked directly from the command line, not on import. */
export async function runCli() {
  try {
    const email = env.ADMIN_EMAIL ?? process.env.ADMIN_EMAIL;
    const password = env.ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD;

    // Reject invalid/missing credentials BEFORE opening a database connection.
    const validated = credentialsSchema.safeParse({ email, password });
    if (!validated.success) {
      throw new Error('Valid ADMIN_EMAIL and ADMIN_PASSWORD (minimum 8 characters) are required');
    }

    await mongoose.connect(env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const result = await provisionAdmin(validated.data);
    console.log(`✓ Admin ${result.status === 'created' ? 'created' : 'already exists'}: ${result.email}`);
    if (result.passwordUpdated) console.log('✓ Admin password updated; previous sessions revoked');
    if (result.verificationUpdated) console.log('✓ Admin marked as verified');
    console.log('✓ Done');
    return 0;
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    return 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

// Importing this file in a test must NOT provision admins or exit Vitest.
const invokedDirectly = process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  runCli()
    .then((exitCode) => { process.exitCode = exitCode; })
    .catch((error) => {
      console.error('❌ Unexpected admin provisioning failure:', error.message);
      process.exitCode = 1;
    });
}
