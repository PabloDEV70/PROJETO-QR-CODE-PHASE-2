import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { RhRequisicoesService } from '../../../domain/services/rh-requisicoes.service';
import { RhRequisicoesResumoService } from '../../../domain/services/rh-requisicoes-resumo.service';
import { RhFeriasService } from '../../../domain/services/rh-ferias.service';
import { RhOcorrenciasService } from '../../../domain/services/rh-ocorrencias.service';
import { RhDashboardService } from '../../../domain/services/rh-dashboard.service';
import { NotFoundError } from '../../../domain/errors';

const dashboardSchema = z.object({
  codemp: z.coerce.number().optional(),
  coddep: z.coerce.number().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

const listarRequisicoesSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  origemTipo: z.string().optional(),
  status: z.coerce.number().optional(),
  codemp: z.coerce.number().optional(),
  codfunc: z.coerce.number().optional(),
  coddep: z.coerce.number().optional(),
  codcargo: z.coerce.number().optional(),
  codfuncao: z.coerce.number().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  termo: z.string().optional(),
  orderBy: z.enum(['dtCriacao', 'status', 'origemTipo', 'nomeFuncionario']).optional(),
  orderDir: z.enum(['ASC', 'DESC']).optional(),
});

const idSchema = z.object({
  id: z.coerce.number(),
});

const filterSchema = z.object({
  codemp: z.coerce.number().optional(),
  coddep: z.coerce.number().optional(),
});

const feriasProximasSchema = z.object({
  dias: z.coerce.number().optional(),
  codemp: z.coerce.number().optional(),
  coddep: z.coerce.number().optional(),
});

export async function rhRoutes(app: FastifyInstance) {
  const requisicaoService = new RhRequisicoesService();
  const resumoService = new RhRequisicoesResumoService();
  const feriasService = new RhFeriasService();
  const ocorrenciasService = new RhOcorrenciasService();
  const dashboardService = new RhDashboardService();

  app.get('/rh/dashboard', async (request) => {
    const params = dashboardSchema.parse(request.query);
    return dashboardService.getDashboard(params);
  });

  app.get('/rh/requisicoes', async (request) => {
    const params = listarRequisicoesSchema.parse(request.query);
    return requisicaoService.listar(params);
  });

  app.get('/rh/requisicoes/resumo', async (request) => {
    const params = dashboardSchema.parse(request.query);
    return resumoService.getResumo(params);
  });

  app.get('/rh/requisicoes/:id', async (request) => {
    const { id } = idSchema.parse(request.params);
    const requisicao = await requisicaoService.getById(id);
    if (!requisicao) throw new NotFoundError('Requisição não encontrada');
    return requisicao;
  });

  app.get('/rh/ferias/atuais', async (request) => {
    const params = filterSchema.parse(request.query);
    return feriasService.getFeriasAtuais(params);
  });

  app.get('/rh/ferias/proximas', async (request) => {
    const params = feriasProximasSchema.parse(request.query);
    return feriasService.getFeriasProximas(params.dias, params);
  });

  app.get('/rh/ferias/resumo', async () => {
    return feriasService.getResumo();
  });

  app.get('/rh/ocorrencias/ativas', async (request) => {
    const params = filterSchema.parse(request.query);
    return ocorrenciasService.getOcorrenciasAtivas(params);
  });

  app.get('/rh/ocorrencias/resumo', async (request) => {
    const params = filterSchema.parse(request.query);
    return ocorrenciasService.getResumo(params);
  });
}
