/**
 * @fileoverview Error simulation utilities for testing error handling
 * @module errors
 */

/**
 * @typedef {Object} MockError
 * @property {number} status - HTTP status code
 * @property {string} message - Error message
 * @property {string} [code] - Error code
 * @property {Object} [details] - Additional error details
 */

/**
 * Common HTTP error definitions
 * @type {Object.<string, MockError>}
 */
const commonErrors = {
  badRequest: {
    status: 400,
    message: 'Bad Request',
    code: 'BAD_REQUEST'
  },
  unauthorized: {
    status: 401,
    message: 'Unauthorized',
    code: 'UNAUTHORIZED'
  },
  forbidden: {
    status: 403,
    message: 'Forbidden',
    code: 'FORBIDDEN'
  },
  notFound: {
    status: 404,
    message: 'Not Found',
    code: 'NOT_FOUND'
  },
  methodNotAllowed: {
    status: 405,
    message: 'Method Not Allowed',
    code: 'METHOD_NOT_ALLOWED'
  },
  conflict: {
    status: 409,
    message: 'Conflict',
    code: 'CONFLICT'
  },
  unprocessableEntity: {
    status: 422,
    message: 'Unprocessable Entity',
    code: 'UNPROCESSABLE_ENTITY'
  },
  tooManyRequests: {
    status: 429,
    message: 'Too Many Requests',
    code: 'TOO_MANY_REQUESTS'
  },
  internalServer: {
    status: 500,
    message: 'Internal Server Error',
    code: 'INTERNAL_ERROR'
  },
  badGateway: {
    status: 502,
    message: 'Bad Gateway',
    code: 'BAD_GATEWAY'
  },
  serviceUnavailable: {
    status: 503,
    message: 'Service Unavailable',
    code: 'SERVICE_UNAVAILABLE'
  },
  gatewayTimeout: {
    status: 504,
    message: 'Gateway Timeout',
    code: 'GATEWAY_TIMEOUT'
  }
};

/**
 * Creates a custom mock error
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 * @param {Object} [options] - Additional options
 * @param {string} [options.code] - Error code
 * @param {Object} [options.details] - Additional details
 * @returns {MockError} The mock error object
 * @example
 * const error = createError(400, 'Invalid email format', {
 *   code: 'VALIDATION_ERROR',
 *   details: { field: 'email' }
 * });
 */
function createError(status, message, options = {}) {
  return {
    status,
    message,
    code: options.code || 'ERROR',
    ...(options.details && { details: options.details })
  };
}

/**
 * @typedef {Object} ErrorSimulationConfig
 * @property {number} probability - Probability of error (0-1)
 * @property {MockError|string} error - Error to return or key from commonErrors
 */

/**
 * Simulates an error based on probability
 * @param {ErrorSimulationConfig} config - Error simulation configuration
 * @returns {MockError|null} The error if triggered, null otherwise
 * @example
 * const error = simulateError({ probability: 0.1, error: 'internalServer' });
 */
function simulateError(config) {
  if (!config || typeof config.probability !== 'number') {
    return null;
  }

  if (Math.random() > config.probability) {
    return null;
  }

  if (typeof config.error === 'string') {
    return commonErrors[config.error] || null;
  }

  return config.error || null;
}

/**
 * Gets a common error by name
 * @param {string} name - Error name
 * @returns {MockError|undefined} The error object or undefined
 * @example
 * const notFound = getCommonError('notFound');
 */
function getCommonError(name) {
  return commonErrors[name];
}

module.exports = {
  commonErrors,
  createError,
  simulateError,
  getCommonError
};
