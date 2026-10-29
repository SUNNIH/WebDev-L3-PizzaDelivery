import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('5000'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  CLIENT_URL: z.string().url('CLIENT_URL must be a valid URL'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRY: z.string().default('2h'),
  CSRF_SECRET: z.string().min(32, 'CSRF_SECRET must be at least 32 characters'),
  EMAIL_HOST: z.string().default('ethereal'),
  EMAIL_PORT: z.string().regex(/^\d+$/).transform(Number).default('587'),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
});

let env;

// Skip validation if running in test mode without full env setup
if (process.env.NODE_ENV === 'test' && !process.env.MONGODB_URI) {
  env = {
    NODE_ENV: 'test',
    PORT: 5001,
    MONGODB_URI: 'mongodb://localhost:27017/test',
    CLIENT_URL: 'http://localhost:5173',
  };
} else {
  try {
    env = envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Environment validation failed:');
    if (error instanceof z.ZodError) {
      error.issues.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    process.exit(1);
  }
}

export default env;
