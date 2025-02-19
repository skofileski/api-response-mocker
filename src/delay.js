/**
 * Delay and timing utilities for simulating network latency
 */

/**
 * Creates a promise that resolves after specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a delay within a random range
 * @param {number} min - Minimum delay in ms
 * @param {number} max - Maximum delay in ms
 * @returns {Promise<void>}
 */
function randomDelay(min, max) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(ms);
}

/**
 * Delay configuration presets for common scenarios
 */
const DelayPresets = {
  INSTANT: 0,
  FAST: 50,
  NORMAL: 200,
  SLOW: 1000,
  VERY_SLOW: 3000,
  TIMEOUT: 30000
};

/**
 * Creates a delay function based on configuration
 * @param {Object|number} config - Delay configuration
 * @param {number} [config.fixed] - Fixed delay in ms
 * @param {number} [config.min] - Minimum random delay
 * @param {number} [config.max] - Maximum random delay
 * @param {string} [config.preset] - Preset name from DelayPresets
 * @returns {Function} Async function that applies the delay
 */
function createDelayFn(config) {
  if (typeof config === 'number') {
    return () => delay(config);
  }

  if (typeof config === 'string' && DelayPresets[config] !== undefined) {
    return () => delay(DelayPresets[config]);
  }

  if (config && typeof config === 'object') {
    if (config.preset && DelayPresets[config.preset] !== undefined) {
      return () => delay(DelayPresets[config.preset]);
    }

    if (config.fixed !== undefined) {
      return () => delay(config.fixed);
    }

    if (config.min !== undefined && config.max !== undefined) {
      return () => randomDelay(config.min, config.max);
    }
  }

  return () => Promise.resolve();
}

module.exports = {
  delay,
  randomDelay,
  DelayPresets,
  createDelayFn
};
