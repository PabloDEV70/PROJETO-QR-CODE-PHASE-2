import { buildApp } from '@/app';
import { FastifyInstance } from 'fastify';

describe('RH Ocorrencias Integration (e2e)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('GET /rh/ocorrencias/ativas should return active occurrences', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rh/ocorrencias/ativas',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);

    if (body.length > 0) {
      const ocorrencia = body[0];
      expect(ocorrencia).toHaveProperty('codemp');
      expect(ocorrencia).toHaveProperty('codfunc');
      expect(ocorrencia).toHaveProperty('nomeFuncionario');
      expect(ocorrencia).toHaveProperty('codHistoCor');
      expect(ocorrencia).toHaveProperty('descricaoHistoCor');
      expect(ocorrencia).toHaveProperty('dtInicio');
    }
  });

  it('GET /rh/ocorrencias/resumo should return summary', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rh/ocorrencias/resumo',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('totalAtivas');
    expect(body).toHaveProperty('porTipo');
    expect(Array.isArray(body.porTipo)).toBe(true);
    expect(typeof body.totalAtivas).toBe('number');
  });
});
