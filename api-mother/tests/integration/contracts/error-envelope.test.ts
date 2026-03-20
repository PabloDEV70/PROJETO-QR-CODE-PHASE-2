import { AxiosInstance } from 'axios';
import { ErrorEnvelopeSchema } from '../../../src/common/schemas/error-envelope.schema';
import { GatewayErrorCode } from '../../../src/common/enums/gateway-error-code.enum';
import { createClient, getToken, TEST_DB } from './setup';

describe('Error Envelope Contract', () => {
  // Use validateStatus: true so axios does not throw on 4xx/5xx —
  // we inspect the response body directly.
  let client: AxiosInstance;

  // Auth client for tests that need a valid token first
  let authToken: string;

  beforeAll(async () => {
    client = createClient(true);

    // Obtain a valid token for the non-SELECT test (test 3)
    const authClient = createClient();
    authToken = await getToken(authClient);
  }, 30000);

  it('401 — invalid token produces ErrorEnvelopeSchema-compliant response with ERR_UNAUTHORIZED', async () => {
    const res = await client.get('/health', {
      headers: { Authorization: 'Bearer invalid_token_xyz' },
    });

    expect(res.status).toBe(401);

    const parsed = ErrorEnvelopeSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error('Zod errors:', JSON.stringify(parsed.error.issues, null, 2));
      console.error('Raw response:', JSON.stringify(res.data, null, 2));
    }
    expect(parsed.success).toBe(true);
    expect(res.data.error.code).toBe(GatewayErrorCode.ERR_UNAUTHORIZED);
    expect(res.data.data).toBeNull();
    expect(res.data.success).toBe(false);
  });

  it('401 — missing Authorization header produces ErrorEnvelopeSchema-compliant response', async () => {
    const res = await client.get('/inspection/tabelas', {
      headers: { 'X-Database': TEST_DB },
    });

    expect(res.status).toBe(401);

    const parsed = ErrorEnvelopeSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error('Zod errors:', JSON.stringify(parsed.error.issues, null, 2));
      console.error('Raw response:', JSON.stringify(res.data, null, 2));
    }
    expect(parsed.success).toBe(true);
  });

  it('400/403 — non-SELECT query produces ErrorEnvelopeSchema-compliant response with write-forbidden code', async () => {
    const res = await client.post(
      '/inspection/query',
      { query: 'DELETE FROM TGFPAR WHERE 1=0' },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-Database': TEST_DB,
        },
      },
    );

    expect([400, 403]).toContain(res.status);

    const parsed = ErrorEnvelopeSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error('Zod errors:', JSON.stringify(parsed.error.issues, null, 2));
      console.error('Raw response:', JSON.stringify(res.data, null, 2));
    }
    expect(parsed.success).toBe(true);

    const allowedCodes = [
      GatewayErrorCode.ERR_QUERY_NOT_SELECT,
      GatewayErrorCode.ERR_QUERY_FORBIDDEN_COMMAND,
      GatewayErrorCode.ERR_WRITE_FORBIDDEN,
    ];
    expect(allowedCodes).toContain(res.data.error.code);
  });
});
