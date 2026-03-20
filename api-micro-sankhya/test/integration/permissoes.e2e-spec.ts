import { buildApp } from '@/app';
import { FastifyInstance } from 'fastify';

describe('Permissoes RBAC Integration (e2e)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('GET /permissoes/resumo', () => {
    it('should return KPI totals', async () => {
      const res = await app.inject({ method: 'GET', url: '/permissoes/resumo' });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body).toHaveProperty('totalTelas');
      expect(body).toHaveProperty('totalUsuarios');
      expect(body).toHaveProperty('totalGrupos');
      expect(body).toHaveProperty('totalAtribuicoes');
      expect(body.totalTelas).toBeGreaterThan(0);
      expect(body.totalGrupos).toBeGreaterThan(0);
    });
  });

  describe('GET /permissoes/telas', () => {
    it('should return paginated telas list', async () => {
      const res = await app.inject({ method: 'GET', url: '/permissoes/telas?limit=10' });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeLessThanOrEqual(10);
      expect(body.meta).toHaveProperty('total');
      expect(body.meta).toHaveProperty('page');
      if (body.data.length > 0) {
        expect(body.data[0]).toHaveProperty('idAcesso');
        expect(body.data[0]).toHaveProperty('nomeAmigavel');
        expect(body.data[0]).toHaveProperty('qtdGrupos');
        expect(body.data[0]).toHaveProperty('qtdUsuarios');
      }
    });

    it('should filter by termo', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/permissoes/telas?termo=parceiro&limit=5',
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('GET /permissoes/telas/:idacesso', () => {
    it('should return tela details with acoes and permissoes', async () => {
      // First get a valid idacesso
      const listRes = await app.inject({ method: 'GET', url: '/permissoes/telas?limit=1' });
      const listBody = JSON.parse(listRes.body);
      if (listBody.data.length === 0) return;

      const idacesso = listBody.data[0].idAcesso;
      const res = await app.inject({
        method: 'GET',
        url: `/permissoes/telas/${encodeURIComponent(idacesso)}`,
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body).toHaveProperty('idAcesso');
      expect(body).toHaveProperty('nomeAmigavel');
      expect(body).toHaveProperty('acoes');
      expect(body).toHaveProperty('permissoes');
      expect(Array.isArray(body.acoes)).toBe(true);
      expect(Array.isArray(body.permissoes)).toBe(true);
    });
  });

  describe('GET /permissoes/grupos', () => {
    it('should return all groups', async () => {
      const res = await app.inject({ method: 'GET', url: '/permissoes/grupos' });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      expect(body[0]).toHaveProperty('codGrupo');
      expect(body[0]).toHaveProperty('nomeGrupo');
      expect(body[0]).toHaveProperty('qtdMembros');
      expect(body[0]).toHaveProperty('qtdTelas');
    });
  });

  describe('GET /permissoes/grupos/:codgrupo', () => {
    it('should return group details with membros and telas', async () => {
      const listRes = await app.inject({ method: 'GET', url: '/permissoes/grupos' });
      const grupos = JSON.parse(listRes.body);
      if (grupos.length === 0) return;

      const codgrupo = grupos[0].codGrupo;
      const res = await app.inject({
        method: 'GET',
        url: `/permissoes/grupos/${codgrupo}`,
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body).toHaveProperty('codGrupo');
      expect(body).toHaveProperty('nomeGrupo');
      expect(body).toHaveProperty('membros');
      expect(body).toHaveProperty('telas');
      expect(Array.isArray(body.membros)).toBe(true);
      expect(Array.isArray(body.telas)).toBe(true);
    });

    it('should return 404 for invalid group', async () => {
      const res = await app.inject({ method: 'GET', url: '/permissoes/grupos/99999' });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /permissoes/usuarios', () => {
    it('should return paginated users', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/permissoes/usuarios?limit=10',
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
      expect(Array.isArray(body.data)).toBe(true);
      if (body.data.length > 0) {
        expect(body.data[0]).toHaveProperty('codUsu');
        expect(body.data[0]).toHaveProperty('nomeUsu');
        expect(body.data[0]).toHaveProperty('codGrupo');
        expect(body.data[0]).toHaveProperty('qtdDiretas');
      }
    });

    it('should search by termo', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/permissoes/usuarios?termo=CARLOS&limit=5',
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('GET /permissoes/usuarios/:codusu', () => {
    it('should return user details with diretas, herdadas, conflitos', async () => {
      const listRes = await app.inject({
        method: 'GET',
        url: '/permissoes/usuarios?limit=1',
      });
      const listBody = JSON.parse(listRes.body);
      if (listBody.data.length === 0) return;

      const codusu = listBody.data[0].codUsu;
      const res = await app.inject({
        method: 'GET',
        url: `/permissoes/usuarios/${codusu}`,
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body).toHaveProperty('codUsu');
      expect(body).toHaveProperty('nomeUsu');
      expect(body).toHaveProperty('diretas');
      expect(body).toHaveProperty('herdadas');
      expect(body).toHaveProperty('conflitos');
      expect(Array.isArray(body.diretas)).toBe(true);
      expect(Array.isArray(body.herdadas)).toBe(true);
      expect(Array.isArray(body.conflitos)).toBe(true);
    });

    it('should return 404 for invalid user', async () => {
      const res = await app.inject({ method: 'GET', url: '/permissoes/usuarios/99999' });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /permissoes/conflitos', () => {
    it('should return conflict list', async () => {
      const res = await app.inject({ method: 'GET', url: '/permissoes/conflitos' });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(Array.isArray(body)).toBe(true);
      if (body.length > 0) {
        expect(body[0]).toHaveProperty('idAcesso');
        expect(body[0]).toHaveProperty('codUsu');
        expect(body[0]).toHaveProperty('nomeUsu');
        expect(body[0]).toHaveProperty('acessoUsuario');
        expect(body[0]).toHaveProperty('acessoGrupo');
      }
    });
  });
});
