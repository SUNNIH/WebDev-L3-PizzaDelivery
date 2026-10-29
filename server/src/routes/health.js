import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * GET /health
 * Health check endpoint
 * Returns server status and database connectivity
 */
router.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: process.uptime(),
  });
});

export default router;
