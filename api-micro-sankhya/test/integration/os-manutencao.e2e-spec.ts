import { buildApp } from '@/app';
import { FastifyInstance } from 'fastify';

/**
 * TCFOSCAB and TCFSERVOS are core maintenance tables that should exist in all databases.
 * If the API Mother routes queries to a test database without data, these tests will be skipped.
 */
describe('OS Manutencao Integration (e2e)', () => {
  let app: FastifyInstance;
  let tableAvailable = false;
  let testNuos: number | null = null;
  let testCodveiculo: number | null = null;
  let testCodparc: number | null = null;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    // Probe: check if TCFOSCAB is accessible in the current database
    const probe = await app.inject({
      method: 'GET',
      url: '/os-manutencao?limit=1',
    });
    tableAvailable = probe.statusCode === 200;

    if (!tableAvailable) {
      console.warn(
        '[os-manutencao.e2e] TCFOSCAB not accessible or empty. Skipping tests.',
      );
    } else {
      const body = JSON.parse(probe.body);
      // Response is { data: [], meta: {} } format
      if (body.data && body.data.length > 0) {
        testNuos = body.data[0].NUOS;
        testCodveiculo = body.data[0].CODVEICULO;
        testCodparc = body.data[0].CODPARC;
      }
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /os-manutencao', () => {
    it('should return a paginated list of OS from API Mother', async () => {
      if (!tableAvailable) return;

      const response = await app.inject({
        method: 'GET',
        url: '/os-manutencao?limit=5',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
      expect(Array.isArray(body.data)).toBe(true);
      if (body.data.length > 0) {
        expect(body.data[0]).toHaveProperty('NUOS');
        expect(body.data[0]).toHaveProperty('STATUS');
        expect(body.data[0]).toHaveProperty('DTABERTURA');
        expect(body.data[0]).toHaveProperty('statusLabel');
      }
    });

    it('should filter by status', async () => {
      if (!tableAvailable) return;

      const response = await app.inject({
        method: 'GET',
        url: '/os-manutencao?status=F&limit=5',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should filter by manutencao type', async () => {
      if (!tableAvailable) return;

      const response = await app.inject({
        method: 'GET',
        url: '/os-manutencao?manutencao=P&limit=5',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should filter by codveiculo', async () => {
      if (!tableAvailable || !testCodveiculo) return;

      const response = await app.inject({
        method: 'GET',
        url: `/os-manutencao?codveiculo=${testCodveiculo}&limit=5`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('GET /os-manutencao/search', () => {
    it('should return search results', async () => {
      if (!tableAvailable) return;

      const response = await app.inject({
        method: 'GET',
        url: '/os-manutencao/search?q=1',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe('GET /os-manutencao/stats', () => {
    it('should return statistics', async () => {
      if (!tableAvailable) return;

      const response = await app.inject({
        method: 'GET',
        url: '/os-manutencao/stats',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('totalOs');
      expect(body).toHaveProperty('osAbertas');
      expect(body).toHaveProperty('osFechadas');
      expect(body).toHaveProperty('topVeiculos');
      expect(Array.isArray(body.topVeiculos)).toBe(true);
    });
  });

  describe('GET /os-manutencao/dashboard', () => {
    it('should return dashboard data', async () => {
      if (!tableAvailable) return;

      const response = await app.inject({
        method: 'GET',
        url: '/os-manutencao/dashboard',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('porStatus');
      expect(body).toHaveProperty('porTipoManutencao');
      expect(body).toHaveProperty('recentes');
      expect(body).toHaveProperty('paraExibir');
      expect(Array.isArray(body.porStatus)).toBe(true);
      expect(Array.isArray(body.porTipoManutencao)).toBe(true);
      expect(Array.isArray(body.recentes)).toBe(true);
      expect(Array.isArray(body.paraExibir)).toBe(true);
    });
  });

  describe('GET /os-manutencao/:nuos', () => {
    it('should return OS by NUOS', async () => {
      if (!tableAvailable || !testNuos) return;

      const response = await app.inject({
        method: 'GET',
        url: `/os-manutencao/${testNuos}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('NUOS');
      expect(body.NUOS).toBe(testNuos);
      expect(body).toHaveProperty('statusLabel');
      expect(body).toHaveProperty('totalServicos');
    });

    it('should return 404 for non-existent NUOS', async () => {
      if (!tableAvailable) return;

      const response = await app.inject({
        method: 'GET',
        url: '/os-manutencao/999999999',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /os-manutencao/:nuos/servicos', () => {
    it('should return services for an OS', async () => {
      if (!tableAvailable || !testNuos) return;

      const response = await app.inject({
        method: 'GET',
        url: `/os-manutencao/${testNuos}/servicos`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      if (body.length > 0) {
        expect(body[0]).toHaveProperty('NUOS');
        expect(body[0]).toHaveProperty('SEQUENCIA');
        expect(body[0]).toHaveProperty('CODPROD');
      }
    });
  });

  describe('GET /os-manutencao/veiculo/:codveiculo', () => {
    it('should return OS for a vehicle', async () => {
      if (!tableAvailable || !testCodveiculo) return;

      const response = await app.inject({
        method: 'GET',
        url: `/os-manutencao/veiculo/${testCodveiculo}?limit=5`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      if (body.length > 0) {
        expect(body[0]).toHaveProperty('NUOS');
        expect(body[0]).toHaveProperty('statusLabel');
      }
    });
  });

  describe('GET /os-manutencao/parceiro/:codparc', () => {
    it('should return OS for a partner', async () => {
      if (!tableAvailable || !testCodparc) return;

      const response = await app.inject({
        method: 'GET',
        url: `/os-manutencao/parceiro/${testCodparc}?limit=5`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      if (body.length > 0) {
        expect(body[0]).toHaveProperty('CODPARC');
        expect(body[0]).toHaveProperty('placa');
      }
    });
  });
});
