import { buildApp } from '@/app';
import { FastifyInstance } from 'fastify';

describe('Funcionarios Integration (e2e)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── VINCULOS BY CODPARC ─────────────────────────────────

  it('GET /funcionarios/parceiro/:codparc/vinculos should return vinculos for known employee', async () => {
    // CODPARC 365 = FRANK (known active employee, 1 vinculo)
    const response = await app.inject({
      method: 'GET',
      url: '/funcionarios/parceiro/365/vinculos',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    const vinculo = body[0];
    expect(vinculo).toHaveProperty('codemp');
    expect(vinculo).toHaveProperty('codfunc');
    expect(vinculo).toHaveProperty('codparc');
    expect(vinculo.codparc).toBe(365);
    expect(vinculo).toHaveProperty('situacao');
    expect(vinculo).toHaveProperty('situacaoLabel');
    expect(vinculo).toHaveProperty('dtadm');
    expect(vinculo).toHaveProperty('codcargahor');
    expect(vinculo).toHaveProperty('salario');

    // Codes + descriptions
    expect(vinculo).toHaveProperty('codcargo');
    expect(vinculo).toHaveProperty('cargo');
    expect(vinculo).toHaveProperty('codfuncao');
    expect(vinculo).toHaveProperty('funcao');
    expect(vinculo).toHaveProperty('coddep');
    expect(vinculo).toHaveProperty('departamento');
    expect(vinculo).toHaveProperty('empresa');
  });

  it('GET /funcionarios/parceiro/:codparc/vinculos for multi-vinculo employee should return all', async () => {
    // CODPARC 1271 = JAFSON (known 4 vinculos)
    const response = await app.inject({
      method: 'GET',
      url: '/funcionarios/parceiro/1271/vinculos',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(2);

    // All vinculos should belong to the same codparc
    body.forEach((v: any) => {
      expect(v.codparc).toBe(1271);
      expect(v).toHaveProperty('situacao');
      expect(v).toHaveProperty('situacaoLabel');
    });
  });

  it('GET /funcionarios/parceiro/:codparc/vinculos for non-employee should return empty', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/funcionarios/parceiro/999999999/vinculos',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(0);
  });

  // ─── HISTORICO ───────────────────────────────────────────

  it('GET /funcionarios/parceiro/:codparc/historico should return complete history', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/funcionarios/parceiro/365/historico',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);

    expect(body).toHaveProperty('codparc');
    expect(body.codparc).toBe(365);
    expect(body).toHaveProperty('nomeparc');
    expect(body).toHaveProperty('vinculos');
    expect(body).toHaveProperty('totalVinculos');
    expect(body).toHaveProperty('vinculoAtivo');

    expect(Array.isArray(body.vinculos)).toBe(true);
    expect(body.totalVinculos).toBeGreaterThan(0);
    expect(body.totalVinculos).toBe(body.vinculos.length);
  });

  it('GET /funcionarios/parceiro/:codparc/historico for active employee should have vinculoAtivo', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/funcionarios/parceiro/365/historico',
    });

    const body = JSON.parse(response.body);
    expect(body.vinculoAtivo).not.toBeNull();
    expect(body.vinculoAtivo.situacao).toBe('1');
    expect(body.vinculoAtivo.situacaoLabel).toBe('Ativo');
  });

  it('GET /funcionarios/parceiro/:codparc/historico for multi-vinculo should show all', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/funcionarios/parceiro/1271/historico',
    });

    const body = JSON.parse(response.body);
    expect(body.totalVinculos).toBeGreaterThanOrEqual(2);

    // Check situacao labels are computed
    body.vinculos.forEach((v: any) => {
      expect(v.situacaoLabel).toBeTruthy();
      expect(typeof v.situacaoLabel).toBe('string');
    });
  });

  it('GET /funcionarios/parceiro/:codparc/historico for non-employee should return empty vinculos', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/funcionarios/parceiro/999999999/historico',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.totalVinculos).toBe(0);
    expect(body.vinculos).toEqual([]);
    expect(body.vinculoAtivo).toBeNull();
  });

  // ─── CARGA HORARIA ───────────────────────────────────────

  it('GET /funcionarios/carga-horaria/:codcargahor should return weekly schedule', async () => {
    // CODCARGAHOR 63 = known schedule (Mon-Fri 07:00-16:00 with lunch)
    const response = await app.inject({
      method: 'GET',
      url: '/funcionarios/carga-horaria/63',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);

    expect(body).toHaveProperty('codcargahor');
    expect(body.codcargahor).toBe(63);
    expect(body).toHaveProperty('dias');
    expect(body).toHaveProperty('totalHorasSemana');
    expect(body).toHaveProperty('totalHorasSemanaFmt');
    expect(Array.isArray(body.dias)).toBe(true);
    expect(body.dias.length).toBeGreaterThan(0);
  });

  it('GET /funcionarios/carga-horaria/:codcargahor dias should have correct structure', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/funcionarios/carga-horaria/63',
    });

    const body = JSON.parse(response.body);
    const dia = body.dias[0];

    expect(dia).toHaveProperty('codcargahor');
    expect(dia).toHaveProperty('diasem');
    expect(dia).toHaveProperty('diasemLabel');
    expect(dia).toHaveProperty('turno');
    expect(dia).toHaveProperty('entrada');
    expect(dia).toHaveProperty('saida');
    expect(dia).toHaveProperty('entradaFmt');
    expect(dia).toHaveProperty('saidaFmt');
    expect(dia).toHaveProperty('horasTurno');
    expect(dia).toHaveProperty('folga');
  });

  it('GET /funcionarios/carga-horaria/:codcargahor Sunday should be folga', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/funcionarios/carga-horaria/63',
    });

    const body = JSON.parse(response.body);
    const domingo = body.dias.find((d: any) => d.diasem === 1);

    if (domingo) {
      expect(domingo.folga).toBe(true);
      expect(domingo.diasemLabel).toBe('Domingo');
      expect(domingo.entrada).toBeNull();
      expect(domingo.saida).toBeNull();
      expect(domingo.entradaFmt).toBeNull();
      expect(domingo.saidaFmt).toBeNull();
      expect(domingo.horasTurno).toBe(0);
    }
  });

  it('GET /funcionarios/carga-horaria/:codcargahor workday should have formatted times', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/funcionarios/carga-horaria/63',
    });

    const body = JSON.parse(response.body);
    // Monday turno 1
    const segT1 = body.dias.find((d: any) => d.diasem === 2 && d.turno === 1);

    if (segT1) {
      expect(segT1.folga).toBe(false);
      expect(segT1.diasemLabel).toBe('Segunda-feira');
      expect(segT1.entradaFmt).toMatch(/^\d{2}:\d{2}$/);
      expect(segT1.saidaFmt).toMatch(/^\d{2}:\d{2}$/);
      expect(segT1.horasTurno).toBeGreaterThan(0);
    }
  });

  it('GET /funcionarios/carga-horaria/:codcargahor total hours should be reasonable', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/funcionarios/carga-horaria/63',
    });

    const body = JSON.parse(response.body);
    // Total hours should be between 20h and 50h for a standard work week
    const totalHoras = body.totalHorasSemana / 60;
    expect(totalHoras).toBeGreaterThan(20);
    expect(totalHoras).toBeLessThan(50);
    expect(body.totalHorasSemanaFmt).toMatch(/^\d{2}:\d{2}$/);
  });

  it('GET /funcionarios/carga-horaria/:codcargahor for nonexistent should return empty', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/funcionarios/carga-horaria/999999',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.dias).toEqual([]);
    expect(body.totalHorasSemana).toBe(0);
  });

  // ─── SITUACAO LABELS ─────────────────────────────────────

  it('vinculos should have correct situacao labels', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/funcionarios/parceiro/365/vinculos',
    });

    const body = JSON.parse(response.body);
    const ativo = body.find((v: any) => v.situacao === '1');
    if (ativo) {
      expect(ativo.situacaoLabel).toBe('Ativo');
    }

    const demitido = body.find((v: any) => v.situacao === '0');
    if (demitido) {
      expect(demitido.situacaoLabel).toBe('Demitido');
    }
  });

  // ─── PERFIL ENRIQUECIDO (ANY SITUACAO) ─────────────────────

  describe('GET /funcionarios/:codparc/perfil-enriquecido', () => {
    it('should return enriched profile for active employee', async () => {
      // CODPARC 3396 = known active employee with RDO data
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/3396/perfil-enriquecido',
      });

      if (response.statusCode !== 200) {
        console.log('ERROR RESPONSE:', response.body);
      }
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      // Dados pessoais
      expect(body).toHaveProperty('codparc');
      expect(body.codparc).toBe(3396);
      expect(body).toHaveProperty('nomeparc');
      expect(body).toHaveProperty('cgcCpf');
      expect(body).toHaveProperty('telefone');
      expect(body).toHaveProperty('email');

      // Papeis
      expect(body).toHaveProperty('papeis');
      expect(body.papeis).toHaveProperty('funcionario');
      expect(body.papeis).toHaveProperty('usuario');
      expect(body.papeis).toHaveProperty('cliente');
      expect(body.papeis).toHaveProperty('fornecedor');

      // Vínculo atual
      expect(body).toHaveProperty('vinculoAtual');
      if (body.vinculoAtual) {
        expect(body.vinculoAtual).toHaveProperty('situacao');
        expect(body.vinculoAtual).toHaveProperty('situacaoLabel');
        expect(body.vinculoAtual).toHaveProperty('dtadm');
        expect(body.vinculoAtual).toHaveProperty('cargo');
        expect(body.vinculoAtual).toHaveProperty('departamento');
        expect(body.vinculoAtual).toHaveProperty('empresa');
      }

      // Histórico
      expect(body).toHaveProperty('historico');
      expect(body.historico).toHaveProperty('totalVinculos');
      expect(body.historico).toHaveProperty('vinculos');
      expect(Array.isArray(body.historico.vinculos)).toBe(true);
    });

    it('should return 404 for non-existent codparc', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/999999999/perfil-enriquecido',
      });

      expect(response.statusCode).toBe(404);
    });

    it('should include usuarioSistema if employee has system login', async () => {
      // Find an employee who is also a system user
      const listaResp = await app.inject({
        method: 'GET',
        url: '/funcionarios/listar?comUsuario=true&limit=1',
      });
      const lista = JSON.parse(listaResp.body);

      if (lista.data.length > 0) {
        const codparc = lista.data[0].codparc;
        const response = await app.inject({
          method: 'GET',
          url: `/funcionarios/${codparc}/perfil-enriquecido`,
        });

        const body = JSON.parse(response.body);
        expect(body.papeis.usuario).toBe(true);
        if (body.usuarioSistema) {
          expect(body.usuarioSistema).toHaveProperty('codusu');
          expect(body.usuarioSistema).toHaveProperty('nomeusu');
        }
      }
    });

    it('should include endereco if available', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/3396/perfil-enriquecido',
      });

      const body = JSON.parse(response.body);
      // endereco can be null if not filled
      if (body.endereco) {
        expect(body.endereco).toHaveProperty('logradouro');
        expect(body.endereco).toHaveProperty('cidade');
        expect(body.endereco).toHaveProperty('uf');
      }
    });

    it('should include cargaHoraria if employee has one', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/3396/perfil-enriquecido',
      });

      const body = JSON.parse(response.body);
      if (body.cargaHoraria) {
        expect(body.cargaHoraria).toHaveProperty('codcargahor');
        expect(body.cargaHoraria).toHaveProperty('totalMinutosSemana');
        expect(body.cargaHoraria).toHaveProperty('totalHorasSemanaFmt');
        expect(body.cargaHoraria).toHaveProperty('dias');
      }
    });
  });

  // ─── PERFIL SUPER (GESTOR + SALARY) ─────────────────────────

  describe('GET /funcionarios/:codparc/perfil-super', () => {
    it('should return super profile with base fields for active employee', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/3396/perfil-super',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      // Base enriched fields
      expect(body.codparc).toBe(3396);
      expect(body).toHaveProperty('nomeparc');
      expect(body).toHaveProperty('papeis');
      expect(body).toHaveProperty('vinculoAtual');
      expect(body).toHaveProperty('historico');

      // Super fields (may be null depending on data)
      expect(body).toHaveProperty('gestor');
      expect(body).toHaveProperty('centroResultado');
      expect(body).toHaveProperty('salarioInfo');
    });

    it('should include gestor info when available', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/3396/perfil-super',
      });

      const body = JSON.parse(response.body);
      if (body.gestor) {
        expect(body.gestor).toHaveProperty('codusu');
        expect(body.gestor).toHaveProperty('nome');
        expect(body.gestor).toHaveProperty('email');
        expect(body.gestor).toHaveProperty('cargo');
        expect(body.gestor).toHaveProperty('departamento');
      }
    });

    it('should include centroResultado when available', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/3396/perfil-super',
      });

      const body = JSON.parse(response.body);
      if (body.centroResultado) {
        expect(body.centroResultado).toHaveProperty('codcencus');
        expect(body.centroResultado).toHaveProperty('descricao');
        expect(typeof body.centroResultado.codcencus).toBe('number');
      }
    });

    it('should include salarioInfo when available', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/3396/perfil-super',
      });

      const body = JSON.parse(response.body);
      if (body.salarioInfo) {
        expect(body.salarioInfo).toHaveProperty('salBase');
        expect(body.salarioInfo).toHaveProperty('salBruto');
        expect(body.salarioInfo).toHaveProperty('salLiq');
        expect(body.salarioInfo).toHaveProperty('dtPagamento');
        expect(body.salarioInfo).toHaveProperty('tipFolhaDescricao');
        expect(body.salarioInfo).toHaveProperty('percentualLiquido');
        expect(body.salarioInfo.salBruto).toBeGreaterThanOrEqual(0);
        if (body.salarioInfo.percentualLiquido !== null) {
          expect(body.salarioInfo.percentualLiquido).toBeGreaterThan(0);
          expect(body.salarioInfo.percentualLiquido).toBeLessThanOrEqual(100);
        }
      }
    });

    it('should return 404 for non-existent codparc', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/999999999/perfil-super',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  // ─── FILTROS-OPCOES ────────────────────────────────────────

  describe('GET /funcionarios/filtros-opcoes', () => {
    it('should return all filter options', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/filtros-opcoes',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body).toHaveProperty('empresas');
      expect(body).toHaveProperty('departamentos');
      expect(body).toHaveProperty('cargos');
      expect(body).toHaveProperty('funcoes');
      expect(body).toHaveProperty('centrosResultado');

      expect(Array.isArray(body.empresas)).toBe(true);
      expect(Array.isArray(body.departamentos)).toBe(true);
      expect(Array.isArray(body.cargos)).toBe(true);
      expect(Array.isArray(body.funcoes)).toBe(true);
    });

    it('should have at least one empresa and departamento', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/filtros-opcoes',
      });

      const body = JSON.parse(response.body);
      expect(body.empresas.length).toBeGreaterThan(0);
      expect(body.departamentos.length).toBeGreaterThan(0);
    });

    it('each option should have codigo and nome', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/filtros-opcoes',
      });

      const body = JSON.parse(response.body);
      const firstEmpresa = body.empresas[0];
      expect(firstEmpresa).toHaveProperty('codigo');
      expect(firstEmpresa).toHaveProperty('nome');
      expect(typeof firstEmpresa.codigo).toBe('number');
      expect(typeof firstEmpresa.nome).toBe('string');
    });
  });

  // ─── RESUMO (DASHBOARD) ────────────────────────────────────

  describe('GET /funcionarios/resumo', () => {
    it('should return dashboard totals', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/resumo',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body).toHaveProperty('totalAtivos');
      expect(body).toHaveProperty('totalDemitidos');
      expect(body).toHaveProperty('totalAfastados');
      expect(body).toHaveProperty('total');
      expect(body).toHaveProperty('porEmpresa');
      expect(body).toHaveProperty('porDepartamento');

      expect(body.totalAtivos).toBeGreaterThan(0);
      expect(body.total).toBeGreaterThanOrEqual(body.totalAtivos);
    });

    it('porEmpresa should have codemp and nome', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/resumo',
      });

      const body = JSON.parse(response.body);
      expect(body.porEmpresa.length).toBeGreaterThan(0);
      const first = body.porEmpresa[0];
      expect(first).toHaveProperty('codemp');
      expect(first).toHaveProperty('total');
      expect(first.total).toBeGreaterThan(0);
    });
  });

  // ─── LISTAR WITH FILTERS ─────────────────────────────────────

  describe('GET /funcionarios/listar filters', () => {
    it('should filter by situacao=1 (ativos)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/listar?situacao=1&limit=5',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');

      body.data.forEach((f: any) => {
        expect(f.situacao).toBe('1');
      });
    });

    it('should filter by comUsuario=true', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/listar?comUsuario=true&limit=5',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.meta.total).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const page1 = await app.inject({
        method: 'GET',
        url: '/funcionarios/listar?page=1&limit=5',
      });
      const page2 = await app.inject({
        method: 'GET',
        url: '/funcionarios/listar?page=2&limit=5',
      });

      const body1 = JSON.parse(page1.body);
      const body2 = JSON.parse(page2.body);

      expect(body1.meta.page).toBe(1);
      expect(body2.meta.page).toBe(2);
      expect(body1.data[0].codparc).not.toBe(body2.data[0].codparc);
    });

    it('should support orderBy and orderDir', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/listar?orderBy=dtadm&orderDir=DESC&limit=5',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.length).toBeGreaterThan(0);
    });

    it('should filter by termo (search)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/listar?termo=JOAO&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      // Should find at least one JOAO
      expect(body.meta.total).toBeGreaterThan(0);
    });
  });
});
