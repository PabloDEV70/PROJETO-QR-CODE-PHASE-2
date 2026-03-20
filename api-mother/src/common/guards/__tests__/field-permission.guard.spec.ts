/**
 * Testes unitarios para FieldPermissionGuard.
 *
 * @module M3-T03
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FieldPermissionGuard } from '../field-permission.guard';
import { PERMISSOES_SERVICE } from '../interfaces/permissoes-service.interface';

describe('FieldPermissionGuard', () => {
  let guard: FieldPermissionGuard;
  let reflector: Reflector;
  let permissoesService: any;

  const criarContextoMock = (usuario: any, headers: any = {}, query: any = {}, body: any = {}): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: usuario,
          headers,
          query,
          body,
        }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => ({ name: 'TgfveiController' }),
    } as any;
  };

  beforeEach(async () => {
    permissoesService = {
      obterCamposPermitidos: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldPermissionGuard,
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

    guard = module.get<FieldPermissionGuard>(FieldPermissionGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('deve permitir acesso quando nao houver decorator @AllowedFields', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

      const contexto = criarContextoMock({ userId: 1 });
      const resultado = await guard.canActivate(contexto);

      expect(resultado).toBe(true);
    });

    it('deve permitir acesso quando campos incluem * (todos)', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
        campos: ['*'],
        permitirTodos: true,
      });

      const contexto = criarContextoMock({ userId: 1 });
      const resultado = await guard.canActivate(contexto);

      expect(resultado).toBe(true);
    });

    it('deve adicionar camposPermitidos ao request quando nao houver servico', async () => {
      // Criar guard sem PermissoesService
      const moduleWithoutService = await Test.createTestingModule({
        providers: [
          FieldPermissionGuard,
          {
            provide: Reflector,
            useValue: {
              getAllAndOverride: jest
                .fn()
                .mockReturnValueOnce({
                  campos: ['CODVEICULO', 'PLACA'],
                  permitirTodos: false,
                })
                .mockReturnValueOnce(null), // Para PERMISSION_KEY
            },
          },
        ],
      }).compile();

      const guardSemServico = moduleWithoutService.get<FieldPermissionGuard>(FieldPermissionGuard);

      const request: any = {
        user: { userId: 1 },
        headers: {},
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

      await guardSemServico.canActivate(contexto);

      expect(request.camposPermitidos).toEqual(['CODVEICULO', 'PLACA']);
    });

    it('deve calcular intersecao entre campos do decorator e do servico', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce({
          campos: ['CODVEICULO', 'PLACA', 'MARCAMODELO'],
          permitirTodos: false,
        })
        .mockReturnValueOnce({
          operacao: 'READ',
          tabela: 'TGFVEI',
        });

      permissoesService.obterCamposPermitidos.mockResolvedValue(['PLACA', 'MARCAMODELO', 'ATIVO']);

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

      // Intersecao: PLACA, MARCAMODELO (campos comuns)
      expect(request.camposPermitidos).toEqual(['PLACA', 'MARCAMODELO']);
    });

    it('deve lancar ForbiddenException quando solicitar campo nao permitido', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce({
          campos: ['CODVEICULO', 'PLACA'],
          permitirTodos: false,
        })
        .mockReturnValueOnce(null);

      permissoesService.obterCamposPermitidos.mockResolvedValue([]);

      const contexto = criarContextoMock(
        { userId: 1 },
        {
          authorization: 'Bearer token123',
          'x-fields': 'CODVEICULO,SENHA', // SENHA nao esta na lista
        },
      );

      await expect(guard.canActivate(contexto)).rejects.toThrow(ForbiddenException);
    });

    it('deve extrair campos do query parameter fields', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce({
          campos: ['CODVEICULO', 'PLACA', 'MARCAMODELO'],
          permitirTodos: false,
        })
        .mockReturnValueOnce(null);

      permissoesService.obterCamposPermitidos.mockResolvedValue([]);

      const request: any = {
        user: { userId: 1 },
        headers: { authorization: 'Bearer token123' },
        query: { fields: 'CODVEICULO,PLACA' },
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

      expect(request.camposPermitidos).toEqual(['CODVEICULO', 'PLACA', 'MARCAMODELO']);
    });
  });
});
