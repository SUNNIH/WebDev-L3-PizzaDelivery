import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Verify user still exists and token version matches
    const user = await User.findById(decoded.sub);
    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Verify email is verified
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Email not verified' });
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    next(error);
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
};

export const requireAdmin = requireRole('admin');
export const requireCustomer = requireRole('customer');
