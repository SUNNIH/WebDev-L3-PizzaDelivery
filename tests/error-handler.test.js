import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi
} from 'vitest';

import { errorHandler } from '../server/src/middleware/errorHandler.js';

describe('Global Error Handler', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'test';

    // Prevent expected error logs from cluttering test output.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }

    vi.restoreAllMocks();
  });

  function runErrorHandler(error) {
    const res = {
      status: vi.fn(),
      json: vi.fn()
    };

    res.status.mockReturnValue(res);

    errorHandler(error, {}, res, vi.fn());

    return {
      res,
      body: res.json.mock.calls[0][0]
    };
  }

  it('returns the specified HTTP status and error message', () => {
    const error = {
      statusCode: 400,
      message: 'Invalid request'
    };

    const { res, body } = runErrorHandler(error);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(body).toEqual({
      error: 'Invalid request'
    });
  });

  it('defaults to HTTP 500 when no status code is supplied', () => {
    const error = {
      message: 'Unexpected failure'
    };

    const { res, body } = runErrorHandler(error);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(body.error).toBe('Unexpected failure');
  });

  it('uses a fallback message when the error message is missing', () => {
    const { res, body } = runErrorHandler({});

    expect(res.status).toHaveBeenCalledWith(500);
    expect(body.error).toBe('Internal server error');
  });

  it('uses a fallback message when the error message is empty', () => {
    const { body } = runErrorHandler({
      message: ''
    });

    expect(body.error).toBe('Internal server error');
  });

  it('hides internal error messages in production', () => {
    process.env.NODE_ENV = 'production';

    const error = {
      message: 'Sensitive database failure',
      stack: 'Sensitive internal stack trace'
    };

    const { res, body } = runErrorHandler(error);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(body).toEqual({
      error: 'Internal server error'
    });

    expect(body).not.toHaveProperty('stack');
  });

  it('does not expose stack traces in test mode', () => {
    process.env.NODE_ENV = 'test';

    const error = {
      message: 'Test failure',
      stack: 'Private stack information'
    };

    const { body } = runErrorHandler(error);

    expect(body.error).toBe('Test failure');
    expect(body).not.toHaveProperty('stack');
  });

  it('logs a sanitized stack trace in development', () => {
    process.env.NODE_ENV = 'development';

    const error = {
      message: 'Development failure',
      stack:
        'at handler (/Users/alice/project/app.js:10)\n' +
        'at handler (C:\\Users\\Bob\\project\\app.js:20)'
    };

    runErrorHandler(error);

    expect(console.error).toHaveBeenCalledWith(
      'Error:',
      'Development failure'
    );

    const stackLog = console.error.mock.calls.find(
      call => call[0] === 'Stack:'
    );

    expect(stackLog).toBeDefined();

    const sanitizedStack = stackLog[1];

    expect(sanitizedStack).toContain('/Users/***');
    expect(sanitizedStack).toContain('C:\\Users\\***');

    expect(sanitizedStack).not.toContain('/Users/alice');
    expect(sanitizedStack).not.toContain('C:\\Users\\Bob');
  });

  it('handles development errors without stack traces', () => {
    process.env.NODE_ENV = 'development';

    const error = {
      message: 'Error without stack'
    };

    const { res, body } = runErrorHandler(error);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(body.error).toBe('Error without stack');

    expect(console.error).toHaveBeenCalledWith(
      'Stack:',
      undefined
    );
  });

  it('handles native JavaScript Error instances', () => {
    const error = new Error('Native JavaScript error');

    const { res, body } = runErrorHandler(error);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(body.error).toBe('Native JavaScript error');
  });
});
