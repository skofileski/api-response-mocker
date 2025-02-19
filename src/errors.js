/**
 * Error simulation utilities for testing error handling
 */

/**
 * Common HTTP error codes and their default messages
 */
const HttpErrors = {
  BAD_REQUEST: { status: 400, message: 'Bad Request' },
  UNAUTHORIZED: { status: 401, message: 'Unauthorized' },
  FORBIDDEN: { status: 403, message: 'Forbidden' },
  NOT_FOUND: { status: 404, message: 'Not Found' },
  METHOD_NOT_ALLOWED: { status: 405, message: 'Method Not Allowed' },
  CONFLICT: { status: 409, message: 'Conflict' },
  UNPROCESSABLE_ENTITY: { status: 422, message: 'Unprocessable Entity' },
  TOO_MANY_REQUESTS: { status: 429, message: 'Too Many Requests' },
  INTERNAL_SERVER_ERROR: { status: 500, message: 'Internal Server Error' },
  BAD_GATEWAY: { status: 502, message: 'Bad Gateway' },
  SERVICE_UNAVAILABLE: { status: 503, message: 'Service Unavailable' },
  GATEWAY_TIMEOUT: { status: 504, message: 'Gateway Timeout' }
};

/**
 * Custom mock API error class
 */
class MockApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = 'MockApiError';
    this.status = status;
    this.details = details;
  }

  toResponse() {
    const response = {
      error: {
        status: this.status,
        message: this.message
      }
    };

    if (this.details) {
      response.error.details = this.details;
    }

    return response;
  }
}

/**
 * Creates a MockApiError from a preset
 * @param {string} preset - Key from HttpErrors
 * @param {string} [customMessage] - Optional custom message
 * @param {*} [details] - Optional error details
 * @returns {MockApiError}
 */
function createError(preset, customMessage = null, details = null) {
  const errorConfig = HttpErrors[preset];
  if (!errorConfig) {
    throw new Error(`Unknown error preset: ${preset}`);
  }

  return new MockApiError(
    errorConfig.status,
    customMessage || errorConfig.message,
    details
  );
}

/**
 * Simulates random errors based on probability
 * @param {Object} config - Error simulation config
 * @param {number} config.probability - Probability of error (0-1)
 * @param {string|string[]} [config.errors] - Error preset(s) to throw
 * @returns {MockApiError|null}
 */
function simulateRandomError(config) {
  const { probability = 0, errors = ['INTERNAL_SERVER_ERROR'] } = config;

  if (Math.random() > probability) {
    return null;
  }

  const errorPresets = Array.isArray(errors) ? errors : [errors];
  const selectedPreset = errorPresets[Math.floor(Math.random() * errorPresets.length)];

  return createError(selectedPreset);
}

/**
 * Creates an error simulation function from configuration
 * @param {Object|number} config - Configuration or simple probability
 * @returns {Function} Function that may throw MockApiError
 */
function createErrorSimulator(config) {
  if (typeof config === 'number') {
    return () => simulateRandomError({ probability: config });
  }

  if (config && typeof config === 'object') {
    return () => simulateRandomError(config);
  }

  return () => null;
}

module.exports = {
  HttpErrors,
  MockApiError,
  createError,
  simulateRandomError,
  createErrorSimulator
};
