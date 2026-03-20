/**
 * Testes unitarios para ApprovalRequiredGuard.
 *
 * @module M3-T05
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApprovalRequiredGuard } from '../approval-required.guard';
import { PERMISSOES_SERVICE } from '../interfaces/permissoes-service.interface';

describe('ApprovalRequiredGuard', () => {
  let guard: ApprovalRequiredGuard;
  let reflector: Reflector;
  let permissoesService: any;

  const criarContextoMock = (usuario: any, headers: any = {}, body: any = {}): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: usuario,
          headers,
          body,
        }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => ({ name: 'TgfveiController' }),
    } as any;
  };

  beforeEach(async () => {
    permissoesService = {
      verificarRequerAprovacao: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalRequiredGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: PERMISSOES_SERVICE,
          useValue: permissoesService,
        },
      ],
    }).compile();

    guard = module.get<ApprovalRequiredGuard>(ApprovalRequiredGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('deve permitir acesso quando nao houver decorator @RequireApproval', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

      const contexto = criarContextoMock({ userId: 1 });
      const resultado = await guard.canActivate(contexto);

      expect(resultado).toBe(true);
    });

    it('deve lancar ForbiddenException quando usuario nao autenticado', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
        tipo: 'FINANCEIRO',
        mensagem: 'Requer aprovacao financeira',
      });

      const contexto = criarContextoMock(null);

      await expect(guard.canActivate(contexto)).rejects.toThrow(ForbiddenException);
    });

    it('deve permitir acesso quando header x-aprovacao-id presente', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce({
          tipo: 'FINANCEIRO',
          mensagem: 'Requer aprovacao financeira',
        })
        .mockReturnValueOnce(null);

      permissoesService.verificarRequerAprovacao.mockResolvedValue(true);

      const contexto = criarContextoMock(
        { userId: 1 },
        {
          authorization: 'Bearer token123',
          'x-aprovacao-id': '12345',
        },
      );

      const resultado = await guard.canActivate(contexto);

      expect(resultado).toBe(true);
    });

    it('deve permitir acesso quando body contem tokenAprovacao', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce({
          tipo: 'GERENCIAL',
          mensagem: 'Requer aprovacao gerencial',
        })
        .mockReturnValueOnce(null);

      permissoesService.verificarRequerAprovacao.mockResolvedValue(true);

      const contexto = criarContextoMock(
        { userId: 1 },
        { authorization: 'Bearer token123' },
        { tokenAprovacao: 'abc123def456' },
      );

      const resultado = await guard.canActivate(contexto);

      expect(resultado).toBe(true);
    });

    it('deve lancar ForbiddenException quando requer aprovacao e nao foi aprovado', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce({
          tipo: 'FINANCEIRO',
          nivelAprovacao: 2,
          mensagem: 'Requer aprovacao financeira',
        })
        .mockReturnValueOnce({
          operacao: 'DELETE',
          tabela: 'TGFVEI',
        });

      permissoesService.verificarRequerAprovacao.mockResolvedValue(true);

      const contexto = criarContextoMock({ userId: 1 }, { authorization: 'Bearer token123' });

      try {
        await guard.canActivate(contexto);
        fail('Deveria ter lancado ForbiddenException');
      } catch (erro: any) {
        expect(erro).toBeInstanceOf(ForbiddenException);
        expect(erro.response).toMatchObject({
          statusCode: 403,
          error: 'Aprovacao Necessaria',
          aprovacao: {
            tipo: 'FINANCEIRO',
            nivelMinimo: 2,
          },
        });
      }
    });

    it('deve adicionar contexto de aprovacao ao request', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce({
          tipo: 'OPERACIONAL',
          mensagem: 'Requer aprovacao operacional',
        })
        .mockReturnValueOnce(null);

      permissoesService.verificarRequerAprovacao.mockResolvedValue(false);

      const request: any = {
        user: { userId: 1 },
        headers: { authorization: 'Bearer token123' },
        body: {},
      };

      const contexto = {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
        getHandler: () => jest.fn(),
        getClass: () => ({ name: 'TgfveiController' }),
      } as any;

      await guard.canActivate(contexto);

      expect(request.aprovacao).toMatchObject({
        requerAprovacao: false,
        tipoAprovacao: 'OPERACIONAL',
      });
    });

    it('deve permitir acesso quando servico retorna que nao requer aprovacao', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce({
          tipo: 'FINANCEIRO',
          mensagem: 'Requer aprovacao financeira',
        })
        .mockReturnValueOnce({
          operacao: 'UPDATE',
          tabela: 'TGFVEI',
        });

      permissoesService.verificarRequerAprovacao.mockResolvedValue(false);

      const contexto = criarContextoMock({ userId: 1 }, { authorization: 'Bearer token123' });

      const resultado = await guard.canActivate(contexto);

      expect(resultado).toBe(true);
    });
  });
});
