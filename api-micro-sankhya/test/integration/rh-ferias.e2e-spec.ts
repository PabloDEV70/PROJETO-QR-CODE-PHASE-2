import { buildApp } from '@/app';
import { FastifyInstance } from 'fastify';

describe('RH Ferias Integration (e2e)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('GET /rh/ferias/atuais should return employees on vacation', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rh/ferias/atuais',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);

    if (body.length > 0) {
      const ferias = body[0];
      expect(ferias).toHaveProperty('codemp');
      expect(ferias).toHaveProperty('codfunc');
      expect(ferias).toHaveProperty('nomeFuncionario');
      expect(ferias).toHaveProperty('nomeEmpresa');
      expect(ferias).toHaveProperty('dtSaida');
      expect(ferias).toHaveProperty('numDiasFer');
      expect(ferias).toHaveProperty('dtRetorno');
      expect(ferias).toHaveProperty('departamento');
      expect(ferias).toHaveProperty('cargo');
    }
  });

  it('GET /rh/ferias/atuais should filter by codemp', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rh/ferias/atuais?codemp=4',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    body.forEach((ferias: any) => {
      expect(ferias.codemp).toBe(4);
    });
  });

  it('GET /rh/ferias/proximas should return upcoming vacations', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rh/ferias/proximas',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
  });

  it('GET /rh/ferias/proximas should accept dias parameter', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rh/ferias/proximas?dias=60',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
  });

  it('GET /rh/ferias/resumo should return summary', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rh/ferias/resumo',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('emFeriasAgora');
    expect(body).toHaveProperty('programadasProximos30Dias');
    expect(body).toHaveProperty('pendentesAprovacao');
    expect(typeof body.emFeriasAgora).toBe('number');
  });
});
