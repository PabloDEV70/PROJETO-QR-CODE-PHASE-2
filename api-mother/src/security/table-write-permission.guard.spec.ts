import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { TableWritePermissionGuard } from './table-write-permission.guard';
import { TablePermissionService } from './table-permission.service';
import { DatabaseContextService } from '../database/database-context.service';
import { AuditService } from './audit.service';
import { ConfigService } from '@nestjs/config'; // eslint-disable-line @typescript-eslint/no-unused-vars

describe('TableWritePermissionGuard', () => {
  let guard: TableWritePermissionGuard;
  let databaseContext: DatabaseContextService;
  let auditService: AuditService;

  const mockRequest = {
    body: {},
    headers: {},
    method: 'POST',
    path: '/inspection/query',
    user: { username: 'testuser' },
    ip: '127.0.0.1',
    socket: { remoteAddress: '127.0.0.1' },
  };

  const mockContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    }),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TableWritePermissionGuard,
        TablePermissionService,
        {
          provide: DatabaseContextService,
          useValue: {
            getCurrentDatabase: jest.fn().mockReturnValue('PROD'),
          },
        },
        {
          provide: AuditService,
          useValue: {
            logOperation: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<TableWritePermissionGuard>(TableWritePermissionGuard);
    databaseContext = module.get<DatabaseContextService>(DatabaseContextService);
    auditService = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    describe('Queries sem SQL', () => {
      it('deve permitir quando não há SQL no body', async () => {
        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
      });

      it('deve permitir quando body é null', async () => {
        const contextWithNullBody = {
          ...mockContext,
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue({ body: null }),
          }),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(contextWithNullBody);
        expect(result).toBe(true);
      });
    });

    describe('Queries read-only (SELECT)', () => {
      it('deve permitir SELECT queries', async () => {
        const requestWithSelect = {
          ...mockRequest,
          body: { query: 'SELECT * FROM TGFVEI WHERE ATIVO = "S"' },
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(requestWithSelect),
          }),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
      });

      it('deve permitir queries com múltiplas SELECTs', async () => {
        const requestWithMultiSelect = {
          ...mockRequest,
          body: { query: 'SELECT a.ID FROM TABELA_A a; SELECT b.ID FROM TABELA_B b;' },
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(requestWithMultiSelect),
          }),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
      });
    });

    describe('INSERT operations', () => {
      it('deve permitir INSERT em tabela autorizada (PROD)', async () => {
        const requestWithInsert = {
          ...mockRequest,
          body: {
            query: 'INSERT INTO AD_RDOAPONTAMENTOS (CODRDO, CODPARC) VALUES (1, 100)',
          },
          headers: { 'x-boss-approval': 'valid-token' },
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(requestWithInsert),
          }),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
      });

      it('deve bloquear INSERT em tabela não autorizada (PROD)', async () => {
        const requestWithInsert = {
          ...mockRequest,
          body: {
            query: 'INSERT INTO TSIUSU (CODUSUR, NOMEUSU) VALUES (999, "Hacker")',
          },
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(requestWithInsert),
          }),
        } as unknown as ExecutionContext;

        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
        expect(auditService.logOperation).toHaveBeenCalled();
      });

      it('deve bloquear INSERT em PROD sem x-boss-approval', async () => {
        const requestWithInsert = {
          ...mockRequest,
          body: {
            query: 'INSERT INTO AD_RDOAPONTAMENTOS (CODRDO) VALUES (1)',
          },
          headers: {}, // Sem x-boss-approval
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(requestWithInsert),
          }),
        } as unknown as ExecutionContext;

        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);

        expect(auditService.logOperation).toHaveBeenCalled();
      });

      it('deve permitir INSERT em TESTE (sem restrictions)', async () => {
        (databaseContext.getCurrentDatabase as jest.Mock).mockReturnValue('TESTE');

        const requestWithInsert = {
          ...mockRequest,
          body: {
            query: 'INSERT INTO TSIUSU (CODUSUR, NOMEUSU) VALUES (999, "Test User")',
          },
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(requestWithInsert),
          }),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
      });

      it('deve bloquear INSERT em TREINA', async () => {
        (databaseContext.getCurrentDatabase as jest.Mock).mockReturnValue('TREINA');

        const requestWithInsert = {
          ...mockRequest,
          body: {
            query: 'INSERT INTO AD_RDOAPONTAMENTOS (CODRDO) VALUES (1)',
          },
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(requestWithInsert),
          }),
        } as unknown as ExecutionContext;

        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      });
    });

    describe('UPDATE operations', () => {
      it('deve permitir UPDATE em tabela autorizada (PROD)', async () => {
        const requestWithUpdate = {
          ...mockRequest,
          body: {
            query: 'UPDATE AD_RDOAPONTAMENTOS SET STATUS = "A" WHERE CODRDO = 1',
          },
          headers: { 'x-boss-approval': 'valid-token' },
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(requestWithUpdate),
          }),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
      });

      it('deve bloquear UPDATE em tabela não autorizada (PROD)', async () => {
        const requestWithUpdate = {
          ...mockRequest,
          body: {
            query: 'UPDATE TSIUSU SET NOMEUSU = "Hacker" WHERE CODUSUR = 1',
          },
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(requestWithUpdate),
          }),
        } as unknown as ExecutionContext;

        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      });
    });

    describe('DELETE operations', () => {
      it('deve permitir DELETE em tabela autorizada (PROD)', async () => {
        const requestWithDelete = {
          ...mockRequest,
          body: {
            query: 'DELETE FROM AD_RDOMOTIVOS WHERE IDMOTIVO = 1',
          },
          headers: { 'x-boss-approval': 'valid-token' },
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(requestWithDelete),
          }),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
      });

      it('deve bloquear DELETE em tabela não autorizada (PROD)', async () => {
        const requestWithDelete = {
          ...mockRequest,
          body: {
            query: 'DELETE FROM TDDCAM WHERE CODCAM = 1',
          },
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(requestWithDelete),
          }),
        } as unknown as ExecutionContext;

        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      });
    });

    describe('Table name extraction', () => {
      it('deve extrair table name de INSERT INTO', async () => {
        const requestWithInsert = {
          ...mockRequest,
          body: {
            query: 'INSERT INTO AD_RDOAPONTAMENTOS (COL1) VALUES (1)',
          },
          headers: { 'x-boss-approval': 'token' },
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(requestWithInsert),
          }),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
      });

      it('deve extrair table name de UPDATE', async () => {
        const requestWithUpdate = {
          ...mockRequest,
          body: {
            query: 'UPDATE AD_RDOAPONTAMENTOS SET COL1 = 1',
          },
          headers: { 'x-boss-approval': 'token' },
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(requestWithUpdate),
          }),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
      });

      it('deve extrair table name de DELETE FROM', async () => {
        const requestWithDelete = {
          ...mockRequest,
          body: {
            query: 'DELETE FROM AD_RDOMOTIVOS WHERE ID = 1',
          },
          headers: { 'x-boss-approval': 'token' },
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(requestWithDelete),
          }),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
      });

      it('deve extrair table name com schema', async () => {
        const requestWithSchema = {
          ...mockRequest,
          body: {
            query: 'INSERT INTO dbo.AD_RDOAPONTAMENTOS (COL1) VALUES (1)',
          },
          headers: { 'x-boss-approval': 'token' },
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(requestWithSchema),
          }),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
      });

      it('deve bloquear quando não consegue extrair table name', async () => {
        const requestWithBadQuery = {
          ...mockRequest,
          body: {
            query: 'INSERT XPTO',
          },
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(requestWithBadQuery),
          }),
        } as unknown as ExecutionContext;

        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
        expect(auditService.logOperation).toHaveBeenCalled();
      });
    });

    describe('Boss approval header', () => {
      it('deve aceitar x-boss-approval válido', async () => {
        const request = {
          ...mockRequest,
          body: { query: 'INSERT INTO AD_RDOAPONTAMENTOS (COL1) VALUES (1)' },
          headers: { 'x-boss-approval': 'valid-boss-token-12345' },
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(request),
          }),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
      });

      it('deve rejeitar x-boss-approval vazio', async () => {
        const request = {
          ...mockRequest,
          body: { query: 'INSERT INTO AD_RDOAPONTAMENTOS (COL1) VALUES (1)' },
          headers: { 'x-boss-approval': '   ' }, // Whitespace only
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(request),
          }),
        } as unknown as ExecutionContext;

        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      });

      it('deve rejeitar quando x-boss-approval está faltando', async () => {
        const request = {
          ...mockRequest,
          body: { query: 'INSERT INTO AD_RDOAPONTAMENTOS (COL1) VALUES (1)' },
          headers: {}, // Nenhum header
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(request),
          }),
        } as unknown as ExecutionContext;

        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      });

      it('não deve exigir x-boss-approval em TESTE', async () => {
        (databaseContext.getCurrentDatabase as jest.Mock).mockReturnValue('TESTE');

        const request = {
          ...mockRequest,
          body: { query: 'INSERT INTO TSIUSU (CODUSUR) VALUES (1)' },
          headers: {}, // Sem approval
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(request),
          }),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
      });
    });

    describe('Audit logging', () => {
      it('deve logar operação bloqueada por tabela', async () => {
        const request = {
          ...mockRequest,
          body: { query: 'INSERT INTO TSIUSU (CODUSUR) VALUES (1)' },
          headers: {},
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(request),
          }),
        } as unknown as ExecutionContext;

        await guard.canActivate(context).catch(() => {});
        expect(auditService.logOperation).toHaveBeenCalled();

        const callArgs = (auditService.logOperation as jest.Mock).mock.calls[0][0];
        expect(callArgs.success).toBe(false);
        expect(callArgs.database).toBe('PROD');
        expect(callArgs.operation).toBe('INSERT TSIUSU');
      });

      it('deve extrair user do request', async () => {
        const request = {
          ...mockRequest,
          body: { query: 'INSERT INTO TSIUSU (CODUSUR) VALUES (1)' },
          headers: {},
          user: { username: 'admin' },
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(request),
          }),
        } as unknown as ExecutionContext;

        await guard.canActivate(context).catch(() => {});
        expect(auditService.logOperation).toHaveBeenCalled();

        const callArgs = (auditService.logOperation as jest.Mock).mock.calls[0][0];
        expect(callArgs.user).toBe('admin');
      });

      it('deve usar "unknown" como user quando não disponível', async () => {
        const request = {
          ...mockRequest,
          body: { query: 'INSERT INTO TSIUSU (CODUSUR) VALUES (1)' },
          headers: {},
          user: undefined,
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(request),
          }),
        } as unknown as ExecutionContext;

        await guard.canActivate(context).catch(() => {});
        expect(auditService.logOperation).toHaveBeenCalled();

        const callArgs = (auditService.logOperation as jest.Mock).mock.calls[0][0];
        expect(callArgs.user).toBe('unknown');
      });
    });

    describe('Case insensitivity', () => {
      it('deve ser case-insensitive no extraction de table names', async () => {
        const request = {
          ...mockRequest,
          body: { query: 'insert into ad_rdoapontamentos (col1) values (1)' },
          headers: { 'x-boss-approval': 'token' },
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(request),
          }),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
      });

      it('deve ser case-insensitive para SQL keywords', async () => {
        const request = {
          ...mockRequest,
          body: { query: 'InSeRt InTo AD_RDOAPONTAMENTOS (col1) VaLuEs (1)' },
          headers: { 'x-boss-approval': 'token' },
        };

        const context = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(request),
          }),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
      });
    });
  });
});
