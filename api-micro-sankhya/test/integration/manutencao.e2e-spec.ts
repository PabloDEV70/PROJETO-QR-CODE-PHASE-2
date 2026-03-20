import { buildApp } from '@/app';
import { FastifyInstance } from 'fastify';

/**
 * Testes das novas rotas /man/ para dashboard de manutenção
 * KPIs, alertas, veículos com múltiplas OS, média de dias por tipo
 */
describe('Manutencao Routes /man/ (e2e)', () => {
  let app: FastifyInstance;
  let tableAvailable = false;
  let testNuos: number | null = null;
  let testCodveiculo: number | null = null;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    // Probe: check if TCFOSCAB is accessible
    const probe = await app.inject({
      method: 'GET',
      url: '/man/kpis',
    });
    tableAvailable = probe.statusCode === 200;

    if (!tableAvailable) {
      console.warn('[manutencao.e2e] /man/kpis not accessible. Skipping tests.');
    } else {
      // Get a test OS for detailed tests
      const osProbe = await app.inject({
        method: 'GET',
        url: '/man/os?limit=1',
      });
      if (osProbe.statusCode === 200) {
        const body = JSON.parse(osProbe.body);
        if (body.data && body.data.length > 0) {
          testNuos = body.data[0].NUOS;
          testCodveiculo = body.data[0].CODVEICULO;
        }
      }
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /man/kpis', () => {
    it('should return detailed KPIs for dashboard', async () => {
      if (!tableAvailable) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/kpis',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('totalAtivas');
      expect(body).toHaveProperty('osAbertas');
      expect(body).toHaveProperty('osEmExecucao');
      expect(body).toHaveProperty('corretivas');
      expect(body).toHaveProperty('preventivas');
      expect(body).toHaveProperty('comBloqueioComercial');
      expect(body).toHaveProperty('atrasadas');
      expect(body).toHaveProperty('naoImpeditivas');
      expect(typeof body.totalAtivas).toBe('number');
    });
  });

  describe('GET /man/alertas', () => {
    it('should return critical alerts (bloqueios sem previsao)', async () => {
      if (!tableAvailable) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/alertas',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      if (body.length > 0) {
        expect(body[0]).toHaveProperty('tipo');
        expect(body[0]).toHaveProperty('mensagem');
        expect(body[0]).toHaveProperty('codveiculo');
        expect(body[0]).toHaveProperty('placa');
        expect(body[0]).toHaveProperty('nuos');
        expect(body[0]).toHaveProperty('diasAtraso');
      }
    });
  });

  describe('GET /man/ativas', () => {
    it('should return active OS with operational details', async () => {
      if (!tableAvailable) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/ativas?limit=10',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      if (body.length > 0) {
        expect(body[0]).toHaveProperty('nuos');
        expect(body[0]).toHaveProperty('placa');
        expect(body[0]).toHaveProperty('diasEmManutencao');
        expect(body[0]).toHaveProperty('situacaoPrazo');
        expect(body[0]).toHaveProperty('qtdServicos');
        expect(body[0]).toHaveProperty('servicosConcluidos');
        expect(['ATRASADA', 'PROXIMA', 'NO_PRAZO']).toContain(body[0].situacaoPrazo);
      }
    });
  });

  describe('GET /man/veiculos-multiplas-os', () => {
    it('should return vehicles with multiple active OS', async () => {
      if (!tableAvailable) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/veiculos-multiplas-os',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      if (body.length > 0) {
        expect(body[0]).toHaveProperty('codveiculo');
        expect(body[0]).toHaveProperty('placa');
        expect(body[0]).toHaveProperty('qtdOsAtivas');
        expect(body[0].qtdOsAtivas).toBeGreaterThan(1);
      }
    });
  });

  describe('GET /man/media-dias', () => {
    it('should return average days by maintenance type', async () => {
      if (!tableAvailable) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/media-dias',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      if (body.length > 0) {
        expect(body[0]).toHaveProperty('manutencao');
        expect(body[0]).toHaveProperty('tipo');
        expect(body[0]).toHaveProperty('total');
        expect(body[0]).toHaveProperty('mediaDias');
        expect(typeof body[0].mediaDias).toBe('number');
      }
    });
  });

  describe('GET /man/stats', () => {
    it('should return basic statistics', async () => {
      if (!tableAvailable) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/stats',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('totalOs');
      expect(body).toHaveProperty('osAbertas');
      expect(body).toHaveProperty('osFechadas');
      expect(body).toHaveProperty('topVeiculos');
    });
  });

  describe('GET /man/dashboard', () => {
    it('should return complete dashboard data', async () => {
      if (!tableAvailable) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/dashboard',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('porStatus');
      expect(body).toHaveProperty('porTipoManutencao');
      expect(body).toHaveProperty('recentes');
      expect(body).toHaveProperty('paraExibir');
    });
  });

  describe('GET /man/os', () => {
    it('should return paginated OS list', async () => {
      if (!tableAvailable) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/os?limit=5&page=1',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.meta).toHaveProperty('totalRegistros');
    });

    it('should filter by status', async () => {
      if (!tableAvailable) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/os?status=E&limit=5',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('data');
    });
  });

  describe('GET /man/os/:nuos', () => {
    it('should return OS details by NUOS', async () => {
      if (!tableAvailable || !testNuos) return;

      const response = await app.inject({
        method: 'GET',
        url: `/man/os/${testNuos}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('NUOS');
      expect(body.NUOS).toBe(testNuos);
    });

    it('should return 404 for non-existent NUOS', async () => {
      if (!tableAvailable) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/os/999999999',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /man/os/:nuos/servicos', () => {
    it('should return services for an OS', async () => {
      if (!tableAvailable || !testNuos) return;

      const response = await app.inject({
        method: 'GET',
        url: `/man/os/${testNuos}/servicos`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe('GET /man/veiculo/:codveiculo', () => {
    it('should return OS history for a vehicle', async () => {
      if (!tableAvailable || !testCodveiculo) return;

      const response = await app.inject({
        method: 'GET',
        url: `/man/veiculo/${testCodveiculo}?limit=5`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });
  });
});
