/**
 * Endpoint Router
 * Manages mock endpoint registration and matching
 */

class Router {
  constructor() {
    this.routes = new Map();
  }

  /**
   * Register a mock endpoint
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
   * @param {string} path - URL path pattern (supports :param syntax)
   * @param {object} config - Endpoint configuration
   */
  register(method, path, config) {
    const key = this._createKey(method, path);
    const pattern = this._pathToRegex(path);
    
    this.routes.set(key, {
      method: method.toUpperCase(),
      path,
      pattern,
      paramNames: this._extractParamNames(path),
      config
    });

    return this;
  }

  /**
   * Find a matching route for the given method and path
   * @param {string} method - HTTP method
   * @param {string} path - Request path
   * @returns {object|null} - Matched route with extracted params
   */
  match(method, path) {
    const normalizedMethod = method.toUpperCase();
    
    for (const route of this.routes.values()) {
      if (route.method !== normalizedMethod) continue;
      
      const match = path.match(route.pattern);
      if (match) {
        const params = this._extractParams(route.paramNames, match);
        return {
          ...route,
          params
        };
      }
    }
    
    return null;
  }

  /**
   * Remove a registered route
   * @param {string} method - HTTP method
   * @param {string} path - URL path pattern
   */
  unregister(method, path) {
    const key = this._createKey(method, path);
    return this.routes.delete(key);
  }

  /**
   * Clear all registered routes
   */
  clear() {
    this.routes.clear();
  }

  /**
   * Get all registered routes
   * @returns {Array} - Array of route definitions
   */
  getRoutes() {
    return Array.from(this.routes.values());
  }

  _createKey(method, path) {
    return `${method.toUpperCase()}:${path}`;
  }

  _pathToRegex(path) {
    const escaped = path
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\\:([a-zA-Z_][a-zA-Z0-9_]*)/g, '([^/]+)');
    return new RegExp(`^${escaped}$`);
  }

  _extractParamNames(path) {
    const matches = path.match(/:([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
    return matches.map(m => m.slice(1));
  }

  _extractParams(paramNames, match) {
    const params = {};
    paramNames.forEach((name, index) => {
      params[name] = match[index + 1];
    });
    return params;
  }
}

module.exports = { Router };
