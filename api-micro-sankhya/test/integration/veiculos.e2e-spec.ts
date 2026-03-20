import { buildApp } from '@/app';
import { FastifyInstance } from 'fastify';

describe('Veiculos Integration (e2e)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── LIST ────────────────────────────────────────────────

  it('GET /veiculos deve retornar lista paginada', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/veiculos?limit=5',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body.length).toBeLessThanOrEqual(5);

    const v = body[0];
    expect(v).toHaveProperty('codveiculo');
    expect(v).toHaveProperty('placa');
    expect(v).toHaveProperty('marcamodelo');
    expect(v).toHaveProperty('categoria');
    expect(v).toHaveProperty('ativo');
  });

  it('GET /veiculos deve paginar corretamente', async () => {
    const page1 = await app.inject({
      method: 'GET',
      url: '/veiculos?page=1&limit=3',
    });
    const page2 = await app.inject({
      method: 'GET',
      url: '/veiculos?page=2&limit=3',
    });

    expect(page1.statusCode).toBe(200);
    expect(page2.statusCode).toBe(200);

    const body1 = JSON.parse(page1.body);
    const body2 = JSON.parse(page2.body);

    expect(body1.length).toBe(3);
    if (body2.length > 0) {
      expect(body1[0].codveiculo).not.toBe(body2[0].codveiculo);
    }
  });

  it('GET /veiculos deve filtrar por categoria', async () => {
    const all = await app.inject({
      method: 'GET',
      url: '/veiculos?limit=50',
    });
    const body = JSON.parse(all.body);
    if (body.length > 0 && body[0].categoria) {
      const cat = body[0].categoria;
      const filtered = await app.inject({
        method: 'GET',
        url: `/veiculos?categoria=${encodeURIComponent(cat)}&limit=50`,
      });
      const filteredBody = JSON.parse(filtered.body);
      expect(filteredBody.length).toBeGreaterThan(0);
      filteredBody.forEach((v: any) => {
        expect(v.categoria).toBe(cat);
      });
    }
  });

  // ─── SEARCH ──────────────────────────────────────────────

  it('GET /veiculos/search deve buscar por placa', async () => {
    const list = await app.inject({
      method: 'GET',
      url: '/veiculos?limit=1',
    });
    const veiculos = JSON.parse(list.body);
    if (veiculos.length > 0 && veiculos[0].placa) {
      const placa = veiculos[0].placa.substring(0, 3);
      const response = await app.inject({
        method: 'GET',
        url: `/veiculos/search?q=${placa}`,
      });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    }
  });

  // ─── GET BY ID ───────────────────────────────────────────

  it('GET /veiculos/:id deve retornar veiculo existente', async () => {
    const list = await app.inject({
      method: 'GET',
      url: '/veiculos?limit=1',
    });
    const veiculos = JSON.parse(list.body);
    expect(veiculos.length).toBeGreaterThan(0);

    const codveiculo = veiculos[0].codveiculo;
    const response = await app.inject({
      method: 'GET',
      url: `/veiculos/${codveiculo}`,
    });

    expect(response.statusCode).toBe(200);
    const v = JSON.parse(response.body);
    expect(v.codveiculo).toBe(codveiculo);
    expect(v).toHaveProperty('placa');
    expect(v).toHaveProperty('chassis');
    expect(v).toHaveProperty('renavam');
  });

  it('GET /veiculos/99999 deve retornar 404', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/veiculos/99999',
    });
    expect(response.statusCode).toBe(404);
  });

  // ─── PERFIL COMPLETO ─────────────────────────────────────

  it('GET /veiculos/:id/perfil deve retornar perfil com status', async () => {
    const list = await app.inject({
      method: 'GET',
      url: '/veiculos?limit=1',
    });
    const veiculos = JSON.parse(list.body);
    const codveiculo = veiculos[0].codveiculo;

    const response = await app.inject({
      method: 'GET',
      url: `/veiculos/${codveiculo}/perfil`,
    });

    expect(response.statusCode).toBe(200);
    const perfil = JSON.parse(response.body);
    expect(perfil.codveiculo).toBe(codveiculo);
    expect(perfil).toHaveProperty('status');
    expect(perfil).toHaveProperty('motoristaNome');
  });

  it('GET /veiculos/:id/perfil?include=osComerciais,osManutencao,contratos', async () => {
    const list = await app.inject({
      method: 'GET',
      url: '/veiculos?limit=1',
    });
    const veiculos = JSON.parse(list.body);
    const codveiculo = veiculos[0].codveiculo;

    const response = await app.inject({
      method: 'GET',
      url: `/veiculos/${codveiculo}/perfil?include=osComerciais,osManutencao,contratos`,
    });

    expect(response.statusCode).toBe(200);
    const perfil = JSON.parse(response.body);
    expect(perfil).toHaveProperty('osComerciais');
    expect(perfil).toHaveProperty('osManutencao');
    expect(perfil).toHaveProperty('contratos');
    expect(Array.isArray(perfil.osComerciais)).toBe(true);
    expect(Array.isArray(perfil.osManutencao)).toBe(true);
    expect(Array.isArray(perfil.contratos)).toBe(true);
  });

  // ─── OS COMERCIAIS ───────────────────────────────────────

  it('GET /veiculos/:id/os-comerciais deve retornar array', async () => {
    const list = await app.inject({
      method: 'GET',
      url: '/veiculos?limit=1',
    });
    const veiculos = JSON.parse(list.body);
    const codveiculo = veiculos[0].codveiculo;

    const response = await app.inject({
      method: 'GET',
      url: `/veiculos/${codveiculo}/os-comerciais`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
  });

  // ─── OS MANUTENCAO ───────────────────────────────────────

  it('GET /veiculos/:id/os-manutencao deve retornar array', async () => {
    const list = await app.inject({
      method: 'GET',
      url: '/veiculos?limit=1',
    });
    const veiculos = JSON.parse(list.body);
    const codveiculo = veiculos[0].codveiculo;

    const response = await app.inject({
      method: 'GET',
      url: `/veiculos/${codveiculo}/os-manutencao`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
  });

  // ─── DASHBOARD ──────────────────────────────────────────

  it('GET /veiculos/dashboard deve retornar veiculos com status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/veiculos/dashboard',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    const v = body[0];
    expect(v).toHaveProperty('codveiculo');
    expect(v).toHaveProperty('placa');
    expect(v).toHaveProperty('marcamodelo');
    expect(v).toHaveProperty('categoria');
    expect(v).toHaveProperty('status');
    expect(v).toHaveProperty('motoristaNome');
    expect(typeof v.status).toBe('string');
    expect(v.status.length).toBeGreaterThan(0);
  });

  // ─── STATS ─────────────────────────────────────────────

  it('GET /veiculos/stats deve retornar contadores por status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/veiculos/stats',
    });

    expect(response.statusCode).toBe(200);
    const stats = JSON.parse(response.body);
    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('livre');
    expect(stats).toHaveProperty('emUso');
    expect(stats).toHaveProperty('manutencao');
    expect(stats).toHaveProperty('parado');
    expect(stats).toHaveProperty('bloqueioComercial');
    expect(stats.total).toBeGreaterThan(0);

    const soma = stats.livre + stats.emUso + stats.agendado
      + stats.manutencao + stats.aguardandoManutencao + stats.parado
      + stats.bloqueioComercial + stats.alugadoContrato + stats.reservadoContrato;
    expect(soma).toBe(stats.total);
  });

  // ─── STATS MANUTENCAO ──────────────────────────────────

  it('GET /veiculos/stats/manutencao deve retornar contadores de manutencao', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/veiculos/stats/manutencao',
    });

    expect(response.statusCode).toBe(200);
    const stats = JSON.parse(response.body);
    expect(stats).toHaveProperty('totalAtivas');
    expect(stats).toHaveProperty('abertas');
    expect(stats).toHaveProperty('emExecucao');
    expect(stats).toHaveProperty('corretivas');
    expect(stats).toHaveProperty('preventivas');
    expect(stats).toHaveProperty('comBloqueio');
    expect(stats).toHaveProperty('impeditivas');
    expect(stats).toHaveProperty('naoImpeditivas');
    expect(stats).toHaveProperty('atrasadas');
    expect(stats).toHaveProperty('mediaDias');
    expect(typeof stats.totalAtivas).toBe('number');
  });

  // ─── RESUMO MANUTENCOES ───────────────────────────────

  it('GET /veiculos/resumo-manutencoes deve retornar lista de OS ativas', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/veiculos/resumo-manutencoes',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      const item = body[0];
      expect(item).toHaveProperty('nuos');
      expect(item).toHaveProperty('codveiculo');
      expect(item).toHaveProperty('placa');
      expect(item).toHaveProperty('status');
      expect(item).toHaveProperty('statusDescricao');
      expect(item).toHaveProperty('diasAberta');
      expect(item).toHaveProperty('qtdServicos');
    }
  });

  // ─── ALERTAS ──────────────────────────────────────────

  it('GET /veiculos/alertas deve retornar lista de alertas', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/veiculos/alertas',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      const item = body[0];
      expect(item).toHaveProperty('tipo');
      expect(item).toHaveProperty('mensagem');
      expect(item).toHaveProperty('codveiculo');
      expect(item).toHaveProperty('placa');
      expect(['CRITICO', 'ATENCAO', 'INFO']).toContain(item.tipo);
    }
  });

  // ─── AUDITORIA ────────────────────────────────────────

  it('GET /veiculos/auditoria deve retornar problemas detectados', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/veiculos/auditoria',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      const item = body[0];
      expect(item).toHaveProperty('tipoProblema');
      expect(item).toHaveProperty('codveiculo');
      expect(item).toHaveProperty('placa');
      expect(item).toHaveProperty('severidade');
      expect(['MULTIPLAS_OS_COMERCIAIS', 'MANUTENCAO_ANTIGA']).toContain(item.tipoProblema);
      expect(['CRITICO', 'ALTO', 'ATENCAO']).toContain(item.severidade);
    }
  });

  // ─── CONTRATOS ───────────────────────────────────────────

  it('GET /veiculos/:id/contratos deve retornar array', async () => {
    const list = await app.inject({
      method: 'GET',
      url: '/veiculos?limit=1',
    });
    const veiculos = JSON.parse(list.body);
    const codveiculo = veiculos[0].codveiculo;

    const response = await app.inject({
      method: 'GET',
      url: `/veiculos/${codveiculo}/contratos`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
  });
});
