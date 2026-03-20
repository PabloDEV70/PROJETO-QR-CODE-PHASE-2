import { View, ViewDetalhe } from './view.entity';

describe('View Entity', () => {
  const dadosBase = {
    schema_name: 'dbo',
    view_name: 'vw_Veiculos',
    definition: 'SELECT * FROM TGFVEI WHERE ATIVO = 1',
    created_date: new Date('2024-01-01'),
    modified_date: new Date('2024-06-01'),
    is_updatable: false,
  };

  describe('criar', () => {
    it('deve criar uma view', () => {
      const view = View.criar(dadosBase);

      expect(view.schema).toBe('dbo');
      expect(view.nome).toBe('vw_Veiculos');
      expect(view.definicao).toBe('SELECT * FROM TGFVEI WHERE ATIVO = 1');
      expect(view.atualizavel).toBe(false);
    });

    it('deve criar view sem definição', () => {
      const view = View.criar({
        ...dadosBase,
        definition: undefined,
      });

      expect(view.definicao).toBeNull();
    });
  });

  describe('obterNomeCompleto', () => {
    it('deve retornar nome completo', () => {
      const view = View.criar(dadosBase);
      expect(view.obterNomeCompleto()).toBe('dbo.vw_Veiculos');
    });
  });

  describe('temDefinicao', () => {
    it('deve retornar true quando tem definição', () => {
      const view = View.criar(dadosBase);
      expect(view.temDefinicao()).toBe(true);
    });

    it('deve retornar false quando não tem definição', () => {
      const view = View.criar({
        ...dadosBase,
        definition: undefined,
      });
      expect(view.temDefinicao()).toBe(false);
    });
  });

  describe('obterDefinicaoTruncada', () => {
    it('deve retornar definição completa quando pequena', () => {
      const view = View.criar(dadosBase);
      expect(view.obterDefinicaoTruncada(100)).toBe('SELECT * FROM TGFVEI WHERE ATIVO = 1');
    });

    it('deve truncar definição longa', () => {
      const view = View.criar(dadosBase);
      expect(view.obterDefinicaoTruncada(20)).toBe('SELECT * FROM TGFVEI...');
    });

    it('deve retornar string vazia quando não tem definição', () => {
      const view = View.criar({
        ...dadosBase,
        definition: undefined,
      });
      expect(view.obterDefinicaoTruncada()).toBe('');
    });
  });
});

describe('ViewDetalhe Entity', () => {
  const dadosDetalhe = {
    schema_name: 'dbo',
    view_name: 'vw_Veiculos',
    definition: 'SELECT * FROM TGFVEI',
    columns: [
      { column_name: 'CODVEI', data_type: 'int', is_nullable: false, ordinal_position: 1 },
      { column_name: 'PLACA', data_type: 'varchar', is_nullable: true, ordinal_position: 2, max_length: 10 },
    ],
  };

  describe('criar', () => {
    it('deve criar view com detalhes', () => {
      const detalhe = ViewDetalhe.criar(dadosDetalhe);

      expect(detalhe.schema).toBe('dbo');
      expect(detalhe.nome).toBe('vw_Veiculos');
      expect(detalhe.colunas).toHaveLength(2);
      expect(detalhe.colunas[0].nome).toBe('CODVEI');
      expect(detalhe.colunas[0].tipo).toBe('int');
      expect(detalhe.colunas[1].tamanhoMaximo).toBe(10);
    });
  });

  describe('obterQuantidadeColunas', () => {
    it('deve retornar quantidade de colunas', () => {
      const detalhe = ViewDetalhe.criar(dadosDetalhe);
      expect(detalhe.obterQuantidadeColunas()).toBe(2);
    });
  });
});
