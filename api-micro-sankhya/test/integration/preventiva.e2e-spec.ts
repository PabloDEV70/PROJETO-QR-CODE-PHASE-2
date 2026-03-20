import { buildApp } from '../../src/app';

describe('Preventiva Routes (e2e)', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /veiculos/:id/preventivas', () => {
    it('should return preventive status for valid vehicle', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/veiculos/66/preventivas',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('codveiculo');
      expect(body).toHaveProperty('placa');
      expect(body).toHaveProperty('preventivas');
      expect(body).toHaveProperty('resumo');
      expect(Array.isArray(body.preventivas)).toBe(true);
      expect(body.preventivas.length).toBeGreaterThan(0);
    });

    it('should return vehicle not found for non-existent vehicle', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/veiculos/999999999/preventivas',
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 400 for invalid id', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/veiculos/invalid/preventivas',
      });

      expect(response.statusCode).toBe(400);
    });

    it('should have correct structure for each preventive', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/veiculos/66/preventivas',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      const preventiva = body.preventivas[0];

      expect(preventiva).toHaveProperty('codigo');
      expect(preventiva).toHaveProperty('descricao');
      expect(preventiva).toHaveProperty('tipoIntervalo');
      expect(preventiva).toHaveProperty('status');
      expect(preventiva).toHaveProperty('intervaloDias');
      expect(preventiva).toHaveProperty('tolerancia');
      expect(preventiva).toHaveProperty('ultimaManutencao');
      expect(preventiva.ultimaManutencao).toHaveProperty('data');
      expect(preventiva.ultimaManutencao).toHaveProperty('km');
      expect(preventiva.ultimaManutencao).toHaveProperty('nuos');
    });

    it('should have correct summary', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/veiculos/66/preventivas',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.resumo).toHaveProperty('total');
      expect(body.resumo).toHaveProperty('emDia');
      expect(body.resumo).toHaveProperty('atrasadas');
      expect(body.resumo).toHaveProperty('semHistorico');
      expect(body.resumo.total).toBe(body.preventivas.length);
    });

    it('should have valid preventive codes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/veiculos/66/preventivas',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      const validCodes = ['A1', 'A2', 'B1', 'C1', 'C2'];

      for (const preventiva of body.preventivas) {
        expect(validCodes).toContain(preventiva.codigo);
      }
    });

    it('should have valid status values', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/veiculos/66/preventivas',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      const validStatuses = ['EM_DIA', 'ATRASADA', 'SEM_HISTORICO'];

      for (const preventiva of body.preventivas) {
        expect(validStatuses).toContain(preventiva.status);
      }
    });
  });
});
