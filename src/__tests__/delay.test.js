const {
  DelayController,
  delayController,
  setDelay,
  setDelayRange,
  applyDelay,
  resetDelay
} = require('../delay');

describe('DelayController', () => {
  let controller;

  beforeEach(() => {
    controller = new DelayController();
  });

  afterEach(() => {
    controller.reset();
  });

  describe('setDelay', () => {
    it('should set a fixed delay', () => {
      controller.setDelay(100);
      expect(controller.getDelay()).toBe(100);
    });

    it('should throw for negative delay', () => {
      expect(() => controller.setDelay(-100)).toThrow('non-negative');
    });

    it('should throw for non-number delay', () => {
      expect(() => controller.setDelay('100')).toThrow('number');
    });

    it('should throw for Infinity', () => {
      expect(() => controller.setDelay(Infinity)).toThrow('finite');
    });

    it('should throw for NaN', () => {
      expect(() => controller.setDelay(NaN)).toThrow('finite');
    });

    it('should clear delay range when setting fixed delay', () => {
      controller.setDelayRange(50, 100);
      controller.setDelay(75);
      expect(controller.delayRange).toBeNull();
    });
  });

  describe('setDelayRange', () => {
    it('should set a delay range', () => {
      controller.setDelayRange(50, 150);
      const delay = controller.getDelay();
      expect(delay).toBeGreaterThanOrEqual(50);
      expect(delay).toBeLessThanOrEqual(150);
    });

    it('should throw if min > max', () => {
      expect(() => controller.setDelayRange(150, 50)).toThrow('cannot be greater');
    });

    it('should throw for negative values', () => {
      expect(() => controller.setDelayRange(-10, 100)).toThrow('non-negative');
    });

    it('should throw for non-number values', () => {
      expect(() => controller.setDelayRange('50', 100)).toThrow('must be numbers');
    });

    it('should throw for infinite values', () => {
      expect(() => controller.setDelayRange(0, Infinity)).toThrow('finite');
    });

    it('should allow equal min and max', () => {
      controller.setDelayRange(100, 100);
      expect(controller.getDelay()).toBe(100);
    });
  });

  describe('apply', () => {
    it('should resolve immediately for zero delay', async () => {
      controller.setDelay(0);
      const start = Date.now();
      await controller.apply();
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(50);
    });

    it('should apply custom delay', async () => {
      const start = Date.now();
      await controller.apply(50);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(45);
    });

    it('should throw for invalid custom delay', async () => {
      await expect(controller.apply(-10)).rejects.toThrow('non-negative');
    });

    it('should throw when aborted', async () => {
      controller.abort();
      await expect(controller.apply(10)).rejects.toThrow('aborted');
    });

    it('should track pending delays', async () => {
      controller.setDelay(100);
      const promise = controller.apply();
      expect(controller.hasPendingDelays()).toBe(true);
      expect(controller.getPendingCount()).toBe(1);
      await promise;
      expect(controller.hasPendingDelays()).toBe(false);
    });
  });

  describe('cancelAll', () => {
    it('should cancel all pending delays', () => {
      controller.setDelay(1000);
      controller.apply();
      controller.apply();
      expect(controller.getPendingCount()).toBe(2);
      controller.cancelAll();
      expect(controller.getPendingCount()).toBe(0);
    });
  });

  describe('abort', () => {
    it('should abort and cancel all delays', () => {
      controller.setDelay(1000);
      controller.apply();
      controller.abort();
      expect(controller.aborted).toBe(true);
      expect(controller.getPendingCount()).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset all state', () => {
      controller.setDelayRange(50, 100);
      controller.abort();
      controller.reset();
      expect(controller.defaultDelay).toBe(0);
      expect(controller.delayRange).toBeNull();
      expect(controller.aborted).toBe(false);
    });
  });
});

describe('Singleton functions', () => {
  afterEach(() => {
    resetDelay();
  });

  it('should use singleton controller', () => {
    setDelay(100);
    expect(delayController.getDelay()).toBe(100);
  });

  it('setDelayRange should work', () => {
    setDelayRange(10, 20);
    const delay = delayController.getDelay();
    expect(delay).toBeGreaterThanOrEqual(10);
    expect(delay).toBeLessThanOrEqual(20);
  });

  it('applyDelay should work', async () => {
    setDelay(10);
    await expect(applyDelay()).resolves.toBeUndefined();
  });
});
