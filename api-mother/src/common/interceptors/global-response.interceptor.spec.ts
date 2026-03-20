import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { firstValueFrom, of } from 'rxjs';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { GlobalResponseInterceptor } from './global-response.interceptor';
import { ApiEnvelopeSchema } from '../schemas/envelope.schema';
import { SKIP_ENVELOPE_KEY } from '../decorators/skip-envelope.decorator';

function makeContext(): ExecutionContext {
  return {
    getHandler: () => function handler() {},
    getClass: () => class Controller {},
  } as unknown as ExecutionContext;
}

function makeCallHandler(payload: unknown): CallHandler {
  return { handle: () => of(payload) };
}

describe('GlobalResponseInterceptor', () => {
  let interceptor: GlobalResponseInterceptor<unknown>;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlobalResponseInterceptor, Reflector],
    }).compile();

    interceptor = module.get<GlobalResponseInterceptor<unknown>>(GlobalResponseInterceptor);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('standard wrapping', () => {
    beforeEach(() => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    });

    it('wraps a naked object payload in { data, success: true, meta: {} }', async () => {
      const payload = { id: 1, name: 'test' };
      const result = await firstValueFrom(
        interceptor.intercept(makeContext(), makeCallHandler(payload)),
      );

      expect(result).toEqual({ data: payload, success: true, meta: {} });
      expect(ApiEnvelopeSchema.safeParse(result).success).toBe(true);
    });

    it('wraps a naked array payload in { data, success: true, meta: {} }', async () => {
      const payload = [{ id: 1 }, { id: 2 }];
      const result = await firstValueFrom(
        interceptor.intercept(makeContext(), makeCallHandler(payload)),
      );

      expect(result).toEqual({ data: payload, success: true, meta: {} });
      expect(ApiEnvelopeSchema.safeParse(result).success).toBe(true);
    });

    it('wraps null payload in { data: null, success: true, meta: {} }', async () => {
      const result = await firstValueFrom(
        interceptor.intercept(makeContext(), makeCallHandler(null)),
      );

      expect(result).toEqual({ data: null, success: true, meta: {} });
      expect(ApiEnvelopeSchema.safeParse(result).success).toBe(true);
    });
  });

  describe('@SkipEnvelope', () => {
    it('passes through payload unchanged when handler metadata has SKIP_ENVELOPE_KEY = true', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      const payload = { raw: 'response', status: 'ok' };
      const result = await firstValueFrom(
        interceptor.intercept(makeContext(), makeCallHandler(payload)),
      );

      expect(result).toEqual(payload);
    });

    it('does not add data/success/meta keys to the pass-through response', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      const payload = { raw: 'response' };
      const result = await firstValueFrom(
        interceptor.intercept(makeContext(), makeCallHandler(payload)),
      ) as Record<string, unknown>;

      expect(result).not.toHaveProperty('success');
      expect(result).not.toHaveProperty('meta');
      expect(result).not.toHaveProperty('data');
    });

    it('uses SKIP_ENVELOPE_KEY when calling getAllAndOverride', async () => {
      const spy = jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      await firstValueFrom(
        interceptor.intercept(makeContext(), makeCallHandler({})),
      );

      expect(spy).toHaveBeenCalledWith(SKIP_ENVELOPE_KEY, expect.any(Array));
    });
  });

  describe('__payload/__meta tagged return', () => {
    beforeEach(() => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    });

    it('promotes __payload to data and __meta to meta', async () => {
      const rows = [{ id: 1 }, { id: 2 }];
      const meta = { rows: 2, executionTimeMs: 42 };
      const tagged = { __payload: rows, __meta: meta };

      const result = await firstValueFrom(
        interceptor.intercept(makeContext(), makeCallHandler(tagged)),
      );

      expect(result).toEqual({ data: rows, success: true, meta });
    });

    it('omits __payload and __meta keys from the returned data field', async () => {
      const rows = [{ id: 1 }];
      const tagged = { __payload: rows, __meta: { rows: 1 } };

      const result = await firstValueFrom(
        interceptor.intercept(makeContext(), makeCallHandler(tagged)),
      ) as Record<string, unknown>;

      expect(result.data).toEqual(rows);
      expect(result.data).not.toHaveProperty('__payload');
      expect(result.data).not.toHaveProperty('__meta');
    });

    it('uses empty {} for meta when __meta is omitted', async () => {
      const tagged = { __payload: { value: 1 } };
      const result = await firstValueFrom(
        interceptor.intercept(makeContext(), makeCallHandler(tagged)),
      );

      expect(result).toEqual({ data: { value: 1 }, success: true, meta: {} });
    });
  });

  describe('Zod schema validation', () => {
    beforeEach(() => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    });

    it('every standard wrapped response passes ApiEnvelopeSchema.safeParse', async () => {
      const cases = [
        { id: 1 },
        [1, 2, 3],
        null,
        'string value',
        42,
      ];

      for (const payload of cases) {
        const result = await firstValueFrom(
          interceptor.intercept(makeContext(), makeCallHandler(payload)),
        );
        const parsed = ApiEnvelopeSchema.safeParse(result);
        expect(parsed.success).toBe(true);
      }
    });

    it('every __payload/__meta response passes ApiEnvelopeSchema.safeParse', async () => {
      const cases = [
        { __payload: [{ id: 1 }], __meta: { rows: 1, executionTimeMs: 10 } },
        { __payload: { count: 5 }, __meta: { count: 5 } },
        { __payload: null, __meta: {} },
        { __payload: [] },
      ];

      for (const payload of cases) {
        const result = await firstValueFrom(
          interceptor.intercept(makeContext(), makeCallHandler(payload)),
        );
        const parsed = ApiEnvelopeSchema.safeParse(result);
        expect(parsed.success).toBe(true);
      }
    });
  });
});
