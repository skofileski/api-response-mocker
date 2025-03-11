/**
 * @module api-response-mocker
 * @description A lightweight library for creating mock API responses with realistic data generation
 * @author API Response Mocker Contributors
 * @license MIT
 */

const { generators } = require('./generators');
const { parseSchema, generateFromSchema } = require('./schema');
const { Router } = require('./router');
const { ResponseHandler } = require('./response-handler');
const { delay, createDelayConfig } = require('./delay');
const { MockError, createErrorResponse, simulateError } = require('./errors');
const { createInterceptor } = require('./interceptor');
const { ScenarioManager } = require('./scenario');
const { SchemaValidator, createValidator } = require('./validator');
const { Logger, createLogger } = require('./logger');
const { StateManager, createState } = require('./state');

/**
 * Creates a new mock server instance with the provided configuration
 * @param {Object} [config={}] - Server configuration options
 * @param {number} [config.defaultDelay=0] - Default response delay in milliseconds
 * @param {number} [config.errorRate=0] - Error simulation rate (0-1)
 * @param {boolean} [config.logging=false] - Enable request/response logging
 * @returns {Object} Mock server instance
 * @example
 * const server = createMockServer({
 *   defaultDelay: 100,
 *   errorRate: 0.1,
 *   logging: true
 * });
 */
function createMockServer(config = {}) {
  const router = new Router();
  const handler = new ResponseHandler(config);
  const scenarioManager = new ScenarioManager();
  const logger = config.logging ? createLogger(config.loggerOptions) : null;
  const stateManager = createState();

  return {
    router,
    handler,
    scenarios: scenarioManager,
    logger,
    state: stateManager,

    /**
     * Registers a GET endpoint
     * @param {string} path - URL path pattern
     * @param {Object|Function} schema - Response schema or handler function
     * @returns {Object} Mock server instance for chaining
     */
    get(path, schema) {
      router.addRoute('GET', path, schema);
      return this;
    },

    /**
     * Registers a POST endpoint
     * @param {string} path - URL path pattern
     * @param {Object|Function} schema - Response schema or handler function
     * @returns {Object} Mock server instance for chaining
     */
    post(path, schema) {
      router.addRoute('POST', path, schema);
      return this;
    },

    /**
     * Registers a PUT endpoint
     * @param {string} path - URL path pattern
     * @param {Object|Function} schema - Response schema or handler function
     * @returns {Object} Mock server instance for chaining
     */
    put(path, schema) {
      router.addRoute('PUT', path, schema);
      return this;
    },

    /**
     * Registers a DELETE endpoint
     * @param {string} path - URL path pattern
     * @param {Object|Function} schema - Response schema or handler function
     * @returns {Object} Mock server instance for chaining
     */
    delete(path, schema) {
      router.addRoute('DELETE', path, schema);
      return this;
    },

    /**
     * Registers a PATCH endpoint
     * @param {string} path - URL path pattern
     * @param {Object|Function} schema - Response schema or handler function
     * @returns {Object} Mock server instance for chaining
     */
    patch(path, schema) {
      router.addRoute('PATCH', path, schema);
      return this;
    },

    /**
     * Handles an incoming request and returns a mock response
     * @param {string} method - HTTP method
     * @param {string} path - Request path
     * @param {Object} [options={}] - Additional request options
     * @returns {Promise<Object>} Mock response
     */
    async handle(method, path, options = {}) {
      if (logger) {
        logger.logRequest(method, path, options);
      }

      const response = await handler.handle(router, method, path, options);

      if (logger) {
        logger.logResponse(method, path, response);
      }

      return response;
    },

    /**
     * Resets the mock server state
     * @returns {Object} Mock server instance for chaining
     */
    reset() {
      router.reset();
      stateManager.clear();
      if (logger) {
        logger.clear();
      }
      return this;
    },
  };
}

module.exports = {
  // Main factory function
  createMockServer,

  // Data generators
  generators,

  // Schema utilities
  parseSchema,
  generateFromSchema,

  // Core components
  Router,
  ResponseHandler,

  // Delay utilities
  delay,
  createDelayConfig,

  // Error handling
  MockError,
  createErrorResponse,
  simulateError,

  // Request interception
  createInterceptor,

  // Scenario management
  ScenarioManager,

  // Validation
  SchemaValidator,
  createValidator,

  // Logging
  Logger,
  createLogger,

  // State management
  StateManager,
  createState,
};
