/**
 * @fileoverview Error simulation utilities for testing edge cases
 * @module errors
 */

/**
 * Standard HTTP error definitions
 * @type {Object.<number, {status: number, message: string}>}
 */
const HTTP_ERRORS = {
  400: { status: 400, message: 'Bad Request' },
  401: { status: 401, message: 'Unauthorized' },
  403: { status: 403, message: 'Forbidden' },
  404: { status: 404, message: 'Not Found' },
  405: { status: 405, message: 'Method Not Allowed' },
  408: { status: 408, message: 'Request Timeout' },
  409: { status: 409, message: 'Conflict' },
  422: { status: 422, message: 'Unprocessable Entity' },
  429: { status: 429, message: 'Too Many Requests' },
  500: { status: 500, message: 'Internal Server Error' },
  502: { status: 502, message: 'Bad Gateway' },
  503: { status: 503, message: 'Service Unavailable' },
  504: { status: 504, message: 'Gateway Timeout' },
};

/**
 * Custom error class for mock API errors
 * @extends Error
 */
class MockApiError extends Error {
  /**
   * Create a MockApiError
   * @param {number} status - HTTP status code
   * @param {string} [message] - Error message
   * @param {Object} [details] - Additional error details
   */
  constructor(status, message, details = {}) {
    const httpError = HTTP_ERRORS[status] || { status, message: 'Unknown Error' };
    super(message || httpError.message);

    this.name = 'MockApiError';
    this.status = status;
    this.details = details;
  }

  /**
   * Convert error to JSON response format
   * @returns {Object} JSON representation of error
   */
  toJSON() {
    return {
      error: {
        status: this.status,
        message: this.message,
        ...this.details,
      },
    };
  }
}

/**
 * Create an error simulator based on configuration
 * @param {Object} config - Error simulation configuration
 * @param {number} [config.rate=0] - Error rate (0-1)
 * @param {number|number[]} [config.status=500] - Status code(s) to return
 * @returns {Function} Error simulator function
 */
function createErrorSimulator(config = {}) {
  const { rate = 0, status = 500 } = config;

  return () => {
    if (Math.random() < rate) {
      const errorStatus = Array.isArray(status)
        ? status[Math.floor(Math.random() * status.length)]
        : status;

      throw new MockApiError(errorStatus);
    }
  };
}

/**
 * Randomly determine if an error should occur
 * @param {number} rate - Error rate (0-1)
 * @returns {boolean} True if error should occur
 */
function shouldError(rate) {
  return Math.random() < rate;
}

/**
 * Get a random error status from a list
 * @param {number[]} [statuses=[500]] - List of status codes
 * @returns {number} Random status code
 */
function randomErrorStatus(statuses = [500]) {
  return statuses[Math.floor(Math.random() * statuses.length)];
}

module.exports = {
  HTTP_ERRORS,
  MockApiError,
  createErrorSimulator,
  shouldError,
  randomErrorStatus,
};
