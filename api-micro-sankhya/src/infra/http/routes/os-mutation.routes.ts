import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { OsMutationService } from '../../../domain/services/os-mutation.service';
import { extractUserToken } from '../../../shared/utils/extract-token';

const nuosSchema = z.object({
  nuos: z.coerce.number(),
});

const nuosSequenciaSchema = z.object({
  nuos: z.coerce.number(),
  sequencia: z.coerce.number(),
});

const createOsSchema = z.object({
  CODVEICULO: z.number(),
  MANUTENCAO: z.string(),
  TIPO: z.string(),
  CODPARC: z.number().nullable().optional(),
  CODMOTORISTA: z.number().nullable().optional(),
  PREVISAO: z.string().nullable().optional(),
  KM: z.number().nullable().optional(),
  HORIMETRO: z.number().nullable().optional(),
  NUPLANO: z.number().nullable().optional(),
  AD_STATUSGIG: z.string().nullable().optional(),
  CODEMP: z.number().nullable().optional(),
  CODCENCUS: z.number().nullable().optional(),
});

const updateOsSchema = z.object({
  CODVEICULO: z.number().optional(),
  CODPARC: z.number().nullable().optional(),
  CODMOTORISTA: z.number().nullable().optional(),
  MANUTENCAO: z.string().optional(),
  TIPO: z.string().optional(),
  PREVISAO: z.string().nullable().optional(),
  KM: z.number().nullable().optional(),
  HORIMETRO: z.number().nullable().optional(),
  NUPLANO: z.number().nullable().optional(),
  AD_STATUSGIG: z.string().nullable().optional(),
  AD_LOCALMANUTENCAO: z.string().nullable().optional(),
  AD_BLOQUEIOS: z.string().nullable().optional(),
  CODEMP: z.number().nullable().optional(),
});

const changeStatusSchema = z.object({
  STATUS: z.string(),
  AD_STATUSGIG: z.string().nullable().optional(),
});

const addServicoSchema = z.object({
  CODPROD: z.number(),
  QTD: z.number().nullable().optional(),
  VLRUNIT: z.number().nullable().optional(),
  VLRTOT: z.number().nullable().optional(),
  TEMPO: z.number().nullable().optional(),
  OBSERVACAO: z.string().nullable().optional(),
});

const updateServicoSchema = z.object({
  CODPROD: z.number().optional(),
  QTD: z.number().nullable().optional(),
  VLRUNIT: z.number().nullable().optional(),
  VLRTOT: z.number().nullable().optional(),
  TEMPO: z.number().nullable().optional(),
  OBSERVACAO: z.string().nullable().optional(),
});

export async function osMutationRoutes(app: FastifyInstance) {
  const service = new OsMutationService();

  app.post('/os-manutencao', async (request, reply) => {
    const body = createOsSchema.parse(request.body);
    const userToken = extractUserToken(request);
    reply.status(201);
    return service.createOs(body, userToken);
  });

  app.put('/os-manutencao/:nuos', async (request) => {
    const { nuos } = nuosSchema.parse(request.params);
    const body = updateOsSchema.parse(request.body);
    const userToken = extractUserToken(request);
    return service.updateOs(nuos, body, userToken);
  });

  app.patch('/os-manutencao/:nuos/status', async (request) => {
    const { nuos } = nuosSchema.parse(request.params);
    const body = changeStatusSchema.parse(request.body);
    const userToken = extractUserToken(request);
    return service.changeStatus(nuos, body, userToken);
  });

  app.patch('/os-manutencao/:nuos/finalizar', async (request) => {
    const { nuos } = nuosSchema.parse(request.params);
    const userToken = extractUserToken(request);
    return service.finalizeOs(nuos, userToken);
  });

  app.patch('/os-manutencao/:nuos/cancelar', async (request) => {
    const { nuos } = nuosSchema.parse(request.params);
    const userToken = extractUserToken(request);
    return service.cancelOs(nuos, userToken);
  });

  app.patch('/os-manutencao/:nuos/reabrir', async (request) => {
    const { nuos } = nuosSchema.parse(request.params);
    const userToken = extractUserToken(request);
    return service.reopenOs(nuos, userToken);
  });

  app.post('/os-manutencao/:nuos/servicos', async (request, reply) => {
    const { nuos } = nuosSchema.parse(request.params);
    const body = addServicoSchema.parse(request.body);
    const userToken = extractUserToken(request);
    reply.status(201);
    return service.addServico(nuos, body, userToken);
  });

  app.put('/os-manutencao/:nuos/servicos/:sequencia', async (request) => {
    const { nuos, sequencia } = nuosSequenciaSchema.parse(request.params);
    const body = updateServicoSchema.parse(request.body);
    const userToken = extractUserToken(request);
    return service.updateServico(nuos, sequencia, body, userToken);
  });

  app.delete('/os-manutencao/:nuos/servicos/:sequencia', async (request) => {
    const { nuos, sequencia } = nuosSequenciaSchema.parse(request.params);
    const userToken = extractUserToken(request);
    return service.deleteServico(nuos, sequencia, userToken);
  });
}
