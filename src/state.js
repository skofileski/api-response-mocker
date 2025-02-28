/**
 * State management for stateful mock endpoints
 * Allows mocks to maintain state across requests
 */

class StateManager {
  constructor() {
    this.stores = new Map();
    this.middleware = [];
  }

  /**
   * Create or get a state store for an endpoint
   * @param {string} name - Store name/identifier
   * @param {*} initialState - Initial state value
   * @returns {StateStore}
   */
  createStore(name, initialState = {}) {
    if (!this.stores.has(name)) {
      this.stores.set(name, new StateStore(name, initialState, this));
    }
    return this.stores.get(name);
  }

  /**
   * Get an existing store
   * @param {string} name - Store name
   * @returns {StateStore|undefined}
   */
  getStore(name) {
    return this.stores.get(name);
  }

  /**
   * Check if a store exists
   * @param {string} name - Store name
   * @returns {boolean}
   */
  hasStore(name) {
    return this.stores.has(name);
  }

  /**
   * Delete a store
   * @param {string} name - Store name
   * @returns {boolean}
   */
  deleteStore(name) {
    return this.stores.delete(name);
  }

  /**
   * Reset all stores to their initial state
   */
  resetAll() {
    for (const store of this.stores.values()) {
      store.reset();
    }
  }

  /**
   * Clear all stores
   */
  clearAll() {
    this.stores.clear();
  }

  /**
   * Add middleware to be called on state changes
   * @param {Function} fn - Middleware function
   */
  use(fn) {
    if (typeof fn !== 'function') {
      throw new Error('Middleware must be a function');
    }
    this.middleware.push(fn);
  }

  /**
   * Notify middleware of state changes
   * @param {string} storeName - Store that changed
   * @param {string} action - Action performed
   * @param {*} payload - Action payload
   */
  notify(storeName, action, payload) {
    for (const fn of this.middleware) {
      try {
        fn({ store: storeName, action, payload, timestamp: Date.now() });
      } catch (e) {
        // Middleware errors shouldn't break state management
        console.error('State middleware error:', e);
      }
    }
  }

  /**
   * Get snapshot of all stores
   * @returns {Object}
   */
  snapshot() {
    const result = {};
    for (const [name, store] of this.stores) {
      result[name] = store.getState();
    }
    return result;
  }

  /**
   * Restore from snapshot
   * @param {Object} snapshot - State snapshot
   */
  restore(snapshot) {
    for (const [name, state] of Object.entries(snapshot)) {
      const store = this.createStore(name, state);
      store.setState(state);
    }
  }
}

class StateStore {
  constructor(name, initialState, manager) {
    this.name = name;
    this.initialState = this._clone(initialState);
    this.state = this._clone(initialState);
    this.manager = manager;
    this.history = [];
    this.maxHistory = 50;
  }

  /**
   * Get current state
   * @returns {*}
   */
  getState() {
    return this._clone(this.state);
  }

  /**
   * Set entire state
   * @param {*} newState - New state value
   */
  setState(newState) {
    this._pushHistory();
    this.state = this._clone(newState);
    this.manager.notify(this.name, 'SET', newState);
  }

  /**
   * Update state with partial object (merge)
   * @param {Object} updates - Partial state updates
   */
  update(updates) {
    if (typeof this.state !== 'object' || this.state === null) {
      throw new Error('Cannot update non-object state');
    }
    this._pushHistory();
    this.state = { ...this.state, ...this._clone(updates) };
    this.manager.notify(this.name, 'UPDATE', updates);
  }

  /**
   * Get a specific path from state
   * @param {string} path - Dot-notation path
   * @returns {*}
   */
  get(path) {
    const keys = path.split('.');
    let value = this.state;
    for (const key of keys) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[key];
    }
    return this._clone(value);
  }

  /**
   * Set a specific path in state
   * @param {string} path - Dot-notation path
   * @param {*} value - Value to set
   */
  set(path, value) {
    this._pushHistory();
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = this.state;
    
    for (const key of keys) {
      if (target[key] === undefined) {
        target[key] = {};
      }
      target = target[key];
    }
    
    target[lastKey] = this._clone(value);
    this.manager.notify(this.name, 'SET_PATH', { path, value });
  }

  /**
   * Push item to array at path
   * @param {string} path - Path to array
   * @param {*} item - Item to push
   */
  push(path, item) {
    const arr = this.get(path);
    if (!Array.isArray(arr)) {
      throw new Error(`Path ${path} is not an array`);
    }
    arr.push(this._clone(item));
    this.set(path, arr);
    this.manager.notify(this.name, 'PUSH', { path, item });
  }

  /**
   * Remove item from array at path by predicate
   * @param {string} path - Path to array
   * @param {Function} predicate - Function to find item
   */
  remove(path, predicate) {
    const arr = this.get(path);
    if (!Array.isArray(arr)) {
      throw new Error(`Path ${path} is not an array`);
    }
    const index = arr.findIndex(predicate);
    if (index !== -1) {
      const removed = arr.splice(index, 1)[0];
      this.set(path, arr);
      this.manager.notify(this.name, 'REMOVE', { path, removed });
      return removed;
    }
    return undefined;
  }

  /**
   * Reset to initial state
   */
  reset() {
    this._pushHistory();
    this.state = this._clone(this.initialState);
    this.manager.notify(this.name, 'RESET', null);
  }

  /**
   * Undo last state change
   * @returns {boolean} - Whether undo was successful
   */
  undo() {
    if (this.history.length === 0) {
      return false;
    }
    this.state = this.history.pop();
    this.manager.notify(this.name, 'UNDO', null);
    return true;
  }

  /**
   * Get history length
   * @returns {number}
   */
  getHistoryLength() {
    return this.history.length;
  }

  _pushHistory() {
    this.history.push(this._clone(this.state));
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  _clone(value) {
    if (value === null || value === undefined) {
      return value;
    }
    return JSON.parse(JSON.stringify(value));
  }
}

// Default singleton instance
const defaultManager = new StateManager();

module.exports = {
  StateManager,
  StateStore,
  defaultManager,
  createStore: (name, initialState) => defaultManager.createStore(name, initialState),
  getStore: (name) => defaultManager.getStore(name),
  resetAll: () => defaultManager.resetAll(),
  clearAll: () => defaultManager.clearAll()
};
