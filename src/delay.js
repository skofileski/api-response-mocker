/**
 * Delay utilities for simulating network latency
 */

class DelayController {
  constructor() {
    this.defaultDelay = 0;
    this.delayRange = null;
    this.activeTimers = new Set();
    this.aborted = false;
  }

  /**
   * Set a fixed delay for all responses
   * @param {number} ms - Delay in milliseconds
   */
  setDelay(ms) {
    if (typeof ms !== 'number' || ms < 0) {
      throw new Error('Delay must be a non-negative number');
    }
    this.defaultDelay = ms;
    this.delayRange = null;
  }

  /**
   * Set a random delay range
   * @param {number} min - Minimum delay in milliseconds
   * @param {number} max - Maximum delay in milliseconds
   */
  setDelayRange(min, max) {
    if (typeof min !== 'number' || typeof max !== 'number') {
      throw new Error('Delay range values must be numbers');
    }
    if (min < 0 || max < 0) {
      throw new Error('Delay range values must be non-negative');
    }
    if (min > max) {
      throw new Error('Minimum delay cannot be greater than maximum delay');
    }
    this.delayRange = { min, max };
    this.defaultDelay = 0;
  }

  /**
   * Get the current delay value
   * @returns {number} Delay in milliseconds
   */
  getDelay() {
    if (this.delayRange) {
      const { min, max } = this.delayRange;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    return this.defaultDelay;
  }

  /**
   * Execute a function after the configured delay
   * @param {Function} fn - Function to execute
   * @returns {Promise} Resolves with function result after delay
   */
  async execute(fn) {
    if (this.aborted) {
      throw new Error('DelayController has been aborted');
    }

    const delay = this.getDelay();
    
    if (delay === 0) {
      return fn();
    }

    return new Promise((resolve, reject) => {
      const timerId = setTimeout(() => {
        this.activeTimers.delete(timerId);
        
        if (this.aborted) {
          reject(new Error('DelayController was aborted during delay'));
          return;
        }

        try {
          resolve(fn());
        } catch (error) {
          reject(error);
        }
      }, delay);

      this.activeTimers.add(timerId);
    });
  }

  /**
   * Create a simple delay promise
   * @param {number} ms - Optional override delay in milliseconds
   * @returns {Promise} Resolves after delay
   */
  wait(ms) {
    const delay = typeof ms === 'number' ? ms : this.getDelay();
    
    if (delay === 0) {
      return Promise.resolve();
    }

    if (this.aborted) {
      return Promise.reject(new Error('DelayController has been aborted'));
    }

    return new Promise((resolve, reject) => {
      const timerId = setTimeout(() => {
        this.activeTimers.delete(timerId);
        
        if (this.aborted) {
          reject(new Error('DelayController was aborted during wait'));
          return;
        }
        
        resolve();
      }, delay);

      this.activeTimers.add(timerId);
    });
  }

  /**
   * Abort all pending delays
   */
  abort() {
    this.aborted = true;
    for (const timerId of this.activeTimers) {
      clearTimeout(timerId);
    }
    this.activeTimers.clear();
  }

  /**
   * Reset the controller state
   */
  reset() {
    this.abort();
    this.defaultDelay = 0;
    this.delayRange = null;
    this.aborted = false;
  }

  /**
   * Check if controller has pending delays
   * @returns {boolean}
   */
  hasPending() {
    return this.activeTimers.size > 0;
  }
}

// Singleton instance for global delay control
const globalDelayController = new DelayController();

/**
 * Simple delay function
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise}
 */
function delay(ms) {
  if (typeof ms !== 'number' || ms < 0) {
    return Promise.reject(new Error('Delay must be a non-negative number'));
  }
  
  if (ms === 0) {
    return Promise.resolve();
  }
  
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  DelayController,
  globalDelayController,
  delay
};
