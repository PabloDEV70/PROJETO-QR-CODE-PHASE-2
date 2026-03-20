import { buildApp } from '@/app';
import { FastifyInstance } from 'fastify';
import { QueryExecutor } from '@/infra/api-mother/queryExecutor';

describe('Auth Integration (e2e)', () => {
  let app: FastifyInstance;
  let queryExecutor: QueryExecutor;
  let testColaborador: { codparc: number; cpf: string } | null = null;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    queryExecutor = new QueryExecutor();

    // Fetch a valid active partner (Person) to test Colaborador login
    // We select one that has a CPF length typical of a person (11 digits usually, but stored raw)
    const sql = `
      SELECT TOP 1 CODPARC, CGC_CPF
      FROM TGFPAR
      WHERE ATIVO = 'S' 
      AND TIPPESSOA = 'F'
      AND LEN(REPLACE(REPLACE(REPLACE(REPLACE(CGC_CPF, '.', ''), '-', ''), '/', ''), ' ', '')) = 11
    `;

    try {
      const rows = await queryExecutor.executeQuery<{ CODPARC: number; CGC_CPF: string }>(sql);
      if (rows.length > 0) {
        testColaborador = {
          codparc: rows[0].CODPARC,
          cpf: rows[0].CGC_CPF,
        };
        console.log('[AuthTest] Found test colaborador:', testColaborador);
      } else {
        console.warn('[AuthTest] No valid colaborador found for testing.');
      }
    } catch (e) {
      console.error('[AuthTest] Failed to fetch test credentials', e);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login should reject invalid standard credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        username: 'TEST_INVALID_USER',
        password: 'TEST_INVALID_PASS',
      },
    });

    expect(response.statusCode).toBe(401);
  });

  it('POST /auth/login/colaborador should authenticate valid colaborador', async () => {
    if (!testColaborador) {
      console.warn('Skipping Colaborador Login test due to missing data');
      return;
    }

    const response = await app.inject({
      method: 'POST',
      url: '/auth/login/colaborador',
      payload: {
        codparc: testColaborador.codparc,
        cpf: testColaborador.cpf,
      },
    });

    expect(response.statusCode).toBe(200); // Expecting 200 now as logic is implemented
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('token');
    expect(body.type).toBe('colaborador');
    expect(body.codparc).toBe(testColaborador.codparc);
  });

  it('POST /auth/login/colaborador should reject invalid codparc', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login/colaborador',
      payload: {
        codparc: 999999999, // Unlikely ID
        cpf: '12345678901',
      },
    });

    expect(response.statusCode).toBe(401);
  });
});
