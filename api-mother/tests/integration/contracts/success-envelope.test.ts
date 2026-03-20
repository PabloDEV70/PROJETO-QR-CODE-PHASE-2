import { AxiosInstance } from 'axios';
import { ApiEnvelopeSchema } from '../../../src/common/schemas/envelope.schema';
import { createClient, getToken, TEST_DB } from './setup';

describe('Success Envelope Contract', () => {
  let token: string;
  let client: AxiosInstance;

  beforeAll(async () => {
    client = createClient();
    token = await getToken(client);
  }, 30000);

  function authHeaders() {
    return {
      Authorization: `Bearer ${token}`,
      'X-Database': TEST_DB,
    };
  }

  it('GET /health — envelope shape is valid and success is true', async () => {
    const res = await client.get('/health');

    const parsed = ApiEnvelopeSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error('Zod errors:', JSON.stringify(parsed.error.issues, null, 2));
    }
    expect(parsed.success).toBe(true);
    expect(res.data.success).toBe(true);
  });

  it('POST /inspection/query — envelope is valid, data is array, meta.rows is number', async () => {
    const res = await client.post(
      '/inspection/query',
      { query: 'SELECT TOP 3 CODPAR, DESCRPAR FROM TGFPAR' },
      { headers: authHeaders() },
    );

    const parsed = ApiEnvelopeSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error('Zod errors:', JSON.stringify(parsed.error.issues, null, 2));
    }
    expect(parsed.success).toBe(true);
    expect(typeof res.data.meta.rows).toBe('number');
    expect(res.data.meta.rows).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(res.data.data)).toBe(true);
  });

  it('GET /inspection/tabelas — envelope is valid and success is true', async () => {
    const res = await client.get('/inspection/tabelas', {
      headers: authHeaders(),
    });

    const parsed = ApiEnvelopeSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error('Zod errors:', JSON.stringify(parsed.error.issues, null, 2));
    }
    expect(parsed.success).toBe(true);
    expect(res.data.success).toBe(true);
  });
});
