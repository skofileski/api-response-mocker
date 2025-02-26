const { Logger, LOG_LEVELS, createLogger, createRequestLoggerMiddleware } = require('../logger');

describe('Logger', () => {
  let mockOutput;
  
  beforeEach(() => {
    mockOutput = {
      log: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    };
  });

  describe('constructor', () => {
    it('should use default options', () => {
      const logger = new Logger();
      expect(logger.level).toBe(LOG_LEVELS.INFO);
      expect(logger.prefix).toBe('[api-mocker]');
      expect(logger.timestamps).toBe(true);
    });

    it('should accept custom options', () => {
      const logger = new Logger({
        level: LOG_LEVELS.DEBUG,
        prefix: '[custom]',
        timestamps: false
      });
      expect(logger.level).toBe(LOG_LEVELS.DEBUG);
      expect(logger.prefix).toBe('[custom]');
      expect(logger.timestamps).toBe(false);
    });
  });

  describe('logging methods', () => {
    it('should log error messages', () => {
      const logger = new Logger({ output: mockOutput });
      logger.error('Test error');
      expect(mockOutput.error).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      const logger = new Logger({ output: mockOutput });
      logger.warn('Test warning');
      expect(mockOutput.warn).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      const logger = new Logger({ output: mockOutput });
      logger.info('Test info');
      expect(mockOutput.info).toHaveBeenCalled();
    });

    it('should log debug messages when level is DEBUG', () => {
      const logger = new Logger({ output: mockOutput, level: LOG_LEVELS.DEBUG });
      logger.debug('Test debug');
      expect(mockOutput.debug).toHaveBeenCalled();
    });

    it('should not log debug messages when level is INFO', () => {
      const logger = new Logger({ output: mockOutput, level: LOG_LEVELS.INFO });
      logger.debug('Test debug');
      expect(mockOutput.debug).not.toHaveBeenCalled();
    });

    it('should include data in log output', () => {
      const logger = new Logger({ output: mockOutput });
      const data = { key: 'value' };
      logger.info('Test with data', data);
      expect(mockOutput.info).toHaveBeenCalledWith(
        expect.any(String),
        data
      );
    });
  });

  describe('setLevel', () => {
    it('should change log level by number', () => {
      const logger = new Logger();
      logger.setLevel(LOG_LEVELS.ERROR);
      expect(logger.level).toBe(LOG_LEVELS.ERROR);
    });

    it('should change log level by string', () => {
      const logger = new Logger();
      logger.setLevel('debug');
      expect(logger.level).toBe(LOG_LEVELS.DEBUG);
    });
  });

  describe('history', () => {
    it('should store log entries in history', () => {
      const logger = new Logger({ output: mockOutput });
      logger.info('First');
      logger.warn('Second');
      expect(logger.history).toHaveLength(2);
    });

    it('should limit history size', () => {
      const logger = new Logger({ output: mockOutput, maxHistory: 2 });
      logger.info('First');
      logger.info('Second');
      logger.info('Third');
      expect(logger.history).toHaveLength(2);
      expect(logger.history[0].message).toBe('Second');
    });

    it('should filter history by level', () => {
      const logger = new Logger({ output: mockOutput });
      logger.info('Info message');
      logger.warn('Warn message');
      const filtered = logger.getHistory({ level: 'warn' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].level).toBe('WARN');
    });

    it('should filter history by content', () => {
      const logger = new Logger({ output: mockOutput });
      logger.info('Hello world');
      logger.info('Goodbye world');
      const filtered = logger.getHistory({ contains: 'Hello' });
      expect(filtered).toHaveLength(1);
    });

    it('should clear history', () => {
      const logger = new Logger({ output: mockOutput });
      logger.info('Test');
      logger.clearHistory();
      expect(logger.history).toHaveLength(0);
    });
  });

  describe('onLog callback', () => {
    it('should call onLog callback when logging', () => {
      const onLog = jest.fn();
      const logger = new Logger({ output: mockOutput, onLog });
      logger.info('Test');
      expect(onLog).toHaveBeenCalledWith(expect.objectContaining({
        level: 'INFO',
        message: 'Test'
      }));
    });
  });
});

describe('createLogger', () => {
  it('should create a new Logger instance', () => {
    const logger = createLogger({ level: LOG_LEVELS.DEBUG });
    expect(logger).toBeInstanceOf(Logger);
    expect(logger.level).toBe(LOG_LEVELS.DEBUG);
  });
});

describe('createRequestLoggerMiddleware', () => {
  let logger;
  let mockOutput;
  let middleware;

  beforeEach(() => {
    mockOutput = {
      log: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    logger = new Logger({ output: mockOutput });
    middleware = createRequestLoggerMiddleware(logger);
  });

  it('should log requests', () => {
    const request = { method: 'GET', url: '/api/users' };
    middleware.beforeRequest(request);
    expect(mockOutput.info).toHaveBeenCalled();
    expect(mockOutput.info.mock.calls[0][0]).toContain('GET /api/users');
  });

  it('should add start time to request', () => {
    const request = { method: 'GET', url: '/api/users' };
    const result = middleware.beforeRequest(request);
    expect(result._startTime).toBeDefined();
  });

  it('should log responses with duration', () => {
    const request = { method: 'GET', url: '/api/users', _startTime: Date.now() - 50 };
    const response = { status: 200 };
    middleware.afterResponse(response, request);
    expect(mockOutput.info).toHaveBeenCalled();
    expect(mockOutput.info.mock.calls[0][0]).toContain('200');
  });

  it('should log errors', () => {
    const request = { method: 'GET', url: '/api/users' };
    const error = new Error('Test error');
    expect(() => middleware.onError(error, request)).toThrow('Test error');
    expect(mockOutput.error).toHaveBeenCalled();
  });
});