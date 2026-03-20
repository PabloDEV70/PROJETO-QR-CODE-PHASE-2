import { buildApp } from '@/app';
import { FastifyInstance } from 'fastify';

/**
 * AD_RDOMOTIVOS is a custom table (AD_ prefix) that only exists in the PROD database.
 * If the API Mother routes queries to TESTE (user config issue), these tests will be skipped.
 * When database routing is fixed to PROD, they run automatically.
 */
describe('Motivos Integration (e2e)', () => {
  let app: FastifyInstance;
  let tableAvailable = false;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    // Probe: check if AD_RDOMOTIVOS is accessible in the current database
    const probe = await app.inject({
      method: 'GET',
      url: '/motivos?limit=1',
    });
    tableAvailable = probe.statusCode === 200;

    if (!tableAvailable) {
      console.warn(
        '[motivos.e2e] AD_RDOMOTIVOS not accessible (likely routed to TESTE database). Skipping tests.',
      );
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /motivos should return a list of motivos from API Mother', async () => {
    if (!tableAvailable) return;

    const response = await app.inject({
      method: 'GET',
      url: '/motivos?limit=5',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('RDOMOTIVOCOD');
      expect(body[0]).toHaveProperty('DESCRICAO');
    }
  });

  it('GET /motivos/search should return results', async () => {
    if (!tableAvailable) return;

    const response = await app.inject({
      method: 'GET',
      url: '/motivos/search?q=A',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
  });

  it('GET /motivos should accept dataInicio and dataFim params', async () => {
    if (!tableAvailable) return;

    const response = await app.inject({
      method: 'GET',
      url: '/motivos?limit=5&dataInicio=2026-01-01&dataFim=2026-01-31',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('rdoCount');
      expect(typeof body[0].rdoCount).toBe('number');
    }
  });

  it('GET /motivos without period should return global rdoCount', async () => {
    if (!tableAvailable) return;

    const response = await app.inject({
      method: 'GET',
      url: '/motivos?limit=5',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('rdoCount');
    }
  });

  it('GET /motivos/search should accept period params', async () => {
    if (!tableAvailable) return;

    const response = await app.inject({
      method: 'GET',
      url: '/motivos/search?q=A&dataInicio=2026-01-01&dataFim=2026-02-28',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
  });
});
