import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { DbTablesService } from '../../../domain/services/db-tables.service';
import { adminGuard } from '../plugins/admin-guard';

const tableNameSchema = z.object({
  tableName: z.string().min(1),
});

export async function dbTablesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', adminGuard);
  const service = new DbTablesService();

  app.get('/db/tables', async () => {
    return service.getTables();
  });

  app.get('/db/tables/resumo', async () => {
    return service.getResumo();
  });

  app.get('/db/tables/:tableName/schema', async (request) => {
    const { tableName } = tableNameSchema.parse(request.params);
    return service.getTableSchema(tableName);
  });

  app.get('/db/tables/:tableName/keys', async (request) => {
    const { tableName } = tableNameSchema.parse(request.params);
    return service.getTableKeys(tableName);
  });

  app.get('/db/tables/:tableName/relations', async (request) => {
    const { tableName } = tableNameSchema.parse(request.params);
    return service.getTableRelations(tableName);
  });
}
