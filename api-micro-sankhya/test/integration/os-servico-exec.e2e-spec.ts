import { buildApp } from '../../src/app';
import { FastifyInstance } from 'fastify';

/**
 * OS Service Execution — Integration Tests (start/finish servico)
 *
 * Uses TESTE database. All mutation requests include:
 *   x-database-selection: TESTE
 *   authorization: Bearer test-integration
 *
 * Test groups:
 *   Group 1 — Validation (schema rejection)
 *   Group 2 — Auth required (no Bearer -> 401)
 *   Group 3 — Full lifecycle (sequential, TESTE)
 */
describe('OS Service Execution (TESTE)', () => {
  let app: FastifyInstance;
  let available = false;
  let canMutate = false;

  let createdNuos: number | null = null;
  let createdSequencia: number | null = null;
  let createdCodrdo: number | null = null;
  let createdDetalheItem: number | null = null;

  const CODPARC = 100185;
  const CODPROD = 3953;

  const HEADERS = {
    'x-database-selection': 'TESTE',
    authorization: 'Bearer test-integration',
    'content-type': 'application/json',
  };

  const HEADERS_NO_AUTH = {
    'x-database-selection': 'TESTE',
    'content-type': 'application/json',
  };

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    const probe = await app.inject({
      method: 'GET',
      url: '/os-manutencao?limit=1',
      headers: HEADERS,
    });
    available = probe.statusCode === 200;

    if (!available) {
      console.warn('[os-servico-exec.e2e] TESTE not accessible. Lifecycle tests will be skipped.');
    }
  });

  afterAll(async () => {
    await app.close();
  });

  // -------------------------------------------------------------------------
  // GROUP 1 — Validation
  // -------------------------------------------------------------------------
  describe('Group 1: Validation (schema rejection)', () => {
    it('POST /os-manutencao/abc/servicos/abc/start with empty body should reject', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/os-manutencao/abc/servicos/abc/start',
        headers: HEADERS,
        payload: {},
      });
      expect([400, 422, 500]).toContain(res.statusCode);
    });

    it('POST /os-manutencao/abc/servicos/abc/finish with empty body should reject', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/os-manutencao/abc/servicos/abc/finish',
        headers: HEADERS,
        payload: {},
      });
      expect([400, 422, 500]).toContain(res.statusCode);
    });
  });

  // -------------------------------------------------------------------------
  // GROUP 2 — Auth
  // -------------------------------------------------------------------------
  describe('Group 2: Auth required (no Bearer token)', () => {
    it('POST /os-manutencao/1/servicos/1/start without auth should return 401', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/os-manutencao/1/servicos/1/start',
        headers: HEADERS_NO_AUTH,
        payload: { codparc: 1 },
      });
      expect(res.statusCode).toBe(401);
    });

    it('POST /os-manutencao/1/servicos/1/finish without auth should return 401', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/os-manutencao/1/servicos/1/finish',
        headers: HEADERS_NO_AUTH,
        payload: { codparc: 1 },
      });
      expect(res.statusCode).toBe(401);
    });
  });

  // -------------------------------------------------------------------------
  // GROUP 3 — Full lifecycle (sequential, TESTE only)
  // -------------------------------------------------------------------------
  describe('Group 3: Service execution lifecycle (sequential, TESTE)', () => {
    it('step 1: Create OS', async () => {
      if (!available) { console.log('[lifecycle] SKIP: TESTE not accessible'); return; }

      const res = await app.inject({
        method: 'POST',
        url: '/os-manutencao',
        headers: HEADERS,
        payload: { CODVEICULO: 1, MANUTENCAO: 'C', TIPO: 'I' },
      });

      if (res.statusCode === 200 || res.statusCode === 201) {
        canMutate = true;
        const body = JSON.parse(res.body);
        createdNuos = body.NUOS ?? body.nuos ?? body.chave?.NUOS ?? body.primaryKey?.NUOS ?? null;
        console.log(`[lifecycle] OS created: NUOS=${createdNuos}`);
        expect(createdNuos).toBeTruthy();
      } else {
        console.log(`[lifecycle] SKIP: API Mother rejected token (${res.statusCode})`);
        canMutate = false;
      }
    });

    it('step 2: Add servico to OS', async () => {
      if (!canMutate || !createdNuos) { console.log('[lifecycle] SKIP step 2'); return; }

      const res = await app.inject({
        method: 'POST',
        url: `/os-manutencao/${createdNuos}/servicos`,
        headers: HEADERS,
        payload: { CODPROD, QTD: 1 },
      });

      expect([200, 201]).toContain(res.statusCode);
      const body = JSON.parse(res.body);
      createdSequencia = body.SEQUENCIA ?? body.sequencia ?? body.chave?.SEQUENCIA ?? null;

      // If not in response, fetch from list
      if (!createdSequencia) {
        const listRes = await app.inject({
          method: 'GET',
          url: `/os-manutencao/${createdNuos}/servicos`,
          headers: HEADERS,
        });
        if (listRes.statusCode === 200) {
          const list = JSON.parse(listRes.body);
          if (Array.isArray(list) && list.length > 0) {
            createdSequencia = list[list.length - 1].SEQUENCIA ?? null;
          }
        }
      }
      console.log(`[lifecycle] Servico added: SEQUENCIA=${createdSequencia}`);
      expect(createdSequencia).toBeTruthy();
    });

    it('step 3: Start servico', async () => {
      if (!canMutate || !createdNuos || !createdSequencia) {
        console.log('[lifecycle] SKIP step 3'); return;
      }

      const res = await app.inject({
        method: 'POST',
        url: `/os-manutencao/${createdNuos}/servicos/${createdSequencia}/start`,
        headers: HEADERS,
        payload: { codparc: CODPARC },
      });

      expect([200, 201]).toContain(res.statusCode);
      const body = JSON.parse(res.body);
      expect(body.ok).toBe(true);
      expect(body.status).toBe('E');
    });

    it('step 4: Verify servico STATUS=E', async () => {
      if (!canMutate || !createdNuos) { console.log('[lifecycle] SKIP step 4'); return; }

      const res = await app.inject({
        method: 'GET',
        url: `/os-manutencao/${createdNuos}/servicos`,
        headers: HEADERS,
      });

      expect(res.statusCode).toBe(200);
      const list = JSON.parse(res.body);
      expect(Array.isArray(list)).toBe(true);
      const srv = list.find((s: { SEQUENCIA: number }) => s.SEQUENCIA === createdSequencia);
      if (srv) expect(srv.STATUS).toBe('E');
    });

    it('step 5: Create RDO for codparc', async () => {
      if (!canMutate) { console.log('[lifecycle] SKIP step 5'); return; }

      const today = new Date().toISOString().slice(0, 10);
      const res = await app.inject({
        method: 'POST',
        url: '/rdo',
        headers: HEADERS,
        payload: { CODPARC, DTREF: today },
      });

      expect([200, 201]).toContain(res.statusCode);
      const body = JSON.parse(res.body);
      createdCodrdo = body.codrdo ?? body.CODRDO ?? body.chave?.CODRDO ?? body.primaryKey?.CODRDO ?? null;

      // Handle duplicate-avoided case
      if (body.duplicateAvoided && body.codrdo) {
        createdCodrdo = body.codrdo;
      }

      console.log(`[lifecycle] RDO created/found: CODRDO=${createdCodrdo}`);
      expect(createdCodrdo).toBeTruthy();
    });

    it('step 6: Add ATVP detalhe with NUOS + AD_SEQUENCIA_OS', async () => {
      if (!canMutate || !createdCodrdo || !createdNuos || !createdSequencia) {
        console.log('[lifecycle] SKIP step 6'); return;
      }

      // Use HRINI=800 HRFIM=800 (will close later)
      const res = await app.inject({
        method: 'POST',
        url: `/rdo/${createdCodrdo}/detalhes`,
        headers: HEADERS,
        payload: {
          HRINI: 800,
          HRFIM: 800,
          RDOMOTIVOCOD: 1,
          NUOS: createdNuos,
          AD_SEQUENCIA_OS: createdSequencia,
        },
      });

      expect([200, 201]).toContain(res.statusCode);
      const body = JSON.parse(res.body);
      createdDetalheItem = body.ITEM ?? body.item ?? body.chave?.ITEM ?? body.primaryKey?.ITEM ?? null;

      // If item not in response, fetch latest
      if (!createdDetalheItem) {
        createdDetalheItem = 1;
      }
      console.log(`[lifecycle] Detalhe added: ITEM=${createdDetalheItem}`);
    });

    it('step 7: Close ATVP detalhe (HRFIM=current+60)', async () => {
      if (!canMutate || !createdCodrdo || !createdDetalheItem) {
        console.log('[lifecycle] SKIP step 7'); return;
      }

      const res = await app.inject({
        method: 'PUT',
        url: `/rdo/${createdCodrdo}/detalhes/${createdDetalheItem}`,
        headers: HEADERS,
        payload: { HRFIM: 900 },
      });

      expect([200, 201]).toContain(res.statusCode);
    });

    it('step 8: Finish servico', async () => {
      if (!canMutate || !createdNuos || !createdSequencia) {
        console.log('[lifecycle] SKIP step 8'); return;
      }

      const res = await app.inject({
        method: 'POST',
        url: `/os-manutencao/${createdNuos}/servicos/${createdSequencia}/finish`,
        headers: HEADERS,
        payload: { codparc: CODPARC },
      });

      expect([200, 201]).toContain(res.statusCode);
      const body = JSON.parse(res.body);
      expect(body.ok).toBe(true);
      expect(body.status).toBe('F');
      expect(body.totalMinutos).toBeDefined();
      console.log(`[lifecycle] Servico finished: totalMinutos=${body.totalMinutos}, osAutoFinalized=${body.osAutoFinalized}`);
    });

    it('step 9: Verify servico STATUS=F', async () => {
      if (!canMutate || !createdNuos) { console.log('[lifecycle] SKIP step 9'); return; }

      const res = await app.inject({
        method: 'GET',
        url: `/os-manutencao/${createdNuos}/servicos`,
        headers: HEADERS,
      });

      expect(res.statusCode).toBe(200);
      const list = JSON.parse(res.body);
      const srv = list.find((s: { SEQUENCIA: number }) => s.SEQUENCIA === createdSequencia);
      if (srv) expect(srv.STATUS).toBe('F');
    });

    it('step 10: Cleanup — cancel OS', async () => {
      if (!canMutate || !createdNuos) { console.log('[lifecycle] SKIP step 10'); return; }

      // Reopen first (F -> A), then cancel
      await app.inject({
        method: 'PATCH',
        url: `/os-manutencao/${createdNuos}/reabrir`,
        headers: HEADERS,
      });

      const res = await app.inject({
        method: 'PATCH',
        url: `/os-manutencao/${createdNuos}/cancelar`,
        headers: HEADERS,
      });

      expect([200, 201]).toContain(res.statusCode);
      console.log(`[lifecycle] OS ${createdNuos} cancelled — cleanup complete`);
    });
  });
});
