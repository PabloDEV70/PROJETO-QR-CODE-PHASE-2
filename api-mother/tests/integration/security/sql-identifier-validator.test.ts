import { validateSqlIdentifier, safeBracket } from '../../../src/common/utils/sql-identifier-validator';

describe('SQL Identifier Validator', () => {
  describe('validateSqlIdentifier', () => {
    it('aceita nomes de tabelas Sankhya validos', () => {
      const tabelas = [
        'TGFCAB', 'TGFITE', 'TGFPAR', 'TGFVEI', 'TGFPRO',
        'TSIUSU', 'TSIEMP', 'TCFOSCAB', 'TCFSERVOS', 'TCFMAN',
        'AD_COMADM', 'AD_LOGSTATUSOS', 'AD_CONTROLE_ROTINA',
        'TGFSER', 'TGFEST', 'TGFLOC', 'TGFGRU',
      ];
      for (const t of tabelas) {
        expect(() => validateSqlIdentifier(t, 'table')).not.toThrow();
        expect(validateSqlIdentifier(t, 'table')).toBe(t);
      }
    });

    it('aceita nomes de colunas Sankhya validos', () => {
      const colunas = [
        'NUNOTA', 'CODPARC', 'NOMEPARC', 'CODVEICULO', 'PLACA',
        'AD_STATUSGIG', 'AD_TAG', 'CODPROD', 'DESCRPROD',
        'DTABERTURA', 'DTNEG', 'STATUS', 'MANUTENCAO',
      ];
      for (const c of colunas) {
        expect(() => validateSqlIdentifier(c, 'column')).not.toThrow();
      }
    });

    it('rejeita strings vazias', () => {
      expect(() => validateSqlIdentifier('', 'table')).toThrow('empty');
      expect(() => validateSqlIdentifier('  ', 'table')).toThrow();
    });

    it('rejeita palavras reservadas SQL', () => {
      const reservadas = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'EXEC', 'EXECUTE', 'UNION', 'TRUNCATE'];
      for (const r of reservadas) {
        expect(() => validateSqlIdentifier(r, 'table')).toThrow('reserved');
      }
    });

    it('rejeita caracteres de injecao', () => {
      const payloads = [
        "tabela'; DROP TABLE TGFCAB--",
        'tabela]; DELETE FROM TGFPAR--',
        "tabela' OR '1'='1",
        'tabela; EXEC xp_cmdshell',
        'tabela\x00null',
        'tab"ela',
        "tab'ela",
        'tab;ela',
        'tab\\ela',
        'tab[ela',
        'tab]ela',
      ];
      for (const p of payloads) {
        expect(() => validateSqlIdentifier(p, 'table')).toThrow();
      }
    });

    it('rejeita nomes que comecam com numero', () => {
      expect(() => validateSqlIdentifier('123TABELA', 'table')).toThrow('illegal');
    });

    it('rejeita nomes muito longos (> 128 chars)', () => {
      const longName = 'A'.repeat(129);
      expect(() => validateSqlIdentifier(longName, 'table')).toThrow('illegal');
    });

    it('aceita nomes com underscore no inicio', () => {
      expect(() => validateSqlIdentifier('_TEMP_TABLE', 'table')).not.toThrow();
    });
  });

  describe('safeBracket', () => {
    it('envolve nomes validos em brackets', () => {
      expect(safeBracket('TGFCAB', 'table')).toBe('[TGFCAB]');
      expect(safeBracket('NUNOTA', 'column')).toBe('[NUNOTA]');
      expect(safeBracket('AD_COMADM', 'table')).toBe('[AD_COMADM]');
    });

    it('rejeita nomes invalidos antes de envolver', () => {
      expect(() => safeBracket('DROP', 'table')).toThrow();
      expect(() => safeBracket("'; DROP--", 'table')).toThrow();
    });
  });
});
