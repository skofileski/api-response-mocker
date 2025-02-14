/**
 * Schema Parser Module
 * Provides a simple DSL for defining mock response schemas
 */

const generators = require('./generators');

/**
 * Parses a schema definition and generates mock data
 * @param {Object} schema - The schema definition object
 * @returns {Object} Generated mock data matching the schema
 */
function parseSchema(schema) {
  if (schema === null || schema === undefined) {
    return null;
  }

  if (typeof schema === 'string') {
    return resolveGenerator(schema);
  }

  if (Array.isArray(schema)) {
    return parseArraySchema(schema);
  }

  if (typeof schema === 'object') {
    return parseObjectSchema(schema);
  }

  return schema;
}

/**
 * Resolves a generator string to actual generated data
 * @param {string} generatorString - Generator identifier (e.g., 'name', 'email')
 * @returns {*} Generated value
 */
function resolveGenerator(generatorString) {
  // Check if it's a generator reference (prefixed with @)
  if (generatorString.startsWith('@')) {
    const generatorName = generatorString.slice(1);
    const [type, ...args] = generatorName.split(':');
    
    if (generators[type]) {
      return generators[type](...args);
    }
    
    throw new Error(`Unknown generator: ${type}`);
  }
  
  // Return literal string value
  return generatorString;
}

/**
 * Parses an array schema definition
 * @param {Array} schema - Array schema definition
 * @returns {Array} Generated array
 */
function parseArraySchema(schema) {
  if (schema.length === 0) {
    return [];
  }

  // First element defines the item schema
  // Second element (optional) defines count or range
  const itemSchema = schema[0];
  const countConfig = schema[1] || 1;
  
  let count;
  if (typeof countConfig === 'number') {
    count = countConfig;
  } else if (typeof countConfig === 'object' && countConfig.min !== undefined) {
    const min = countConfig.min || 1;
    const max = countConfig.max || 10;
    count = Math.floor(Math.random() * (max - min + 1)) + min;
  } else {
    count = 1;
  }

  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(parseSchema(itemSchema));
  }
  
  return result;
}

/**
 * Parses an object schema definition
 * @param {Object} schema - Object schema definition
 * @returns {Object} Generated object
 */
function parseObjectSchema(schema) {
  const result = {};
  
  for (const [key, value] of Object.entries(schema)) {
    result[key] = parseSchema(value);
  }
  
  return result;
}

/**
 * Creates a reusable schema definition
 * @param {Object} definition - Schema definition object
 * @returns {Function} Function that generates data from the schema
 */
function defineSchema(definition) {
  return function generate() {
    return parseSchema(definition);
  };
}

module.exports = {
  parseSchema,
  defineSchema,
  resolveGenerator
};
