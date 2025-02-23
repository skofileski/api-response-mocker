const { ScenarioManager, ScenarioPresets, createScenarioManager } = require('../scenario');

describe('ScenarioManager', () => {
  let manager;

  beforeEach(() => {
    manager = new ScenarioManager();
  });

  describe('define', () => {
    it('should define a scenario', () => {
      manager.define('test-scenario', {
        response: { message: 'test' }
      });

      expect(manager.has('test-scenario')).toBe(true);
    });

    it('should throw error for invalid name', () => {
      expect(() => manager.define('', {})).toThrow('Scenario name must be a non-empty string');
      expect(() => manager.define(null, {})).toThrow('Scenario name must be a non-empty string');
    });

    it('should support method chaining', () => {
      const result = manager.define('scenario1', {}).define('scenario2', {});
      expect(result).toBe(manager);
      expect(manager.list()).toEqual(['scenario1', 'scenario2']);
    });
  });

  describe('activate/deactivate', () => {
    beforeEach(() => {
      manager.define('auth-error', {
        statusCode: 401,
        response: { error: 'Unauthorized' }
      });
    });

    it('should activate a scenario globally', () => {
      manager.activate('auth-error');
      const active = manager.getActiveScenarios('/any-endpoint');
      expect(active).toHaveLength(1);
      expect(active[0].name).toBe('auth-error');
    });

    it('should activate a scenario for specific endpoint', () => {
      manager.activate('auth-error', '/users');
      
      const usersActive = manager.getActiveScenarios('/users');
      expect(usersActive).toHaveLength(1);

      const otherActive = manager.getActiveScenarios('/products');
      expect(otherActive).toHaveLength(0);
    });

    it('should throw error when activating non-existent scenario', () => {
      expect(() => manager.activate('non-existent')).toThrow('Scenario "non-existent" not found');
    });

    it('should deactivate a scenario', () => {
      manager.activate('auth-error');
      manager.deactivate('auth-error');
      
      const active = manager.getActiveScenarios('/any');
      expect(active).toHaveLength(0);
    });

    it('should reset all scenarios', () => {
      manager.define('scenario2', {});
      manager.activate('auth-error');
      manager.activate('scenario2', '/users');
      
      manager.reset();
      
      expect(manager.getActiveScenarios('/any')).toHaveLength(0);
      expect(manager.getActiveScenarios('/users')).toHaveLength(0);
    });
  });

  describe('evaluate', () => {
    it('should return matching scenario', () => {
      manager.define('missing-token', {
        condition: (req) => !req.headers?.authorization,
        statusCode: 401
      });
      manager.activate('missing-token');

      const result = manager.evaluate('/api/users', { headers: {} });
      expect(result).not.toBeNull();
      expect(result.statusCode).toBe(401);
    });

    it('should return null when no scenario matches', () => {
      manager.define('missing-token', {
        condition: (req) => !req.headers?.authorization,
        statusCode: 401
      });
      manager.activate('missing-token');

      const result = manager.evaluate('/api/users', { 
        headers: { authorization: 'Bearer token' } 
      });
      expect(result).toBeNull();
    });

    it('should handle condition errors gracefully', () => {
      manager.define('error-scenario', {
        condition: () => { throw new Error('Condition error'); }
      });
      manager.activate('error-scenario');

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = manager.evaluate('/api', {});
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should combine global and endpoint-specific scenarios', () => {
      manager.define('global', { condition: () => false });
      manager.define('specific', { condition: () => true });
      
      manager.activate('global');
      manager.activate('specific', '/users');

      const result = manager.evaluate('/users', {});
      expect(result.name).toBe('specific');
    });
  });

  describe('list', () => {
    it('should return all defined scenario names', () => {
      manager.define('scenario1', {});
      manager.define('scenario2', {});
      manager.define('scenario3', {});

      expect(manager.list()).toEqual(['scenario1', 'scenario2', 'scenario3']);
    });
  });
});

describe('ScenarioPresets', () => {
  describe('unauthorized', () => {
    it('should match requests without authorization', () => {
      const preset = ScenarioPresets.unauthorized();
      
      expect(preset.condition({ headers: {} })).toBe(true);
      expect(preset.condition({ headers: { authorization: 'Bearer token' } })).toBe(false);
      expect(preset.statusCode).toBe(401);
    });
  });

  describe('rateLimited', () => {
    it('should trigger after limit exceeded', () => {
      const preset = ScenarioPresets.rateLimited(3);
      
      expect(preset.condition({})).toBe(false); // 1
      expect(preset.condition({})).toBe(false); // 2
      expect(preset.condition({})).toBe(false); // 3
      expect(preset.condition({})).toBe(true);  // 4 - exceeded
      expect(preset.statusCode).toBe(429);
    });
  });

  describe('maintenance', () => {
    it('should always match', () => {
      const preset = ScenarioPresets.maintenance();
      
      expect(preset.condition({})).toBe(true);
      expect(preset.statusCode).toBe(503);
    });
  });

  describe('queryParam', () => {
    it('should match based on query parameter', () => {
      const preset = ScenarioPresets.queryParam('debug', 'true');
      
      expect(preset.condition({ query: { debug: 'true' } })).toBe(true);
      expect(preset.condition({ query: { debug: 'false' } })).toBe(false);
      expect(preset.condition({ query: {} })).toBe(false);
    });
  });

  describe('header', () => {
    it('should match based on header value', () => {
      const preset = ScenarioPresets.header('X-Test-Mode', 'enabled');
      
      expect(preset.condition({ headers: { 'x-test-mode': 'enabled' } })).toBe(true);
      expect(preset.condition({ headers: { 'x-test-mode': 'disabled' } })).toBe(false);
    });
  });
});

describe('createScenarioManager', () => {
  it('should create a new ScenarioManager instance', () => {
    const manager = createScenarioManager();
    expect(manager).toBeInstanceOf(ScenarioManager);
  });
});
