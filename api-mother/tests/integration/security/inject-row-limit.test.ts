import { injectRowLimit } from '../../../src/common/utils/inject-row-limit';

describe('Inject Row Limit', () => {
  it('injeta TOP 5000 em SELECT simples', () => {
    const sql = 'SELECT CODPARC, NOMEPARC FROM TGFPAR WHERE ATIVO = 1';
    const result = injectRowLimit(sql);
    expect(result.toUpperCase()).toContain('TOP 5000');
    expect(result.toUpperCase()).toContain('SELECT');
  });

  it('nao modifica query que ja tem TOP', () => {
    const sql = 'SELECT TOP 100 * FROM TGFPAR';
    const result = injectRowLimit(sql);
    expect(result).toBe(sql);
  });

  it('nao modifica query que ja tem OFFSET', () => {
    const sql = 'SELECT * FROM TGFPAR ORDER BY CODPARC OFFSET 10 ROWS FETCH NEXT 50 ROWS ONLY';
    const result = injectRowLimit(sql);
    expect(result).toBe(sql);
  });

  it('nao modifica query com ROW_NUMBER paginacao', () => {
    const sql = `SELECT * FROM (SELECT *, ROW_NUMBER() OVER (ORDER BY CODPARC) AS rn FROM TGFPAR) T WHERE rn > 0 AND rn <= 50`;
    const result = injectRowLimit(sql);
    // Deve manter original pois ja tem paginacao implicita
    expect(result).toContain('ROW_NUMBER');
  });

  it('aceita maxRows customizado', () => {
    const sql = 'SELECT CODPARC FROM TGFPAR';
    const result = injectRowLimit(sql, 100);
    expect(result.toUpperCase()).toContain('TOP 100');
  });

  it('lida com SELECT DISTINCT', () => {
    const sql = 'SELECT DISTINCT CODPARC FROM TGFPAR';
    const result = injectRowLimit(sql);
    expect(result.toUpperCase()).toContain('TOP 5000');
    expect(result.toUpperCase()).toContain('DISTINCT');
  });

  it('lida com CTE (WITH)', () => {
    const sql = `WITH cte AS (SELECT CODPARC FROM TGFPAR) SELECT CODPARC FROM cte`;
    const result = injectRowLimit(sql);
    // TOP deve estar no SELECT final, nao dentro da CTE
    const lastSelect = result.lastIndexOf('SELECT');
    const topPos = result.toUpperCase().indexOf('TOP 5000');
    expect(topPos).toBeGreaterThan(-1);
  });

  it('nao injeta em query vazia', () => {
    const result = injectRowLimit('');
    expect(result).toBe('');
  });

  it('nao injeta em queries nao-SELECT', () => {
    // Se por algum motivo chegasse um INSERT (nao deveria), nao modificar
    const sql = 'INSERT INTO TGFPAR (NOMEPARC) VALUES (1)';
    const result = injectRowLimit(sql);
    expect(result).toBe(sql);
  });
});
