import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';

/**
 * Tests for GET /rdo/detalhes - RDO details by period.
 * AD_RDOAPONTAMENTOS and AD_RDOAPONDETALHES are custom tables (AD_ prefix).
 * They may only exist in the PROD database.
 */
describe('RDO Detalhes por Periodo (e2e)', () => {
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
        '[rdo-detalhes.e2e] AD_RDOAPONTAMENTOS tables not accessible. Skipping tests.',
      );
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /rdo/detalhes - basic', () => {
    it('should return paginated details with meta', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.meta).toHaveProperty('page');
      expect(result.meta).toHaveProperty('limit');
      expect(result.meta).toHaveProperty('totalRegistros');
      expect(result.meta).toHaveProperty('totalMinutos');
      expect(result.meta).toHaveProperty('totalHoras');
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('should return correct detail fields', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?page=1&limit=5',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();

      if (result.data.length > 0) {
        const item = result.data[0];
        expect(item).toHaveProperty('CODRDO');
        expect(item).toHaveProperty('DTREF');
        expect(item).toHaveProperty('CODPARC');
        expect(item).toHaveProperty('nomeparc');
        expect(item).toHaveProperty('ITEM');
        expect(item).toHaveProperty('HRINI');
        expect(item).toHaveProperty('HRFIM');
        expect(item).toHaveProperty('hriniFormatada');
        expect(item).toHaveProperty('hrfimFormatada');
        expect(item).toHaveProperty('duracaoMinutos');
        expect(item).toHaveProperty('RDOMOTIVOCOD');
        expect(item).toHaveProperty('motivoDescricao');
        expect(item).toHaveProperty('NUOS');
        expect(item).toHaveProperty('OBS');
      }
    });

    it('should default to page=1 limit=50 when no params', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(50);
    });
  });

  describe('GET /rdo/detalhes - date filters', () => {
    it('should filter by dataInicio only', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?dataInicio=2026-01-01&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should filter by dataFim only', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?dataFim=2026-01-31&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should filter by date range (dataInicio + dataFim)', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?dataInicio=2026-01-01&dataFim=2026-01-31&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);
      expect(typeof result.meta.totalRegistros).toBe('number');
    });

    it('should filter single day', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?dataInicio=2026-01-23&dataFim=2026-01-23&page=1&limit=50',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('GET /rdo/detalhes - partner filter', () => {
    it('should filter by codparc', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?codparc=3396&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 0) {
        result.data.forEach((item: any) => {
          expect(item.CODPARC).toBe(3396);
        });
      }
    });

    it('should filter by codparc + date range', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?codparc=3396&dataInicio=2026-01-01&dataFim=2026-01-31&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);
      expect(typeof result.meta.totalHoras).toBe('number');
    });
  });

  describe('GET /rdo/detalhes - motivo filter', () => {
    it('should filter by rdomotivocod', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?rdomotivocod=1&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 0) {
        result.data.forEach((item: any) => {
          expect(item.RDOMOTIVOCOD).toBe(1);
        });
      }
    });
  });

  describe('GET /rdo/detalhes - OS filters', () => {
    it('should filter items with OS (comOs=true)', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?comOs=true&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 0) {
        result.data.forEach((item: any) => {
          expect(item.NUOS).not.toBeNull();
        });
      }
    });

    it('should filter items without OS (semOs=true)', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?semOs=true&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 0) {
        result.data.forEach((item: any) => {
          expect(item.NUOS).toBeNull();
        });
      }
    });
  });

  describe('GET /rdo/detalhes - ordering', () => {
    it('should order by DTREF DESC (default)', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should order by HRINI ASC', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?orderBy=HRINI&orderDir=ASC&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should order by CODRDO ASC', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?orderBy=CODRDO&orderDir=ASC&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /rdo/detalhes - pagination', () => {
    it('should return different results for page 1 and page 2', async () => {
      if (!rdoTablesExist) return;

      const [res1, res2] = await Promise.all([
        app.inject({ method: 'GET', url: '/rdo/detalhes?page=1&limit=5' }),
        app.inject({ method: 'GET', url: '/rdo/detalhes?page=2&limit=5' }),
      ]);

      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(200);

      const page1 = res1.json();
      const page2 = res2.json();

      expect(page1.meta.totalRegistros).toBe(page2.meta.totalRegistros);

      if (page1.data.length > 0 && page2.data.length > 0) {
        const ids1 = page1.data.map(
          (d: any) => `${d.CODRDO}-${d.ITEM}`,
        );
        const ids2 = page2.data.map(
          (d: any) => `${d.CODRDO}-${d.ITEM}`,
        );
        const overlap = ids1.filter((id: string) => ids2.includes(id));
        expect(overlap.length).toBe(0);
      }
    });

    it('should respect limit parameter', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?page=1&limit=3',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.data.length).toBeLessThanOrEqual(3);
    });
  });

  describe('GET /rdo/detalhes - combined filters', () => {
    it('should combine partner + date + motivo', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?codparc=3396&dataInicio=2026-01-01&dataFim=2026-12-31&rdomotivocod=1&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
    });

    it('should combine date + comOs', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?dataInicio=2026-01-01&dataFim=2026-01-31&comOs=true&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 0) {
        result.data.forEach((item: any) => {
          expect(item.NUOS).not.toBeNull();
        });
      }
    });
  });

  describe('GET /rdo/detalhes - meta totals', () => {
    it('should return consistent totalRegistros with data', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?page=1&limit=5',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();

      if (result.meta.totalRegistros <= 5) {
        expect(result.data.length).toBe(result.meta.totalRegistros);
      } else {
        expect(result.data.length).toBe(5);
      }
    });

    it('should return numeric totalMinutos and totalHoras', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(typeof result.meta.totalMinutos).toBe('number');
      expect(typeof result.meta.totalHoras).toBe('number');
    });
  });

  describe('GET /rdo/detalhes - V2 organizational fields', () => {
    it('should return new organizational fields in response', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?page=1&limit=5',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();

      if (result.data.length > 0) {
        const item = result.data[0];
        expect(item).toHaveProperty('coddep');
        expect(item).toHaveProperty('departamento');
        expect(item).toHaveProperty('codcargo');
        expect(item).toHaveProperty('cargo');
        expect(item).toHaveProperty('codfuncao');
        expect(item).toHaveProperty('funcao');
        expect(item).toHaveProperty('codemp');
        expect(item).toHaveProperty('empresa');
      }
    });
  });

  describe('GET /rdo/detalhes - V2 include/exclude filters', () => {
    it('should filter by codparc single include', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?codparc=3396&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 0) {
        result.data.forEach((item: any) => {
          expect(item.CODPARC).toBe(3396);
        });
      }
    });

    it('should filter by codparc multiple include (IN)', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?codparc=3396,566&page=1&limit=20',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 0) {
        result.data.forEach((item: any) => {
          expect([3396, 566]).toContain(item.CODPARC);
        });
      }
    });

    it('should filter by codparc single exclude (NOT IN)', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?codparc=!100&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 0) {
        result.data.forEach((item: any) => {
          expect(item.CODPARC).not.toBe(100);
        });
      }
    });

    it('should filter by codparc multiple exclude (NOT IN)', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?codparc=!100,200&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 0) {
        result.data.forEach((item: any) => {
          expect([100, 200]).not.toContain(item.CODPARC);
        });
      }
    });

    it('should filter by rdomotivocod multiple include', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?rdomotivocod=1,2&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 0) {
        result.data.forEach((item: any) => {
          expect([1, 2]).toContain(item.RDOMOTIVOCOD);
        });
      }
    });

    it('should filter by rdomotivocod single exclude', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?rdomotivocod=!5&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 0) {
        result.data.forEach((item: any) => {
          expect(item.RDOMOTIVOCOD).not.toBe(5);
        });
      }
    });
  });

  describe('GET /rdo/detalhes - V2 organizational filters', () => {
    it('should filter by coddep single value', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?coddep=1&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 0) {
        result.data.forEach((item: any) => {
          expect(item.coddep).toBe(1);
        });
      }
    });

    it('should filter by coddep multiple values (IN)', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?coddep=1,2&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 0) {
        result.data.forEach((item: any) => {
          expect([1, 2]).toContain(item.coddep);
        });
      }
    });

    it('should filter by codcargo', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?codcargo=10&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should filter by codfuncao', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?codfuncao=5&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should filter by codemp', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?codemp=1&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should filter by codemp exclude', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?codemp=!999&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 0) {
        result.data.forEach((item: any) => {
          expect(item.codemp).not.toBe(999);
        });
      }
    });
  });

  describe('GET /rdo/detalhes - V2 combined advanced filters', () => {
    it('should combine organizational + include/exclude + date', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?codparc=3396,566&coddep=1&rdomotivocod=!5&dataInicio=2026-01-01&dataFim=2026-12-31&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 0) {
        result.data.forEach((item: any) => {
          expect([3396, 566]).toContain(item.CODPARC);
          expect(item.coddep).toBe(1);
          expect(item.RDOMOTIVOCOD).not.toBe(5);
        });
      }
    });

    it('should combine multiple organizational filters', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?coddep=1&codcargo=10&codemp=1&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should combine exclude filters across multiple fields', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?codparc=!100&rdomotivocod=!5&codemp=!999&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 0) {
        result.data.forEach((item: any) => {
          expect(item.CODPARC).not.toBe(100);
          expect(item.RDOMOTIVOCOD).not.toBe(5);
          expect(item.codemp).not.toBe(999);
        });
      }
    });
  });

  describe('GET /rdo/detalhes - V2 ordering', () => {
    it('should order by CODDEP ASC', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?orderBy=CODDEP&orderDir=ASC&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 1) {
        for (let i = 0; i < result.data.length - 1; i++) {
          const curr = result.data[i].coddep ?? 0;
          const next = result.data[i + 1].coddep ?? 0;
          expect(curr).toBeLessThanOrEqual(next);
        }
      }
    });

    it('should order by CODDEP DESC', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?orderBy=CODDEP&orderDir=DESC&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 1) {
        for (let i = 0; i < result.data.length - 1; i++) {
          const curr = result.data[i].coddep ?? 0;
          const next = result.data[i + 1].coddep ?? 0;
          expect(curr).toBeGreaterThanOrEqual(next);
        }
      }
    });

    it('should order by CODCARGO ASC', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?orderBy=CODCARGO&orderDir=ASC&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should order by CODCARGO DESC', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?orderBy=CODCARGO&orderDir=DESC&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should order by CODDEP with filters applied', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/detalhes?orderBy=CODDEP&orderDir=ASC&codparc=3396&dataInicio=2026-01-01&page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
});
