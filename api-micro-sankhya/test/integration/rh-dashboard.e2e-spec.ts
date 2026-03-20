import { buildApp } from '@/app';
import { FastifyInstance } from 'fastify';

describe('RH Dashboard Integration (e2e)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('GET /rh/dashboard should return full dashboard', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rh/dashboard',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);

    expect(body).toHaveProperty('requisicoes');
    expect(body.requisicoes).toHaveProperty('total');
    expect(body.requisicoes).toHaveProperty('porStatus');
    expect(body.requisicoes).toHaveProperty('porTipo');

    expect(body).toHaveProperty('ferias');
    expect(body.ferias).toHaveProperty('resumo');
    expect(body.ferias).toHaveProperty('emFeriasAgora');
    expect(body.ferias).toHaveProperty('proximas');
    expect(Array.isArray(body.ferias.emFeriasAgora)).toBe(true);

    expect(body).toHaveProperty('ocorrencias');
    expect(body.ocorrencias).toHaveProperty('resumo');
    expect(body.ocorrencias).toHaveProperty('ativas');
    expect(Array.isArray(body.ocorrencias.ativas)).toBe(true);
  });

  it('GET /rh/dashboard should filter by codemp', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rh/dashboard?codemp=4',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('requisicoes');
    expect(body).toHaveProperty('ferias');
    expect(body).toHaveProperty('ocorrencias');
  });

  it('GET /rh/dashboard should filter by date range', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rh/dashboard?dataInicio=2026-01-01&dataFim=2026-02-06',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('requisicoes');
  });
});
