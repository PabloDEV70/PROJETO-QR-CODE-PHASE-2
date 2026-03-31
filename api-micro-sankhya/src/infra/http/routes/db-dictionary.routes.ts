import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { DbDictionaryService } from '../../../domain/services/db-dictionary.service';

export async function dbDictionaryRoutes(app: FastifyInstance) {
  const service = new DbDictionaryService();

  app.get('/db/dictionary/tables', async () => {
    return service.getTables();
  });

  app.get('/db/dictionary/tables/:tableName/fields', async (request) => {
    const { tableName } = z.object({ tableName: z.string() }).parse(request.params);
    return service.getTableFields(tableName);
  });

  app.get('/db/dictionary/search/:term', async (request) => {
    const { term } = z.object({ term: z.string().min(1) }).parse(request.params);
    return service.search(term);
  });
}
