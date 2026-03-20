import { HttpException, HttpStatus, ForbiddenException } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { ArgumentsHost } from '@nestjs/common';
import { AllExceptionsFilter } from '../all-exceptions.filter';
import { GatewayException } from '../../exceptions/gateway.exception';
import { GatewayErrorCode } from '../../enums/gateway-error-code.enum';
import { ErrorEnvelopeSchema } from '../../schemas/error-envelope.schema';

function makeHost(): { host: ArgumentsHost; jsonSpy: jest.Mock; statusSpy: jest.Mock } {
  const jsonSpy = jest.fn();
  const statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status: statusSpy }),
      getRequest: () => ({ url: '/test-path' }),
    }),
  } as unknown as ArgumentsHost;
  return { host, jsonSpy, statusSpy };
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GatewayException', () => {
    it('preserves code and context from GatewayException', () => {
      const { host, jsonSpy, statusSpy } = makeHost();
      const ex = new GatewayException(
        GatewayErrorCode.ERR_WRITE_FORBIDDEN,
        'Write operations are not allowed.',
        { table: 'TGFPAR' },
        HttpStatus.FORBIDDEN,
      );

      filter.catch(ex, host);

      expect(statusSpy).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      const body = jsonSpy.mock.calls[0][0];
      expect(body.error.code).toBe(GatewayErrorCode.ERR_WRITE_FORBIDDEN);
      expect(body.error.context).toEqual({ table: 'TGFPAR' });
      expect(ErrorEnvelopeSchema.safeParse(body).success).toBe(true);
    });

    it('preserves ERR_ADMIN_REQUIRED code from GatewayException', () => {
      const { host, jsonSpy } = makeHost();
      const ex = new GatewayException(
        GatewayErrorCode.ERR_ADMIN_REQUIRED,
        'Admin role required.',
        {},
        HttpStatus.FORBIDDEN,
      );

      filter.catch(ex, host);

      const body = jsonSpy.mock.calls[0][0];
      expect(body.error.code).toBe(GatewayErrorCode.ERR_ADMIN_REQUIRED);
      expect(ErrorEnvelopeSchema.safeParse(body).success).toBe(true);
    });
  });

  describe('ThrottlerException', () => {
    it('maps ThrottlerException to ERR_RATE_LIMIT with 429 status', () => {
      const { host, jsonSpy, statusSpy } = makeHost();
      const ex = new ThrottlerException();

      filter.catch(ex, host);

      expect(statusSpy).toHaveBeenCalledWith(HttpStatus.TOO_MANY_REQUESTS);
      const body = jsonSpy.mock.calls[0][0];
      expect(body.error.code).toBe(GatewayErrorCode.ERR_RATE_LIMIT);
      expect(body.success).toBe(false);
      expect(body.data).toBeNull();
      expect(ErrorEnvelopeSchema.safeParse(body).success).toBe(true);
    });
  });

  describe('HttpException (guard-embedded legacy codes)', () => {
    it('maps guard-embedded DATABASE_WRITE_BLOCKED to ERR_WRITE_FORBIDDEN', () => {
      const { host, jsonSpy, statusSpy } = makeHost();
      const ex = new ForbiddenException({
        code: 'DATABASE_WRITE_BLOCKED',
        message: 'Write blocked.',
      });

      filter.catch(ex, host);

      expect(statusSpy).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      const body = jsonSpy.mock.calls[0][0];
      expect(body.error.code).toBe(GatewayErrorCode.ERR_WRITE_FORBIDDEN);
      expect(ErrorEnvelopeSchema.safeParse(body).success).toBe(true);
    });
  });

  describe('SQL errors', () => {
    it('maps SQL syntax error to ERR_SQL_SYNTAX', () => {
      const { host, jsonSpy, statusSpy } = makeHost();
      const ex = new Error('There is a syntax error near the keyword SELECT');

      filter.catch(ex, host);

      expect(statusSpy).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      const body = jsonSpy.mock.calls[0][0];
      expect(body.error.code).toBe(GatewayErrorCode.ERR_SQL_SYNTAX);
      expect(body.error.message).not.toContain('Incorrect syntax');
      expect(ErrorEnvelopeSchema.safeParse(body).success).toBe(true);
    });

    it('maps connection error to ERR_DATABASE_CONNECTION', () => {
      const { host, jsonSpy, statusSpy } = makeHost();
      const ex = new Error('MSSQL: connection refused to server');

      filter.catch(ex, host);

      expect(statusSpy).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      const body = jsonSpy.mock.calls[0][0];
      expect(body.error.code).toBe(GatewayErrorCode.ERR_DATABASE_CONNECTION);
      expect(ErrorEnvelopeSchema.safeParse(body).success).toBe(true);
    });
  });

  describe('Plain Error (non-SQL)', () => {
    it('maps non-SQL plain Error to ERR_INTERNAL with 500 status', () => {
      const { host, jsonSpy, statusSpy } = makeHost();
      const ex = new Error('Something unexpected happened');

      filter.catch(ex, host);

      expect(statusSpy).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      const body = jsonSpy.mock.calls[0][0];
      expect(body.error.code).toBe(GatewayErrorCode.ERR_INTERNAL);
      expect(body.success).toBe(false);
      expect(body.data).toBeNull();
      expect(ErrorEnvelopeSchema.safeParse(body).success).toBe(true);
    });
  });

  describe('response shape invariants', () => {
    it('every error response passes ErrorEnvelopeSchema.safeParse', () => {
      const cases: unknown[] = [
        new GatewayException(GatewayErrorCode.ERR_UNAUTHORIZED, 'No token.', {}, HttpStatus.UNAUTHORIZED),
        new ThrottlerException(),
        new HttpException('plain http error', HttpStatus.FORBIDDEN),
        new Error('select * from deadlock victim'),
        new Error('totally unrelated crash'),
      ];

      for (const ex of cases) {
        const { host, jsonSpy } = makeHost();
        filter.catch(ex, host);
        const body = jsonSpy.mock.calls[0][0];
        const parsed = ErrorEnvelopeSchema.safeParse(body);
        expect(parsed.success).toBe(true);
      }
    });
  });
});
