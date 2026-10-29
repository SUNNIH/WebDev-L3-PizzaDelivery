// Vitest-only fixtures. Run before importing application modules.
// These are public, test-only values — never use them in production.
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/test';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.JWT_SECRET = 'test-jwt-secret-min-32-characters-long-for-testing';
process.env.CSRF_SECRET = 'test-csrf-secret-min-32-characters-long-for-testing';
process.env.JWT_EXPIRY = '2h';
process.env.EMAIL_HOST = 'test';
