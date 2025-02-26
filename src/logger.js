/**
 * Request logger middleware for debugging mock API calls
 */

const LOG_LEVELS = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4
};

class Logger {
  constructor(options = {}) {
    this.level = options.level !== undefined ? options.level : LOG_LEVELS.INFO;
    this.prefix = options.prefix || '[api-mocker]';
    this.timestamps = options.timestamps !== false;
    this.colorize = options.colorize !== false;
    this.output = options.output || console;
    this.history = [];
    this.maxHistory = options.maxHistory || 100;
    this.onLog = options.onLog || null;
  }

  _getTimestamp() {
    return new Date().toISOString();
  }

  _formatMessage(level, message, data) {
    const parts = [];
    
    if (this.timestamps) {
      parts.push(`[${this._getTimestamp()}]`);
    }
    
    parts.push(this.prefix);
    parts.push(`[${level}]`);
    parts.push(message);
    
    return parts.join(' ');
  }

  _log(level, levelName, message, data) {
    if (this.level < level) return;
    
    const formattedMessage = this._formatMessage(levelName, message, data);
    const logEntry = {
      timestamp: this._getTimestamp(),
      level: levelName,
      message,
      data,
      formatted: formattedMessage
    };
    
    this.history.push(logEntry);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    
    if (this.onLog) {
      this.onLog(logEntry);
    }
    
    const logMethod = levelName.toLowerCase();
    const outputMethod = this.output[logMethod] || this.output.log;
    
    if (data !== undefined) {
      outputMethod.call(this.output, formattedMessage, data);
    } else {
      outputMethod.call(this.output, formattedMessage);
    }
  }

  error(message, data) {
    this._log(LOG_LEVELS.ERROR, 'ERROR', message, data);
  }

  warn(message, data) {
    this._log(LOG_LEVELS.WARN, 'WARN', message, data);
  }

  info(message, data) {
    this._log(LOG_LEVELS.INFO, 'INFO', message, data);
  }

  debug(message, data) {
    this._log(LOG_LEVELS.DEBUG, 'DEBUG', message, data);
  }

  setLevel(level) {
    if (typeof level === 'string') {
      this.level = LOG_LEVELS[level.toUpperCase()] || LOG_LEVELS.INFO;
    } else {
      this.level = level;
    }
  }

  getHistory(filter = {}) {
    let history = [...this.history];
    
    if (filter.level) {
      history = history.filter(entry => entry.level === filter.level.toUpperCase());
    }
    
    if (filter.since) {
      const sinceDate = new Date(filter.since);
      history = history.filter(entry => new Date(entry.timestamp) >= sinceDate);
    }
    
    if (filter.contains) {
      history = history.filter(entry => 
        entry.message.includes(filter.contains) || 
        JSON.stringify(entry.data).includes(filter.contains)
      );
    }
    
    return history;
  }

  clearHistory() {
    this.history = [];
  }

  logRequest(request) {
    this.info(`--> ${request.method} ${request.url}`, {
      headers: request.headers,
      body: request.body
    });
  }

  logResponse(response, duration) {
    const durationStr = duration !== undefined ? ` (${duration}ms)` : '';
    this.info(`<-- ${response.status}${durationStr}`, {
      headers: response.headers,
      body: response.body
    });
  }

  logError(error, request) {
    this.error(`Error handling ${request.method} ${request.url}`, {
      error: error.message,
      stack: error.stack
    });
  }
}

function createLogger(options) {
  return new Logger(options);
}

function createRequestLoggerMiddleware(logger) {
  return {
    beforeRequest(request) {
      request._startTime = Date.now();
      logger.logRequest(request);
      return request;
    },
    
    afterResponse(response, request) {
      const duration = request._startTime ? Date.now() - request._startTime : undefined;
      logger.logResponse(response, duration);
      return response;
    },
    
    onError(error, request) {
      logger.logError(error, request);
      throw error;
    }
  };
}

module.exports = {
  Logger,
  LOG_LEVELS,
  createLogger,
  createRequestLoggerMiddleware
};