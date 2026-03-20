/**
 * Testes unitarios para CrudPermissionGuard.
 *
 * @module M3-T02
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CrudPermissionGuard } from '../crud-permission.guard';
import { PERMISSOES_SERVICE } from '../interfaces/permissoes-service.interface';

describe('CrudPermissionGuard', () => {
  let guard: CrudPermissionGuard;
  let reflector: Reflector;
  let permissoesService: any;

  const criarContextoMock = (usuario: any, headers: any = {}, body: any = {}): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: usuario,
          headers,
          body,
          query: {},
        }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => ({ name: 'TgfveiController' }),
    } as any;
  };

  beforeEach(async () => {
    permissoesService = {
      verificarPermissaoCrud: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrudPermissionGuard,
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

    guard = module.get<CrudPermissionGuard>(CrudPermissionGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('deve permitir acesso quando nao houver decorator @RequirePermission', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

      const contexto = criarContextoMock({ userId: 1 });
      const resultado = await guard.canActivate(contexto);

      expect(resultado).toBe(true);
    });

    it('deve lancar ForbiddenException quando usuario nao autenticado', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
        operacao: 'READ',
        tabela: 'TGFVEI',
      });

      const contexto = criarContextoMock(null);

      await expect(guard.canActivate(contexto)).rejects.toThrow(ForbiddenException);
    });

    it('deve permitir acesso quando PermissoesService nao configurado', async () => {
      // Criar guard sem PermissoesService
      const moduleWithoutService = await Test.createTestingModule({
        providers: [
          CrudPermissionGuard,
          {
            provide: Reflector,
            useValue: {
              getAllAndOverride: jest.fn().mockReturnValue({
                operacao: 'READ',
                tabela: 'TGFVEI',
              }),
            },
          },
        ],
      }).compile();

      const guardSemServico = moduleWithoutService.get<CrudPermissionGuard>(CrudPermissionGuard);
      const contexto = criarContextoMock({ userId: 1 });

      const resultado = await guardSemServico.canActivate(contexto);

      expect(resultado).toBe(true);
    });

    it('deve permitir acesso quando servico retorna permitido=true', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
        operacao: 'READ',
        tabela: 'TGFVEI',
      });

      permissoesService.verificarPermissaoCrud.mockResolvedValue({
        permitido: true,
        camposPermitidos: ['CODVEICULO', 'PLACA'],
      });

      const contexto = criarContextoMock({ userId: 1 }, { authorization: 'Bearer token123' });

      const resultado = await guard.canActivate(contexto);

      expect(resultado).toBe(true);
      expect(permissoesService.verificarPermissaoCrud).toHaveBeenCalledWith(
        expect.objectContaining({
          codUsuario: 1,
          operacao: 'READ',
          tabela: 'TGFVEI',
        }),
      );
    });

    it('deve lancar ForbiddenException quando servico retorna permitido=false', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
        operacao: 'DELETE',
        tabela: 'TGFVEI',
      });

      permissoesService.verificarPermissaoCrud.mockResolvedValue({
        permitido: false,
        motivo: 'Usuario nao tem permissao de exclusao',
      });

      const contexto = criarContextoMock({ userId: 1 }, { authorization: 'Bearer token123' });

      await expect(guard.canActivate(contexto)).rejects.toThrow('Usuario nao tem permissao de exclusao');
    });

    it('deve adicionar informacoes de permissao ao request', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
        operacao: 'UPDATE',
        tabela: 'TGFVEI',
      });

      permissoesService.verificarPermissaoCrud.mockResolvedValue({
        permitido: true,
        camposPermitidos: ['PLACA', 'MARCAMODELO'],
        condicoesRls: 'CODEMP = 1',
      });

      const request: any = {
        user: { userId: 1 },
        headers: { authorization: 'Bearer token123' },
        query: {},
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

      expect(request.permissao).toEqual({
        operacao: 'UPDATE',
        tabela: 'TGFVEI',
        camposPermitidos: ['PLACA', 'MARCAMODELO'],
        condicoesRls: 'CODEMP = 1',
        requerAprovacao: undefined,
      });
    });

    it('deve obter codTela do header x-cod-tela', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
        operacao: 'READ',
        tabela: 'TGFVEI',
      });

      permissoesService.verificarPermissaoCrud.mockResolvedValue({
        permitido: true,
      });

      const contexto = criarContextoMock(
        { userId: 1 },
        {
          authorization: 'Bearer token123',
          'x-cod-tela': '100',
        },
      );

      await guard.canActivate(contexto);

      expect(permissoesService.verificarPermissaoCrud).toHaveBeenCalledWith(
        expect.objectContaining({
          codTela: 100,
        }),
      );
    });
  });
});
