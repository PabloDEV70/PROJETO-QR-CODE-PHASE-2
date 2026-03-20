/**
 * Testes unitarios para RlsConditionGuard e RlsQueryHelper.
 *
 * @module M3-T04
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RlsConditionGuard, RlsQueryHelper } from '../rls-condition.guard';
import { PERMISSOES_SERVICE } from '../interfaces/permissoes-service.interface';

describe('RlsConditionGuard', () => {
  let guard: RlsConditionGuard;
  let reflector: Reflector;
  let permissoesService: any;

  const criarContextoMock = (usuario: any, headers: any = {}): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: usuario,
          headers,
        }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => ({ name: 'TgfveiController' }),
    } as any;
  };

  beforeEach(async () => {
    permissoesService = {
      obterCondicoesRls: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RlsConditionGuard,
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

    guard = module.get<RlsConditionGuard>(RlsConditionGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('deve retornar true quando usuario nao autenticado', async () => {
      const contexto = criarContextoMock(null);
      const resultado = await guard.canActivate(contexto);

      expect(resultado).toBe(true);
    });

    it('deve retornar true quando PermissoesService nao configurado', async () => {
      // Criar guard sem PermissoesService
      const moduleWithoutService = await Test.createTestingModule({
        providers: [
          RlsConditionGuard,
          {
            provide: Reflector,
            useValue: {
              getAllAndOverride: jest.fn(),
            },
          },
        ],
      }).compile();

      const guardSemServico = moduleWithoutService.get<RlsConditionGuard>(RlsConditionGuard);
      const contexto = criarContextoMock({ userId: 1 });

      const resultado = await guardSemServico.canActivate(contexto);

      expect(resultado).toBe(true);
    });

    it('deve adicionar contexto RLS ao request', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
        operacao: 'READ',
        tabela: 'TGFVEI',
      });

      permissoesService.obterCondicoesRls.mockResolvedValue('CODEMP = 1');

      const request: any = {
        user: { userId: 1 },
        headers: { authorization: 'Bearer token123' },
      };

      const contexto = {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
        getHandler: () => jest.fn(),
        getClass: () => ({ name: 'TgfveiController' }),
      } as any;

      await guard.canActivate(contexto);

      expect(request.rls).toEqual({
        condicoes: 'CODEMP = 1',
        tabela: 'TGFVEI',
        codUsuario: 1,
      });
    });

    it('deve definir condicoes como null quando nao houver RLS', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
        operacao: 'READ',
        tabela: 'TGFVEI',
      });

      permissoesService.obterCondicoesRls.mockResolvedValue(null);

      const request: any = {
        user: { userId: 1 },
        headers: { authorization: 'Bearer token123' },
      };

      const contexto = {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
        getHandler: () => jest.fn(),
        getClass: () => ({ name: 'TgfveiController' }),
      } as any;

      await guard.canActivate(contexto);

      expect(request.rls.condicoes).toBeNull();
    });
  });
});

describe('RlsQueryHelper', () => {
  describe('aplicarCondicoesRls', () => {
    it('deve retornar query original quando contexto nulo', () => {
      const query = 'SELECT * FROM TGFVEI';
      const resultado = RlsQueryHelper.aplicarCondicoesRls(query, null);

      expect(resultado).toBe(query);
    });

    it('deve retornar query original quando condicoes nulas', () => {
      const query = 'SELECT * FROM TGFVEI';
      const contexto = { condicoes: null, tabela: 'TGFVEI', codUsuario: 1 };
      const resultado = RlsQueryHelper.aplicarCondicoesRls(query, contexto);

      expect(resultado).toBe(query);
    });

    it('deve adicionar WHERE quando query nao tem WHERE', () => {
      const query = 'SELECT * FROM TGFVEI ORDER BY PLACA';
      const contexto = { condicoes: 'CODEMP = 1', tabela: 'TGFVEI', codUsuario: 1 };

      const resultado = RlsQueryHelper.aplicarCondicoesRls(query, contexto);

      expect(resultado).toContain('WHERE CODEMP = 1');
      expect(resultado).toContain('ORDER BY PLACA');
    });

    it('deve adicionar condicao com AND quando query tem WHERE', () => {
      const query = "SELECT * FROM TGFVEI WHERE ATIVO = 'S'";
      const contexto = { condicoes: 'CODEMP = 1', tabela: 'TGFVEI', codUsuario: 1 };

      const resultado = RlsQueryHelper.aplicarCondicoesRls(query, contexto);

      expect(resultado).toContain('WHERE (CODEMP = 1) AND');
      expect(resultado).toContain("ATIVO = 'S'");
    });

    it('deve substituir placeholder {alias} nas condicoes', () => {
      const query = 'SELECT * FROM TGFVEI v';
      const contexto = { condicoes: '{alias}.CODEMP = 1', tabela: 'TGFVEI', codUsuario: 1 };

      const resultado = RlsQueryHelper.aplicarCondicoesRls(query, contexto, 'v');

      expect(resultado).toContain('v.CODEMP = 1');
    });
  });
});
