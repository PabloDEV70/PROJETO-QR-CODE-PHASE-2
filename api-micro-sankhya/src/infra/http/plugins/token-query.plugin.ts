import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

/**
 * Allow passing a JWT via `?token=` for non-credentialed resources
 * (images, public widgets). This copies `token` query param into
 * the `Authorization` header so the existing auth guard works.
 *
 * Note: exposing tokens in querystrings is insecure in general —
 * this helper is intentionally narrow and should be used only in
 * development or for image endpoints. Keep logging minimal.
 */
export async function registerTokenQueryParam(app: FastifyInstance): Promise<void> {
  app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // If there's already an Authorization header, do nothing
      const auth = request.headers.authorization;
      if (auth && auth.startsWith('Bearer ')) return;

      // request.url includes path + query; parse to extract token
      const raw = (request.raw && (request.raw.url as string)) || request.url || '';
      const u = new URL(raw, 'http://localhost');
      const token = u.searchParams.get('token');
      if (!token) return;

      // Set header on the raw incoming message so downstream hooks see it
      (request.raw as any).headers = (request.raw as any).headers || {};
      (request.raw as any).headers.authorization = `Bearer ${token}`;

      // Also reflect on request.headers for convenience
      try { (request as any).headers.authorization = `Bearer ${token}`; } catch {}

      // Avoid logging token contents; do not reveal token in logs
    } catch (err) {
      // Non-fatal — don't block request if URL parsing fails
    }
  });
}

export default registerTokenQueryParam;
