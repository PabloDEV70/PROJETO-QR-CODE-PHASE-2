import { buildApp } from '@/app';
import { FastifyInstance } from 'fastify';

describe('RH Requisicoes Integration (e2e)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('GET /rh/requisicoes should return paginated list', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rh/requisicoes?limit=5',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeLessThanOrEqual(5);
    expect(body.meta).toHaveProperty('total');
    expect(body.meta).toHaveProperty('page');
    expect(body.meta).toHaveProperty('limit');
    expect(body.meta).toHaveProperty('totalPages');

    if (body.data.length > 0) {
      const req = body.data[0];
      expect(req).toHaveProperty('id');
      expect(req).toHaveProperty('dtCriacao');
      expect(req).toHaveProperty('status');
      expect(req).toHaveProperty('statusLabel');
      expect(req).toHaveProperty('origemTipo');
      expect(req).toHaveProperty('origemTipoLabel');
      expect(req).toHaveProperty('nomeFuncionario');
      expect(req).toHaveProperty('nomeEmpresa');
      expect(req).toHaveProperty('descricaoCargo');
      expect(req).toHaveProperty('nomeSolicitante');
      expect(req).toHaveProperty('departamento');
      expect(req).toHaveProperty('funcao');
    }
  });

  it('GET /rh/requisicoes should filter by origemTipo=V (ferias)', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rh/requisicoes?origemTipo=V&limit=5',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    body.data.forEach((req: any) => {
      expect(req.origemTipo).toBe('V');
    });
  });

  it('GET /rh/requisicoes should filter by status=0 (pendentes)', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rh/requisicoes?status=0&limit=5',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    body.data.forEach((req: any) => {
      expect(req.status).toBe(0);
    });
  });

  it('GET /rh/requisicoes should filter by codemp', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rh/requisicoes?codemp=4&limit=5',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    body.data.forEach((req: any) => {
      expect(req.codemp).toBe(4);
    });
  });

  it('GET /rh/requisicoes should paginate correctly', async () => {
    const response1 = await app.inject({
      method: 'GET',
      url: '/rh/requisicoes?page=1&limit=3',
    });
    const response2 = await app.inject({
      method: 'GET',
      url: '/rh/requisicoes?page=2&limit=3',
    });

    const body1 = JSON.parse(response1.body);
    const body2 = JSON.parse(response2.body);

    expect(body1.meta.page).toBe(1);
    expect(body2.meta.page).toBe(2);
    if (body1.data.length > 0 && body2.data.length > 0) {
      expect(body1.data[0].id).not.toBe(body2.data[0].id);
    }
  });

  it('GET /rh/requisicoes/:id should return detail for known ID', async () => {
    const listResponse = await app.inject({
      method: 'GET',
      url: '/rh/requisicoes?limit=1',
    });
    const list = JSON.parse(listResponse.body);
    if (list.data.length === 0) return;

    const knownId = list.data[0].id;
    const response = await app.inject({
      method: 'GET',
      url: `/rh/requisicoes/${knownId}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.id).toBe(knownId);
    expect(body).toHaveProperty('nomeFuncionario');
    expect(body).toHaveProperty('observacao');
  });

  it('GET /rh/requisicoes/:id should return 404 for unknown ID', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rh/requisicoes/999999',
    });

    expect(response.statusCode).toBe(404);
  });

  it('GET /rh/requisicoes/resumo should return aggregates', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rh/requisicoes/resumo',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('porStatus');
    expect(body.porStatus).toHaveProperty('pendentes');
    expect(body.porStatus).toHaveProperty('aprovados');
    expect(body.porStatus).toHaveProperty('executados');
    expect(body.porStatus).toHaveProperty('cancelados');
    expect(body).toHaveProperty('porTipo');
    expect(Array.isArray(body.porTipo)).toBe(true);
    expect(body).toHaveProperty('pendentesUrgentes');
    expect(body.total).toBeGreaterThan(0);
  });

  it('GET /rh/requisicoes/resumo should filter by codemp', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rh/requisicoes/resumo?codemp=4',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('total');
  });
});
