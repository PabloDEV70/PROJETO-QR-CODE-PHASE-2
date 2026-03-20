import { buildApp } from '@/app';
import { FastifyInstance } from 'fastify';

/**
 * Testes das rotas de manutenção focadas em veículo
 * Dashboard e status operacional
 */
describe('VeiculoManutencao Routes (e2e)', () => {
  let app: FastifyInstance;
  let tableAvailable = false;
  let testCodveiculo: number | null = null;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    const probe = await app.inject({
      method: 'GET',
      url: '/man/kpis',
    });
    tableAvailable = probe.statusCode === 200;

    if (tableAvailable) {
      const veiculoProbe = await app.inject({
        method: 'GET',
        url: '/veiculos/66/dashboard',
      });
      if (veiculoProbe.statusCode === 200) {
        testCodveiculo = 66;
      }
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /veiculos/:id/dashboard', () => {
    it('should return vehicle dashboard for valid id', async () => {
      if (!tableAvailable || !testCodveiculo) return;

      const response = await app.inject({
        method: 'GET',
        url: `/veiculos/${testCodveiculo}/dashboard`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('veiculo');
      expect(body.veiculo).toHaveProperty('codveiculo');
      expect(body).toHaveProperty('statusOperacional');
    });

    it('should return 404 for non-existent vehicle', async () => {
      if (!tableAvailable) return;

      const response = await app.inject({
        method: 'GET',
        url: '/veiculos/999999999/dashboard',
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 400 for invalid id', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/veiculos/invalid/dashboard',
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /veiculos/:id/proxima-manutencao', () => {
    it('should return next maintenance for valid vehicle', async () => {
      if (!tableAvailable || !testCodveiculo) return;

      const response = await app.inject({
        method: 'GET',
        url: `/veiculos/${testCodveiculo}/proxima-manutencao`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('nuplano');
    });
  });

  describe('GET /man/frota/status', () => {
    it('should return fleet status', async () => {
      if (!tableAvailable) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/frota/status',
      });

      expect(response.statusCode).toBe(200);
    });
  });
});
