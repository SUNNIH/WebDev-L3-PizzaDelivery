import app from './app.js';
import env from './config/env.js';
import { connectDB } from './db/connection.js';

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Start server
  const server = app.listen(env.PORT, () => {
    console.log(`✓ Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    server.close(async () => {
      const { disconnectDB } = await import('./db/connection.js');
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((error) => {
  console.error('❌ Server startup failed:', error);
  process.exit(1);
});
