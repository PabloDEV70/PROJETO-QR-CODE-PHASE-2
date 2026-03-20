/**
 * INTEGRATION: CHAR trimming (PERF-03) and HTTP compression (PERF-01)
 *
 * - CHAR(N) fields (e.g. TGFLOC.DESCRLOCAL) return without trailing spaces
 * - Trimming applies to every row in an array result
 * - Non-CHAR numeric fields are preserved as-is
 * - Brotli/gzip compression applied for responses > 1KB threshold
 * - Responses below 1KB are NOT compressed
 */
import axios, { AxiosInstance } from 'axios';
import { createClient, getToken, TEST_DB } from './contracts/setup';

const BASE = process.env.GATEWAY_URL || 'http://localhost:3027';

function extractRows(envelope: unknown): Record<string, unknown>[] {
  if (Array.isArray(envelope)) return envelope;
  const e = envelope as Record<string, unknown>;
  if (Array.isArray(e?.data)) return e.data as Record<string, unknown>[];
  if (Array.isArray(e?.dados)) return e.dados as Record<string, unknown>[];
  return [];
}

describe('PERF-03: CHAR trimming via CharTrimInterceptor', () => {
  let client: AxiosInstance;
  let token: string;
  let skip: boolean;

  beforeAll(async () => {
    skip = !process.env.TEST_USERNAME || !process.env.TEST_PASSWORD;
    if (skip) {
      console.warn('TEST_USERNAME/TEST_PASSWORD not set — skipping CHAR trim tests');
      return;
    }
    client = createClient(true);
    token = await getToken(client);
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    client.defaults.headers.common['X-Database'] = TEST_DB;
  });

  // Test 1: Single CHAR field has no trailing spaces
  it('TGFLOC.DESCRLOCAL returns without trailing spaces (single row)', async () => {
    if (skip) return;
    const res = await client.post('/inspection/query', {
      query: 'SELECT TOP 1 CODLOCAL, DESCRLOCAL FROM TGFLOC ORDER BY CODLOCAL',
    });
    expect(res.status).toBe(200);
    const rows = extractRows(res.data);
    expect(rows.length).toBeGreaterThan(0);
    const val = (rows[0]['DESCRLOCAL'] ?? rows[0]['descrlocal'] ?? '') as string;
    expect(val).toBe(val.trim());
  });

  // Test 2: Trimming applies to ALL rows in an array result
  it('all rows in array result have trimmed CHAR fields', async () => {
    if (skip) return;
    const res = await client.post('/inspection/query', {
      query: 'SELECT TOP 10 CODLOCAL, DESCRLOCAL FROM TGFLOC ORDER BY CODLOCAL',
    });
    expect(res.status).toBe(200);
    const rows = extractRows(res.data);
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const val = (row['DESCRLOCAL'] ?? row['descrlocal'] ?? '') as string;
      expect(val).toBe(val.trim());
    }
  });

  // Test 3: Non-CHAR numeric fields preserved without corruption
  it('numeric fields (CODLOCAL) are preserved as-is after trimming pass', async () => {
    if (skip) return;
    const res = await client.post('/inspection/query', {
      query: 'SELECT TOP 5 CODLOCAL, ANALITICO FROM TGFLOC ORDER BY CODLOCAL',
    });
    expect(res.status).toBe(200);
    const rows = extractRows(res.data);
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const codlocal = row['CODLOCAL'] ?? row['codlocal'];
      expect(codlocal).not.toBeUndefined();
    }
  });
});

describe('PERF-01: HTTP compression (Brotli / gzip)', () => {
  // Test 4: Brotli header accepted — either br applied or no encoding (small body)
  it('Accept-Encoding: br is accepted without error (Content-Encoding br or absent)', async () => {
    const res = await axios.get(`${BASE}/health`, {
      headers: { 'Accept-Encoding': 'br' },
      decompress: false,
      validateStatus: () => true,
      responseType: 'arraybuffer',
    });
    expect(res.status).toBe(200);
    const encoding = (res.headers['content-encoding'] ?? '') as string;
    expect(['br', '']).toContain(encoding);
  });

  // Test 5: gzip applied to large (>1KB) response
  it('large response with Accept-Encoding: gzip returns Content-Encoding: gzip', async () => {
    if (!process.env.TEST_USERNAME || !process.env.TEST_PASSWORD) {
      console.warn('Skipping gzip test — credentials not set');
      return;
    }
    const plainClient = createClient(true);
    const t = await getToken(plainClient);
    const res = await axios.post(
      `${BASE}/inspection/query`,
      { query: 'SELECT TOP 100 CODLOCAL, DESCRLOCAL, ANALITICO, CODLOCALPAI FROM TGFLOC ORDER BY CODLOCAL' },
      {
        headers: {
          Authorization: `Bearer ${t}`,
          'X-Database': TEST_DB,
          'Accept-Encoding': 'gzip',
          'Content-Type': 'application/json',
        },
        decompress: false,
        validateStatus: () => true,
        responseType: 'arraybuffer',
      },
    );
    expect(res.status).toBe(200);
    expect(res.headers['content-encoding']).toBe('gzip');
  });

  // Test 6: Small response (<1KB) is NOT compressed
  it('small response (below 1KB threshold) is NOT compressed', async () => {
    const res = await axios.get(`${BASE}/health`, {
      headers: { 'Accept-Encoding': 'gzip, br' },
      decompress: false,
      validateStatus: () => true,
      responseType: 'arraybuffer',
    });
    expect(res.status).toBe(200);
    const encoding = (res.headers['content-encoding'] ?? '') as string;
    expect(encoding).not.toBe('gzip');
    expect(encoding).not.toBe('br');
  });
});
