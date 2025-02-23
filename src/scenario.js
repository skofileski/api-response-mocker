/**
 * Scenario manager for conditional mock responses
 * Allows defining different response scenarios based on request conditions
 */

class ScenarioManager {
  constructor() {
    this.scenarios = new Map();
    this.activeScenarios = new Map();
  }

  /**
   * Define a new scenario
   * @param {string} name - Scenario name
   * @param {Object} config - Scenario configuration
   * @param {Function} [config.condition] - Function to evaluate if scenario applies
   * @param {Object} [config.response] - Response override for this scenario
   * @param {number} [config.statusCode] - Status code override
   * @param {Object} [config.headers] - Headers override
   */
  define(name, config) {
    if (!name || typeof name !== 'string') {
      throw new Error('Scenario name must be a non-empty string');
    }

    this.scenarios.set(name, {
      name,
      condition: config.condition || (() => true),
      response: config.response || null,
      statusCode: config.statusCode || null,
      headers: config.headers || {},
      enabled: false
    });

    return this;
  }

  /**
   * Activate a scenario
   * @param {string} name - Scenario name
   * @param {string} [endpoint] - Optional endpoint to scope the scenario
   */
  activate(name, endpoint = '*') {
    const scenario = this.scenarios.get(name);
    if (!scenario) {
      throw new Error(`Scenario "${name}" not found`);
    }

    if (!this.activeScenarios.has(endpoint)) {
      this.activeScenarios.set(endpoint, new Set());
    }

    this.activeScenarios.get(endpoint).add(name);
    return this;
  }

  /**
   * Deactivate a scenario
   * @param {string} name - Scenario name
   * @param {string} [endpoint] - Optional endpoint to scope the scenario
   */
  deactivate(name, endpoint = '*') {
    const endpointScenarios = this.activeScenarios.get(endpoint);
    if (endpointScenarios) {
      endpointScenarios.delete(name);
    }
    return this;
  }

  /**
   * Deactivate all scenarios
   */
  reset() {
    this.activeScenarios.clear();
    return this;
  }

  /**
   * Get active scenarios for an endpoint
   * @param {string} endpoint - Endpoint path
   * @returns {Array} Active scenarios
   */
  getActiveScenarios(endpoint) {
    const active = [];
    
    // Check global scenarios
    const globalScenarios = this.activeScenarios.get('*');
    if (globalScenarios) {
      for (const name of globalScenarios) {
        const scenario = this.scenarios.get(name);
        if (scenario) {
          active.push(scenario);
        }
      }
    }

    // Check endpoint-specific scenarios
    const endpointScenarios = this.activeScenarios.get(endpoint);
    if (endpointScenarios) {
      for (const name of endpointScenarios) {
        const scenario = this.scenarios.get(name);
        if (scenario && !active.includes(scenario)) {
          active.push(scenario);
        }
      }
    }

    return active;
  }

  /**
   * Evaluate scenarios against a request and return the first matching
   * @param {string} endpoint - Endpoint path
   * @param {Object} request - Request object
   * @returns {Object|null} Matching scenario or null
   */
  evaluate(endpoint, request) {
    const activeScenarios = this.getActiveScenarios(endpoint);

    for (const scenario of activeScenarios) {
      try {
        if (scenario.condition(request)) {
          return scenario;
        }
      } catch (error) {
        console.warn(`Scenario "${scenario.name}" condition threw error:`, error.message);
      }
    }

    return null;
  }

  /**
   * Check if a scenario exists
   * @param {string} name - Scenario name
   * @returns {boolean}
   */
  has(name) {
    return this.scenarios.has(name);
  }

  /**
   * Get all defined scenario names
   * @returns {Array<string>}
   */
  list() {
    return Array.from(this.scenarios.keys());
  }
}

/**
 * Create common scenario presets
 */
const ScenarioPresets = {
  /**
   * Create an unauthorized scenario
   */
  unauthorized() {
    return {
      condition: (req) => !req.headers?.authorization,
      statusCode: 401,
      response: { error: 'Unauthorized', message: 'Authentication required' }
    };
  },

  /**
   * Create a rate limited scenario
   * @param {number} limit - Request limit
   */
  rateLimited(limit = 100) {
    let requestCount = 0;
    return {
      condition: () => {
        requestCount++;
        return requestCount > limit;
      },
      statusCode: 429,
      response: { error: 'Too Many Requests', message: 'Rate limit exceeded' },
      headers: { 'Retry-After': '60' }
    };
  },

  /**
   * Create a maintenance mode scenario
   */
  maintenance() {
    return {
      condition: () => true,
      statusCode: 503,
      response: { error: 'Service Unavailable', message: 'System under maintenance' }
    };
  },

  /**
   * Create a scenario based on query parameter
   * @param {string} param - Query parameter name
   * @param {string} value - Expected value
   */
  queryParam(param, value) {
    return {
      condition: (req) => req.query?.[param] === value
    };
  },

  /**
   * Create a scenario based on header value
   * @param {string} header - Header name
   * @param {string} value - Expected value
   */
  header(header, value) {
    return {
      condition: (req) => req.headers?.[header.toLowerCase()] === value
    };
  }
};

function createScenarioManager() {
  return new ScenarioManager();
}

module.exports = {
  ScenarioManager,
  ScenarioPresets,
  createScenarioManager
};
