/**
 * API Response Mocker
 * A lightweight library for creating mock API responses with realistic data generation
 */

const generators = require('./generators');
const { parseSchema, defineSchema } = require('./schema');

class ApiResponseMocker {
  constructor() {
    this.endpoints = new Map();
  }

  /**
   * Define a mock endpoint
   * @param {string} method - HTTP method (GET, POST, etc.)
   * @param {string} path - URL path
   * @param {Object} options - Endpoint configuration
   */
  define(method, path, options = {}) {
    const key = `${method.toUpperCase()}:${path}`;
    this.endpoints.set(key, {
      method: method.toUpperCase(),
      path,
      schema: options.schema || null,
      status: options.status || 200,
      headers: options.headers || {},
      ...options
    });
    return this;
  }

  /**
   * Generate response for a defined endpoint
   * @param {string} method - HTTP method
   * @param {string} path - URL path
   * @returns {Object} Generated response
   */
  generate(method, path) {
    const key = `${method.toUpperCase()}:${path}`;
    const endpoint = this.endpoints.get(key);

    if (!endpoint) {
      return {
        status: 404,
        body: { error: 'Endpoint not defined' },
        headers: {}
      };
    }

    const body = endpoint.schema ? parseSchema(endpoint.schema) : null;

    return {
      status: endpoint.status,
      body,
      headers: endpoint.headers
    };
  }
}

module.exports = {
  ApiResponseMocker,
  generators,
  defineSchema,
  parseSchema
};
