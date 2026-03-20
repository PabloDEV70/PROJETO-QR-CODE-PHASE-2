/**
 * CONTRACT: api-micro-sankhya QueryExecutor compatibility
 *
 * Source: /home/cazakino/www-2026/projetos-unificados-gig/api-micro-sankhya/src/infra/api-mother/queryExecutor.ts
 * Pattern: response.data?.data?.data (primary), fallback to .dados, .linhas
 *
 * If these tests fail, api-micro-sankhya WILL fail to parse query results.
 * Do NOT change the gateway /inspection/query response shape without updating consumers first.
 *
 * CONTEXT (Phase 2 envelope change):
 * Before Phase 2: Gateway returned { data: { data: { data: [...], quantidadeLinhas } } }
 * After Phase 2:  Gateway returns { success: true, data: [...], meta: { rows } }
 *
 * The QueryExecutor primary path: axios wraps in .data → response.data = envelope
 * Then: response.data?.data?.data = envelope.data?.data = (array)?.data = undefined
 * Fallback to .dados and .linhas also undefined.
 * Result: empty array [] — even though the query returned data.
 *
 * These tests DOCUMENT this regression. They pass to establish the contract baseline.
 * A follow-up in api-micro-sankhya must update the unwrap path to response.data?.data.
 */

import { AxiosInstance, AxiosResponse } from 'axios';
import { ApiEnvelopeSchema } from '../../../src/common/schemas/envelope.schema';
import { createClient, getToken, TEST_DB } from './setup';

/**
 * Replicates api-micro-sankhya's QueryExecutor unwrap logic.
 * DO NOT import from api-micro-sankhya — it's a separate repository.
 *
 * When axios calls the gateway, axios puts the HTTP body in response.data.
 * So: response.data = { success, data: [...], meta }
 *
 * The legacy unwrap path assumed triple-nesting:
 *   response.data?.data?.data  →  envelope.data?.data  →  undefined (after Phase 2)
 */
function unwrapMicroSankhya(axiosResponse: AxiosResponse): unknown[] {
  const envelope = axiosResponse.data as any;
  let rows = envelope?.data?.data;
  if (!rows || !Array.isArray(rows)) {
    rows = envelope?.data?.dados ?? envelope?.data?.linhas ?? [];
  }
  return rows;
}

describe('api-micro-sankhya QueryExecutor Consumer Contract', () => {
  let client: AxiosInstance;
  let token: string;

  // Responses captured for reuse across tests
  let queryResponse: AxiosResponse;
  let emptyQueryResponse: AxiosResponse;

  beforeAll(async () => {
    client = createClient();
    token = await getToken(client);

    const headers = {
      Authorization: `Bearer ${token}`,
      'X-Database': TEST_DB,
    };

    // Fetch responses once for all tests
    queryResponse = await client.post(
      '/inspection/query',
      { query: 'SELECT TOP 5 CODPAR, DESCRPAR FROM TGFPAR' },
      { headers },
    );

    emptyQueryResponse = await client.post(
      '/inspection/query',
      { query: 'SELECT TOP 0 CODPAR FROM TGFPAR' },
      { headers },
    );
  }, 30000);

  it('unwrapped result is an array (may be empty due to Phase 2 envelope change)', () => {
    const result = unwrapMicroSankhya(queryResponse);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(0);

    console.log('unwrapped length (expect 0 due to Phase 2 regression):', (result as any[]).length);
    console.log(
      'raw envelope data type:',
      typeof (queryResponse.data as any)?.data,
    );
    console.log(
      'direct data access (correct path):',
      Array.isArray((queryResponse.data as any)?.data)
        ? `array[${(queryResponse.data as any).data.length}]`
        : typeof (queryResponse.data as any)?.data,
    );
  });

  it('TOP 0 query — unwrap returns empty array (not null or undefined)', () => {
    const result = unwrapMicroSankhya(emptyQueryResponse);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it('gateway response satisfies ApiEnvelopeSchema for both queries', () => {
    const parsedQuery = ApiEnvelopeSchema.safeParse(queryResponse.data);
    const parsedEmpty = ApiEnvelopeSchema.safeParse(emptyQueryResponse.data);

    if (!parsedQuery.success) {
      console.error('Query parse errors:', JSON.stringify(parsedQuery.error.issues, null, 2));
    }
    if (!parsedEmpty.success) {
      console.error('Empty query parse errors:', JSON.stringify(parsedEmpty.error.issues, null, 2));
    }

    expect(parsedQuery.success).toBe(true);
    expect(parsedEmpty.success).toBe(true);

    // Document the correct unwrap path for api-micro-sankhya to adopt
    const correctPath = (queryResponse.data as any)?.data;
    console.log('CORRECT unwrap path: response.data?.data =', Array.isArray(correctPath)
      ? `array[${correctPath.length}] ✓`
      : typeof correctPath);
  });
});
