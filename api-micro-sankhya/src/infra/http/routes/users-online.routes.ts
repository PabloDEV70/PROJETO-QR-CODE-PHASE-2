import { FastifyInstance } from 'fastify';
import { apiMotherClient } from '../../api-mother/client';

export async function usersOnlineRoutes(app: FastifyInstance) {
  app.get('/monitoring/users-online', async (request, reply) => {
    const database = (request.query as Record<string, string>).database ?? '';
    const params = database ? `?database=${database}` : '';
    const { data } = await apiMotherClient.get(`/monitoring/users-online${params}`);
    return data;
  });

  app.get('/monitoring/users-online/count', async (request, reply) => {
    const database = (request.query as Record<string, string>).database ?? '';
    const params = database ? `?database=${database}` : '';
    const { data } = await apiMotherClient.get(`/monitoring/users-online/count${params}`);
    return data;
  });
}
