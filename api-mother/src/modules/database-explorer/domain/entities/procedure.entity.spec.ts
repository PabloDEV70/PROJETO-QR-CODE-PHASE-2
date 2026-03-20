import { Procedure, ProcedureDetalhe } from './procedure.entity';

describe('Procedure Entity', () => {
  const dadosBase = {
    schema_name: 'dbo',
    procedure_name: 'sp_BuscarVeiculo',
    definition: 'CREATE PROCEDURE sp_BuscarVeiculo @CodVei INT AS SELECT * FROM TGFVEI WHERE CODVEI = @CodVei',
    type_desc: 'SQL_STORED_PROCEDURE',
    created_date: new Date('2024-01-01'),
    modified_date: new Date('2024-06-01'),
  };

  describe('criar', () => {
    it('deve criar uma procedure', () => {
      const proc = Procedure.criar(dadosBase);

      expect(proc.schema).toBe('dbo');
      expect(proc.nome).toBe('sp_BuscarVeiculo');
      expect(proc.tipoDescricao).toBe('SQL_STORED_PROCEDURE');
      expect(proc.dataCriacao).toEqual(new Date('2024-01-01'));
    });
  });

  describe('obterNomeCompleto', () => {
    it('deve retornar nome completo', () => {
      const proc = Procedure.criar(dadosBase);
      expect(proc.obterNomeCompleto()).toBe('dbo.sp_BuscarVeiculo');
    });
  });

  describe('temDefinicao', () => {
    it('deve retornar true quando tem definição', () => {
      const proc = Procedure.criar(dadosBase);
      expect(proc.temDefinicao()).toBe(true);
    });

    it('deve retornar false quando não tem definição', () => {
      const proc = Procedure.criar({
        ...dadosBase,
        definition: undefined,
      });
      expect(proc.temDefinicao()).toBe(false);
    });
  });

  describe('obterDefinicaoTruncada', () => {
    it('deve truncar definição longa', () => {
      const proc = Procedure.criar(dadosBase);
      expect(proc.obterDefinicaoTruncada(30)).toBe('CREATE PROCEDURE sp_BuscarVeic...');
    });
  });
});

describe('ProcedureDetalhe Entity', () => {
  const dadosDetalhe = {
    schema_name: 'dbo',
    procedure_name: 'sp_BuscarVeiculo',
    definition: 'CREATE PROCEDURE ...',
    type_desc: 'SQL_STORED_PROCEDURE',
    parameters: [
      { parameter_name: '@CodVei', data_type: 'int', is_output: false },
      { parameter_name: '@Result', data_type: 'int', is_output: true },
    ],
  };

  describe('criar', () => {
    it('deve criar procedure com detalhes', () => {
      const detalhe = ProcedureDetalhe.criar(dadosDetalhe);

      expect(detalhe.schema).toBe('dbo');
      expect(detalhe.nome).toBe('sp_BuscarVeiculo');
      expect(detalhe.parametros).toHaveLength(2);
      expect(detalhe.parametros[0].nome).toBe('@CodVei');
      expect(detalhe.parametros[0].saida).toBe(false);
      expect(detalhe.parametros[1].saida).toBe(true);
    });
  });

  describe('obterQuantidadeParametros', () => {
    it('deve retornar quantidade de parâmetros', () => {
      const detalhe = ProcedureDetalhe.criar(dadosDetalhe);
      expect(detalhe.obterQuantidadeParametros()).toBe(2);
    });
  });

  describe('obterParametrosEntrada', () => {
    it('deve retornar parâmetros de entrada', () => {
      const detalhe = ProcedureDetalhe.criar(dadosDetalhe);
      const entrada = detalhe.obterParametrosEntrada();
      expect(entrada).toHaveLength(1);
      expect(entrada[0].nome).toBe('@CodVei');
    });
  });

  describe('obterParametrosSaida', () => {
    it('deve retornar parâmetros de saída', () => {
      const detalhe = ProcedureDetalhe.criar(dadosDetalhe);
      const saida = detalhe.obterParametrosSaida();
      expect(saida).toHaveLength(1);
      expect(saida[0].nome).toBe('@Result');
    });
  });
});
