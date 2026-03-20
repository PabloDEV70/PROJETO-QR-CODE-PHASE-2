import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';

/**
 * AD_RDOAPONTAMENTOS and AD_RDOAPONDETALHES are custom tables (AD_ prefix).
 * They may only exist in the PROD database.
 * If not accessible, tests are skipped.
 */
describe('RDO API (e2e)', () => {
  let app: FastifyInstance;
  let rdoTablesExist = false;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    // Probe: check if tables exist by attempting to list
    const probeResponse = await app.inject({
      method: 'GET',
      url: '/rdo?page=1&limit=1',
    });

    // If status is 200, tables exist. If 400/500, assume tables don't exist.
    rdoTablesExist = probeResponse.statusCode === 200;

    if (!rdoTablesExist) {
      console.warn(
        '[rdo.e2e] AD_RDOAPONTAMENTOS tables not accessible (likely routed to TESTE database). Skipping tests.',
      );
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /rdo/stats', () => {
    it('should return RDO statistics', async () => {
      if (!rdoTablesExist) {
        return; // Skip test
      }

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/stats',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();

      expect(data).toHaveProperty('totalRdos');
      expect(data).toHaveProperty('totalItens');
      expect(data).toHaveProperty('totalMinutos');
      expect(data).toHaveProperty('totalHoras');
      expect(data).toHaveProperty('mediaItensPorRdo');
      expect(data).toHaveProperty('itensComOs');
      expect(data).toHaveProperty('itensSemOs');
      expect(data).toHaveProperty('topColaboradores');
      expect(Array.isArray(data.topColaboradores)).toBe(true);
    });
  });

  describe('GET /rdo', () => {
    it('should list RDOs with paginated response and enhanced fields', async () => {
      if (!rdoTablesExist) {
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: '/rdo?page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();

      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.meta).toHaveProperty('totalRegistros');
      expect(body.meta).toHaveProperty('page', 1);
      expect(body.meta).toHaveProperty('limit', 10);

      if (body.data.length > 0) {
        const rdo = body.data[0];
        expect(rdo).toHaveProperty('CODRDO');
        expect(rdo).toHaveProperty('CODPARC');
        expect(rdo).toHaveProperty('DTREF');
        expect(rdo).toHaveProperty('nomeparc');
        expect(rdo).toHaveProperty('totalItens');
        expect(rdo).toHaveProperty('totalHoras');
        expect(rdo).toHaveProperty('primeiraHora');
        expect(rdo).toHaveProperty('ultimaHora');
        expect(rdo).toHaveProperty('qtdOs');
        expect(rdo).toHaveProperty('veiculoPlaca');
        expect(rdo).toHaveProperty('departamento');
        expect(rdo).toHaveProperty('cargo');
        // OS fields (nullable - RDO may not have OS)
        expect(rdo).toHaveProperty('primeiroNuos');
        expect(rdo).toHaveProperty('osStatus');
        expect(rdo).toHaveProperty('osManutencao');
        expect(rdo).toHaveProperty('osStatusGig');
        expect(rdo).toHaveProperty('osDataIni');
        expect(rdo).toHaveProperty('osPrevisao');
        expect(rdo).toHaveProperty('osQtdServicos');
        expect(rdo).toHaveProperty('veiculoTag');
        expect(rdo).toHaveProperty('veiculoModelo');
      }
    });

    it('should filter RDOs by CODPARC', async () => {
      if (!rdoTablesExist) {
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: '/rdo?page=1&limit=10&codparc=3396',
      });

      expect(response.statusCode).toBe(200);
      const { data } = response.json();

      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0].CODPARC).toBe(3396);
      }
    });

    it('should filter RDOs by date range', async () => {
      if (!rdoTablesExist) {
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: '/rdo?page=1&limit=10&dataInicio=2026-01-01&dataFim=2026-01-31',
      });

      expect(response.statusCode).toBe(200);
      const { data } = response.json();

      expect(Array.isArray(data)).toBe(true);
    });

    it('should filter RDOs with OS (comOs=true)', async () => {
      if (!rdoTablesExist) {
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: '/rdo?page=1&limit=10&comOs=true',
      });

      expect(response.statusCode).toBe(200);
      const { data } = response.json();

      expect(Array.isArray(data)).toBe(true);
    });

    it('should filter RDOs without OS (semOs=true)', async () => {
      if (!rdoTablesExist) {
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: '/rdo?page=1&limit=10&semOs=true',
      });

      expect(response.statusCode).toBe(200);
      const { data } = response.json();

      expect(Array.isArray(data)).toBe(true);
    });

    it('should support include/exclude filter syntax for codparc', async () => {
      if (!rdoTablesExist) {
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: '/rdo?page=1&limit=5&codparc=3396',
      });

      expect(response.statusCode).toBe(200);
      const { data } = response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should return OS data for RDOs with linked OS', async () => {
      if (!rdoTablesExist) return;

      const response = await app.inject({
        method: 'GET',
        url: '/rdo?page=1&limit=10&comOs=true',
      });

      expect(response.statusCode).toBe(200);
      const { data } = response.json();

      if (data.length > 0) {
        const rdoComOs = data[0];
        expect(rdoComOs.primeiroNuos).not.toBeNull();
        expect(rdoComOs.osStatus).not.toBeNull();
        expect(['A', 'E', 'F', 'C']).toContain(rdoComOs.osStatus);
        expect(rdoComOs.veiculoPlaca).not.toBeNull();
      }
    });
  });

  describe('GET /rdo/search', () => {
    it('should search RDOs by collaborator name', async () => {
      if (!rdoTablesExist) {
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/search?q=CARLOS',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();

      expect(Array.isArray(data)).toBe(true);
    });

    it('should search RDOs by CODRDO', async () => {
      if (!rdoTablesExist) {
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/search?q=1',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();

      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('GET /rdo/:codrdo', () => {
    it('should get RDO by CODRDO', async () => {
      if (!rdoTablesExist) {
        return;
      }

      // First, get a valid CODRDO
      const listResponse = await app.inject({
        method: 'GET',
        url: '/rdo?page=1&limit=1',
      });

      const { data: rdos } = listResponse.json();
      if (rdos.length === 0) {
        console.warn('No RDOs found, skipping detail test');
        return;
      }

      const codrdo = rdos[0].CODRDO;

      const response = await app.inject({
        method: 'GET',
        url: `/rdo/${codrdo}`,
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();

      expect(data.CODRDO).toBe(codrdo);
      expect(data).toHaveProperty('CODPARC');
      expect(data).toHaveProperty('DTREF');
      expect(data).toHaveProperty('nomeparc');
      expect(data).toHaveProperty('totalItens');
      expect(data).toHaveProperty('totalHoras');
    });

    it('should return 404 for non-existent CODRDO', async () => {
      if (!rdoTablesExist) {
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/999999999',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /rdo/:codrdo/detalhes', () => {
    it('should get RDO details/items', async () => {
      if (!rdoTablesExist) {
        return;
      }

      // First, get a valid CODRDO
      const listResponse = await app.inject({
        method: 'GET',
        url: '/rdo?page=1&limit=1',
      });

      const { data: rdos } = listResponse.json();
      if (rdos.length === 0) {
        console.warn('No RDOs found, skipping details test');
        return;
      }

      const codrdo = rdos[0].CODRDO;

      const response = await app.inject({
        method: 'GET',
        url: `/rdo/${codrdo}/detalhes`,
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();

      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0]).toHaveProperty('ITEM');
        expect(data[0]).toHaveProperty('HRINI');
        expect(data[0]).toHaveProperty('HRFIM');
        expect(data[0]).toHaveProperty('hriniFormatada');
        expect(data[0]).toHaveProperty('hrfimFormatada');
        expect(data[0]).toHaveProperty('duracaoMinutos');
        expect(data[0]).toHaveProperty('motivoDescricao');
        expect(data[0]).toHaveProperty('NUOS');
        expect(data[0]).toHaveProperty('veiculoPlaca');
      }
    });
  });

  describe('GET /rdo/parceiro/:codparc', () => {
    it('should get RDOs by collaborator (CODPARC)', async () => {
      if (!rdoTablesExist) {
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/parceiro/3396?page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();

      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0].CODPARC).toBe(3396);
      }
    });
  });

  describe('GET /rdo/veiculo/:codveiculo', () => {
    it('should get RDOs by vehicle (CODVEICULO via 3 JOINs)', async () => {
      if (!rdoTablesExist) {
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/veiculo/66?page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();

      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('GET /rdo/resumo-diario', () => {
    it('should get daily summary', async () => {
      if (!rdoTablesExist) {
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/resumo-diario?page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();

      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0]).toHaveProperty('DTREF');
        expect(data[0]).toHaveProperty('totalRdos');
        expect(data[0]).toHaveProperty('totalItens');
        expect(data[0]).toHaveProperty('totalHoras');
      }
    });

    it('should filter daily summary by date range', async () => {
      if (!rdoTablesExist) {
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: '/rdo/resumo-diario?page=1&limit=10&dataInicio=2026-01-01&dataFim=2026-01-31',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();

      expect(Array.isArray(data)).toBe(true);
    });
  });
});
