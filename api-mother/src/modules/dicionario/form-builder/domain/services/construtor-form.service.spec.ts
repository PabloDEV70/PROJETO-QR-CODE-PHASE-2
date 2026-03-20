import { Test, TestingModule } from '@nestjs/testing';
import { ConstrutorFormService } from './construtor-form.service';
import { Campo } from '../../../domain/entities/campo.entity';

describe('ConstrutorFormService', () => {
  let service: ConstrutorFormService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConstrutorFormService],
    }).compile();

    service = module.get<ConstrutorFormService>(ConstrutorFormService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('construirSchemaFormulario', () => {
    it('deve construir schema válido com campos básicos', () => {
      const campos = [
        Campo.criar({
          nomeTabela: 'TGFPRO',
          nomeCampo: 'CODPROD',
          descricao: 'Código do Produto',
          tipo: 'I',
          tamanho: 0,
          decimais: 0,
          obrigatorio: 'S',
          chavePrimaria: 'S',
        }).obterValor(),
        Campo.criar({
          nomeTabela: 'TGFPRO',
          nomeCampo: 'DESCRPROD',
          descricao: 'Descrição',
          tipo: 'S',
          tamanho: 255,
          decimais: 0,
          obrigatorio: 'S',
        }).obterValor(),
      ];

      const resultado = service.construirSchemaFormulario('TGFPRO', campos);

      expect(resultado.sucesso).toBe(true);
      const schema = resultado.obterValor();
      expect(schema.tableName).toBe('TGFPRO');
      expect(schema.fields).toHaveLength(2);
      expect(schema.fields[0].name).toBe('CODPROD');
      expect(schema.fields[0].isPrimaryKey).toBe(true);
    });

    it('deve falhar se nome da tabela for vazio', () => {
      const resultado = service.construirSchemaFormulario('', []);

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('não pode ser vazio');
    });

    it('deve falhar se lista de campos for vazia', () => {
      const resultado = service.construirSchemaFormulario('TGFPRO', []);

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('não pode ser vazia');
    });
  });

  describe('construirValidacoes', () => {
    it('deve incluir validação required para campo obrigatório', () => {
      const campo = Campo.criar({
        nomeTabela: 'TEST',
        nomeCampo: 'CAMPO1',
        tipo: 'S',
        obrigatorio: 'S',
      }).obterValor();

      const validacoes = service.construirValidacoes(campo);

      expect(validacoes.some((v) => v.type === 'required')).toBe(true);
    });

    it('deve incluir validação maxLength para strings', () => {
      const campo = Campo.criar({
        nomeTabela: 'TEST',
        nomeCampo: 'CAMPO1',
        tipo: 'S',
        tamanho: 100,
      }).obterValor();

      const validacoes = service.construirValidacoes(campo);

      expect(validacoes.some((v) => v.type === 'maxLength' && v.value === 100)).toBe(true);
    });

    it('deve incluir validação number para campos numéricos', () => {
      const campo = Campo.criar({
        nomeTabela: 'TEST',
        nomeCampo: 'CAMPO1',
        tipo: 'I',
      }).obterValor();

      const validacoes = service.construirValidacoes(campo);

      expect(validacoes.some((v) => v.type === 'number')).toBe(true);
    });
  });
});
