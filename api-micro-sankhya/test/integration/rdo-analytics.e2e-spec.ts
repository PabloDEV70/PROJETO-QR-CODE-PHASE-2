import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';

describe('RDO Analytics (e2e)', () => {
  let app: FastifyInstance;
  let rdoTablesExist = false;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    const probeResponse = await app.inject({
      method: 'GET',
      url: '/rdo?page=1&limit=1',
    });

    rdoTablesExist = probeResponse.statusCode === 200;

    if (!rdoTablesExist) {
      console.warn(
        '[rdo-analytics.e2e] AD_ tables not accessible. Skipping tests.',
      );
    }
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── PRODUTIVIDADE ──────────────────────────────────────────

  describe('GET /rdo/analytics/produtividade', () => {
    it('should return productivity data with meta', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/produtividade',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.meta).toHaveProperty('total');
      expect(result.meta).toHaveProperty('limit');
    });

    it('should return correct productivity fields', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/produtividade?limit=5',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();

      if (result.data.length > 0) {
        const item = result.data[0];
        expect(item).toHaveProperty('codparc');
        expect(item).toHaveProperty('nomeparc');
        expect(item).toHaveProperty('totalRdos');
        expect(item).toHaveProperty('totalItens');
        expect(item).toHaveProperty('totalMinutos');
        expect(item).toHaveProperty('totalHoras');
        expect(item).toHaveProperty('mediaMinutosPorItem');
        expect(item).toHaveProperty('mediaHorasPorRdo');
        expect(item).toHaveProperty('desvioPadrao');
        expect(item).toHaveProperty('itensCurtos');
        expect(item).toHaveProperty('percentualCurtos');
        expect(item).toHaveProperty('itensComOs');
        expect(item).toHaveProperty('itensSemOs');
        expect(item).toHaveProperty('percentualComOs');
      }
    });

    it('should not return negative hours (HRFIM < HRINI protection)', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/produtividade?limit=50',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();

      result.data.forEach((item: any) => {
        expect(Number(item.totalHoras)).toBeGreaterThanOrEqual(0);
        expect(Number(item.totalMinutos)).toBeGreaterThanOrEqual(0);
      });
    });

    it('should filter by period', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/produtividade?dataInicio=2026-01-27&dataFim=2026-01-31',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should filter by codparc include', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/produtividade?codparc=3396',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();

      if (result.data.length > 0) {
        expect(result.data.length).toBe(1);
        expect(result.data[0].codparc).toBe(3396);
      }
    });

    it('should filter by codparc exclude', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/produtividade?codparc=!3396&limit=50',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();

      result.data.forEach((item: any) => {
        expect(item.codparc).not.toBe(3396);
      });
    });

    it('should respect limit parameter', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/produtividade?limit=3',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.data.length).toBeLessThanOrEqual(3);
      expect(result.meta.limit).toBe(3);
    });

    it('should order by totalHoras DESC by default', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/produtividade?limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();

      if (result.data.length >= 2) {
        expect(Number(result.data[0].totalHoras))
          .toBeGreaterThanOrEqual(Number(result.data[1].totalHoras));
      }
    });
  });

  // ─── EFICIENCIA ─────────────────────────────────────────────

  describe('GET /rdo/analytics/eficiencia', () => {
    it('should return efficiency data with correct fields', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/eficiencia?limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');

      if (result.data.length > 0) {
        const item = result.data[0];
        expect(item).toHaveProperty('codparc');
        expect(item).toHaveProperty('nomeparc');
        expect(item).toHaveProperty('mediaMinutosPorItem');
        expect(item).toHaveProperty('desvioPadrao');
        expect(item).toHaveProperty('itensCurtos');
        expect(item).toHaveProperty('percentualCurtos');
        expect(item).toHaveProperty('motivosDiferentes');
        expect(item).toHaveProperty('mediaItensPorRdo');
      }
    });

    it('should filter by period', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/eficiencia?dataInicio=2026-01-27&dataFim=2026-01-31',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should have numeric desvio padrao', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/eficiencia?limit=20',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();

      result.data.forEach((item: any) => {
        expect(typeof Number(item.desvioPadrao)).toBe('number');
        expect(Number(item.desvioPadrao)).toBeGreaterThanOrEqual(0);
      });
    });
  });

  // ─── MOTIVOS ────────────────────────────────────────────────

  describe('GET /rdo/analytics/motivos', () => {
    it('should return motivos with percentages', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/motivos',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toHaveProperty('totalHoras');

      if (result.data.length > 0) {
        const item = result.data[0];
        expect(item).toHaveProperty('rdomotivocod');
        expect(item).toHaveProperty('descricao');
        expect(item).toHaveProperty('sigla');
        expect(item).toHaveProperty('totalItens');
        expect(item).toHaveProperty('totalHoras');
        expect(item).toHaveProperty('percentualDoTotal');
      }
    });

    it('should have percentages that sum approximately to 100', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/motivos',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();

      if (result.data.length > 0) {
        const totalPercentual = result.data.reduce(
          (sum: number, item: any) => sum + Number(item.percentualDoTotal), 0,
        );
        expect(totalPercentual).toBeGreaterThan(95);
        expect(totalPercentual).toBeLessThanOrEqual(101);
      }
    });

    it('should not return negative hours', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/motivos',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();

      result.data.forEach((item: any) => {
        expect(Number(item.totalHoras)).toBeGreaterThanOrEqual(0);
      });
    });

    it('should filter by period', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/motivos?dataInicio=2026-01-27&dataFim=2026-01-31',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should filter by codparc', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/motivos?codparc=3396',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  // ─── MOTIVOS POR COLABORADOR ────────────────────────────────

  describe('GET /rdo/analytics/motivos/colaborador', () => {
    it('should return motivos grouped by collaborator', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/motivos/colaborador',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');

      if (result.data.length > 0) {
        const item = result.data[0];
        expect(item).toHaveProperty('codparc');
        expect(item).toHaveProperty('nomeparc');
        expect(item).toHaveProperty('rdomotivocod');
        expect(item).toHaveProperty('descricao');
        expect(item).toHaveProperty('sigla');
        expect(item).toHaveProperty('totalItens');
        expect(item).toHaveProperty('horasNoMotivo');
        expect(item).toHaveProperty('percentual');
      }
    });

    it('should filter by single codparc', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/motivos/colaborador?codparc=3396',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();

      result.data.forEach((item: any) => {
        expect(item.codparc).toBe(3396);
      });
    });

    it('should have percentages that sum to ~100 per collaborator', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/motivos/colaborador?codparc=3396',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();

      if (result.data.length > 0) {
        const totalPercentual = result.data.reduce(
          (sum: number, item: any) => sum + Number(item.percentual), 0,
        );
        expect(totalPercentual).toBeGreaterThan(95);
        expect(totalPercentual).toBeLessThanOrEqual(101);
      }
    });

    it('should filter by period', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/motivos/colaborador?dataInicio=2026-01-27&dataFim=2026-01-31',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  // ─── RESUMO ─────────────────────────────────────────────────

  describe('GET /rdo/analytics/resumo', () => {
    it('should return summary card data', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/resumo',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();

      expect(result).toHaveProperty('totalRdos');
      expect(result).toHaveProperty('totalDetalhes');
      expect(result).toHaveProperty('totalColaboradores');
      expect(result).toHaveProperty('totalHoras');
      expect(result).toHaveProperty('mediaHorasDia');
      expect(result).toHaveProperty('mediaItensPorRdo');
      expect(result).toHaveProperty('diasComDados');
      expect(result).toHaveProperty('topMotivo');
      expect(result).toHaveProperty('topMotivoSigla');
      expect(result).toHaveProperty('topMotivoPercentual');
      expect(result).toHaveProperty('percentualComOs');
    });

    it('should return non-negative totals', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/resumo',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();

      expect(result.totalRdos).toBeGreaterThanOrEqual(0);
      expect(result.totalDetalhes).toBeGreaterThanOrEqual(0);
      expect(result.totalHoras).toBeGreaterThanOrEqual(0);
      expect(result.diasComDados).toBeGreaterThanOrEqual(0);
    });

    it('should filter by period', async () => {
      if (!rdoTablesExist) return;

      const [fullRes, filteredRes] = await Promise.all([
        app.inject({
          method: 'GET',
          url: '/rdo/analytics/resumo',
        }),
        app.inject({
          method: 'GET',
          url: '/rdo/analytics/resumo?dataInicio=2026-01-29&dataFim=2026-01-31',
        }),
      ]);

      expect(fullRes.statusCode).toBe(200);
      expect(filteredRes.statusCode).toBe(200);

      const full = fullRes.json();
      const filtered = filteredRes.json();

      expect(filtered.totalRdos).toBeLessThanOrEqual(full.totalRdos);
    });

    it('should filter by codparc', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/resumo?codparc=3396',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.totalColaboradores).toBeLessThanOrEqual(1);
    });

    it('should have topMotivo as string', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/resumo',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(typeof result.topMotivo).toBe('string');
      expect(typeof result.topMotivoSigla).toBe('string');
    });

    it('should include per-collaborator KPIs in resumo', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/resumo',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();

      expect(body).toHaveProperty('mediaHorasPorColabDia');
      expect(body).toHaveProperty('mediaRdosPorColab');
      expect(typeof body.mediaHorasPorColabDia).toBe('number');
      expect(typeof body.mediaRdosPorColab).toBe('number');
    });
  });

  // ─── COMBINED FILTERS ──────────────────────────────────────

  describe('GET /rdo/analytics - combined filters', () => {
    it('should apply organizational filter (codcargo)', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/produtividade?codcargo=426',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should combine period + codparc + limit', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/produtividade?dataInicio=2026-01-27&dataFim=2026-01-31&codparc=3396,566&limit=5',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();

      result.data.forEach((item: any) => {
        expect([3396, 566]).toContain(item.codparc);
      });
    });

    it('should apply exclude filter on eficiencia', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/eficiencia?codparc=!100&limit=20',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();

      result.data.forEach((item: any) => {
        expect(item.codparc).not.toBe(100);
      });
    });
  });
});
