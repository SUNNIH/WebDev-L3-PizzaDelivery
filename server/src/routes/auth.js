import express from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';
import AuthToken from '../models/AuthToken.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../config/email.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { generateToken, doubleCsrfProtection } from '../middleware/security.js';
import env from '../config/env.js';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.literal('customer').optional(), // Explicitly reject admin role
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Helper to generate JWT
const generateJWT = (user) => {
  return jwt.sign(
    {
      sub: user._id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRY }
  );
};

// Helper to set auth cookie
const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
  });
};

/**
 * POST /api/auth/register
 * Register a new customer account
 */
router.post('/register', doubleCsrfProtection, async (req, res, next) => {
  try {
    // Reject attempts to register with an unauthorized role
    if (req.body?.role !== undefined && req.body.role !== 'customer') {
      return res.status(400).json({
        error: 'Invalid role specified'
      });
    }

    // Validate registration input
    const validated = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user with customer role
    const user = await User.create({
      email: validated.email,
      password: validated.password,
      role: 'customer',
      isVerified: false,
    });

    // Generate verification token
    const token = await AuthToken.createVerificationToken(user._id);

    // Send verification email
    await sendVerificationEmail(user.email, token);

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      email: user.email,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    next(error);
  }
});

/**
 * POST /api/auth/verify-email
 * Verify email with token
 */
router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Verify and consume token
    const userId = await AuthToken.verifyAndConsumeToken(token, 'verification');

    if (!userId) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    // Mark user as verified
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    user.isVerified = true;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/resend-verification
 * Resend verification email
 */
router.post('/resend-verification', doubleCsrfProtection, async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Generic response to prevent account enumeration
      return res.json({ message: 'If the email exists, a verification link has been sent' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new verification token
    const token = await AuthToken.createVerificationToken(user._id);

    // Send verification email
    await sendVerificationEmail(user.email, token);

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Customer login
 */
router.post('/login', doubleCsrfProtection, async (req, res, next) => {
  try {
    // Validate input
    const validated = loginSchema.parse(req.body);

    // Find user
    const user = await User.findOne({ email: validated.email });
    if (!user || !(await user.comparePassword(validated.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }

    // Prevent admin login through customer endpoint
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Please use the admin login' });
    }

    // Generate JWT
    const token = generateJWT(user);

    // Set cookie
    setAuthCookie(res, token);

    // Generate CSRF token
    const csrfToken = generateToken(req, res);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      csrfToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    next(error);
  }
});

/**
 * POST /api/auth/admin-login
 * Administrator login (separate endpoint)
 */
router.post('/admin-login', doubleCsrfProtection, async (req, res, next) => {
  try {
    // Validate input
    const validated = loginSchema.parse(req.body);

    // Find user
    const user = await User.findOne({ email: validated.email });
    if (!user || !(await user.comparePassword(validated.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify admin role
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Email verification required for admin too
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Email verification required' });
    }

    // Generate JWT
    const token = generateJWT(user);

    // Set cookie
    setAuthCookie(res, token);

    // Generate CSRF token
    const csrfToken = generateToken(req, res);

    res.json({
      message: 'Admin login successful',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      csrfToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Logout (clear cookie)
 */
router.post('/logout', doubleCsrfProtection, (req, res) => {
  res.clearCookie('token');
  res.clearCookie('x-csrf-token');
  res.json({ message: 'Logout successful' });
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -tokenVersion');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', doubleCsrfProtection, async (req, res, next) => {
  try {
    const validated = forgotPasswordSchema.parse(req.body);

    const user = await User.findOne({ email: validated.email });

    // Generic response to prevent account enumeration
    if (!user) {
      return res.json({ message: 'If the email exists, a password reset link has been sent' });
    }

    // Generate password reset token
    const token = await AuthToken.createPasswordResetToken(user._id);

    // Send reset email
    await sendPasswordResetEmail(user.email, token);

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    next(error);
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', doubleCsrfProtection, async (req, res, next) => {
  try {
    const validated = resetPasswordSchema.parse(req.body);

    // Verify and consume token
    const userId = await AuthToken.verifyAndConsumeToken(validated.token, 'passwordReset');

    if (!userId) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Update password and increment token version
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = validated.password;
    await user.incrementTokenVersion(); // Invalidates all existing JWTs

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    next(error);
  }
});

/**
 * GET /api/auth/csrf-token
 * Get CSRF token
 */
router.get('/csrf-token', (req, res) => {
  const csrfToken = generateToken(req, res);
  res.json({ csrfToken });
});

export default router;
