/**
 * Response Handler
 * Processes matched routes and generates mock responses
 */

const { SchemaParser } = require('./schema');
const generators = require('./generators');

class ResponseHandler {
  constructor(options = {}) {
    this.defaultDelay = options.delay || 0;
    this.schemaParser = new SchemaParser();
  }

  /**
   * Generate a response for the matched route
   * @param {object} route - Matched route from router
   * @param {object} context - Request context (body, query, headers)
   * @returns {Promise<object>} - Generated response
   */
  async handle(route, context = {}) {
    const { config, params } = route;
    
    // Check for error simulation
    if (config.error) {
      return this._handleError(config.error);
    }

    // Apply delay if configured
    const delay = config.delay ?? this.defaultDelay;
    if (delay > 0) {
      await this._delay(delay);
    }

    // Generate response body
    const body = this._generateBody(config, { params, ...context });

    return {
      status: config.status || 200,
      headers: config.headers || {},
      body
    };
  }

  /**
   * Generate response body from schema or static data
   */
  _generateBody(config, context) {
    if (config.schema) {
      return this._processSchema(config.schema, context);
    }
    
    if (config.body !== undefined) {
      return typeof config.body === 'function' 
        ? config.body(context) 
        : config.body;
    }

    return null;
  }

  /**
   * Process schema definition and generate data
   */
  _processSchema(schema, context) {
    if (Array.isArray(schema)) {
      const count = schema.length > 0 && schema[0]._count 
        ? schema[0]._count 
        : 1;
      const itemSchema = schema[0] || {};
      delete itemSchema._count;
      
      return Array.from({ length: count }, () => 
        this._processSchema(itemSchema, context)
      );
    }

    if (typeof schema === 'object' && schema !== null) {
      const result = {};
      
      for (const [key, value] of Object.entries(schema)) {
        if (key.startsWith('_')) continue;
        result[key] = this._processValue(value, context);
      }
      
      return result;
    }

    return this._processValue(schema, context);
  }

  /**
   * Process individual schema value
   */
  _processValue(value, context) {
    if (typeof value === 'string' && value.startsWith('$')) {
      return this._resolveGenerator(value.slice(1), context);
    }
    
    if (typeof value === 'object' && value !== null) {
      return this._processSchema(value, context);
    }
    
    return value;
  }

  /**
   * Resolve generator function from string identifier
   */
  _resolveGenerator(identifier, context) {
    // Handle param references like $params.id
    if (identifier.startsWith('params.')) {
      const paramName = identifier.slice(7);
      return context.params?.[paramName];
    }

    // Handle built-in generators
    if (generators[identifier]) {
      return generators[identifier]();
    }

    return `$${identifier}`;
  }

  /**
   * Handle error simulation
   */
  _handleError(errorConfig) {
    const status = typeof errorConfig === 'number' 
      ? errorConfig 
      : errorConfig.status || 500;
    
    const message = typeof errorConfig === 'object' 
      ? errorConfig.message 
      : undefined;

    return {
      status,
      headers: {},
      body: message ? { error: message } : null
    };
  }

  /**
   * Delay execution
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { ResponseHandler };
