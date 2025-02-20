const { InterceptorChain, createInterceptorChain, builtInInterceptors } = require('../interceptor');

describe('InterceptorChain', () => {
  let chain;

  beforeEach(() => {
    chain = createInterceptorChain();
  });

  describe('use()', () => {
    it('should add interceptor to chain', () => {
      const interceptor = jest.fn();
      chain.use(interceptor);
      expect(chain.count).toBe(1);
    });

    it('should throw error for non-function interceptor', () => {
      expect(() => chain.use('not a function')).toThrow('Interceptor must be a function');
    });

    it('should allow chaining', () => {
      const result = chain.use(() => {}).use(() => {});
      expect(result).toBe(chain);
      expect(chain.count).toBe(2);
    });
  });

  describe('remove()', () => {
    it('should remove interceptor from chain', () => {
      const interceptor = jest.fn();
      chain.use(interceptor);
      chain.remove(interceptor);
      expect(chain.count).toBe(0);
    });

    it('should handle removing non-existent interceptor', () => {
      chain.remove(() => {});
      expect(chain.count).toBe(0);
    });
  });

  describe('clear()', () => {
    it('should remove all interceptors', () => {
      chain.use(() => {}).use(() => {}).use(() => {});
      chain.clear();
      expect(chain.count).toBe(0);
    });
  });

  describe('execute()', () => {
    it('should execute interceptors in order', async () => {
      const order = [];
      chain.use(() => { order.push(1); });
      chain.use(() => { order.push(2); });
      chain.use(() => { order.push(3); });

      await chain.execute({});
      expect(order).toEqual([1, 2, 3]);
    });

    it('should pass and merge context between interceptors', async () => {
      chain.use((req, ctx) => ({ ...ctx, a: 1 }));
      chain.use((req, ctx) => ({ ...ctx, b: ctx.a + 1 }));
      chain.use((req, ctx) => ({ ...ctx, c: ctx.b + 1 }));

      const result = await chain.execute({});
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should handle async interceptors', async () => {
      chain.use(async () => {
        await new Promise(r => setTimeout(r, 10));
        return { async: true };
      });

      const result = await chain.execute({});
      expect(result.async).toBe(true);
    });

    it('should stop on error and add to context', async () => {
      chain.use(() => ({ step: 1 }));
      chain.use(() => { throw new Error('Test error'); });
      chain.use(() => ({ step: 3 }));

      const result = await chain.execute({});
      expect(result.step).toBe(1);
      expect(result.interceptorError).toBeDefined();
      expect(result.interceptorError.message).toBe('Test error');
    });

    it('should provide request object to interceptors', async () => {
      const mockRequest = { method: 'GET', path: '/test' };
      let receivedRequest;

      chain.use((req) => { receivedRequest = req; });
      await chain.execute(mockRequest);

      expect(receivedRequest).toEqual(mockRequest);
    });
  });
});

describe('builtInInterceptors', () => {
  describe('logger', () => {
    it('should log request details', async () => {
      const mockLog = jest.fn();
      const logger = builtInInterceptors.logger(mockLog);
      const req = { method: 'POST', path: '/api/users', params: { id: 1 }, query: {} };

      await logger(req, {});
      expect(mockLog).toHaveBeenCalledWith(
        '[MockAPI] POST /api/users',
        { params: { id: 1 }, query: {} }
      );
    });
  });

  describe('auth', () => {
    it('should detect authenticated request', () => {
      const auth = builtInInterceptors.auth();
      const req = { headers: { authorization: 'Bearer token123' } };

      const result = auth(req, {});
      expect(result.authenticated).toBe(true);
      expect(result.authToken).toBe('token123');
    });

    it('should detect unauthenticated request', () => {
      const auth = builtInInterceptors.auth();
      const req = { headers: {} };

      const result = auth(req, {});
      expect(result.authenticated).toBe(false);
      expect(result.authToken).toBe(null);
    });
  });

  describe('timestamp', () => {
    it('should add timestamp to context', () => {
      const timestamp = builtInInterceptors.timestamp();
      const result = timestamp({}, {});

      expect(result.requestTimestamp).toBeDefined();
      expect(typeof result.requestTimestamp).toBe('number');
      expect(result.requestDate).toBeDefined();
    });
  });

  describe('rateLimit', () => {
    it('should track request count', () => {
      const rateLimit = builtInInterceptors.rateLimit(3, 60000);
      const req = { ip: '127.0.0.1' };

      let result = rateLimit(req, {});
      expect(result.rateLimited).toBe(false);
      expect(result.rateLimitRemaining).toBe(2);

      result = rateLimit(req, {});
      result = rateLimit(req, {});
      result = rateLimit(req, {});

      expect(result.rateLimited).toBe(true);
      expect(result.rateLimitRemaining).toBe(0);
    });
  });

  describe('conditional', () => {
    it('should apply modifier when condition is true', () => {
      const conditional = builtInInterceptors.conditional(
        (req) => req.method === 'POST',
        () => ({ modified: true })
      );

      const result = conditional({ method: 'POST' }, {});
      expect(result.modified).toBe(true);
    });

    it('should not apply modifier when condition is false', () => {
      const conditional = builtInInterceptors.conditional(
        (req) => req.method === 'POST',
        () => ({ modified: true })
      );

      const result = conditional({ method: 'GET' }, {});
      expect(result.modified).toBeUndefined();
    });
  });
});
