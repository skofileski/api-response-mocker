/**
 * @fileoverview Configurable response delay utilities
 * @module delay
 */

/**
 * Create a delay promise
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>} Promise that resolves after delay
 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate delay based on configuration
 * @param {Object} config - Delay configuration
 * @param {number} [config.fixed] - Fixed delay in milliseconds
 * @param {number} [config.min] - Minimum delay for random range
 * @param {number} [config.max] - Maximum delay for random range
 * @returns {number} Calculated delay in milliseconds
 */
function calculateDelay(config = {}) {
  if (typeof config === 'number') {
    return config;
  }

  if (config.fixed !== undefined) {
    return config.fixed;
  }

  if (config.min !== undefined && config.max !== undefined) {
    return Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
  }

  return 0;
}

/**
 * Apply delay before executing callback
 * @param {Object} config - Delay configuration
 * @param {Function} callback - Callback to execute after delay
 * @returns {Promise<*>} Result of callback execution
 */
async function withDelay(config, callback) {
  const delayMs = calculateDelay(config);

  if (delayMs > 0) {
    await wait(delayMs);
  }

  return callback();
}

/**
 * Create a delayed response handler
 * @param {number|Object} delayConfig - Delay configuration
 * @returns {Function} Middleware function that applies delay
 */
function createDelayMiddleware(delayConfig) {
  return async (req, res, next) => {
    const delayMs = calculateDelay(delayConfig);

    if (delayMs > 0) {
      await wait(delayMs);
    }

    next();
  };
}

module.exports = {
  wait,
  calculateDelay,
  withDelay,
  createDelayMiddleware,
};
