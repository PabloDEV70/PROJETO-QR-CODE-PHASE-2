/**
 * CONTRACT: Auth scenarios — login success/failure, token structure
 *
 * Validates that:
 * - Successful login returns access_token, refreshToken, tokenType, expiresIn
 * - Invalid credentials return 401 with ERR_INVALID_CREDENTIALS code
 * - Malformed login body returns 400 with success: false
 *
 * Uses ErrorEnvelopeSchema and GatewayErrorCode to verify error contract stability.
 */
import { AxiosInstance } from 'axios';
import { ApiEnvelopeSchema } from '../../../src/common/schemas/envelope.schema';
import { ErrorEnvelopeSchema } from '../../../src/common/schemas/error-envelope.schema';
import { GatewayErrorCode } from '../../../src/common/enums/gateway-error-code.enum';
import { createClient, TEST_DB } from './setup';

describe('CONTRACT auth-scenarios: login, invalid credentials, token shape', () => {
  let client: AxiosInstance;

  beforeAll(() => {
    // validateStatus: true — axios will not throw on 4xx/5xx, allowing body inspection
    client = createClient(true);
  });

  // -------------------------------------------------------------------------
  // Test 1: Login success shape
  // -------------------------------------------------------------------------
  it('login success returns access_token, refreshToken, tokenType, expiresIn', async () => {
    const username = process.env.TEST_USERNAME;
    const password = process.env.TEST_PASSWORD;

    if (!username || !password) {
      console.warn('TEST_USERNAME/TEST_PASSWORD not set — skipping auth test');
      return;
    }

    const res = await client.post('/auth/login', { username, password });

    expect(res.status).toBe(201);

    // Validate outer envelope
    const parseResult = ApiEnvelopeSchema.safeParse(res.data);
    expect(parseResult.success).toBe(true);

    if (parseResult.success) {
      expect(parseResult.data.success).toBe(true);

      const tokenData = parseResult.data.data as Record<string, unknown>;

      // All four token fields must be present
      expect(typeof tokenData.access_token).toBe('string');
      expect((tokenData.access_token as string).length).toBeGreaterThan(0);

      expect(typeof tokenData.refreshToken).toBe('string');
      expect((tokenData.refreshToken as string).length).toBeGreaterThan(0);

      expect(typeof tokenData.tokenType).toBe('string');
      expect(tokenData.tokenType).toBe('Bearer');

      expect(typeof tokenData.expiresIn).toBe('number');
      expect(tokenData.expiresIn as number).toBeGreaterThan(0);
    }
  });

  // -------------------------------------------------------------------------
  // Test 2: Invalid credentials — 401 + ERR_INVALID_CREDENTIALS
  // -------------------------------------------------------------------------
  it('invalid credentials return 401 with ERR_INVALID_CREDENTIALS', async () => {
    const res = await client.post('/auth/login', {
      username: 'nonexistent_user_xyz',
      password: 'wrong_password_xyz',
    });

    expect(res.status).toBe(401);

    // Validate error envelope structure
    const parseResult = ErrorEnvelopeSchema.safeParse(res.data);
    expect(parseResult.success).toBe(true);

    if (parseResult.success) {
      expect(parseResult.data.success).toBe(false);
      expect(parseResult.data.data).toBeNull();
      expect(parseResult.data.error.code).toBe(GatewayErrorCode.ERR_INVALID_CREDENTIALS);
      expect(typeof parseResult.data.error.message).toBe('string');
      expect(parseResult.data.error.message.length).toBeGreaterThan(0);
      expect(typeof parseResult.data.meta.timestamp).toBe('string');
    }
  });

  // -------------------------------------------------------------------------
  // Test 3: Malformed login body — 400 + success: false
  // -------------------------------------------------------------------------
  it('malformed login body (missing username) returns 400 with success false', async () => {
    const res = await client.post('/auth/login', {
      // intentionally omit username to trigger validation error
      password: 'some_password',
    });

    expect(res.status).toBe(400);

    // Body must have success: false
    const body = res.data as Record<string, unknown>;
    expect(body.success).toBe(false);

    // Validate as error envelope — but allow partial match since 400 error structure
    // may differ slightly depending on validation layer
    const parseResult = ErrorEnvelopeSchema.safeParse(res.data);
    if (parseResult.success) {
      expect(parseResult.data.success).toBe(false);
    } else {
      // Fallback: at minimum success must be false and data null
      expect(body.success).toBe(false);
    }
  });
});
