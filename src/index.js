import { FakeDataGenerator } from './generators.js';

/**
 * API Response Mocker - Create configurable mock endpoints with realistic data
 */
export class ApiMocker {
	constructor(options = {}) {
		this.endpoints = new Map();
		this.defaultDelay = options.delay || 0;
		this.generator = new FakeDataGenerator();
	}

	/**
	 * Define a mock endpoint with a response schema
	 * @param {string} method - HTTP method (GET, POST, etc.)
	 * @param {string} path - Endpoint path
	 * @param {object} schema - Response schema definition
	 * @param {object} options - Endpoint-specific options
	 */
	define(method, path, schema, options = {}) {
		const key = `${method.toUpperCase()}:${path}`;
		this.endpoints.set(key, {
			schema,
			delay: options.delay ?? this.defaultDelay,
			errorRate: options.errorRate || 0,
			errorStatus: options.errorStatus || 500,
			count: options.count || 1
		});
		return this;
	}

	/**
	 * Generate a response for a defined endpoint
	 * @param {string} method - HTTP method
	 * @param {string} path - Endpoint path
	 * @returns {Promise<object>} Mock response
	 */
	async request(method, path) {
		const key = `${method.toUpperCase()}:${path}`;
		const endpoint = this.endpoints.get(key);

		if (!endpoint) {
			return { status: 404, data: { error: 'Endpoint not found' } };
		}

		// Simulate network delay
		if (endpoint.delay > 0) {
			await this._delay(endpoint.delay);
		}

		// Simulate random errors
		if (endpoint.errorRate > 0 && Math.random() < endpoint.errorRate) {
			return {
				status: endpoint.errorStatus,
				data: { error: 'Simulated error' }
			};
		}

		// Generate response data
		const data = endpoint.count > 1
			? Array.from({ length: endpoint.count }, () => this._generateFromSchema(endpoint.schema))
			: this._generateFromSchema(endpoint.schema);

		return { status: 200, data };
	}

	/**
	 * Generate data from a schema definition
	 * @param {object} schema - Schema object
	 * @returns {object} Generated data
	 */
	_generateFromSchema(schema) {
		const result = {};

		for (const [field, type] of Object.entries(schema)) {
			if (typeof type === 'object' && !type._type) {
				// Nested object
				result[field] = this._generateFromSchema(type);
			} else if (typeof type === 'object' && type._type) {
				// Type with options
				result[field] = this.generator.generate(type._type, type);
			} else {
				// Simple type string
				result[field] = this.generator.generate(type);
			}
		}

		return result;
	}

	/**
	 * Promise-based delay helper
	 * @param {number} ms - Milliseconds to delay
	 */
	_delay(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}

// Export generators for direct use
export { FakeDataGenerator } from './generators.js';

// Convenience factory function
export function createMocker(options) {
	return new ApiMocker(options);
}