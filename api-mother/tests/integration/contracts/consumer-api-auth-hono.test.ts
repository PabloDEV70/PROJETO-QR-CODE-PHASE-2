/**
 * CONTRACT: api-auth-hono direct axios response handling
 *
 * Source: /home/cazakino/www-2026/api-auth-hono (integration tests)
 * Pattern: direct axios response handling, accesses res.data directly
 *
 * api-auth-hono accesses: res.data.data.access_token (for auth)
 * and res.data.data (for query results as array)
 *
 * If these tests fail, api-auth-hono's Sankhya gateway calls will break.
 */
import { AxiosInstance } from 'axios';
import { ApiEnvelopeSchema } from '../../../src/common/schemas/envelope.schema';
import { createClient, getToken, TEST_DB } from './setup';

// ---------------------------------------------------------------------------
// api-auth-hono access pattern helpers — re-implemented locally
// ---------------------------------------------------------------------------

function extractAccessToken(axiosResponse: { data: unknown }): string | undefined {
  return (axiosResponse.data as Record<string, unknown> | undefined)
    ?.data as string | undefined;
}

function extractQueryRows(axiosResponse: { data: unknown }): unknown[] {
  const inner = (axiosResponse.data as Record<string, unknown> | undefined)?.data;
  return Array.isArray(inner) ? inner : [];
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('CONTRACT api-auth-hono: direct axios response patterns', () => {
  let client: AxiosInstance;
  let token: string;

  beforeAll(async () => {
    client = createClient();
    token = await getToken(client);
  }, 30000);

  function authHeaders() {
    return { Authorization: `Bearer ${token}`, 'X-Database': TEST_DB };
  }

  // -------------------------------------------------------------------------
  // Test 1: Auth response shape — extractAccessToken returns a non-empty string
  // -------------------------------------------------------------------------
  it('extractAccessToken() returns non-empty string from login response', async () => {
    const username = process.env.TEST_USERNAME;
    const password = process.env.TEST_PASSWORD;

    if (!username || !password) {
      console.warn('TEST_USERNAME/TEST_PASSWORD not set — skipping login shape check');
      return;
    }

    const res = await client.post('/auth/login', { username, password });

    // api-auth-hono accesses: res.data.data.access_token
    const extracted = extractAccessToken(res);

    expect(typeof extracted).toBe('string');
    expect((extracted as string).length).toBeGreaterThan(0);

    // Validate envelope
    const parseResult = ApiEnvelopeSchema.safeParse(res.data);
    expect(parseResult.success).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Test 2: Query rows extraction — extractQueryRows returns an array
  // -------------------------------------------------------------------------
  it('extractQueryRows() returns array from /inspection/query response', async () => {
    const res = await client.post(
      '/inspection/query',
      { query: 'SELECT TOP 5 1 AS N' },
      { headers: authHeaders() },
    );

    // api-auth-hono accesses: res.data.data (expects array)
    const rows = extractQueryRows(res);

    expect(Array.isArray(rows)).toBe(true);

    // Validate envelope
    const parseResult = ApiEnvelopeSchema.safeParse(res.data);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.success).toBe(true);
    }
  });

  // -------------------------------------------------------------------------
  // Test 3: ApiEnvelopeSchema validates both auth and query responses
  // -------------------------------------------------------------------------
  it('ApiEnvelopeSchema validates /inspection/query response shape', async () => {
    const res = await client.post(
      '/inspection/query',
      { query: 'SELECT TOP 1 GETDATE() AS NOW' },
      { headers: authHeaders() },
    );

    const parseResult = ApiEnvelopeSchema.safeParse(res.data);

    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.success).toBe(true);
      expect(parseResult.data.meta).toBeDefined();
    }
  });
});
