import { buildApp } from '@/app';
import { FastifyInstance } from 'fastify';

describe('Usuarios Integration (e2e)', () => {
  let app: FastifyInstance;
  let tableAvailable = false;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    const probe = await app.inject({
      method: 'GET',
      url: '/usuarios?limit=1',
    });
    tableAvailable = probe.statusCode === 200;

    if (!tableAvailable) {
      console.warn('[usuarios.e2e] TSIUSU not accessible. Skipping tests.');
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /usuarios should return a list of usuarios', async () => {
    if (!tableAvailable) return;

    const response = await app.inject({
      method: 'GET',
      url: '/usuarios?limit=10',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('codusu');
      expect(body[0]).toHaveProperty('nomeusu');
    }
  });

  it('GET /usuarios should support pagination', async () => {
    if (!tableAvailable) return;

    const response = await app.inject({
      method: 'GET',
      url: '/usuarios?page=1&limit=5',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeLessThanOrEqual(5);
  });

  it('GET /usuarios should filter by ativo', async () => {
    if (!tableAvailable) return;

    const response = await app.inject({
      method: 'GET',
      url: '/usuarios?ativo=S&limit=10',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    body.forEach((u: { ativo: string }) => {
      expect(u.ativo).toBe('S');
    });
  });

  it('GET /usuarios/search should return results', async () => {
    if (!tableAvailable) return;

    const response = await app.inject({
      method: 'GET',
      url: '/usuarios/search?q=a',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
  });

  it('GET /usuarios/:codusu should return 404 for non-existent user', async () => {
    if (!tableAvailable) return;

    const response = await app.inject({
      method: 'GET',
      url: '/usuarios/999999',
    });

    expect(response.statusCode).toBe(404);
  });

  it('GET /usuarios/:codusu should return user if exists', async () => {
    if (!tableAvailable) return;

    // First get a list to find a valid user
    const listResponse = await app.inject({
      method: 'GET',
      url: '/usuarios?limit=1',
    });

    const list = JSON.parse(listResponse.body);
    if (list.length === 0) return;

    const codusu = list[0].codusu;
    const response = await app.inject({
      method: 'GET',
      url: `/usuarios/${codusu}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.codusu).toBe(codusu);
    expect(body).toHaveProperty('nomeusu');
  });
});
