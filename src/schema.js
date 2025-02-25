/**
 * Schema parser and validator for mock API responses
 */

const generators = require('./generators');

class Schema {
  constructor(definition) {
    if (!definition || typeof definition !== 'object') {
      throw new Error('Schema definition must be a non-null object');
    }
    this.definition = definition;
  }

  generate() {
    return this.processValue(this.definition);
  }

  processValue(value) {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'string') {
      return this.processStringValue(value);
    }

    if (Array.isArray(value)) {
      return this.processArray(value);
    }

    if (typeof value === 'object') {
      return this.processObject(value);
    }

    return value;
  }

  processStringValue(value) {
    const generatorPattern = /^\{\{\s*(\w+)(?:\((.*?)\))?\s*\}\}$/;
    const match = value.match(generatorPattern);

    if (match) {
      const [, generatorName, argsString] = match;
      const args = argsString ? this.parseArgs(argsString) : [];
      return this.callGenerator(generatorName, args);
    }

    return value;
  }

  parseArgs(argsString) {
    if (!argsString || argsString.trim() === '') {
      return [];
    }

    const args = [];
    let current = '';
    let inString = false;
    let stringChar = null;
    let depth = 0;

    for (let i = 0; i < argsString.length; i++) {
      const char = argsString[i];

      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
        current += char;
      } else if (inString && char === stringChar && argsString[i - 1] !== '\\') {
        inString = false;
        stringChar = null;
        current += char;
      } else if (!inString && (char === '[' || char === '{')) {
        depth++;
        current += char;
      } else if (!inString && (char === ']' || char === '}')) {
        depth--;
        current += char;
      } else if (!inString && depth === 0 && char === ',') {
        args.push(this.parseArgValue(current.trim()));
        current = '';
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      args.push(this.parseArgValue(current.trim()));
    }

    return args;
  }

  parseArgValue(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (value === 'undefined') return undefined;

    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }

    const num = Number(value);
    if (!isNaN(num) && value !== '') {
      return num;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  callGenerator(name, args) {
    const generatorFn = generators[name];

    if (typeof generatorFn !== 'function') {
      console.warn(`Unknown generator: ${name}, returning null`);
      return null;
    }

    try {
      return generatorFn(...args);
    } catch (error) {
      console.warn(`Generator ${name} failed: ${error.message}, returning null`);
      return null;
    }
  }

  processArray(arr) {
    if (arr.length === 0) {
      return [];
    }
    return arr.map(item => this.processValue(item));
  }

  processObject(obj) {
    if (obj === null) {
      return null;
    }

    if (obj._repeat && obj._template) {
      const count = typeof obj._repeat === 'number' && obj._repeat > 0 ? obj._repeat : 1;
      return Array.from({ length: count }, () => this.processValue(obj._template));
    }

    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === undefined || value === undefined) {
        continue;
      }
      result[key] = this.processValue(value);
    }
    return result;
  }
}

function createSchema(definition) {
  return new Schema(definition);
}

module.exports = { Schema, createSchema };
