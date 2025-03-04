const { DelayController, globalDelayController, delay } = require('../delay');

describe('delay', () => {
  describe('delay function', () => {
    it('should resolve after specified time', async () => {
      const start = Date.now();
      await delay(50);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(45);
    });

    it('should resolve immediately for 0ms delay', async () => {
      const start = Date.now();
      await delay(0);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(10);
    });

    it('should reject for negative delay', async () => {
      await expect(delay(-100)).rejects.toThrow('Delay must be a non-negative number');
    });

    it('should reject for non-number delay', async () => {
      await expect(delay('100')).rejects.toThrow('Delay must be a non-negative number');
    });
  });

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
        expect(() => controller.setDelay(-50)).toThrow('Delay must be a non-negative number');
      });

      it('should throw for non-number delay', () => {
        expect(() => controller.setDelay('100')).toThrow('Delay must be a non-negative number');
      });
    });

    describe('setDelayRange', () => {
      it('should set a delay range', () => {
        controller.setDelayRange(50, 150);
        const delay = controller.getDelay();
        expect(delay).toBeGreaterThanOrEqual(50);
        expect(delay).toBeLessThanOrEqual(150);
      });

      it('should throw when min > max', () => {
        expect(() => controller.setDelayRange(200, 100)).toThrow(
          'Minimum delay cannot be greater than maximum delay'
        );
      });

      it('should throw for negative values', () => {
        expect(() => controller.setDelayRange(-10, 100)).toThrow(
          'Delay range values must be non-negative'
        );
      });
    });

    describe('execute', () => {
      it('should execute function after delay', async () => {
        controller.setDelay(50);
        const result = await controller.execute(() => 'done');
        expect(result).toBe('done');
      });

      it('should execute immediately with 0 delay', async () => {
        const start = Date.now();
        await controller.execute(() => 'done');
        const elapsed = Date.now() - start;
        expect(elapsed).toBeLessThan(10);
      });

      it('should reject if aborted before execution', async () => {
        controller.abort();
        await expect(controller.execute(() => 'done')).rejects.toThrow(
          'DelayController has been aborted'
        );
      });

      it('should propagate function errors', async () => {
        await expect(
          controller.execute(() => {
            throw new Error('Test error');
          })
        ).rejects.toThrow('Test error');
      });
    });

    describe('wait', () => {
      it('should wait for the configured delay', async () => {
        controller.setDelay(50);
        const start = Date.now();
        await controller.wait();
        const elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(45);
      });

      it('should allow override delay', async () => {
        controller.setDelay(200);
        const start = Date.now();
        await controller.wait(50);
        const elapsed = Date.now() - start;
        expect(elapsed).toBeLessThan(100);
      });

      it('should reject if aborted', async () => {
        controller.abort();
        await expect(controller.wait(50)).rejects.toThrow('DelayController has been aborted');
      });
    });

    describe('abort', () => {
      it('should clear all pending timers', () => {
        controller.setDelay(1000);
        controller.wait();
        controller.wait();
        expect(controller.hasPending()).toBe(true);
        controller.abort();
        expect(controller.hasPending()).toBe(false);
      });
    });

    describe('reset', () => {
      it('should reset all state', () => {
        controller.setDelay(100);
        controller.wait();
        controller.reset();
        expect(controller.defaultDelay).toBe(0);
        expect(controller.delayRange).toBeNull();
        expect(controller.hasPending()).toBe(false);
        expect(controller.aborted).toBe(false);
      });
    });
  });

  describe('globalDelayController', () => {
    afterEach(() => {
      globalDelayController.reset();
    });

    it('should be a singleton instance', () => {
      expect(globalDelayController).toBeInstanceOf(DelayController);
    });

    it('should persist state between uses', () => {
      globalDelayController.setDelay(100);
      expect(globalDelayController.getDelay()).toBe(100);
    });
  });
});
