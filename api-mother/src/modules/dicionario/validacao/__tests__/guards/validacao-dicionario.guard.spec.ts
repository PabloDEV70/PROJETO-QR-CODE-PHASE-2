import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ValidacaoDicionarioGuard } from '../../infrastructure/guards/validacao-dicionario.guard';
import { ValidacaoService } from '../../application/services/validacao.service';
import { Resultado } from '../../../shared/resultado';

describe('ValidacaoDicionarioGuard', () => {
  let guard: ValidacaoDicionarioGuard;
  let validacaoService: ValidacaoService;

  const mockValidacaoService = {
    validarDados: jest.fn(),
  };

  const mockReflector = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidacaoDicionarioGuard,
        { provide: ValidacaoService, useValue: mockValidacaoService },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<ValidacaoDicionarioGuard>(ValidacaoDicionarioGuard);
    validacaoService = module.get<ValidacaoService>(ValidacaoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockExecutionContext = (body: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ body }),
      }),
      getHandler: () => ({}),
    } as any;
  };

  describe('canActivate', () => {
    it('deve permitir passagem quando não há decorador', async () => {
      mockReflector.get.mockReturnValue(null);
      const context = createMockExecutionContext({});

      const resultado = await guard.canActivate(context);

      expect(resultado).toBe(true);
      expect(mockReflector.get).toHaveBeenCalled();
      expect(validacaoService.validarDados).not.toHaveBeenCalled();
    });

    it('deve validar dados quando decorador presente', async () => {
      mockReflector.get.mockReturnValue('TGFPRO');
      mockValidacaoService.validarDados.mockResolvedValue(Resultado.ok<void>());

      const body = { CODPROD: 123, DESCRPROD: 'Produto Teste' };
      const context = createMockExecutionContext(body);

      const resultado = await guard.canActivate(context);

      expect(resultado).toBe(true);
      expect(validacaoService.validarDados).toHaveBeenCalledWith('TGFPRO', body);
    });

    it('deve lançar BadRequestException quando body inválido', async () => {
      mockReflector.get.mockReturnValue('TGFPRO');
      const context = createMockExecutionContext(null);

      await expect(guard.canActivate(context)).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException quando validação falha', async () => {
      mockReflector.get.mockReturnValue('TGFPRO');
      mockValidacaoService.validarDados.mockResolvedValue(Resultado.falhar('Campo CODPROD é obrigatório'));

      const body = { DESCRPROD: 'Produto' };
      const context = createMockExecutionContext(body);

      await expect(guard.canActivate(context)).rejects.toThrow(BadRequestException);
    });
  });
});
