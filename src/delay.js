/**
 * @fileoverview Response delay utilities for simulating network latency
 * @module delay
 */

/**
 * Creates a promise that resolves after a specified delay
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise<void>} Promise that resolves after the delay
 * @example
 * await delay(1000); // Wait 1 second
 */
function delay(ms) {
  if (typeof ms !== 'number' || ms < 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates a random delay within a specified range
 * @param {number} min - Minimum delay in milliseconds
 * @param {number} max - Maximum delay in milliseconds
 * @returns {Promise<void>} Promise that resolves after a random delay
 * @example
 * await randomDelay(100, 500); // Wait between 100-500ms
 */
function randomDelay(min, max) {
  if (typeof min !== 'number' || typeof max !== 'number') {
    return Promise.resolve();
  }
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(ms);
}

/**
 * @typedef {Object} DelayConfig
 * @property {number} [fixed] - Fixed delay in milliseconds
 * @property {number} [min] - Minimum delay for random range
 * @property {number} [max] - Maximum delay for random range
 */

/**
 * Creates a delay based on a configuration object
 * @param {DelayConfig} config - Delay configuration
 * @returns {Promise<void>} Promise that resolves after the configured delay
 * @example
 * await configuredDelay({ fixed: 200 });
 * await configuredDelay({ min: 100, max: 500 });
 */
function configuredDelay(config) {
  if (!config || typeof config !== 'object') {
    return Promise.resolve();
  }

  if (typeof config.fixed === 'number') {
    return delay(config.fixed);
  }

  if (typeof config.min === 'number' && typeof config.max === 'number') {
    return randomDelay(config.min, config.max);
  }

  return Promise.resolve();
}

module.exports = {
  delay,
  randomDelay,
  configuredDelay
};
