/**
 * Request interceptor middleware for API mocker
 * Allows custom processing of requests before response generation
 */

class InterceptorChain {
  constructor() {
    this.interceptors = [];
  }

  /**
   * Add an interceptor to the chain
   * @param {Function} interceptor - Function(req, context) => context
   */
  use(interceptor) {
    if (typeof interceptor !== 'function') {
      throw new Error('Interceptor must be a function');
    }
    this.interceptors.push(interceptor);
    return this;
  }

  /**
   * Remove an interceptor from the chain
   * @param {Function} interceptor - The interceptor to remove
   */
  remove(interceptor) {
    const index = this.interceptors.indexOf(interceptor);
    if (index > -1) {
      this.interceptors.splice(index, 1);
    }
    return this;
  }

  /**
   * Clear all interceptors
   */
  clear() {
    this.interceptors = [];
    return this;
  }

  /**
   * Execute all interceptors in sequence
   * @param {Object} request - The incoming request object
   * @param {Object} initialContext - Initial context object
   * @returns {Promise<Object>} - Modified context after all interceptors
   */
  async execute(request, initialContext = {}) {
    let context = { ...initialContext };

    for (const interceptor of this.interceptors) {
      try {
        const result = await interceptor(request, context);
        if (result !== undefined) {
          context = { ...context, ...result };
        }
      } catch (error) {
        context.interceptorError = error;
        break;
      }
    }

    return context;
  }

  /**
   * Get the number of registered interceptors
   */
  get count() {
    return this.interceptors.length;
  }
}

/**
 * Built-in interceptors for common use cases
 */
const builtInInterceptors = {
  /**
   * Log all requests
   */
  logger: (logFn = console.log) => (req, context) => {
    logFn(`[MockAPI] ${req.method} ${req.path}`, { params: req.params, query: req.query });
    return context;
  },

  /**
   * Add authentication context based on headers
   */
  auth: (headerName = 'authorization') => (req, context) => {
    const authHeader = req.headers?.[headerName] || req.headers?.[headerName.toLowerCase()];
    return {
      ...context,
      authenticated: !!authHeader,
      authToken: authHeader ? authHeader.replace(/^Bearer\s+/i, '') : null
    };
  },

  /**
   * Add timestamp to context
   */
  timestamp: () => (req, context) => {
    return {
      ...context,
      requestTimestamp: Date.now(),
      requestDate: new Date().toISOString()
    };
  },

  /**
   * Rate limiting interceptor
   */
  rateLimit: (maxRequests = 100, windowMs = 60000) => {
    const requests = new Map();
    
    return (req, context) => {
      const key = req.ip || 'default';
      const now = Date.now();
      const windowStart = now - windowMs;

      // Clean old entries
      const timestamps = (requests.get(key) || []).filter(t => t > windowStart);
      timestamps.push(now);
      requests.set(key, timestamps);

      const remaining = Math.max(0, maxRequests - timestamps.length);
      
      return {
        ...context,
        rateLimited: timestamps.length > maxRequests,
        rateLimitRemaining: remaining
      };
    };
  },

  /**
   * Conditional response modifier
   */
  conditional: (condition, modifier) => (req, context) => {
    if (condition(req, context)) {
      return modifier(req, context);
    }
    return context;
  }
};

function createInterceptorChain() {
  return new InterceptorChain();
}

module.exports = {
  InterceptorChain,
  createInterceptorChain,
  builtInInterceptors
};
