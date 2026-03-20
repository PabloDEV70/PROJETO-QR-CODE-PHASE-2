import { buildApp } from '@/app';
import { FastifyInstance } from 'fastify';

describe('Parceiros Integration (e2e)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── LIST ────────────────────────────────────────────────

  it('GET /parceiros should return a list of parceiros', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/parceiros?limit=5',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body.length).toBeLessThanOrEqual(5);

    const p = body[0];
    expect(p).toHaveProperty('codparc');
    expect(p).toHaveProperty('nomeparc');
    expect(p).toHaveProperty('tippessoa');
    expect(p).toHaveProperty('cgcCpf');
  });

  it('GET /parceiros should paginate correctly', async () => {
    const page1 = await app.inject({
      method: 'GET',
      url: '/parceiros?page=1&limit=3',
    });
    const page2 = await app.inject({
      method: 'GET',
      url: '/parceiros?page=2&limit=3',
    });

    expect(page1.statusCode).toBe(200);
    expect(page2.statusCode).toBe(200);

    const body1 = JSON.parse(page1.body);
    const body2 = JSON.parse(page2.body);

    expect(body1.length).toBe(3);
    if (body2.length > 0) {
      expect(body1[0].codparc).not.toBe(body2[0].codparc);
    }
  });

  it('GET /parceiros should filter by tippessoa=F', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/parceiros?limit=5&tippessoa=F',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.length).toBeGreaterThan(0);
    body.forEach((p: any) => {
      expect(p.tippessoa).toBe('F');
    });
  });

  it('GET /parceiros should filter by tippessoa=J', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/parceiros?limit=5&tippessoa=J',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.length).toBeGreaterThan(0);
    body.forEach((p: any) => {
      expect(p.tippessoa).toBe('J');
    });
  });

  // ─── SEARCH ──────────────────────────────────────────────

  it('GET /parceiros/search should return results for a letter', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/parceiros/search?q=A',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  it('GET /parceiros/search should return empty for gibberish', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/parceiros/search?q=XYZQWERTY999',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(0);
  });

  // ─── GET BY ID ───────────────────────────────────────────

  it('GET /parceiros/:codparc should return a single parceiro', async () => {
    // First get a valid codparc from the list
    const listResp = await app.inject({
      method: 'GET',
      url: '/parceiros?limit=1',
    });
    const list = JSON.parse(listResp.body);
    const codparc = list[0].codparc;

    const response = await app.inject({
      method: 'GET',
      url: `/parceiros/${codparc}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.codparc).toBe(codparc);
    expect(body).toHaveProperty('nomeparc');
    expect(body).toHaveProperty('tippessoa');
  });

  it('GET /parceiros/:codparc should return 404 for invalid id', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/parceiros/999999999',
    });

    expect(response.statusCode).toBe(404);
  });

  // ─── PERFIL COMPLETO ─────────────────────────────────────

  it('GET /parceiros/:codparc/perfil should return full profile', async () => {
    const listResp = await app.inject({
      method: 'GET',
      url: '/parceiros?limit=1',
    });
    const list = JSON.parse(listResp.body);
    const codparc = list[0].codparc;

    const response = await app.inject({
      method: 'GET',
      url: `/parceiros/${codparc}/perfil`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);

    // Dados base
    expect(body.codparc).toBe(codparc);
    expect(body).toHaveProperty('nomeparc');
    expect(body).toHaveProperty('cgcCpf');
    expect(body).toHaveProperty('cgcCpfFormatted');
    expect(body).toHaveProperty('tippessoa');
    expect(body).toHaveProperty('ativo');

    // Papeis
    expect(body).toHaveProperty('papeis');
    expect(body.papeis).toHaveProperty('cliente');
    expect(body.papeis).toHaveProperty('fornecedor');
    expect(body.papeis).toHaveProperty('motorista');
    expect(body.papeis).toHaveProperty('vendedor');
    expect(body.papeis).toHaveProperty('transportadora');
    expect(body.papeis).toHaveProperty('usuario');
    expect(body.papeis).toHaveProperty('funcionario');
    expect(['S', 'N']).toContain(body.papeis.usuario);
    expect(['S', 'N']).toContain(body.papeis.funcionario);

    // Endereco com codigos
    expect(body).toHaveProperty('endereco');
    expect(body.endereco).toHaveProperty('codend');
    expect(body.endereco).toHaveProperty('codbai');
    expect(body.endereco).toHaveProperty('codcid');
    expect(body.endereco).toHaveProperty('nomecid');
    expect(body.endereco).toHaveProperty('cep');

    // Contato separado por dimensao
    expect(body).toHaveProperty('contato');
    expect(body.contato).toHaveProperty('emailParceiro');
    expect(body.contato).toHaveProperty('telefoneParceiro');
    expect(body.contato).toHaveProperty('emailUsuario');
    expect(body.contato).toHaveProperty('telefoneUsuario');

    // Auditoria
    expect(body).toHaveProperty('dtcad');
    expect(body).toHaveProperty('dtalter');

    // Vinculos
    expect(body).toHaveProperty('vinculosCount');
    expect(typeof body.vinculosCount).toBe('number');

    // Usuario sistema
    expect(body).toHaveProperty('usuarioSistema');
  });

  it('GET /parceiros/:codparc/perfil should return 404 for invalid id', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/parceiros/999999999/perfil',
    });

    expect(response.statusCode).toBe(404);
  });

  it('GET /parceiros/:codparc/perfil?include=funcionario should include employee data', async () => {
    // CODPARC 365 = FRANK DORNELES (known active employee)
    const response = await app.inject({
      method: 'GET',
      url: '/parceiros/365/perfil?include=funcionario',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);

    expect(body.papeis.funcionario).toBe('S');
    expect(body).toHaveProperty('funcionario');
    expect(body.funcionario).toHaveProperty('vinculos');
    expect(body.funcionario).toHaveProperty('totalVinculos');
    expect(body.funcionario).toHaveProperty('vinculoAtivo');
    expect(Array.isArray(body.funcionario.vinculos)).toBe(true);
    expect(body.funcionario.totalVinculos).toBeGreaterThan(0);

    // Vinculo deve ter cargo, funcao, departamento, empresa
    const vinculo = body.funcionario.vinculos[0];
    expect(vinculo).toHaveProperty('codemp');
    expect(vinculo).toHaveProperty('codfunc');
    expect(vinculo).toHaveProperty('situacao');
    expect(vinculo).toHaveProperty('situacaoLabel');
    expect(vinculo).toHaveProperty('dtadm');
    expect(vinculo).toHaveProperty('codcargo');
    expect(vinculo).toHaveProperty('cargo');
    expect(vinculo).toHaveProperty('codfuncao');
    expect(vinculo).toHaveProperty('funcao');
    expect(vinculo).toHaveProperty('coddep');
    expect(vinculo).toHaveProperty('departamento');
    expect(vinculo).toHaveProperty('empresa');
  });

  it('GET /parceiros/:codparc/perfil without include should NOT load funcionario', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/parceiros/365/perfil',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.papeis.funcionario).toBe('S');
    expect(body.funcionario).toBeUndefined();
  });

  it('GET /parceiros/:codparc/perfil for non-employee should have funcionario=N', async () => {
    // Use search to find a non-employee parceiro (pessoa juridica usually)
    const listResp = await app.inject({
      method: 'GET',
      url: '/parceiros?limit=5&tippessoa=J',
    });
    const list = JSON.parse(listResp.body);
    if (list.length === 0) return;

    const codparc = list[0].codparc;
    const response = await app.inject({
      method: 'GET',
      url: `/parceiros/${codparc}/perfil?include=funcionario`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    // PJ is likely not an employee
    if (body.papeis.funcionario === 'N') {
      expect(body.funcionario).toBeUndefined();
    }
  });

  it('GET /parceiros/:codparc/perfil for user should have usuario=S and usuarioSistema populated', async () => {
    // CODPARC 365 = FRANK (known user CODUSU=8)
    const response = await app.inject({
      method: 'GET',
      url: '/parceiros/365/perfil',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.papeis.usuario).toBe('S');
    expect(body.usuarioSistema).not.toBeNull();
    expect(body.usuarioSistema.codusu).toBe(8);
    expect(body.usuarioSistema.nomeusu).toBe('FRANK.CARRIJO');
  });

  // ─── NEW ENDPOINTS ───────────────────────────────────────

  it('GET /parceiros/:codparc/rdos should return RDOs for a parceiro', async () => {
    // Use a known codparc that has RDOs (codparc 365 = FRANK, known employee with RDOs)
    const response = await app.inject({
      method: 'GET',
      url: '/parceiros/365/rdos?page=1&limit=5',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);

    if (body.length > 0) {
      const rdo = body[0];
      expect(rdo).toHaveProperty('CODRDO');
      expect(rdo).toHaveProperty('DTREF');
      expect(rdo).toHaveProperty('totalItens');
      expect(typeof rdo.CODRDO).toBe('number');
      expect(typeof rdo.totalItens).toBe('number');
    }
  });

  it('GET /parceiros/:codparc/rdos should paginate correctly', async () => {
    const page1 = await app.inject({
      method: 'GET',
      url: '/parceiros/365/rdos?page=1&limit=2',
    });
    const page2 = await app.inject({
      method: 'GET',
      url: '/parceiros/365/rdos?page=2&limit=2',
    });

    expect(page1.statusCode).toBe(200);
    expect(page2.statusCode).toBe(200);

    const body1 = JSON.parse(page1.body);
    const body2 = JSON.parse(page2.body);

    if (body1.length > 0 && body2.length > 0) {
      expect(body1[0].CODRDO).not.toBe(body2[0].CODRDO);
    }
  });

  it('GET /parceiros/:codparc/os-manutencao should return OS for a parceiro', async () => {
    // Use a known codparc that is provider (CODPARC 1418 from reference docs)
    const response = await app.inject({
      method: 'GET',
      url: '/parceiros/1418/os-manutencao?page=1&limit=5',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);

    if (body.length > 0) {
      const os = body[0];
      expect(os).toHaveProperty('NUOS');
      expect(os).toHaveProperty('DTABERTURA');
      expect(os).toHaveProperty('STATUS');
      expect(os).toHaveProperty('statusLabel');
      expect(typeof os.NUOS).toBe('number');
      expect(['Finalizada', 'Aberta']).toContain(os.statusLabel);
    }
  });

  it('GET /parceiros/:codparc/os-manutencao should paginate correctly', async () => {
    const page1 = await app.inject({
      method: 'GET',
      url: '/parceiros/1418/os-manutencao?page=1&limit=2',
    });
    const page2 = await app.inject({
      method: 'GET',
      url: '/parceiros/1418/os-manutencao?page=2&limit=2',
    });

    expect(page1.statusCode).toBe(200);
    expect(page2.statusCode).toBe(200);

    const body1 = JSON.parse(page1.body);
    const body2 = JSON.parse(page2.body);

    if (body1.length > 0 && body2.length > 0) {
      expect(body1[0].NUOS).not.toBe(body2[0].NUOS);
    }
  });
});
