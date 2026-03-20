import { Test, TestingModule } from '@nestjs/testing';
import { ValidadorCampoService } from './validador-campo.service';
import { Campo } from '../../../domain/entities/campo.entity';

describe('ValidadorCampoService', () => {
  let service: ValidadorCampoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidadorCampoService],
    }).compile();

    service = module.get<ValidadorCampoService>(ValidadorCampoService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('validarValor', () => {
    it('deve validar valor obrigatório com sucesso', () => {
      const campo = Campo.criar({
        nomeTabela: 'TEST',
        nomeCampo: 'CAMPO1',
        tipo: 'S',
        obrigatorio: 'S',
      }).obterValor();

      const resultado = service.validarValor(campo, 'valor válido');

      expect(resultado.sucesso).toBe(true);
    });

    it('deve falhar para campo obrigatório vazio', () => {
      const campo = Campo.criar({
        nomeTabela: 'TEST',
        nomeCampo: 'CAMPO1',
        tipo: 'S',
        obrigatorio: 'S',
      }).obterValor();

      const resultado = service.validarValor(campo, '');

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('obrigatório');
    });

    it('deve validar tamanho máximo de string', () => {
      const campo = Campo.criar({
        nomeTabela: 'TEST',
        nomeCampo: 'CAMPO1',
        tipo: 'S',
        tamanho: 10,
      }).obterValor();

      const resultado = service.validarValor(campo, 'texto muito longo para caber');

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('caracteres');
    });

    it('deve validar tipo numérico', () => {
      const campo = Campo.criar({
        nomeTabela: 'TEST',
        nomeCampo: 'CAMPO1',
        tipo: 'I',
      }).obterValor();

      const resultadoValido = service.validarValor(campo, 123);
      expect(resultadoValido.sucesso).toBe(true);

      const resultadoInvalido = service.validarValor(campo, 'texto');
      expect(resultadoInvalido.falhou).toBe(true);
    });
  });

  describe('validarObjeto', () => {
    it('deve validar objeto completo com sucesso', () => {
      const campos = [
        Campo.criar({
          nomeTabela: 'TEST',
          nomeCampo: 'CAMPO1',
          tipo: 'S',
          obrigatorio: 'S',
        }).obterValor(),
        Campo.criar({
          nomeTabela: 'TEST',
          nomeCampo: 'CAMPO2',
          tipo: 'I',
        }).obterValor(),
      ];

      const objeto = {
        CAMPO1: 'valor',
        CAMPO2: 123,
      };

      const resultado = service.validarObjeto(campos, objeto);

      expect(resultado.sucesso).toBe(true);
    });

    it('deve retornar erros para campos inválidos', () => {
      const campos = [
        Campo.criar({
          nomeTabela: 'TEST',
          nomeCampo: 'CAMPO1',
          tipo: 'S',
          obrigatorio: 'S',
        }).obterValor(),
        Campo.criar({
          nomeTabela: 'TEST',
          nomeCampo: 'CAMPO2',
          tipo: 'I',
          obrigatorio: 'S',
        }).obterValor(),
      ];

      const objeto = {
        CAMPO1: '',
        CAMPO2: 'texto',
      };

      const resultado = service.validarObjeto(campos, objeto);

      expect(resultado.falhou).toBe(true);
      const erros = JSON.parse(resultado.erro!);
      expect(erros.CAMPO1).toBeDefined();
      expect(erros.CAMPO2).toBeDefined();
    });
  });
});
