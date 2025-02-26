const {
  validate,
  createValidator,
  ValidationError,
  validateFormat
} = require('../validator');

describe('Validator', () => {
  describe('validate', () => {
    it('should validate string type', () => {
      const schema = { type: 'string' };
      expect(validate('hello', schema)).toEqual({ valid: true, errors: [] });
      expect(() => validate(123, schema)).toThrow(ValidationError);
    });

    it('should validate number type', () => {
      const schema = { type: 'number' };
      expect(validate(42, schema)).toEqual({ valid: true, errors: [] });
      expect(validate(3.14, schema)).toEqual({ valid: true, errors: [] });
      expect(() => validate('42', schema)).toThrow(ValidationError);
    });

    it('should validate integer type', () => {
      const schema = { type: 'integer' };
      expect(validate(42, schema)).toEqual({ valid: true, errors: [] });
      expect(() => validate(3.14, schema)).toThrow(ValidationError);
    });

    it('should validate boolean type', () => {
      const schema = { type: 'boolean' };
      expect(validate(true, schema)).toEqual({ valid: true, errors: [] });
      expect(validate(false, schema)).toEqual({ valid: true, errors: [] });
      expect(() => validate('true', schema)).toThrow(ValidationError);
    });

    it('should validate array type', () => {
      const schema = { type: 'array' };
      expect(validate([1, 2, 3], schema)).toEqual({ valid: true, errors: [] });
      expect(() => validate({}, schema)).toThrow(ValidationError);
    });

    it('should validate object type', () => {
      const schema = { type: 'object' };
      expect(validate({ a: 1 }, schema)).toEqual({ valid: true, errors: [] });
      expect(() => validate([], schema)).toThrow(ValidationError);
    });
  });

  describe('string validation', () => {
    it('should validate minLength', () => {
      const schema = { type: 'string', minLength: 3 };
      expect(validate('hello', schema).valid).toBe(true);
      expect(() => validate('hi', schema)).toThrow(ValidationError);
    });

    it('should validate maxLength', () => {
      const schema = { type: 'string', maxLength: 5 };
      expect(validate('hello', schema).valid).toBe(true);
      expect(() => validate('hello world', schema)).toThrow(ValidationError);
    });

    it('should validate pattern', () => {
      const schema = { type: 'string', pattern: '^[a-z]+$' };
      expect(validate('hello', schema).valid).toBe(true);
      expect(() => validate('Hello123', schema)).toThrow(ValidationError);
    });

    it('should validate enum', () => {
      const schema = { type: 'string', enum: ['red', 'green', 'blue'] };
      expect(validate('red', schema).valid).toBe(true);
      expect(() => validate('yellow', schema)).toThrow(ValidationError);
    });

    it('should validate email format', () => {
      const schema = { type: 'string', format: 'email' };
      expect(validate('test@example.com', schema).valid).toBe(true);
      expect(() => validate('invalid-email', schema)).toThrow(ValidationError);
    });

    it('should validate uuid format', () => {
      const schema = { type: 'string', format: 'uuid' };
      expect(validate('123e4567-e89b-12d3-a456-426614174000', schema).valid).toBe(true);
      expect(() => validate('not-a-uuid', schema)).toThrow(ValidationError);
    });
  });

  describe('number validation', () => {
    it('should validate minimum', () => {
      const schema = { type: 'number', minimum: 0 };
      expect(validate(5, schema).valid).toBe(true);
      expect(validate(0, schema).valid).toBe(true);
      expect(() => validate(-1, schema)).toThrow(ValidationError);
    });

    it('should validate maximum', () => {
      const schema = { type: 'number', maximum: 100 };
      expect(validate(50, schema).valid).toBe(true);
      expect(() => validate(101, schema)).toThrow(ValidationError);
    });

    it('should validate exclusiveMinimum', () => {
      const schema = { type: 'number', minimum: 0, exclusiveMinimum: true };
      expect(validate(1, schema).valid).toBe(true);
      expect(() => validate(0, schema)).toThrow(ValidationError);
    });

    it('should validate multipleOf', () => {
      const schema = { type: 'number', multipleOf: 5 };
      expect(validate(10, schema).valid).toBe(true);
      expect(() => validate(7, schema)).toThrow(ValidationError);
    });
  });

  describe('array validation', () => {
    it('should validate minItems', () => {
      const schema = { type: 'array', minItems: 2 };
      expect(validate([1, 2, 3], schema).valid).toBe(true);
      expect(() => validate([1], schema)).toThrow(ValidationError);
    });

    it('should validate maxItems', () => {
      const schema = { type: 'array', maxItems: 3 };
      expect(validate([1, 2], schema).valid).toBe(true);
      expect(() => validate([1, 2, 3, 4], schema)).toThrow(ValidationError);
    });

    it('should validate uniqueItems', () => {
      const schema = { type: 'array', uniqueItems: true };
      expect(validate([1, 2, 3], schema).valid).toBe(true);
      expect(() => validate([1, 2, 2], schema)).toThrow(ValidationError);
    });

    it('should validate items schema', () => {
      const schema = {
        type: 'array',
        items: { type: 'number', minimum: 0 }
      };
      expect(validate([1, 2, 3], schema).valid).toBe(true);
      expect(() => validate([1, -1, 3], schema)).toThrow(ValidationError);
    });
  });

  describe('object validation', () => {
    it('should validate required properties', () => {
      const schema = {
        type: 'object',
        required: ['name', 'email']
      };
      expect(validate({ name: 'John', email: 'john@test.com' }, schema).valid).toBe(true);
      expect(() => validate({ name: 'John' }, schema)).toThrow(ValidationError);
    });

    it('should validate nested properties', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'integer', minimum: 0 }
        }
      };
      expect(validate({ name: 'John', age: 30 }, schema).valid).toBe(true);
      expect(() => validate({ name: 'John', age: -5 }, schema)).toThrow(ValidationError);
    });

    it('should reject additional properties when configured', () => {
      const schema = {
        type: 'object',
        properties: { name: { type: 'string' } },
        additionalProperties: false
      };
      expect(validate({ name: 'John' }, schema).valid).toBe(true);
      expect(() => validate({ name: 'John', extra: true }, schema)).toThrow(ValidationError);
    });

    it('should validate additional properties schema', () => {
      const schema = {
        type: 'object',
        additionalProperties: { type: 'number' }
      };
      expect(validate({ a: 1, b: 2 }, schema).valid).toBe(true);
      expect(() => validate({ a: 'string' }, schema)).toThrow(ValidationError);
    });
  });

  describe('nullable', () => {
    it('should allow null when nullable is true', () => {
      const schema = { type: 'string', nullable: true };
      expect(validate(null, schema).valid).toBe(true);
      expect(validate('hello', schema).valid).toBe(true);
    });
  });

  describe('const', () => {
    it('should validate const value', () => {
      const schema = { const: 'fixed-value' };
      expect(validate('fixed-value', schema).valid).toBe(true);
      expect(() => validate('other', schema)).toThrow(ValidationError);
    });
  });

  describe('createValidator', () => {
    it('should create a reusable validator function', () => {
      const schema = {
        type: 'object',
        required: ['id', 'name'],
        properties: {
          id: { type: 'integer' },
          name: { type: 'string', minLength: 1 }
        }
      };
      const validator = createValidator(schema);

      expect(validator({ id: 1, name: 'Test' }).valid).toBe(true);
      expect(() => validator({ id: 'not-int', name: 'Test' })).toThrow(ValidationError);
    });
  });

  describe('options', () => {
    it('should return errors without throwing when throwOnError is false', () => {
      const schema = { type: 'string', minLength: 5 };
      const result = validate('hi', schema, { throwOnError: false });
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateFormat', () => {
    it('should validate date format', () => {
      expect(validateFormat('2024-01-15', 'date')).toBe(true);
      expect(validateFormat('invalid', 'date')).toBe(false);
    });

    it('should validate date-time format', () => {
      expect(validateFormat('2024-01-15T10:30:00Z', 'date-time')).toBe(true);
      expect(validateFormat('invalid', 'date-time')).toBe(false);
    });

    it('should validate uri format', () => {
      expect(validateFormat('https://example.com', 'uri')).toBe(true);
      expect(validateFormat('not-a-url', 'uri')).toBe(false);
    });

    it('should validate ipv4 format', () => {
      expect(validateFormat('192.168.1.1', 'ipv4')).toBe(true);
      expect(validateFormat('999.999.999.999', 'ipv4')).toBe(false);
    });
  });
});
