const { Schema, createSchema } = require('../schema');
const generators = require('../generators');

describe('Schema', () => {
  beforeEach(() => {
    generators.sequence.reset();
  });

  describe('constructor', () => {
    it('should throw error for null definition', () => {
      expect(() => new Schema(null)).toThrow('Schema definition must be a non-null object');
    });

    it('should throw error for undefined definition', () => {
      expect(() => new Schema(undefined)).toThrow('Schema definition must be a non-null object');
    });

    it('should throw error for non-object definition', () => {
      expect(() => new Schema('string')).toThrow('Schema definition must be a non-null object');
    });

    it('should accept valid object definition', () => {
      const schema = new Schema({ name: 'test' });
      expect(schema.definition).toEqual({ name: 'test' });
    });
  });

  describe('generate', () => {
    it('should handle null values in schema', () => {
      const schema = createSchema({ value: null });
      expect(schema.generate()).toEqual({ value: null });
    });

    it('should handle empty arrays', () => {
      const schema = createSchema({ items: [] });
      expect(schema.generate()).toEqual({ items: [] });
    });

    it('should return null for unknown generators', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const schema = createSchema({ value: '{{unknownGenerator}}' });
      const result = schema.generate();
      expect(result.value).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown generator'));
      consoleSpy.mockRestore();
    });

    it('should handle generators with invalid arguments gracefully', () => {
      const schema = createSchema({ num: '{{integer("invalid", "args")}}' });
      const result = schema.generate();
      expect(typeof result.num).toBe('number');
    });

    it('should handle _repeat with invalid count', () => {
      const schema = createSchema({
        items: {
          _repeat: -5,
          _template: { id: '{{uuid}}' }
        }
      });
      const result = schema.generate();
      expect(result.items).toHaveLength(1);
    });

    it('should handle _repeat with zero count', () => {
      const schema = createSchema({
        items: {
          _repeat: 0,
          _template: { id: '{{uuid}}' }
        }
      });
      const result = schema.generate();
      expect(result.items).toHaveLength(1);
    });

    it('should process nested objects correctly', () => {
      const schema = createSchema({
        user: {
          profile: {
            name: '{{fullName}}',
            email: '{{email}}'
          }
        }
      });
      const result = schema.generate();
      expect(result.user.profile.name).toBeDefined();
      expect(result.user.profile.email).toContain('@');
    });

    it('should handle mixed static and dynamic values', () => {
      const schema = createSchema({
        type: 'user',
        id: '{{uuid}}',
        count: 42
      });
      const result = schema.generate();
      expect(result.type).toBe('user');
      expect(result.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(result.count).toBe(42);
    });
  });

  describe('parseArgs', () => {
    it('should handle empty argument string', () => {
      const schema = new Schema({});
      expect(schema.parseArgs('')).toEqual([]);
    });

    it('should handle whitespace-only argument string', () => {
      const schema = new Schema({});
      expect(schema.parseArgs('   ')).toEqual([]);
    });

    it('should parse boolean arguments', () => {
      const schema = new Schema({});
      expect(schema.parseArgs('true, false')).toEqual([true, false]);
    });

    it('should parse null argument', () => {
      const schema = new Schema({});
      expect(schema.parseArgs('null')).toEqual([null]);
    });
  });
});
