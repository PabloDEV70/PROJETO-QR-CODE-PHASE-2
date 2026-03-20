import { Test, TestingModule } from '@nestjs/testing';
import { ValidadorCampoService } from '../../application/services/validador-campo.service';
import { Campo } from '../../../domain/entities/campo.entity';

describe('ValidadorCampoService', () => {
  let service: ValidadorCampoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidadorCampoService],
    }).compile();

    service = module.get<ValidadorCampoService>(ValidadorCampoService);
  });

  const criarCampo = (tipo: string, tamanho: number = 0, obrigatorio: boolean = false): Campo => {
    return Campo.criar({
      nomeTabela: 'TESTE',
      nomeCampo: 'CAMPO_TESTE',
      tipo,
      tamanho,
      obrigatorio: obrigatorio ? 'S' : 'N',
    }).obterValor();
  };

  describe('validarTipo', () => {
    it('deve aceitar string para tipo C', () => {
      const campo = criarCampo('C');
      const resultado = service.validarTipo(campo, 'Texto válido');

      expect(resultado.sucesso).toBe(true);
    });

    it('deve rejeitar number para tipo C', () => {
      const campo = criarCampo('C');
      const resultado = service.validarTipo(campo, 123);

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('esperado string');
    });

    it('deve aceitar number para tipo I', () => {
      const campo = criarCampo('I');
      const resultado = service.validarTipo(campo, 42);

      expect(resultado.sucesso).toBe(true);
    });

    it('deve rejeitar string para tipo I', () => {
      const campo = criarCampo('I');
      const resultado = service.validarTipo(campo, '42');

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('esperado number');
    });

    it('deve aceitar Date para tipo D', () => {
      const campo = criarCampo('D');
      const resultado = service.validarTipo(campo, new Date());

      expect(resultado.sucesso).toBe(true);
    });

    it('deve aceitar string ISO para tipo D', () => {
      const campo = criarCampo('D');
      const resultado = service.validarTipo(campo, '2024-01-29T12:00:00Z');

      expect(resultado.sucesso).toBe(true);
    });

    it('deve aceitar boolean para tipo L', () => {
      const campo = criarCampo('L');
      const resultado = service.validarTipo(campo, true);

      expect(resultado.sucesso).toBe(true);
    });

    it('deve aceitar S/N para tipo L', () => {
      const campo = criarCampo('L');
      const resultadoS = service.validarTipo(campo, 'S');
      const resultadoN = service.validarTipo(campo, 'N');

      expect(resultadoS.sucesso).toBe(true);
      expect(resultadoN.sucesso).toBe(true);
    });
  });

  describe('validarTamanho', () => {
    it('deve aceitar string dentro do limite', () => {
      const campo = criarCampo('C', 10);
      const resultado = service.validarTamanho(campo, 'Teste');

      expect(resultado.sucesso).toBe(true);
    });

    it('deve rejeitar string acima do limite', () => {
      const campo = criarCampo('C', 5);
      const resultado = service.validarTamanho(campo, 'Texto muito longo');

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('excede máximo');
    });

    it('deve aceitar número dentro do limite de dígitos', () => {
      const campo = criarCampo('I', 5);
      const resultado = service.validarTamanho(campo, 12345);

      expect(resultado.sucesso).toBe(true);
    });

    it('deve rejeitar número acima do limite de dígitos', () => {
      const campo = criarCampo('I', 3);
      const resultado = service.validarTamanho(campo, 12345);

      expect(resultado.falhou).toBe(true);
    });
  });

  describe('validarObrigatoriedade', () => {
    it('deve aceitar valor quando campo obrigatório preenchido', () => {
      const campo = criarCampo('C', 0, true);
      const resultado = service.validarObrigatoriedade(campo, 'Valor');

      expect(resultado.sucesso).toBe(true);
    });

    it('deve rejeitar null quando campo obrigatório', () => {
      const campo = criarCampo('C', 0, true);
      const resultado = service.validarObrigatoriedade(campo, null);

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('obrigatório');
    });

    it('deve rejeitar string vazia quando campo obrigatório', () => {
      const campo = criarCampo('C', 0, true);
      const resultado = service.validarObrigatoriedade(campo, '');

      expect(resultado.falhou).toBe(true);
    });

    it('deve aceitar null quando campo não obrigatório', () => {
      const campo = criarCampo('C', 0, false);
      const resultado = service.validarObrigatoriedade(campo, null);

      expect(resultado.sucesso).toBe(true);
    });
  });

  describe('validarValor', () => {
    it('deve validar valor completo com sucesso', () => {
      const campo = criarCampo('C', 50, true);
      const resultado = service.validarValor(campo, 'Texto válido');

      expect(resultado.sucesso).toBe(true);
    });

    it('deve falhar quando obrigatoriedade não atendida', () => {
      const campo = criarCampo('C', 50, true);
      const resultado = service.validarValor(campo, null);

      expect(resultado.falhou).toBe(true);
    });

    it('deve falhar quando tipo inválido', () => {
      const campo = criarCampo('I', 10, false);
      const resultado = service.validarValor(campo, 'abc');

      expect(resultado.falhou).toBe(true);
    });

    it('deve falhar quando tamanho excedido', () => {
      const campo = criarCampo('C', 5, false);
      const resultado = service.validarValor(campo, 'Texto muito longo');

      expect(resultado.falhou).toBe(true);
    });
  });
});
