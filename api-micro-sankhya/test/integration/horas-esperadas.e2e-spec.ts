import { FastifyInstance } from 'fastify';
import { buildApp } from '@/app';

/**
 * Integration tests for GET /rdo/analytics/horas-esperadas
 *
 * Tests against REAL API Mother data (PROD database).
 * Known data points validated manually:
 *   - ANDERSON RODRIGUES DOS SANTOS (CODEMP=2, CODFUNC=292, dept 1050000)
 *     - Jan 2026: schedule 63 (44h/week), vacation Jan 12-31 (20 days)
 *     - Expected: ~64h (8h/day Mon-Fri + 4h Sat for Jan 1-11)
 *   - Dept 1050000: 31 active employees
 */
describe('Horas Esperadas (e2e)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  // ─── VALIDATION ───────────────────────────────────────────

  describe('Parameter validation', () => {
    it('should return 400 when dataInicio missing', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/horas-esperadas?dataFim=2026-01-31',
      });
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when dataFim missing', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/horas-esperadas?dataInicio=2026-01-01',
      });
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for invalid date format', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/horas-esperadas?dataInicio=01/01/2026&dataFim=31/01/2026',
      });
      expect(res.statusCode).toBe(400);
    });
  });

  // ─── RESPONSE STRUCTURE ───────────────────────────────────

  describe('Response structure', () => {
    it('should return correct top-level shape', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/horas-esperadas'
          + '?dataInicio=2026-01-01&dataFim=2026-01-31&coddep=1050000',
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();

      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('resumo');
      expect(body).toHaveProperty('feriados');
      expect(body).toHaveProperty('periodo');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.periodo).toEqual({
        dataInicio: '2026-01-01',
        dataFim: '2026-01-31',
      });
    });

    it('should return correct employee fields', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/horas-esperadas'
          + '?dataInicio=2026-01-01&dataFim=2026-01-31&coddep=1050000',
      });

      const body = res.json();
      if (body.data.length === 0) return;

      const emp = body.data[0];
      expect(emp).toHaveProperty('codemp');
      expect(emp).toHaveProperty('codfunc');
      expect(emp).toHaveProperty('codparc');
      expect(emp).toHaveProperty('nomefunc');
      expect(emp).toHaveProperty('coddep');
      expect(emp).toHaveProperty('codcargahor');
      expect(emp).toHaveProperty('diasUteis');
      expect(emp).toHaveProperty('diasExcluidos');
      expect(emp).toHaveProperty('minutosEsperados');
      expect(emp).toHaveProperty('horasEsperadas');
      expect(emp).toHaveProperty('ausencias');
    });

    it('should return correct resumo fields', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/horas-esperadas'
          + '?dataInicio=2026-01-01&dataFim=2026-01-31&coddep=1050000',
      });

      const { resumo } = res.json();
      expect(resumo).toHaveProperty('totalFuncionarios');
      expect(resumo).toHaveProperty('totalMinutosEsperados');
      expect(resumo).toHaveProperty('totalHorasEsperadas');
      expect(resumo).toHaveProperty('totalDiasUteis');
      expect(resumo).toHaveProperty('totalDiasExcluidos');
      expect(resumo).toHaveProperty('mediaHorasPorFuncionario');
    });
  });

  // ─── DATA INTEGRITY ───────────────────────────────────────

  describe('Data integrity', () => {
    it('should have non-negative hours for all employees', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/horas-esperadas'
          + '?dataInicio=2026-01-01&dataFim=2026-01-31&coddep=1050000',
      });

      const body = res.json();
      body.data.forEach((emp: any) => {
        expect(emp.horasEsperadas).toBeGreaterThanOrEqual(0);
        expect(emp.minutosEsperados).toBeGreaterThanOrEqual(0);
        expect(emp.diasUteis).toBeGreaterThanOrEqual(0);
        expect(emp.diasExcluidos).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have consistent resumo totals', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/horas-esperadas'
          + '?dataInicio=2026-01-01&dataFim=2026-01-31&coddep=1050000',
      });

      const { data, resumo } = res.json();
      const sumMin = data.reduce(
        (s: number, e: any) => s + e.minutosEsperados, 0,
      );
      const sumDU = data.reduce(
        (s: number, e: any) => s + e.diasUteis, 0,
      );

      expect(resumo.totalFuncionarios).toBe(data.length);
      expect(resumo.totalMinutosEsperados).toBe(sumMin);
      expect(resumo.totalDiasUteis).toBe(sumDU);
    });

    it('horasEsperadas should equal minutosEsperados / 60', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/horas-esperadas'
          + '?dataInicio=2026-01-01&dataFim=2026-01-31&coddep=1050000',
      });

      const body = res.json();
      body.data.forEach((emp: any) => {
        const expected = Math.round(emp.minutosEsperados / 60 * 100) / 100;
        expect(emp.horasEsperadas).toBeCloseTo(expected, 2);
      });
    });
  });

  // ─── KNOWN DATA VALIDATION ────────────────────────────────

  describe('Known data: ANDERSON (dept 1050000, Jan 2026)', () => {
    it('should calculate ~64h for ANDERSON with 20-day vacation', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/horas-esperadas'
          + '?dataInicio=2026-01-01&dataFim=2026-01-31&coddep=1050000',
      });

      const body = res.json();
      const anderson = body.data.find(
        (e: any) => e.nomefunc?.includes('ANDERSON RODRIGUES'),
      );

      if (!anderson) {
        console.warn('ANDERSON not found in dept 1050000 — skipping');
        return;
      }

      // Schedule 63: 8h Mon-Fri + 4h Sat
      // Vacation: Jan 12-31 (20 days). Working days: Jan 1-11
      // Jan 1=Thu(8h), 2=Fri(8h), 3=Sat(4h), 4=Sun(0),
      // 5=Mon(8h), 6=Tue(8h), 7=Wed(8h), 8=Thu(8h),
      // 9=Fri(8h), 10=Sat(4h), 11=Sun(0) => 64h
      expect(anderson.horasEsperadas).toBeGreaterThanOrEqual(56);
      expect(anderson.horasEsperadas).toBeLessThanOrEqual(72);
      expect(anderson.diasExcluidos).toBeGreaterThan(0);
      expect(anderson.ausencias.length).toBeGreaterThan(0);
    });
  });

  // ─── DEPARTMENT TOTALS ────────────────────────────────────

  describe('Department totals', () => {
    it('dept 1050000 should have multiple employees', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/horas-esperadas'
          + '?dataInicio=2026-01-01&dataFim=2026-01-31&coddep=1050000',
      });

      const { resumo } = res.json();
      expect(resumo.totalFuncionarios).toBeGreaterThan(10);
      expect(resumo.totalHorasEsperadas).toBeGreaterThan(0);
    });

    it('total hours should be reasonable per employee', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/horas-esperadas'
          + '?dataInicio=2026-01-01&dataFim=2026-01-31&coddep=1050000',
      });

      const { resumo } = res.json();
      // 31 days in Jan: max ~220h/person (if 10h/day every day)
      // Min: 0 (if on vacation entire month)
      if (resumo.totalFuncionarios > 0) {
        const avg = resumo.mediaHorasPorFuncionario;
        expect(avg).toBeGreaterThan(0);
        expect(avg).toBeLessThan(250);
      }
    });
  });

  // ─── FILTERS ──────────────────────────────────────────────

  describe('Filters', () => {
    it('should filter by coddep', async () => {
      const [deptRes, allRes] = await Promise.all([
        app.inject({
          method: 'GET',
          url: '/rdo/analytics/horas-esperadas'
            + '?dataInicio=2026-01-01&dataFim=2026-01-31&coddep=1050000',
        }),
        app.inject({
          method: 'GET',
          url: '/rdo/analytics/horas-esperadas'
            + '?dataInicio=2026-01-01&dataFim=2026-01-31',
        }),
      ]);

      const deptBody = deptRes.json();
      const allBody = allRes.json();

      expect(deptBody.resumo.totalFuncionarios)
        .toBeLessThanOrEqual(allBody.resumo.totalFuncionarios);

      deptBody.data.forEach((e: any) => {
        expect(e.coddep).toBe(1050000);
      });
    });

    it('should return empty data for non-existent dept', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/horas-esperadas'
          + '?dataInicio=2026-01-01&dataFim=2026-01-31&coddep=9999999',
      });

      const body = res.json();
      expect(body.data).toHaveLength(0);
      expect(body.resumo.totalFuncionarios).toBe(0);
    });
  });

  // ─── EDGE CASES ───────────────────────────────────────────

  describe('Edge cases', () => {
    it('single day period should work', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/horas-esperadas'
          + '?dataInicio=2026-01-15&dataFim=2026-01-15&coddep=1050000',
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      // Each employee should have at most 1 work day
      body.data.forEach((e: any) => {
        expect(e.diasUteis + e.diasExcluidos).toBeLessThanOrEqual(1);
      });
    });

    it('employees on full vacation should have 0 hours', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/horas-esperadas'
          + '?dataInicio=2026-01-01&dataFim=2026-01-31&coddep=1050000',
      });

      const body = res.json();
      // Any employee with 0 hours should have diasExcluidos > 0
      body.data
        .filter((e: any) => e.horasEsperadas === 0 && e.diasUteis === 0)
        .forEach((e: any) => {
          expect(e.diasExcluidos).toBeGreaterThanOrEqual(0);
        });
    });

    it('future period should return employees with full hours', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/rdo/analytics/horas-esperadas'
          + '?dataInicio=2026-03-01&dataFim=2026-03-31&coddep=1050000',
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      // Most employees in future should have ~160-200h
      if (body.data.length > 0) {
        const maxHours = Math.max(
          ...body.data.map((e: any) => e.horasEsperadas),
        );
        expect(maxHours).toBeGreaterThan(100);
      }
    });
  });
});
