import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi
} from 'vitest';

// Mock external dependencies to avoid opening a real server.
const mocks = vi.hoisted(() => ({
  connectDB: vi.fn(),
  disconnectDB: vi.fn(),
  listen: vi.fn(),
  close: vi.fn()
}));

vi.mock('../server/src/app.js', () => ({
  default: {
    listen: mocks.listen
  }
}));

vi.mock('../server/src/config/env.js', () => ({
  default: {
    PORT: 5001,
    NODE_ENV: 'test'
  }
}));

vi.mock('../server/src/db/connection.js', () => ({
  connectDB: mocks.connectDB,
  disconnectDB: mocks.disconnectDB
}));

describe('Server Startup and Shutdown', () => {
  const handlers = new Map();

  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    handlers.clear();

    const originalProcessOn = process.on.bind(process);

    // Capture shutdown handlers without registering real signal listeners.
    vi.spyOn(process, 'on').mockImplementation((event, handler) => {
      if (event === 'SIGTERM' || event === 'SIGINT') {
        handlers.set(event, handler);
        return process;
      }

      return originalProcessOn(event, handler);
    });

    // Never terminate the Vitest process.
    vi.spyOn(process, 'exit').mockImplementation(() => undefined);

    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    mocks.connectDB.mockResolvedValue(undefined);
    mocks.disconnectDB.mockResolvedValue(undefined);

    mocks.close.mockImplementation(callback => {
      callback();
    });

    mocks.listen.mockImplementation((port, callback) => {
      callback();

      return {
        close: mocks.close
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('connects to MongoDB before starting the server', async () => {
    await import('../server/src/index.js');

    await vi.waitFor(() => {
      expect(mocks.listen).toHaveBeenCalledWith(
        5001,
        expect.any(Function)
      );
    });

    expect(mocks.connectDB).toHaveBeenCalledTimes(1);

    expect(console.log).toHaveBeenCalledWith(
      '✓ Server running on port 5001 in test mode'
    );

    expect(handlers.has('SIGTERM')).toBe(true);
    expect(handlers.has('SIGINT')).toBe(true);
  });

  it.each(['SIGTERM', 'SIGINT'])(
    'shuts down gracefully when %s is received',
    async signal => {
      await import('../server/src/index.js');

      await vi.waitFor(() => {
        expect(handlers.has(signal)).toBe(true);
      });

      // Simulate receiving the shutdown signal.
      handlers.get(signal)();

      await vi.waitFor(() => {
        expect(mocks.close).toHaveBeenCalledTimes(1);
        expect(mocks.disconnectDB).toHaveBeenCalledTimes(1);
        expect(process.exit).toHaveBeenCalledWith(0);
      });
    }
  );

  it('handles server startup failures', async () => {
    mocks.connectDB.mockRejectedValue(
      new Error('Database startup failed')
    );

    await import('../server/src/index.js');

    await vi.waitFor(() => {
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    expect(mocks.listen).not.toHaveBeenCalled();

    expect(console.error).toHaveBeenCalledWith(
      '❌ Server startup failed:',
      expect.any(Error)
    );
  });
});