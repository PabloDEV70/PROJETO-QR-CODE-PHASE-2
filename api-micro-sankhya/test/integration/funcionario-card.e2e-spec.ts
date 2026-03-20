import { buildApp } from '@/app';
import { FastifyInstance } from 'fastify';

describe('Funcionario Card Publico (e2e)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── CARD PUBLICO - HAPPY PATH ────────────────────────────

  describe('GET /funcionarios/card/:codemp/:codfunc', () => {
    it('should return 200 with card data for known employee', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/card/1/3396',
      });

      if (response.statusCode !== 200) {
        console.log('ERROR RESPONSE:', response.body);
      }
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body).toHaveProperty('data');
      const card = body.data;

      // Required fields present
      expect(card).toHaveProperty('codemp');
      expect(card).toHaveProperty('codfunc');
      expect(card).toHaveProperty('nome');
      expect(card).toHaveProperty('cargo');
      expect(card).toHaveProperty('funcao');
      expect(card).toHaveProperty('departamento');
      expect(card).toHaveProperty('empresa');
      expect(card).toHaveProperty('situacao');
      expect(card).toHaveProperty('situacaoLabel');
      expect(card).toHaveProperty('dtadm');
    });

    it('should return correct codemp value', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/card/1/3396',
      });

      const body = JSON.parse(response.body);
      const card = body.data;

      expect(card.codemp).toBe(1);
      expect(typeof card.codfunc).toBe('number');
      expect(typeof card.nome).toBe('string');
      expect(card.nome.length).toBeGreaterThan(0);
    });

    it('should have situacaoLabel as readable string', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/card/1/3396',
      });

      const body = JSON.parse(response.body);
      const card = body.data;

      expect(typeof card.situacao).toBe('string');
      expect(typeof card.situacaoLabel).toBe('string');
      expect(card.situacaoLabel.length).toBeGreaterThan(0);
    });

    // ─── SENSITIVE FIELDS EXCLUDED ────────────────────────────

    it('should NOT contain sensitive personal fields', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/card/1/3396',
      });

      const body = JSON.parse(response.body);
      const card = body.data;

      expect(card).not.toHaveProperty('cpf');
      expect(card).not.toHaveProperty('cgcCpf');
      expect(card).not.toHaveProperty('email');
      expect(card).not.toHaveProperty('telefone');
      expect(card).not.toHaveProperty('salario');
      expect(card).not.toHaveProperty('endereco');
    });

    // ─── NO AUTH REQUIRED ─────────────────────────────────────

    it('should work without Authorization header', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/card/1/3396',
        headers: {},
      });

      expect(response.statusCode).toBe(200);
    });

    // ─── CACHE-CONTROL HEADER ─────────────────────────────────

    it('should include Cache-Control header', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/card/1/3396',
      });

      expect(response.statusCode).toBe(200);
      const cacheControl = response.headers['cache-control'];
      expect(cacheControl).toBeDefined();
      expect(typeof cacheControl).toBe('string');
      expect(cacheControl).toContain('max-age=');
    });

    // ─── NOT FOUND ────────────────────────────────────────────

    it('should return 404 for non-existent employee', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/card/99999/99999',
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
