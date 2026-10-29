import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { doubleCsrf } from 'csrf-csrf';
import { randomBytes } from 'node:crypto';
import env from '../config/env.js';

// Browser-session identifier used only for CSRF protection.
const CSRF_SESSION_COOKIE = 'sunnys_csrf_session';

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};

export const securityMiddleware = (app) => {
  // Security headers
  app.use(helmet());

  // Allow requests from the SUNNYS Pizza frontend
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  );

  // Parse cookies and verify signed cookies
  app.use(cookieParser(env.CSRF_SECRET));

  // Create or restore a browser-bound CSRF session identifier
  app.use('/api/', (req, res, next) => {
    const existingId = req.signedCookies?.[CSRF_SESSION_COOKIE];

    const validExistingId =
      typeof existingId === 'string' &&
      /^[a-f0-9]{64}$/.test(existingId);

    if (validExistingId) {
      req.csrfSessionId = existingId;
    } else {
      req.csrfSessionId = randomBytes(32).toString('hex');

      res.cookie(
        CSRF_SESSION_COOKIE,
        req.csrfSessionId,
        {
          ...cookieOptions,
          signed: true,
        }
      );
    }

    next();
  });

  // General API rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message:
      'Too many requests from this IP, please try again later',
  });

  app.use('/api/', limiter);

  // Stricter authentication rate limiting
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message:
      'Too many authentication attempts, please try again later',
  });

  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/admin-login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/forgot-password', authLimiter);
};

// CSRF protection
export const {
  generateCsrfToken: generateToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => env.CSRF_SECRET,

  // Bind each token to the browser's signed session identifier
  getSessionIdentifier: (req) => req.csrfSessionId,

  cookieName: 'x-csrf-token',

  cookieOptions,

  size: 64,

  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],

  getCsrfTokenFromRequest: (req) =>
    req.headers['x-csrf-token'],
});