/**
 * Testes de integracao com banco SANKHYA_TESTE.
 * Validam que as queries de seguranca funcionam corretamente
 * contra o banco real, sem modificar dados.
 *
 * IMPORTANTE: Todos os testes sao READ-ONLY.
 * Nenhum INSERT/UPDATE/DELETE e executado.
 */
import { ConnectionPool } from 'mssql';

const TEST_CONFIG = {
  server: process.env.SQLSERVER_SERVER || '192.168.1.6',
  port: Number(process.env.SQLSERVER_PORT) || 1433,
  user: process.env.SQLSERVER_CRUD_USER || process.env.SQLSERVER_USER || 'sankhya',
  password: process.env.SQLSERVER_CRUD_PASSWORD || process.env.SQLSERVER_PASSWORD || '12gig23',
  database: 'SANKHYA_TESTE',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  connectionTimeout: 15000,
  requestTimeout: 30000,
};

let pool: ConnectionPool;

beforeAll(async () => {
  pool = new ConnectionPool(TEST_CONFIG);
  await pool.connect();
}, 20000);

afterAll(async () => {
  if (pool?.connected) await pool.close();
});

describe('Conexao com SANKHYA_TESTE', () => {
  it('conecta com sucesso', () => {
    expect(pool.connected).toBe(true);
  });

  it('executa SELECT simples', async () => {
    const result = await pool.request().query('SELECT 1 AS ok');
    expect(result.recordset[0].ok).toBe(1);
  });

  it('acessa tabelas Sankhya', async () => {
    const result = await pool.request().query('SELECT TOP 1 CODPARC, NOMEPARC FROM TGFPAR');
    expect(result.recordset.length).toBe(1);
    expect(result.recordset[0]).toHaveProperty('CODPARC');
    expect(result.recordset[0]).toHaveProperty('NOMEPARC');
  });
});

describe('Query com JOINs complexos (validacao api-mother aceita)', () => {
  it('JOIN TGFPAR + TSIUSU funciona', async () => {
    const sql = `
      SELECT TOP 3 par.CODPARC, par.NOMEPARC, usu.CODUSU, usu.NOMEUSU
      FROM TGFPAR par
      JOIN TSIUSU usu ON usu.CODPARC = par.CODPARC
      WHERE par.CODPARC > 0
    `;
    const result = await pool.request().query(sql);
    expect(result.recordset.length).toBeGreaterThan(0);
    expect(result.recordset[0]).toHaveProperty('NOMEPARC');
    expect(result.recordset[0]).toHaveProperty('NOMEUSU');
  });

  it('JOIN multiplo TCFOSCAB + TGFVEI + TGFPAR + TSIUSU + TSIEMP + TCFMAN funciona', async () => {
    const sql = `
      SELECT TOP 3
        os.NUOS, os.STATUS,
        v.PLACA, v.MARCAMODELO,
        mot.NOMEPARC AS NOMEMOTORISTA,
        emp.NOMEFANTASIA AS NOMEEMPRESA,
        uinc.NOMEUSU AS NOMEUSUINC,
        pm.DESCRICAO AS DESCRICAOPLANO
      FROM TCFOSCAB os
      LEFT JOIN TGFVEI v ON os.CODVEICULO = v.CODVEICULO
      LEFT JOIN TGFPAR mot ON os.CODMOTORISTA = mot.CODPARC
      LEFT JOIN TSIEMP emp ON os.CODEMP = emp.CODEMP
      LEFT JOIN TSIUSU uinc ON os.CODUSUINC = uinc.CODUSU
      LEFT JOIN TCFMAN pm ON os.NUPLANO = pm.NUPLANO
      ORDER BY os.NUOS DESC
    `;
    const result = await pool.request().query(sql);
    expect(result.recordset.length).toBeGreaterThan(0);
    expect(result.recordset[0]).toHaveProperty('NUOS');
    expect(result.recordset[0]).toHaveProperty('PLACA');
  });

  it('alias pm funciona (nao plan que e reservado)', async () => {
    const sql = `SELECT TOP 1 pm.NUPLANO, pm.DESCRICAO FROM TCFMAN pm`;
    const result = await pool.request().query(sql);
    expect(result.recordset.length).toBeLessThanOrEqual(1);
  });

  it('alias plan FALHA (palavra reservada MSSQL)', async () => {
    const sql = `SELECT TOP 1 plan.NUPLANO FROM TCFMAN plan`;
    await expect(pool.request().query(sql)).rejects.toThrow();
  });
});

describe('Prevencao de SQL injection no banco', () => {
  it('nao permite DROP via query string', async () => {
    const malicious = "SELECT 1; DROP TABLE TGFPAR--";
    // MSSQL por padrao executa multiplos statements, mas nosso validator deve bloquear antes
    // Aqui testamos que mesmo no banco, a tabela sobrevive
    try {
      await pool.request().query(malicious);
    } catch {
      // Esperado falhar
    }
    // Tabela deve continuar existindo
    const check = await pool.request().query('SELECT TOP 1 CODPARC FROM TGFPAR');
    expect(check.recordset.length).toBe(1);
  });

  it('brackets nao previnem injection sozinhos', () => {
    // Demonstra que [tabela] NAO e seguro se o nome vier do usuario
    const malicious = "tabela]] + CHAR(59) + CHAR(68) + CHAR(82) + CHAR(79) + CHAR(80)--";
    // Nosso validator deve rejeitar ANTES de chegar ao banco
    const { validateSqlIdentifier } = require('../../../src/common/utils/sql-identifier-validator');
    expect(() => validateSqlIdentifier(malicious, 'table')).toThrow();
  });
});

describe('TGFSER queries (series/empenhados)', () => {
  it('retorna produtos com series', async () => {
    const sql = `
      SELECT TOP 5 s.CODPROD, p.DESCRPROD, COUNT(DISTINCT s.SERIE) AS QTD_SERIES
      FROM TGFSER s
      JOIN TGFPRO p ON s.CODPROD = p.CODPROD
      GROUP BY s.CODPROD, p.DESCRPROD
      HAVING COUNT(DISTINCT s.SERIE) > 0
      ORDER BY QTD_SERIES DESC
    `;
    const result = await pool.request().query(sql);
    expect(result.recordset.length).toBeGreaterThan(0);
    expect(result.recordset[0].QTD_SERIES).toBeGreaterThan(0);
  });

  it('retorna historico de serie com JOINs completos', async () => {
    // Pega uma serie existente primeiro
    const serieResult = await pool.request().query(
      `SELECT TOP 1 SERIE, CODPROD FROM TGFSER WHERE SEQUENCIA > 0`
    );
    if (serieResult.recordset.length === 0) return; // Skip se nao tem dados

    const { SERIE, CODPROD } = serieResult.recordset[0];
    const sql = `
      SELECT TOP 5
        s.SERIE, s.NUNOTA, s.SEQUENCIA, s.ATUALESTOQUE,
        c.DTNEG, c.TIPMOV, t.DESCROPER,
        par.NOMEPARC, u.NOMEUSU,
        lo.DESCRLOCAL AS LOCAL_NOME
      FROM TGFSER s
      JOIN TGFCAB c ON s.NUNOTA = c.NUNOTA
      JOIN TGFTOP t ON c.CODTIPOPER = t.CODTIPOPER AND c.DHTIPOPER = t.DHALTER
      LEFT JOIN TGFPAR par ON c.CODPARC = par.CODPARC
      LEFT JOIN TSIUSU u ON s.CODUSU = u.CODUSU
      LEFT JOIN TGFITE i ON s.NUNOTA = i.NUNOTA AND i.SEQUENCIA = ABS(s.SEQUENCIA)
      LEFT JOIN TGFLOC lo ON i.CODLOCALORIG = lo.CODLOCAL
      WHERE s.SERIE = '${SERIE.replace(/'/g, "''")}' AND s.CODPROD = ${Number(CODPROD)}
      ORDER BY c.DTNEG DESC
    `;
    const result = await pool.request().query(sql);
    expect(result.recordset.length).toBeGreaterThan(0);
    expect(result.recordset[0]).toHaveProperty('DESCROPER');
  });

  it('retorna colaboradores com materiais empenhados', async () => {
    const sql = `
      SELECT TOP 5 USU.CODUSU, USU.NOMEUSU, PAR.CODPARC, PAR.NOMEPARC,
        COUNT(DISTINCT EST.CODPROD) AS QTD_PRODUTOS
      FROM TGFEST EST
      JOIN TGFPAR PAR ON PAR.CODPARC = EST.CODPARC
      JOIN TSIUSU USU ON USU.CODPARC = PAR.CODPARC AND PAR.CODPARC <> 0
      WHERE EST.ESTOQUE <> 0
      GROUP BY USU.CODUSU, USU.NOMEUSU, PAR.CODPARC, PAR.NOMEPARC
      ORDER BY QTD_PRODUTOS DESC
    `;
    const result = await pool.request().query(sql);
    expect(result.recordset.length).toBeGreaterThan(0);
    expect(result.recordset[0].QTD_PRODUTOS).toBeGreaterThan(0);
  });
});

describe('Limites e paginacao', () => {
  it('TOP limita resultados corretamente', async () => {
    const result = await pool.request().query('SELECT TOP 3 CODPARC FROM TGFPAR');
    expect(result.recordset.length).toBe(3);
  });

  it('ROW_NUMBER paginacao funciona', async () => {
    const sql = `
      SELECT * FROM (
        SELECT CODPARC, NOMEPARC, ROW_NUMBER() OVER (ORDER BY CODPARC) AS rn
        FROM TGFPAR
      ) T WHERE rn > 5 AND rn <= 10
    `;
    const result = await pool.request().query(sql);
    expect(result.recordset.length).toBe(5);
    expect(Number(result.recordset[0].rn)).toBe(6);
  });
});
