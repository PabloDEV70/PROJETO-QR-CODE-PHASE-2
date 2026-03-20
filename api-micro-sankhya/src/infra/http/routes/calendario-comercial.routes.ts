import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { CalendarioComercialService } from '../../../domain/services/calendario-comercial.service';
import { NotFoundError } from '../../../domain/errors';

const listSchema = z.object({
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  codVeiculo: z.coerce.number().optional(),
  status: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(200).default(50),
});

const idSchema = z.object({
  id: z.coerce.number(),
});

const veiculoSchema = z.object({
  codveiculo: z.coerce.number(),
});

const periodoSchema = z.object({
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

export async function calendarioComercialRoutes(app: FastifyInstance) {
  const service = new CalendarioComercialService();

  const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
  const defaultDates = () => {
    const now = new Date();
    const inicio = new Date(now);
    inicio.setDate(inicio.getDate() - 30);
    const fim = new Date(now);
    fim.setDate(fim.getDate() + 90);
    return { dataInicio: fmtDate(inicio), dataFim: fmtDate(fim) };
  };

  app.get('/calendario-comercial', async (request) => {
    const query = listSchema.parse(request.query);
    const defaults = defaultDates();
    return service.list({
      dataInicio: query.dataInicio || defaults.dataInicio,
      dataFim: query.dataFim || defaults.dataFim,
      codVeiculo: query.codVeiculo,
      status: query.status,
      page: query.page,
      limit: query.limit,
    });
  });

  app.get('/calendario-comercial/stats', async (request) => {
    const query = listSchema.parse(request.query);
    const defaults = defaultDates();
    return service.getStats({
      dataInicio: query.dataInicio || defaults.dataInicio,
      dataFim: query.dataFim || defaults.dataFim,
      codVeiculo: query.codVeiculo,
      status: query.status,
    });
  });

  app.get('/calendario-comercial/veiculo/:codveiculo', async (request) => {
    const { codveiculo } = veiculoSchema.parse(request.params);
    const query = periodoSchema.parse(request.query);
    const defaults = defaultDates();
    return service.getByVeiculo(
      codveiculo,
      query.dataInicio || defaults.dataInicio,
      query.dataFim || defaults.dataFim,
    );
  });

  app.get('/calendario-comercial/:id', async (request) => {
    const { id } = idSchema.parse(request.params);
    const result = await service.getById(id);
    if (!result) throw new NotFoundError('Evento nao encontrado');
    return result;
  });
}
