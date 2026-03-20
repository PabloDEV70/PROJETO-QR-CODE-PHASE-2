import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { HorasEsperadasService } from '../../../domain/services/horas-esperadas.service';
import { ValidationError } from '../../../domain/errors';

const horasEsperadasSchema = z.object({
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  coddep: z.string().optional(),
  codemp: z.string().optional(),
  codparc: z.string().optional(),
});

export async function horasEsperadasRoutes(app: FastifyInstance) {
  const service = new HorasEsperadasService();

  app.get('/rdo/analytics/horas-esperadas', async (request) => {
    const parsed = horasEsperadasSchema.safeParse(request.query);
    if (!parsed.success) {
      throw new ValidationError(
        'dataInicio and dataFim are required (YYYY-MM-DD)',
        parsed.error.flatten(),
      );
    }
    return service.getHorasEsperadas(parsed.data);
  });
}
