import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi
} from 'vitest';

// Mock MongoDB functions so tests do not need a real database.
const mongoMocks = vi.hoisted(() => ({
  connect: vi.fn(),
  disconnect: vi.fn()
}));

vi.mock('mongoose', () => ({
  default: {
    connect: mongoMocks.connect,
    disconnect: mongoMocks.disconnect
  }
}));

vi.mock('../server/src/config/env.js', () => ({
  default: {
    MONGODB_URI: 'mongodb://127.0.0.1:27017/test'
  }
}));

import {
  connectDB,
  disconnectDB
} from '../server/src/db/connection.js';

describe('MongoDB Connection Management', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Prevent the test runner from exiting.
    vi.spyOn(process, 'exit').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('connects to MongoDB successfully', async () => {
    const fakeConnection = {
      connection: {
        host: '127.0.0.1'
      }
    };

    mongoMocks.connect.mockResolvedValue(fakeConnection);

    const result = await connectDB();

    expect(mongoMocks.connect).toHaveBeenCalledWith(
      'mongodb://127.0.0.1:27017/test'
    );

    expect(result).toBe(fakeConnection);

    expect(console.log).toHaveBeenCalledWith(
      '✓ MongoDB connected: 127.0.0.1'
    );
  });

  it('handles MongoDB connection failures', async () => {
    const error = new Error('Connection refused');

    mongoMocks.connect.mockRejectedValue(error);

    await connectDB();

    expect(console.error).toHaveBeenCalledWith(
      '❌ MongoDB connection failed:',
      'Connection refused'
    );

    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('disconnects from MongoDB successfully', async () => {
    mongoMocks.disconnect.mockResolvedValue(undefined);

    await disconnectDB();

    expect(mongoMocks.disconnect).toHaveBeenCalledTimes(1);

    expect(console.log).toHaveBeenCalledWith(
      '✓ MongoDB disconnected'
    );
  });

  it('handles MongoDB disconnection failures', async () => {
    const error = new Error('Disconnection failed');

    mongoMocks.disconnect.mockRejectedValue(error);

    await disconnectDB();

    expect(console.error).toHaveBeenCalledWith(
      '❌ MongoDB disconnection failed:',
      'Disconnection failed'
    );
  });
});