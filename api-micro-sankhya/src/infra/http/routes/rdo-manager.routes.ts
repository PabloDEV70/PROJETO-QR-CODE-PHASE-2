import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { RdoFiltrosService } from '../../../domain/services/rdo-filtros.service';
import { RdoManagerAnalyticsService } from '../../../domain/services/rdo-manager-analytics.service';

const periodSchema = z.object({
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

const analyticsSchema = z.object({
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  codparc: z.string().optional(),
  coddep: z.string().optional(),
  codcargo: z.string().optional(),
  codfuncao: z.string().optional(),
  codemp: z.string().optional(),
});

export async function rdoManagerRoutes(app: FastifyInstance) {
  const filtrosService = new RdoFiltrosService();
  const managerService = new RdoManagerAnalyticsService();

  app.get('/rdo/analytics/filtros-opcoes', async (request) => {
    const options = periodSchema.parse(request.query);
    return filtrosService.getOpcoesFiltros(options);
  });

  app.get('/rdo/analytics/hora-extra', async (request) => {
    const options = analyticsSchema.parse(request.query);
    return managerService.getHoraExtra(options);
  });

  app.get('/rdo/analytics/assiduidade', async (request) => {
    const options = analyticsSchema.parse(request.query);
    return managerService.getAssiduidade(options);
  });
}
