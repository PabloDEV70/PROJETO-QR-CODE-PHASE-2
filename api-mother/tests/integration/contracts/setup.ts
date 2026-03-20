import axios, { AxiosInstance } from 'axios';

/** Database header constant — NEVER use 'PROD' in integration tests. */
export const TEST_DB = 'TESTE';

/**
 * Creates an Axios client targeting the gateway.
 *
 * @param validateStatus - When true, axios will not throw on 4xx/5xx responses.
 *   Use this when testing error responses so you can inspect the body.
 */
export function createClient(validateStatus = false): AxiosInstance {
  return axios.create({
    baseURL: process.env.GATEWAY_URL || 'http://localhost:3027',
    timeout: 15000,
    ...(validateStatus ? { validateStatus: () => true } : {}),
  });
}

/**
 * Logs in to the gateway and returns a Bearer token.
 * Reads credentials from TEST_USERNAME and TEST_PASSWORD environment variables.
 *
 * @throws Error with a clear message if login fails.
 */
export async function getToken(client: AxiosInstance): Promise<string> {
  const username = process.env.TEST_USERNAME;
  const password = process.env.TEST_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'Missing credentials: set TEST_USERNAME and TEST_PASSWORD environment variables before running integration tests.',
    );
  }

  const res = await client.post('/auth/login', { username, password });

  const token: string | undefined = res.data?.data?.access_token;

  if (!token) {
    throw new Error(
      `Login failed (HTTP ${res.status}). Response: ${JSON.stringify(res.data)}`,
    );
  }

  return token;
}
