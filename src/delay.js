/**
 * Delay utilities for simulating network latency
 */

class DelayController {
  constructor() {
    this.defaultDelay = 0;
    this.delayRange = null;
    this.pendingDelays = new Set();
    this.aborted = false;
  }

  /**
   * Set a fixed delay for all responses
   */
  setDelay(ms) {
    if (typeof ms !== 'number' || ms < 0 || !Number.isFinite(ms)) {
      throw new Error('Delay must be a non-negative finite number');
    }
    this.defaultDelay = ms;
    this.delayRange = null;
  }

  /**
   * Set a random delay range
   */
  setDelayRange(min, max) {
    if (typeof min !== 'number' || typeof max !== 'number') {
      throw new Error('Delay range values must be numbers');
    }
    if (min < 0 || max < 0) {
      throw new Error('Delay range values must be non-negative');
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      throw new Error('Delay range values must be finite');
    }
    if (min > max) {
      throw new Error('Minimum delay cannot be greater than maximum delay');
    }
    this.delayRange = { min, max };
    this.defaultDelay = 0;
  }

  /**
   * Get the current delay value
   */
  getDelay() {
    if (this.delayRange) {
      const { min, max } = this.delayRange;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    return this.defaultDelay;
  }

  /**
   * Apply delay and return a promise
   */
  async apply(customDelay = null) {
    if (this.aborted) {
      throw new Error('Delay controller has been aborted');
    }

    let delay;
    if (customDelay !== null) {
      if (typeof customDelay !== 'number' || customDelay < 0 || !Number.isFinite(customDelay)) {
        throw new Error('Custom delay must be a non-negative finite number');
      }
      delay = customDelay;
    } else {
      delay = this.getDelay();
    }

    if (delay === 0) {
      return Promise.resolve();
    }

    const delayPromise = this._createCancellableDelay(delay);
    return delayPromise;
  }

  /**
   * Create a cancellable delay promise
   */
  _createCancellableDelay(ms) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingDelays.delete(timeoutId);
        if (this.aborted) {
          reject(new Error('Delay was aborted'));
        } else {
          resolve();
        }
      }, ms);

      this.pendingDelays.add(timeoutId);
    });
  }

  /**
   * Cancel all pending delays
   */
  cancelAll() {
    for (const timeoutId of this.pendingDelays) {
      clearTimeout(timeoutId);
    }
    this.pendingDelays.clear();
  }

  /**
   * Abort the controller - prevents new delays
   */
  abort() {
    this.aborted = true;
    this.cancelAll();
  }

  /**
   * Reset the controller
   */
  reset() {
    this.cancelAll();
    this.defaultDelay = 0;
    this.delayRange = null;
    this.aborted = false;
  }

  /**
   * Check if there are pending delays
   */
  hasPendingDelays() {
    return this.pendingDelays.size > 0;
  }

  /**
   * Get count of pending delays
   */
  getPendingCount() {
    return this.pendingDelays.size;
  }
}

// Singleton instance
const delayController = new DelayController();

// Convenience functions
function setDelay(ms) {
  return delayController.setDelay(ms);
}

function setDelayRange(min, max) {
  return delayController.setDelayRange(min, max);
}

function applyDelay(customDelay = null) {
  return delayController.apply(customDelay);
}

function resetDelay() {
  return delayController.reset();
}

module.exports = {
  DelayController,
  delayController,
  setDelay,
  setDelayRange,
  applyDelay,
  resetDelay
};
