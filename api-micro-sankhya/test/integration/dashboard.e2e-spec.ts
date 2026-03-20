import { buildApp } from '@/app';
import { FastifyInstance } from 'fastify';

describe('Dashboard Integration (e2e)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /dashboard should return overview data', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/dashboard',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('totalVeiculosAtivos');
    expect(body).toHaveProperty('osManutencaoAbertas');
    expect(body).toHaveProperty('osManutencaoFechadas');
    expect(body).toHaveProperty('osComercialAbertas');
    expect(body).toHaveProperty('osComercialFechadas');
    expect(body).toHaveProperty('rdosUltimo30Dias');
    expect(body).toHaveProperty('contratosVigentes');
    expect(typeof body.totalVeiculosAtivos).toBe('number');
  });

  it('GET /dashboard/os-pendentes should return list of pending OS', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/dashboard/os-pendentes',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('tipo');
      expect(body[0]).toHaveProperty('numeroOS');
      expect(body[0]).toHaveProperty('dataAbertura');
      expect(body[0]).toHaveProperty('status');
      expect(['MANUTENCAO', 'COMERCIAL']).toContain(body[0].tipo);
    }
  });

  it('GET /dashboard/atividade-recente should return recent activities', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/dashboard/atividade-recente',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('tipoAtividade');
      expect(body[0]).toHaveProperty('referencia');
      expect(body[0]).toHaveProperty('dataAtividade');
      expect(['RDO', 'OS_MANUTENCAO', 'OS_COMERCIAL']).toContain(body[0].tipoAtividade);
    }
  });

  it('GET /dashboard/indicadores should return KPIs', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/dashboard/indicadores',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('taxaConclusaoOSManutencao');
    expect(body).toHaveProperty('taxaConclusaoOSComercial');
    expect(body).toHaveProperty('tempoMedioResolucaoOSManutencao');
    expect(body).toHaveProperty('totalHorasRDOUltimoMes');
    expect(body).toHaveProperty('mediaItensPorRDO');
    expect(typeof body.taxaConclusaoOSManutencao).toBe('number');
    expect(typeof body.totalHorasRDOUltimoMes).toBe('number');
  });
});
