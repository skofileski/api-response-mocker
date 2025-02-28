const { StateManager, StateStore, createStore, getStore, resetAll, clearAll } = require('../state');

describe('StateManager', () => {
  let manager;

  beforeEach(() => {
    manager = new StateManager();
  });

  describe('createStore', () => {
    it('should create a new store with initial state', () => {
      const store = manager.createStore('users', { items: [] });
      expect(store).toBeInstanceOf(StateStore);
      expect(store.getState()).toEqual({ items: [] });
    });

    it('should return existing store if already created', () => {
      const store1 = manager.createStore('users', { items: [] });
      const store2 = manager.createStore('users', { items: ['different'] });
      expect(store1).toBe(store2);
      expect(store2.getState()).toEqual({ items: [] });
    });

    it('should create store with empty object by default', () => {
      const store = manager.createStore('empty');
      expect(store.getState()).toEqual({});
    });
  });

  describe('getStore', () => {
    it('should return existing store', () => {
      const created = manager.createStore('test', { value: 1 });
      const retrieved = manager.getStore('test');
      expect(retrieved).toBe(created);
    });

    it('should return undefined for non-existent store', () => {
      expect(manager.getStore('nonexistent')).toBeUndefined();
    });
  });

  describe('hasStore', () => {
    it('should return true for existing store', () => {
      manager.createStore('exists');
      expect(manager.hasStore('exists')).toBe(true);
    });

    it('should return false for non-existent store', () => {
      expect(manager.hasStore('missing')).toBe(false);
    });
  });

  describe('deleteStore', () => {
    it('should delete existing store', () => {
      manager.createStore('toDelete');
      expect(manager.deleteStore('toDelete')).toBe(true);
      expect(manager.hasStore('toDelete')).toBe(false);
    });

    it('should return false for non-existent store', () => {
      expect(manager.deleteStore('missing')).toBe(false);
    });
  });

  describe('resetAll', () => {
    it('should reset all stores to initial state', () => {
      const store1 = manager.createStore('s1', { count: 0 });
      const store2 = manager.createStore('s2', { items: [] });
      
      store1.setState({ count: 10 });
      store2.push('items', 'item1');
      
      manager.resetAll();
      
      expect(store1.getState()).toEqual({ count: 0 });
      expect(store2.getState()).toEqual({ items: [] });
    });
  });

  describe('clearAll', () => {
    it('should remove all stores', () => {
      manager.createStore('s1');
      manager.createStore('s2');
      
      manager.clearAll();
      
      expect(manager.hasStore('s1')).toBe(false);
      expect(manager.hasStore('s2')).toBe(false);
    });
  });

  describe('middleware', () => {
    it('should call middleware on state changes', () => {
      const events = [];
      manager.use((event) => events.push(event));
      
      const store = manager.createStore('test', { value: 0 });
      store.setState({ value: 1 });
      
      expect(events).toHaveLength(1);
      expect(events[0].store).toBe('test');
      expect(events[0].action).toBe('SET');
    });

    it('should throw if middleware is not a function', () => {
      expect(() => manager.use('not a function')).toThrow('Middleware must be a function');
    });

    it('should handle middleware errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      manager.use(() => { throw new Error('Middleware error'); });
      
      const store = manager.createStore('test');
      expect(() => store.setState({ value: 1 })).not.toThrow();
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('snapshot and restore', () => {
    it('should create snapshot of all stores', () => {
      manager.createStore('s1', { a: 1 });
      manager.createStore('s2', { b: 2 });
      
      const snapshot = manager.snapshot();
      
      expect(snapshot).toEqual({
        s1: { a: 1 },
        s2: { b: 2 }
      });
    });

    it('should restore from snapshot', () => {
      const snapshot = {
        restored1: { x: 100 },
        restored2: { y: 200 }
      };
      
      manager.restore(snapshot);
      
      expect(manager.getStore('restored1').getState()).toEqual({ x: 100 });
      expect(manager.getStore('restored2').getState()).toEqual({ y: 200 });
    });
  });
});

describe('StateStore', () => {
  let manager;
  let store;

  beforeEach(() => {
    manager = new StateManager();
    store = manager.createStore('test', {
      users: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ],
      meta: {
        total: 2,
        page: 1
      }
    });
  });

  describe('getState', () => {
    it('should return a clone of state', () => {
      const state = store.getState();
      state.users.push({ id: 3, name: 'Charlie' });
      
      expect(store.getState().users).toHaveLength(2);
    });
  });

  describe('setState', () => {
    it('should replace entire state', () => {
      store.setState({ newState: true });
      expect(store.getState()).toEqual({ newState: true });
    });
  });

  describe('update', () => {
    it('should merge updates into state', () => {
      store.update({ meta: { page: 2 } });
      const state = store.getState();
      expect(state.meta).toEqual({ page: 2 });
      expect(state.users).toBeDefined();
    });

    it('should throw for non-object state', () => {
      const primitiveStore = manager.createStore('primitive', 'string value');
      expect(() => primitiveStore.update({ key: 'value' })).toThrow('Cannot update non-object state');
    });
  });

  describe('get', () => {
    it('should get value at path', () => {
      expect(store.get('meta.total')).toBe(2);
      expect(store.get('users')).toHaveLength(2);
    });

    it('should return undefined for missing path', () => {
      expect(store.get('missing.path')).toBeUndefined();
    });

    it('should return clone of value', () => {
      const users = store.get('users');
      users.push({ id: 3 });
      expect(store.get('users')).toHaveLength(2);
    });
  });

  describe('set', () => {
    it('should set value at path', () => {
      store.set('meta.page', 5);
      expect(store.get('meta.page')).toBe(5);
    });

    it('should create intermediate objects', () => {
      store.set('deep.nested.value', 'test');
      expect(store.get('deep.nested.value')).toBe('test');
    });
  });

  describe('push', () => {
    it('should push item to array', () => {
      store.push('users', { id: 3, name: 'Charlie' });
      expect(store.get('users')).toHaveLength(3);
    });

    it('should throw if path is not an array', () => {
      expect(() => store.push('meta', 'item')).toThrow('Path meta is not an array');
    });
  });

  describe('remove', () => {
    it('should remove item by predicate', () => {
      const removed = store.remove('users', (u) => u.id === 1);
      expect(removed).toEqual({ id: 1, name: 'Alice' });
      expect(store.get('users')).toHaveLength(1);
    });

    it('should return undefined if item not found', () => {
      const removed = store.remove('users', (u) => u.id === 999);
      expect(removed).toBeUndefined();
    });

    it('should throw if path is not an array', () => {
      expect(() => store.remove('meta', () => true)).toThrow('Path meta is not an array');
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      store.setState({ changed: true });
      store.reset();
      expect(store.get('users')).toHaveLength(2);
    });
  });

  describe('undo', () => {
    it('should undo last change', () => {
      const original = store.getState();
      store.setState({ changed: true });
      store.undo();
      expect(store.getState()).toEqual(original);
    });

    it('should return false if no history', () => {
      expect(store.undo()).toBe(false);
    });

    it('should support multiple undos', () => {
      store.set('meta.page', 2);
      store.set('meta.page', 3);
      store.set('meta.page', 4);
      
      store.undo();
      expect(store.get('meta.page')).toBe(3);
      
      store.undo();
      expect(store.get('meta.page')).toBe(2);
    });
  });

  describe('getHistoryLength', () => {
    it('should return history length', () => {
      expect(store.getHistoryLength()).toBe(0);
      store.setState({ a: 1 });
      expect(store.getHistoryLength()).toBe(1);
      store.setState({ b: 2 });
      expect(store.getHistoryLength()).toBe(2);
    });
  });
});

describe('Default exports', () => {
  beforeEach(() => {
    clearAll();
  });

  it('should provide createStore helper', () => {
    const store = createStore('helper-test', { value: 42 });
    expect(store.getState()).toEqual({ value: 42 });
  });

  it('should provide getStore helper', () => {
    createStore('get-test', { data: 'test' });
    const store = getStore('get-test');
    expect(store.getState()).toEqual({ data: 'test' });
  });

  it('should provide resetAll helper', () => {
    const store = createStore('reset-test', { count: 0 });
    store.setState({ count: 100 });
    resetAll();
    expect(store.getState()).toEqual({ count: 0 });
  });
});
