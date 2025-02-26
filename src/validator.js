/**
 * Request validation module with JSON schema support
 */

class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

const typeValidators = {
  string: (value) => typeof value === 'string',
  number: (value) => typeof value === 'number' && !isNaN(value),
  integer: (value) => Number.isInteger(value),
  boolean: (value) => typeof value === 'boolean',
  array: (value) => Array.isArray(value),
  object: (value) => typeof value === 'object' && value !== null && !Array.isArray(value),
  null: (value) => value === null
};

function validateType(value, type) {
  if (Array.isArray(type)) {
    return type.some(t => typeValidators[t]?.(value));
  }
  return typeValidators[type]?.(value) ?? true;
}

function validateString(value, schema) {
  const errors = [];
  
  if (schema.minLength !== undefined && value.length < schema.minLength) {
    errors.push(`String length must be at least ${schema.minLength}`);
  }
  
  if (schema.maxLength !== undefined && value.length > schema.maxLength) {
    errors.push(`String length must be at most ${schema.maxLength}`);
  }
  
  if (schema.pattern) {
    const regex = new RegExp(schema.pattern);
    if (!regex.test(value)) {
      errors.push(`String must match pattern ${schema.pattern}`);
    }
  }
  
  if (schema.format) {
    const formatValid = validateFormat(value, schema.format);
    if (!formatValid) {
      errors.push(`String must be a valid ${schema.format}`);
    }
  }
  
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`Value must be one of: ${schema.enum.join(', ')}`);
  }
  
  return errors;
}

function validateFormat(value, format) {
  const formats = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    'date-time': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    date: /^\d{4}-\d{2}-\d{2}$/,
    uri: /^https?:\/\/.+/,
    ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  };
  
  const regex = formats[format];
  return regex ? regex.test(value) : true;
}

function validateNumber(value, schema) {
  const errors = [];
  
  if (schema.minimum !== undefined) {
    if (schema.exclusiveMinimum && value <= schema.minimum) {
      errors.push(`Value must be greater than ${schema.minimum}`);
    } else if (!schema.exclusiveMinimum && value < schema.minimum) {
      errors.push(`Value must be at least ${schema.minimum}`);
    }
  }
  
  if (schema.maximum !== undefined) {
    if (schema.exclusiveMaximum && value >= schema.maximum) {
      errors.push(`Value must be less than ${schema.maximum}`);
    } else if (!schema.exclusiveMaximum && value > schema.maximum) {
      errors.push(`Value must be at most ${schema.maximum}`);
    }
  }
  
  if (schema.multipleOf !== undefined && value % schema.multipleOf !== 0) {
    errors.push(`Value must be a multiple of ${schema.multipleOf}`);
  }
  
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`Value must be one of: ${schema.enum.join(', ')}`);
  }
  
  return errors;
}

function validateArray(value, schema, path = '') {
  const errors = [];
  
  if (schema.minItems !== undefined && value.length < schema.minItems) {
    errors.push(`Array must have at least ${schema.minItems} items`);
  }
  
  if (schema.maxItems !== undefined && value.length > schema.maxItems) {
    errors.push(`Array must have at most ${schema.maxItems} items`);
  }
  
  if (schema.uniqueItems) {
    const seen = new Set();
    const hasDuplicates = value.some(item => {
      const key = JSON.stringify(item);
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });
    if (hasDuplicates) {
      errors.push('Array items must be unique');
    }
  }
  
  if (schema.items) {
    value.forEach((item, index) => {
      const itemErrors = validateValue(item, schema.items, `${path}[${index}]`);
      errors.push(...itemErrors);
    });
  }
  
  return errors;
}

function validateObject(value, schema, path = '') {
  const errors = [];
  
  // Check required properties
  if (schema.required) {
    schema.required.forEach(prop => {
      if (!(prop in value)) {
        errors.push(`Missing required property: ${path ? path + '.' : ''}${prop}`);
      }
    });
  }
  
  // Validate properties
  if (schema.properties) {
    Object.keys(value).forEach(key => {
      if (schema.properties[key]) {
        const propPath = path ? `${path}.${key}` : key;
        const propErrors = validateValue(value[key], schema.properties[key], propPath);
        errors.push(...propErrors);
      } else if (schema.additionalProperties === false) {
        errors.push(`Additional property not allowed: ${path ? path + '.' : ''}${key}`);
      } else if (typeof schema.additionalProperties === 'object') {
        const propPath = path ? `${path}.${key}` : key;
        const propErrors = validateValue(value[key], schema.additionalProperties, propPath);
        errors.push(...propErrors);
      }
    });
  }
  
  // Check property count
  const propCount = Object.keys(value).length;
  if (schema.minProperties !== undefined && propCount < schema.minProperties) {
    errors.push(`Object must have at least ${schema.minProperties} properties`);
  }
  if (schema.maxProperties !== undefined && propCount > schema.maxProperties) {
    errors.push(`Object must have at most ${schema.maxProperties} properties`);
  }
  
  return errors;
}

function validateValue(value, schema, path = '') {
  const errors = [];
  const prefix = path ? `${path}: ` : '';
  
  // Handle nullable
  if (value === null && schema.nullable) {
    return errors;
  }
  
  // Type validation
  if (schema.type && !validateType(value, schema.type)) {
    errors.push(`${prefix}Expected type ${schema.type}, got ${typeof value}`);
    return errors;
  }
  
  // Type-specific validation
  if (typeof value === 'string') {
    errors.push(...validateString(value, schema).map(e => prefix + e));
  } else if (typeof value === 'number') {
    errors.push(...validateNumber(value, schema).map(e => prefix + e));
  } else if (Array.isArray(value)) {
    errors.push(...validateArray(value, schema, path));
  } else if (typeof value === 'object' && value !== null) {
    errors.push(...validateObject(value, schema, path));
  }
  
  // Const validation
  if (schema.const !== undefined && value !== schema.const) {
    errors.push(`${prefix}Value must be ${JSON.stringify(schema.const)}`);
  }
  
  return errors;
}

function validate(data, schema, options = {}) {
  const { throwOnError = true } = options;
  const errors = validateValue(data, schema);
  
  if (errors.length > 0) {
    if (throwOnError) {
      throw new ValidationError('Validation failed', errors);
    }
    return { valid: false, errors };
  }
  
  return { valid: true, errors: [] };
}

function createValidator(schema) {
  return (data, options) => validate(data, schema, options);
}

module.exports = {
  validate,
  createValidator,
  ValidationError,
  validateValue,
  validateFormat
};
