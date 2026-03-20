import { FastifyInstance } from 'fastify';
import {
  VALID_DATABASES,
  enterDatabase,
  enterUserToken,
  enterUserInfo,
  decodeJwtPayload,
} from '@/infra/api-mother/database-context';

export async function registerContext(app: FastifyInstance): Promise<void> {
  app.addHook('onRequest', async (request) => {
    const header = request.headers['x-database-selection'] as string | undefined;
    const db = header && VALID_DATABASES.includes(header as any)
      ? (header as 'PROD' | 'TESTE' | 'TREINA')
      : 'PROD';
    enterDatabase(db);

    const auth = request.headers.authorization;
    let token: string | undefined;

    if (auth?.startsWith('Bearer ')) {
      token = auth.slice(7);
    } else if ((request.query as Record<string, string>)?.token) {
      token = (request.query as Record<string, string>).token;
    }

    if (token) {
      enterUserToken(token);
      const payload = decodeJwtPayload(token);
      if (payload) {
        enterUserInfo({
          codusu: typeof payload.sub === 'number' ? payload.sub : Number(payload.sub) || null,
          username: (payload.idusu as string) ?? (payload.username as string) ?? null,
        });
      }
    }
  });
}
