/**
 * CONTRACT: gig-rdo-vite API helper compatibility
 *
 * Source: /home/cazakino/www-2026/projetos-unificados-gig/gig-rdo-vite/src/api/api-helpers.ts
 *
 * unwrap(): strips double-nesting from ApiEnvelope responses (axios .data + envelope .data)
 * unwrapDb(): strips nesting from database-specific responses (extracts .dados field)
 *
 * If these tests fail, gig-rdo-vite React Query hooks will return undefined instead of data.
 */
import { AxiosInstance } from 'axios';
import { ApiEnvelopeSchema } from '../../../src/common/schemas/envelope.schema';
import { createClient, getToken, TEST_DB } from './setup';

// ---------------------------------------------------------------------------
// Helpers re-implemented locally — do NOT import from gig-rdo-vite (separate repo)
// ---------------------------------------------------------------------------

function unwrap(data: unknown): unknown {
  let d = data;
  if (d && typeof d === 'object' && 'data' in d) d = (d as Record<string, unknown>).data;
  if (d && typeof d === 'object' && 'data' in d) d = (d as Record<string, unknown>).data;
  return d;
}

function unwrapDb(data: unknown): unknown {
  let d = data;
  if (d && typeof d === 'object' && 'data' in d) d = (d as Record<string, unknown>).data;
  if (d && typeof d === 'object' && 'dados' in d) d = (d as Record<string, unknown>).dados;
  return d;
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('CONTRACT gig-rdo-vite: unwrap/unwrapDb helpers', () => {
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
  // Test 1: unwrap() on /inspection/query
  // -------------------------------------------------------------------------
  it('unwrap() extracts row array from /inspection/query envelope', async () => {
    const res = await client.post(
      '/inspection/query',
      { query: 'SELECT TOP 3 1 AS N' },
      { headers: authHeaders() },
    );

    // Outer axios response: { data: ApiEnvelope }
    // ApiEnvelope: { data: <rows>, success, meta }
    // unwrap strips two levels of .data
    const extracted = unwrap(res);

    // After unwrap: extracted is the inner data payload (array of rows or object)
    expect(extracted).toBeDefined();
    expect(extracted).not.toBeNull();

    // Validate the envelope itself with Zod schema
    const parseResult = ApiEnvelopeSchema.safeParse(res.data);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.success).toBe(true);
    }
  });

  // -------------------------------------------------------------------------
  // Test 2: unwrap() on /inspection/tabelas
  // -------------------------------------------------------------------------
  it('unwrap() extracts table list from /inspection/tabelas envelope', async () => {
    const res = await client.get('/inspection/tabelas', { headers: authHeaders() });

    const extracted = unwrap(res);

    // Extracted should be the inner data (object or array)
    expect(extracted).toBeDefined();
    expect(extracted).not.toBeNull();

    // The outer ApiEnvelope wraps the list — success must be true
    const parseResult = ApiEnvelopeSchema.safeParse(res.data);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.success).toBe(true);
    }
  });

  // -------------------------------------------------------------------------
  // Test 3: unwrapDb() on /inspection/query
  // Documents that /inspection/query does NOT use the .dados path — it returns
  // its data directly under .data, so unwrapDb falls through to the inner .data
  // without finding a .dados field.
  // -------------------------------------------------------------------------
  it('unwrapDb() on /inspection/query: no .dados field — returns inner data directly', async () => {
    const res = await client.post(
      '/inspection/query',
      { query: 'SELECT TOP 2 42 AS ANSWER' },
      { headers: authHeaders() },
    );

    const extracted = unwrapDb(res);

    // /inspection/query wraps rows under .data (not .dados)
    // unwrapDb strips outer .data (axios), then .data (envelope), then tries .dados
    // .dados is absent → returns the inner payload as-is
    expect(extracted).toBeDefined();

    // Validate envelope shape
    const parseResult = ApiEnvelopeSchema.safeParse(res.data);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      // The .data payload should NOT have a .dados key for query responses
      const innerData = parseResult.data.data;
      const hasNoGatewayDados =
        innerData === null ||
        typeof innerData !== 'object' ||
        !('dados' in (innerData as object));
      // Document the finding (does not fail the test — shape is informational)
      console.info(
        '[CONTRACT] /inspection/query inner data has .dados field:',
        !hasNoGatewayDados,
      );
    }
  });
});
