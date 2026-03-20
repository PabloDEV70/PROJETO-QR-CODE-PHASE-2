import { HttpStatus, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';
import { HttpExceptionFilter } from '../http-exception.filter';
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

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GatewayException', () => {
    it('preserves code directly from GatewayException', () => {
      const { host, jsonSpy, statusSpy } = makeHost();
      const ex = new GatewayException(
        GatewayErrorCode.ERR_TABLE_PROTECTED,
        'This table is protected.',
        { table: 'TSIUSU' },
        HttpStatus.FORBIDDEN,
      );

      filter.catch(ex, host);

      expect(statusSpy).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      const body = jsonSpy.mock.calls[0][0];
      expect(body.error.code).toBe(GatewayErrorCode.ERR_TABLE_PROTECTED);
      expect(body.error.context).toEqual({ table: 'TSIUSU' });
      expect(ErrorEnvelopeSchema.safeParse(body).success).toBe(true);
    });

    it('preserves ERR_ADMIN_REQUIRED code from GatewayException', () => {
      const { host, jsonSpy, statusSpy } = makeHost();
      const ex = new GatewayException(
        GatewayErrorCode.ERR_ADMIN_REQUIRED,
        'Admin role required for this operation.',
        {},
        HttpStatus.FORBIDDEN,
      );

      filter.catch(ex, host);

      expect(statusSpy).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      const body = jsonSpy.mock.calls[0][0];
      expect(body.error.code).toBe(GatewayErrorCode.ERR_ADMIN_REQUIRED);
      expect(body.success).toBe(false);
      expect(body.data).toBeNull();
      expect(ErrorEnvelopeSchema.safeParse(body).success).toBe(true);
    });
  });

  describe('ForbiddenException with guard-embedded legacy code', () => {
    it('maps DATABASE_WRITE_BLOCKED to ERR_WRITE_FORBIDDEN', () => {
      const { host, jsonSpy, statusSpy } = makeHost();
      const ex = new ForbiddenException({
        code: 'DATABASE_WRITE_BLOCKED',
        message: 'Write operations are blocked.',
      });

      filter.catch(ex, host);

      expect(statusSpy).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      const body = jsonSpy.mock.calls[0][0];
      expect(body.error.code).toBe(GatewayErrorCode.ERR_WRITE_FORBIDDEN);
      expect(ErrorEnvelopeSchema.safeParse(body).success).toBe(true);
    });

    it('maps PROTECTED_TABLE to ERR_TABLE_PROTECTED', () => {
      const { host, jsonSpy } = makeHost();
      const ex = new ForbiddenException({
        code: 'PROTECTED_TABLE',
        message: 'Table is protected.',
      });

      filter.catch(ex, host);

      const body = jsonSpy.mock.calls[0][0];
      expect(body.error.code).toBe(GatewayErrorCode.ERR_TABLE_PROTECTED);
      expect(ErrorEnvelopeSchema.safeParse(body).success).toBe(true);
    });
  });

  describe('class-validator error array', () => {
    it('maps class-validator array to ERR_VALIDATION_FAILED with details in context', () => {
      const { host, jsonSpy, statusSpy } = makeHost();
      const validationMessages = ['query must be a string', 'query should not be empty'];
      const ex = new BadRequestException({ message: validationMessages, error: 'Bad Request', statusCode: 400 });

      filter.catch(ex, host);

      expect(statusSpy).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      const body = jsonSpy.mock.calls[0][0];
      expect(body.error.code).toBe(GatewayErrorCode.ERR_VALIDATION_FAILED);
      expect(body.error.message).toBe('Validation failed.');
      expect(body.error.context).toEqual({ details: validationMessages });
      expect(ErrorEnvelopeSchema.safeParse(body).success).toBe(true);
    });
  });

  describe('bare HttpException fallback', () => {
    it('maps bare UnauthorizedException to ERR_UNAUTHORIZED', () => {
      const { host, jsonSpy, statusSpy } = makeHost();
      const ex = new UnauthorizedException();

      filter.catch(ex, host);

      expect(statusSpy).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      const body = jsonSpy.mock.calls[0][0];
      expect(body.error.code).toBe(GatewayErrorCode.ERR_UNAUTHORIZED);
      expect(body.success).toBe(false);
      expect(body.data).toBeNull();
      expect(ErrorEnvelopeSchema.safeParse(body).success).toBe(true);
    });
  });

  describe('response shape invariants', () => {
    it('every error response passes ErrorEnvelopeSchema.safeParse', () => {
      const cases = [
        new GatewayException(GatewayErrorCode.ERR_BOSS_APPROVAL_REQUIRED, 'Approval needed.', {}, HttpStatus.FORBIDDEN),
        new ForbiddenException({ code: 'MUTATION_DISABLED', message: 'Mutations disabled.' }),
        new BadRequestException({ message: ['field required'], error: 'Bad Request', statusCode: 400 }),
        new UnauthorizedException(),
        new ForbiddenException('Generic forbidden'),
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
