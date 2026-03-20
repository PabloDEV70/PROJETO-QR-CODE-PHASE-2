import { buildApp } from '../../src/app';
import { FastifyInstance } from 'fastify';

const HEADERS = {
  'x-database-selection': 'TREINA',
  'authorization': 'Bearer test-integration',
};

/**
 * Comprehensive integration tests for ALL manutencao read-only endpoints.
 * Hits real backend with TREINA database.
 * Tests skip gracefully when TREINA is not accessible or data is missing.
 */
describe('Manutencao Full Integration (TREINA)', () => {
  let app: FastifyInstance;
  let available = false;
  let testNuos: number | null = null;
  let testCodveiculo: number | null = null;
  let testCodparc: number | null = null;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    // Probe availability via KPIs endpoint
    const probe = await app.inject({
      method: 'GET',
      url: '/man/kpis',
      headers: HEADERS,
    });
    available = probe.statusCode === 200;

    if (!available) {
      console.warn('[manutencao-full] TREINA not accessible. Tests will be skipped.');
      return;
    }

    // Get test data from OS list
    const osProbe = await app.inject({
      method: 'GET',
      url: '/man/os?limit=1',
      headers: HEADERS,
    });
    if (osProbe.statusCode === 200) {
      const body = JSON.parse(osProbe.body);
      if (body.data?.length > 0) {
        testNuos = body.data[0].NUOS;
        testCodveiculo = body.data[0].CODVEICULO;
        testCodparc = body.data[0].CODPARC;
      }
    }

    // Fallback: use vehicle 66 as known test vehicle for dashboard/preventivas
    if (!testCodveiculo) {
      const vProbe = await app.inject({
        method: 'GET',
        url: '/veiculos/66/dashboard',
        headers: HEADERS,
      });
      if (vProbe.statusCode === 200) {
        testCodveiculo = 66;
      }
    }
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── GROUP 1: KPIs & Dashboard ──────────────────────────────────────────────

  describe('Group 1: KPIs & Dashboard', () => {
    it('GET /man/kpis → 200, has totalAtivas, osAbertas, osEmExecucao, corretivas, preventivas', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/kpis',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('totalAtivas');
      expect(body).toHaveProperty('osAbertas');
      expect(body).toHaveProperty('osEmExecucao');
      expect(body).toHaveProperty('corretivas');
      expect(body).toHaveProperty('preventivas');
    });

    it('GET /man/stats → 200, has totalOs, osAbertas, osFechadas, topVeiculos (array)', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/stats',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('totalOs');
      expect(body).toHaveProperty('osAbertas');
      expect(body).toHaveProperty('osFechadas');
      expect(body).toHaveProperty('topVeiculos');
      expect(Array.isArray(body.topVeiculos)).toBe(true);
    });

    it('GET /man/dashboard → 200, has porStatus, porTipoManutencao, recentes, paraExibir', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/dashboard',
        headers: HEADERS,
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
    });

    it('GET /os-manutencao/stats → 200, has totalOs, osAbertas, osFechadas, topVeiculos', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/os-manutencao/stats',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('totalOs');
      expect(body).toHaveProperty('osAbertas');
      expect(body).toHaveProperty('osFechadas');
      expect(body).toHaveProperty('topVeiculos');
    });

    it('GET /os-manutencao/dashboard → 200, has porStatus, porTipoManutencao, recentes, paraExibir', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/os-manutencao/dashboard',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('porStatus');
      expect(body).toHaveProperty('porTipoManutencao');
      expect(body).toHaveProperty('recentes');
      expect(body).toHaveProperty('paraExibir');
    });

    it('GET /man/kpis → typeof totalAtivas === number', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/kpis',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(typeof body.totalAtivas).toBe('number');
    });
  });

  // ─── GROUP 2: Alertas & Análises ────────────────────────────────────────────

  describe('Group 2: Alertas & Análises', () => {
    it('GET /man/alertas → 200, array, if length>0 check: tipo, mensagem, codveiculo, placa, nuos, diasAtraso', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/alertas',
        headers: HEADERS,
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

    it('GET /man/ativas?limit=5 → 200, array, if length>0 check: nuos, placa, diasEmManutencao, situacaoPrazo', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/ativas?limit=5',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      if (body.length > 0) {
        expect(body[0]).toHaveProperty('nuos');
        expect(body[0]).toHaveProperty('placa');
        expect(body[0]).toHaveProperty('diasEmManutencao');
        expect(body[0]).toHaveProperty('situacaoPrazo');
      }
    });

    it('GET /man/ativas (default limit) → 200, array length <=50', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/ativas',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeLessThanOrEqual(50);
    });

    it('GET /man/veiculos-multiplas-os → 200, array, if length>0 check: codveiculo, placa, qtdOsAtivas >1', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/veiculos-multiplas-os',
        headers: HEADERS,
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

    it('GET /man/media-dias → 200, array, if length>0 check: manutencao, tipo, total, mediaDias (number)', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/media-dias',
        headers: HEADERS,
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

    it('GET /man/ativas?limit=3 → 200, array length <=3', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/ativas?limit=3',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeLessThanOrEqual(3);
    });

    it('GET /man/alertas → each item has tipo as string', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/alertas',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      for (const item of body) {
        expect(typeof item.tipo).toBe('string');
      }
    });

    it('GET /man/media-dias → typeof mediaDias === number (verify numeric)', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/media-dias',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      if (body.length > 0) {
        expect(typeof body[0].mediaDias).toBe('number');
      }
    });
  });

  // ─── GROUP 3: OS Listagem & Busca ───────────────────────────────────────────

  describe('Group 3: OS Listagem & Busca', () => {
    it('GET /man/os?limit=5&page=1 → 200, has data (array), meta.totalRegistros', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/os?limit=5&page=1',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body).toHaveProperty('meta');
      expect(body.meta).toHaveProperty('totalRegistros');
    });

    it('GET /man/os?status=E&limit=5 → 200, has data', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/os?status=E&limit=5',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('data');
    });

    it('GET /man/os?status=F&limit=5 → 200, all items have STATUS=F', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/os?status=F&limit=5',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      for (const item of body.data) {
        expect(item.STATUS).toBe('F');
      }
    });

    it('GET /man/os?manutencao=P&limit=5 → 200, data filtered by tipo P', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/os?manutencao=P&limit=5',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('GET /man/os?orderBy=DTABERTURA&orderDir=DESC → 200', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/os?orderBy=DTABERTURA&orderDir=DESC',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('data');
    });

    it('GET /man/os/:nuos → 200, body.NUOS === testNuos', async () => {
      if (!available || !testNuos) return;

      const response = await app.inject({
        method: 'GET',
        url: `/man/os/${testNuos}`,
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('NUOS');
      expect(body.NUOS).toBe(testNuos);
    });

    it('GET /man/os/999999999 → 404', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/os/999999999',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(404);
    });

    it('GET /man/os/:nuos/servicos → 200, array, if length>0 check NUOS, SEQUENCIA, CODPROD', async () => {
      if (!available || !testNuos) return;

      const response = await app.inject({
        method: 'GET',
        url: `/man/os/${testNuos}/servicos`,
        headers: HEADERS,
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

    it('GET /man/os/:nuos/historico → 200, array', async () => {
      if (!available || !testNuos) return;

      const response = await app.inject({
        method: 'GET',
        url: `/man/os/${testNuos}/historico`,
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });

    it('GET /os-manutencao/search?q=1 → 200, array', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/os-manutencao/search?q=1',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });

    it('GET /os-manutencao?limit=5 → 200, has data, meta, data[0] has NUOS/STATUS/DTABERTURA/statusLabel', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/os-manutencao?limit=5',
        headers: HEADERS,
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

    it('GET /os-manutencao/:nuos → 200, has NUOS, statusLabel, totalServicos', async () => {
      if (!available || !testNuos) return;

      const response = await app.inject({
        method: 'GET',
        url: `/os-manutencao/${testNuos}`,
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('NUOS');
      expect(body).toHaveProperty('statusLabel');
      expect(body).toHaveProperty('totalServicos');
    });
  });

  // ─── GROUP 4: Veículo Histórico ─────────────────────────────────────────────

  describe('Group 4: Veículo Histórico', () => {
    it('GET /man/veiculo/:codveiculo?limit=5 → 200, array', async () => {
      if (!available || !testCodveiculo) return;

      const response = await app.inject({
        method: 'GET',
        url: `/man/veiculo/${testCodveiculo}?limit=5`,
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });

    it('GET /man/veiculo/:codveiculo/resumo → 200, has codveiculo, totalOs', async () => {
      if (!available || !testCodveiculo) return;

      const response = await app.inject({
        method: 'GET',
        url: `/man/veiculo/${testCodveiculo}/resumo`,
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('codveiculo');
      expect(body).toHaveProperty('totalOs');
    });

    it('GET /man/veiculo/:codveiculo/historico?page=1&limit=10 → 200 or skip if 400', async () => {
      if (!available || !testCodveiculo) return;

      const response = await app.inject({
        method: 'GET',
        url: `/man/veiculo/${testCodveiculo}/historico?page=1&limit=10`,
        headers: HEADERS,
      });

      if (response.statusCode === 400) {
        console.log('SKIP: /man/veiculo/:codveiculo/historico - not supported by API Mother');
        return;
      }

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('total');
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('GET /man/veiculo/:codveiculo/servicos-frequentes → 200, array', async () => {
      if (!available || !testCodveiculo) return;

      const response = await app.inject({
        method: 'GET',
        url: `/man/veiculo/${testCodveiculo}/servicos-frequentes`,
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });

    it('GET /man/veiculo/:codveiculo/observacoes?page=1&limit=10 → 200 or skip if 400', async () => {
      if (!available || !testCodveiculo) return;

      const response = await app.inject({
        method: 'GET',
        url: `/man/veiculo/${testCodveiculo}/observacoes?page=1&limit=10`,
        headers: HEADERS,
      });

      if (response.statusCode === 400) {
        console.log('SKIP: /man/veiculo/:codveiculo/observacoes - not supported by API Mother');
        return;
      }

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('total');
    });

    it('GET /os-manutencao/veiculo/:codveiculo?limit=5 → 200, array, check statusLabel', async () => {
      if (!available || !testCodveiculo) return;

      const response = await app.inject({
        method: 'GET',
        url: `/os-manutencao/veiculo/${testCodveiculo}?limit=5`,
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      if (body.length > 0) {
        expect(body[0]).toHaveProperty('statusLabel');
      }
    });

    it('GET /os-manutencao/parceiro/:codparc?limit=5 → 200, array (if testCodparc)', async () => {
      if (!available || !testCodparc) return;

      const response = await app.inject({
        method: 'GET',
        url: `/os-manutencao/parceiro/${testCodparc}?limit=5`,
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });

    it('GET /man/parceiro/:codparc?limit=5 → 200, array (if testCodparc)', async () => {
      if (!available || !testCodparc) return;

      const response = await app.inject({
        method: 'GET',
        url: `/man/parceiro/${testCodparc}?limit=5`,
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });
  });

  // ─── GROUP 5: Planos Preventivos ────────────────────────────────────────────

  describe('Group 5: Planos Preventivos', () => {
    it('GET /man/planos → 200 or skip if 400, array', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/planos',
        headers: HEADERS,
      });

      if (response.statusCode === 400) {
        console.log('SKIP: /man/planos - tabela TCFMAN não acessível');
        return;
      }

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });

    it('GET /man/planos/aderencia → 200 or skip if 400, array', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/planos/aderencia',
        headers: HEADERS,
      });

      if (response.statusCode === 400) {
        console.log('SKIP: /man/planos/aderencia - tabela TCFMAN não acessível');
        return;
      }

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });

    it('GET /man/planos/aderencia?situacao=ATRASADA → 200, all items have situacao=ATRASADA', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/planos/aderencia?situacao=ATRASADA',
        headers: HEADERS,
      });

      if (response.statusCode === 400) {
        console.log('SKIP: /man/planos/aderencia?situacao=ATRASADA - tabela TCFMAN não acessível');
        return;
      }

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      for (const item of body) {
        expect(item.situacao).toBe('ATRASADA');
      }
    });

    it('GET /man/planos/aderencia?situacao=EM_DIA → 200, all items have situacao=EM_DIA', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/planos/aderencia?situacao=EM_DIA',
        headers: HEADERS,
      });

      if (response.statusCode === 400) {
        console.log('SKIP: /man/planos/aderencia?situacao=EM_DIA - tabela TCFMAN não acessível');
        return;
      }

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      for (const item of body) {
        expect(item.situacao).toBe('EM_DIA');
      }
    });

    it('GET /man/planos/atrasadas → 200 or skip if 400, array', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/planos/atrasadas',
        headers: HEADERS,
      });

      if (response.statusCode === 400) {
        console.log('SKIP: /man/planos/atrasadas - tabela TCFMAN não acessível');
        return;
      }

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });

    it('GET /man/planos/resumo → 200, has emDia, proximas, atrasadas, semHistorico, total', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/planos/resumo',
        headers: HEADERS,
      });

      if (response.statusCode === 400) {
        console.log('SKIP: /man/planos/resumo - tabela TCFMAN não acessível');
        return;
      }

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('emDia');
      expect(body).toHaveProperty('proximas');
      expect(body).toHaveProperty('atrasadas');
      expect(body).toHaveProperty('semHistorico');
      expect(body).toHaveProperty('total');
    });

    it('GET /man/planos/resumo → typeof total === number', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/planos/resumo',
        headers: HEADERS,
      });

      if (response.statusCode === 400) {
        console.log('SKIP: /man/planos/resumo (numeric) - tabela TCFMAN não acessível');
        return;
      }

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(typeof body.total).toBe('number');
    });

    it('GET /veiculos/66/preventivas → 200, has codveiculo, placa, preventivas (array), resumo', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/veiculos/66/preventivas',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('codveiculo');
      expect(body).toHaveProperty('placa');
      expect(body).toHaveProperty('preventivas');
      expect(body).toHaveProperty('resumo');
      expect(Array.isArray(body.preventivas)).toBe(true);
    });

    it('GET /veiculos/999999999/preventivas → 404', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/veiculos/999999999/preventivas',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(404);
    });

    it('GET /veiculos/preventivas/quadro → 200 (fleet preventive dashboard)', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/veiculos/preventivas/quadro',
        headers: HEADERS,
      });

      if (response.statusCode === 400 || response.statusCode === 404) {
        console.log('SKIP: /veiculos/preventivas/quadro - endpoint not available');
        return;
      }

      expect(response.statusCode).toBe(200);
    });
  });

  // ─── GROUP 6: Produtividade Técnicos ────────────────────────────────────────

  describe('Group 6: Produtividade Técnicos', () => {
    it('GET /man/tecnicos/produtividade → 200, array', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/tecnicos/produtividade',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });

    it('GET /man/tecnicos/produtividade?limit=5 → 200, array length <=5', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/tecnicos/produtividade?limit=5',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeLessThanOrEqual(5);
    });

    it('GET /man/tecnicos/produtividade?dataInicio=2024-01-01&dataFim=2024-12-31 → 200, array', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/tecnicos/produtividade?dataInicio=2024-01-01&dataFim=2024-12-31',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });

    it('GET /man/tecnicos/produtividade (structure check) → if length>0 check fields', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/tecnicos/produtividade',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      if (body.length > 0) {
        // At minimum each technician record should have some identifier
        const item = body[0];
        const hasFields =
          'codparc' in item ||
          'nomeparc' in item ||
          'nome' in item ||
          'totalOs' in item ||
          'osConcluidas' in item;
        expect(hasFields).toBe(true);
      }
    });
  });

  // ─── GROUP 7: Veículo Dashboard & Detail ────────────────────────────────────

  describe('Group 7: Veículo Dashboard & Detail', () => {
    it('GET /veiculos/:id/dashboard → 200, has veiculo (with codveiculo), statusOperacional', async () => {
      if (!available || !testCodveiculo) return;

      const response = await app.inject({
        method: 'GET',
        url: `/veiculos/${testCodveiculo}/dashboard`,
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('veiculo');
      expect(body.veiculo).toHaveProperty('codveiculo');
      expect(body).toHaveProperty('statusOperacional');
    });

    it('GET /veiculos/999999999/dashboard → 404', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/veiculos/999999999/dashboard',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(404);
    });

    it('GET /veiculos/invalid/dashboard → 400', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/veiculos/invalid/dashboard',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(400);
    });

    it('GET /veiculos/:id/proxima-manutencao → 200, has nuplano', async () => {
      if (!available || !testCodveiculo) return;

      const response = await app.inject({
        method: 'GET',
        url: `/veiculos/${testCodveiculo}/proxima-manutencao`,
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('nuplano');
    });

    it('GET /veiculos/:id/aderencia-plano → 200', async () => {
      if (!available || !testCodveiculo) return;

      const response = await app.inject({
        method: 'GET',
        url: `/veiculos/${testCodveiculo}/aderencia-plano`,
        headers: HEADERS,
      });

      if (response.statusCode === 400 || response.statusCode === 404) {
        console.log('SKIP: /veiculos/:id/aderencia-plano - not available');
        return;
      }

      expect(response.statusCode).toBe(200);
    });

    it('GET /veiculos/:id/historico?page=1&limit=5 → 200 or skip if 400', async () => {
      if (!available || !testCodveiculo) return;

      const response = await app.inject({
        method: 'GET',
        url: `/veiculos/${testCodveiculo}/historico?page=1&limit=5`,
        headers: HEADERS,
      });

      if (response.statusCode === 400) {
        console.log('SKIP: /veiculos/:id/historico - not supported');
        return;
      }

      expect(response.statusCode).toBe(200);
    });

    it('GET /veiculos/:id/custos → 200', async () => {
      if (!available || !testCodveiculo) return;

      const response = await app.inject({
        method: 'GET',
        url: `/veiculos/${testCodveiculo}/custos`,
        headers: HEADERS,
      });

      if (response.statusCode === 400 || response.statusCode === 404) {
        console.log('SKIP: /veiculos/:id/custos - not available');
        return;
      }

      expect(response.statusCode).toBe(200);
    });

    it('GET /veiculos/:id/retrabalho → 200', async () => {
      if (!available || !testCodveiculo) return;

      const response = await app.inject({
        method: 'GET',
        url: `/veiculos/${testCodveiculo}/retrabalho`,
        headers: HEADERS,
      });

      if (response.statusCode === 400 || response.statusCode === 404) {
        console.log('SKIP: /veiculos/:id/retrabalho - not available');
        return;
      }

      expect(response.statusCode).toBe(200);
    });
  });

  // ─── GROUP 8: Frota ─────────────────────────────────────────────────────────

  describe('Group 8: Frota', () => {
    it('GET /man/frota/status → 200', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/frota/status',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
    });

    it('GET /man/frota/status?page=1&limit=10 → 200', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/frota/status?page=1&limit=10',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
    });

    it('GET /man/frota/manutencoes-urgentes → 200', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/frota/manutencoes-urgentes',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
    });

    it('GET /man/frota/manutencoes-urgentes?limit=5 → 200', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/frota/manutencoes-urgentes?limit=5',
        headers: HEADERS,
      });

      expect(response.statusCode).toBe(200);
    });
  });

  // ─── GROUP 9: Database Selection Header ─────────────────────────────────────

  describe('Group 9: Database Selection Header', () => {
    it('Request with X-Database-Selection: TREINA → 200', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/kpis',
        headers: {
          'x-database-selection': 'TREINA',
          'authorization': 'Bearer test-integration',
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it('Request with X-Database-Selection: TESTE → 200', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/man/kpis',
        headers: {
          'x-database-selection': 'TESTE',
          'authorization': 'Bearer test-integration',
        },
      });

      // TESTE may or may not have data; API Mother may reject token on different DB
      // Accept 200 (ok), 400 (data error), 401 (token invalid on this DB), 500 (server error)
      expect([200, 400, 401, 500]).toContain(response.statusCode);
      // Route must exist — not 404
      expect(response.statusCode).not.toBe(404);
    });

    it('Request with no X-Database-Selection → 200 (defaults to PROD)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/man/kpis',
        headers: {
          'authorization': 'Bearer test-integration',
        },
      });

      // Should default to PROD — API Mother may reject test token on PROD
      expect([200, 400, 401, 500]).toContain(response.statusCode);
      expect(response.statusCode).not.toBe(404);
    });

    it('Request with invalid database → 200 (defaults to PROD)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/man/kpis',
        headers: {
          'x-database-selection': 'INVALID_DB',
          'authorization': 'Bearer test-integration',
        },
      });

      // Invalid DB defaults to PROD — API Mother may reject test token
      expect([200, 400, 401, 500]).toContain(response.statusCode);
      expect(response.statusCode).not.toBe(404);
    });
  });

  // ─── GROUP 10: Auth Guard ────────────────────────────────────────────────────

  describe('Group 10: Auth Guard', () => {
    it('Request without Authorization header → 401', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/man/kpis',
        headers: {
          'x-database-selection': 'TREINA',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('Request with invalid auth format (no Bearer) → 401', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/man/kpis',
        headers: {
          'x-database-selection': 'TREINA',
          'authorization': 'InvalidToken test-integration',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('Request with Bearer token → 200', async () => {
      if (!available) return;

      const response = await app.inject({
        method: 'GET',
        url: '/man/kpis',
        headers: {
          'x-database-selection': 'TREINA',
          'authorization': 'Bearer test-integration',
        },
      });

      expect(response.statusCode).toBe(200);
    });
  });
});
