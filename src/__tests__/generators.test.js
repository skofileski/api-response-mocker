const generators = require('../generators');

describe('generators', () => {
  describe('uuid', () => {
    it('should generate a valid UUID v4 format', () => {
      const uuid = generators.uuid();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generators.uuid();
      const uuid2 = generators.uuid();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('email', () => {
    it('should generate a valid email format', () => {
      const email = generators.email();
      const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
      expect(email).toMatch(emailRegex);
    });
  });

  describe('name', () => {
    it('should generate a non-empty string', () => {
      const name = generators.name();
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });
  });

  describe('integer', () => {
    it('should generate an integer within default range', () => {
      const num = generators.integer();
      expect(Number.isInteger(num)).toBe(true);
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThanOrEqual(1000);
    });

    it('should respect min and max options', () => {
      const num = generators.integer({ min: 10, max: 20 });
      expect(num).toBeGreaterThanOrEqual(10);
      expect(num).toBeLessThanOrEqual(20);
    });
  });

  describe('boolean', () => {
    it('should generate a boolean value', () => {
      const bool = generators.boolean();
      expect(typeof bool).toBe('boolean');
    });
  });

  describe('date', () => {
    it('should generate a valid ISO date string', () => {
      const date = generators.date();
      const parsed = new Date(date);
      expect(parsed.toISOString()).toBe(date);
    });
  });

  describe('oneOf', () => {
    it('should return one of the provided options', () => {
      const options = ['a', 'b', 'c'];
      const result = generators.oneOf(options);
      expect(options).toContain(result);
    });
  });
});