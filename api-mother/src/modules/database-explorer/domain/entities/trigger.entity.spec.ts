import { Trigger, TriggerDetalhe } from './trigger.entity';

describe('Trigger Entity', () => {
  const dadosBase = {
    schema_name: 'dbo',
    trigger_name: 'tr_Audit_Veiculo',
    table_name: 'TGFVEI',
    definition: 'CREATE TRIGGER tr_Audit_Veiculo ON TGFVEI AFTER INSERT AS ...',
    is_disabled: false,
    type_desc: 'AFTER',
    create_date: new Date('2024-01-01'),
    modify_date: new Date('2024-06-01'),
  };

  describe('criar', () => {
    it('deve criar um trigger', () => {
      const trigger = Trigger.criar(dadosBase);

      expect(trigger.schema).toBe('dbo');
      expect(trigger.nome).toBe('tr_Audit_Veiculo');
      expect(trigger.tabela).toBe('TGFVEI');
      expect(trigger.desabilitado).toBe(false);
      expect(trigger.tipoDescricao).toBe('AFTER');
    });
  });

  describe('obterNomeCompleto', () => {
    it('deve retornar nome completo', () => {
      const trigger = Trigger.criar(dadosBase);
      expect(trigger.obterNomeCompleto()).toBe('dbo.tr_Audit_Veiculo');
    });
  });

  describe('estaAtivo', () => {
    it('deve retornar true quando não está desabilitado', () => {
      const trigger = Trigger.criar(dadosBase);
      expect(trigger.estaAtivo()).toBe(true);
    });

    it('deve retornar false quando está desabilitado', () => {
      const trigger = Trigger.criar({
        ...dadosBase,
        is_disabled: true,
      });
      expect(trigger.estaAtivo()).toBe(false);
    });
  });

  describe('temDefinicao', () => {
    it('deve retornar true quando tem definição', () => {
      const trigger = Trigger.criar(dadosBase);
      expect(trigger.temDefinicao()).toBe(true);
    });
  });

  describe('obterDefinicaoTruncada', () => {
    it('deve truncar definição longa', () => {
      const trigger = Trigger.criar(dadosBase);
      expect(trigger.obterDefinicaoTruncada(30)).toBe('CREATE TRIGGER tr_Audit_Veicul...');
    });
  });
});

describe('TriggerDetalhe Entity', () => {
  const dadosDetalhe = {
    schema_name: 'dbo',
    trigger_name: 'tr_Audit_Veiculo',
    table_name: 'TGFVEI',
    definition: 'CREATE TRIGGER ...',
    is_disabled: false,
    type_desc: 'AFTER',
    trigger_events: ['INSERT', 'UPDATE'],
  };

  describe('criar', () => {
    it('deve criar trigger com detalhes', () => {
      const detalhe = TriggerDetalhe.criar(dadosDetalhe);

      expect(detalhe.schema).toBe('dbo');
      expect(detalhe.nome).toBe('tr_Audit_Veiculo');
      expect(detalhe.eventos).toEqual(['INSERT', 'UPDATE']);
    });
  });

  describe('disparaEmInsert', () => {
    it('deve retornar true quando dispara em INSERT', () => {
      const detalhe = TriggerDetalhe.criar(dadosDetalhe);
      expect(detalhe.disparaEmInsert()).toBe(true);
    });

    it('deve retornar false quando não dispara em INSERT', () => {
      const detalhe = TriggerDetalhe.criar({
        ...dadosDetalhe,
        trigger_events: ['DELETE'],
      });
      expect(detalhe.disparaEmInsert()).toBe(false);
    });
  });

  describe('disparaEmUpdate', () => {
    it('deve retornar true quando dispara em UPDATE', () => {
      const detalhe = TriggerDetalhe.criar(dadosDetalhe);
      expect(detalhe.disparaEmUpdate()).toBe(true);
    });
  });

  describe('disparaEmDelete', () => {
    it('deve retornar false quando não dispara em DELETE', () => {
      const detalhe = TriggerDetalhe.criar(dadosDetalhe);
      expect(detalhe.disparaEmDelete()).toBe(false);
    });
  });

  describe('obterEventosFormatados', () => {
    it('deve retornar eventos formatados', () => {
      const detalhe = TriggerDetalhe.criar(dadosDetalhe);
      expect(detalhe.obterEventosFormatados()).toBe('INSERT, UPDATE');
    });
  });
});
