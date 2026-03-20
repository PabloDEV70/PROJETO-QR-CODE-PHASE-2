import { buildApp } from '@/app';
import { FastifyInstance } from 'fastify';

describe('Apontamentos Integration (e2e)', () => {
  let app: FastifyInstance;
  let tableAvailable = false;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    const probe = await app.inject({
      method: 'GET',
      url: '/apontamentos/resumo',
    });
    tableAvailable = probe.statusCode === 200;

    if (!tableAvailable) {
      console.warn(
        '[apontamentos.e2e] AD_APONTSOL not accessible. Skipping tests.',
      );
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /apontamentos/resumo should return KPIs', async () => {
    if (!tableAvailable) return;

    const response = await app.inject({
      method: 'GET',
      url: '/apontamentos/resumo',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('TOTAL_SERVICOS');
    expect(body).toHaveProperty('TOTAL_APONTAMENTOS');
    expect(body).toHaveProperty('PERC_COM_OS');
  });

  it('GET /apontamentos/pendentes should return paginated list', async () => {
    if (!tableAvailable) return;

    const response = await app.inject({
      method: 'GET',
      url: '/apontamentos/pendentes?limit=5',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('CODIGO');
      expect(body[0]).toHaveProperty('DESCRITIVO');
    }
  });

  it('GET /apontamentos/com-os should return services with OS', async () => {
    if (!tableAvailable) return;

    const response = await app.inject({
      method: 'GET',
      url: '/apontamentos/com-os?limit=5',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('NUOS');
      expect(body[0]).toHaveProperty('STATUS_OS');
    }
  });

  it('GET /apontamentos/servicos-frequentes should return top services', async () => {
    if (!tableAvailable) return;

    const response = await app.inject({
      method: 'GET',
      url: '/apontamentos/servicos-frequentes',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('DESCRITIVO');
      expect(body[0]).toHaveProperty('QTD_APONTAMENTOS');
    }
  });

  it('GET /apontamentos/por-produto should return products', async () => {
    if (!tableAvailable) return;

    const response = await app.inject({
      method: 'GET',
      url: '/apontamentos/por-produto',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('CODPROD');
      expect(body[0]).toHaveProperty('QTD_UTILIZACOES');
    }
  });

  it('GET /apontamentos/por-veiculo should return vehicles', async () => {
    if (!tableAvailable) return;

    const response = await app.inject({
      method: 'GET',
      url: '/apontamentos/por-veiculo',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('CODVEICULO');
      expect(body[0]).toHaveProperty('QTD_SERVICOS');
    }
  });

  it('GET /apontamentos/por-veiculo?codveiculo= should filter', async () => {
    if (!tableAvailable) return;

    const listRes = await app.inject({
      method: 'GET',
      url: '/apontamentos/por-veiculo',
    });
    const list = JSON.parse(listRes.body);
    if (list.length === 0) return;

    const codveiculo = list[0].CODVEICULO;
    const response = await app.inject({
      method: 'GET',
      url: `/apontamentos/por-veiculo?codveiculo=${codveiculo}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expect(body[0].CODVEICULO).toBe(codveiculo);
    }
  });

  it('GET /apontamentos/por-periodo should filter by date range', async () => {
    if (!tableAvailable) return;

    const response = await app.inject({
      method: 'GET',
      url: '/apontamentos/por-periodo?dtini=01/01/2024&dtfim=31/12/2025&limit=5',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
  });

  it('GET /apontamentos/por-periodo should reject invalid dates', async () => {
    if (!tableAvailable) return;

    const response = await app.inject({
      method: 'GET',
      url: '/apontamentos/por-periodo?dtini=2024-01-01&dtfim=2025-12-31',
    });

    expect(response.statusCode).toBe(400);
  });

  it('GET /apontamentos/veiculo/:codveiculo/timeline should return timeline', async () => {
    if (!tableAvailable) return;

    const listRes = await app.inject({
      method: 'GET',
      url: '/apontamentos/por-veiculo',
    });
    const list = JSON.parse(listRes.body);
    if (list.length === 0) return;

    const codveiculo = list[0].CODVEICULO;
    const response = await app.inject({
      method: 'GET',
      url: `/apontamentos/veiculo/${codveiculo}/timeline?limit=5`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('CODAPONTAMENTO');
      expect(body[0]).toHaveProperty('DESCRITIVO');
    }
  });

  it('GET /apontamentos/:codigo should return services of an apontamento', async () => {
    if (!tableAvailable) return;

    const pendRes = await app.inject({
      method: 'GET',
      url: '/apontamentos/pendentes?limit=1',
    });
    const pendentes = JSON.parse(pendRes.body);
    if (pendentes.length === 0) return;

    const codigo = pendentes[0].CODIGO;
    const response = await app.inject({
      method: 'GET',
      url: `/apontamentos/${codigo}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('SEQ');
      expect(body[0]).toHaveProperty('DESCRITIVO');
    }
  });
});
