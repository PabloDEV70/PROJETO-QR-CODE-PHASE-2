import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ApontamentoMutationService } from '../../../domain/services/apontamento-mutation.service';
import { extractUserToken } from '../../../shared/utils/extract-token';

const codigoSchema = z.object({
  codigo: z.coerce.number(),
});

const codigoSeqSchema = z.object({
  codigo: z.coerce.number(),
  seq: z.coerce.number(),
});

const tipoServicoEnum = z.enum(['S', 'N']).nullable().optional();

const createApontamentoSchema = z.object({
  CODVEICULO: z.number(),
  CODUSU: z.number(),
  KM: z.number().nullable().optional(),
  HORIMETRO: z.number().nullable().optional(),
  TAG: z.string().nullable().optional(),
  OBS: z.string().nullable().optional(),
  BORRCHARIA: tipoServicoEnum,
  ELETRICA: tipoServicoEnum,
  FUNILARIA: tipoServicoEnum,
  MECANICA: tipoServicoEnum,
  CALDEIRARIA: tipoServicoEnum,
  OSEXTERNA: tipoServicoEnum,
  OPEXTERNO: z.string().nullable().optional(),
  DTPROGRAMACAO: z.string().nullable().optional(),
});

const updateApontamentoSchema = z.object({
  CODVEICULO: z.number().optional(),
  KM: z.number().nullable().optional(),
  HORIMETRO: z.number().nullable().optional(),
  TAG: z.string().nullable().optional(),
  OBS: z.string().nullable().optional(),
  BORRCHARIA: tipoServicoEnum,
  ELETRICA: tipoServicoEnum,
  FUNILARIA: tipoServicoEnum,
  MECANICA: tipoServicoEnum,
  CALDEIRARIA: tipoServicoEnum,
  OSEXTERNA: tipoServicoEnum,
  OPEXTERNO: z.string().nullable().optional(),
  DTPROGRAMACAO: z.string().nullable().optional(),
});

const addServicoSchema = z.object({
  DESCRITIVO: z.string().nullable().optional(),
  CODPROD: z.number().nullable().optional(),
  QTD: z.number().nullable().optional(),
  GERAOS: z.string().nullable().optional(),
  HR: z.number().nullable().optional(),
  KM: z.number().nullable().optional(),
  DTPROGRAMACAO: z.string().nullable().optional(),
});

const updateServicoSchema = z.object({
  DESCRITIVO: z.string().nullable().optional(),
  CODPROD: z.number().nullable().optional(),
  QTD: z.number().nullable().optional(),
  GERAOS: z.string().nullable().optional(),
  HR: z.number().nullable().optional(),
  KM: z.number().nullable().optional(),
  DTPROGRAMACAO: z.string().nullable().optional(),
});

export async function apontamentoMutationRoutes(app: FastifyInstance) {
  const service = new ApontamentoMutationService();

  app.post('/apontamentos', async (request, reply) => {
    const body = createApontamentoSchema.parse(request.body);
    const userToken = extractUserToken(request);
    reply.status(201);
    return service.createApontamento(body, userToken);
  });

  app.put('/apontamentos/:codigo', async (request) => {
    const { codigo } = codigoSchema.parse(request.params);
    const body = updateApontamentoSchema.parse(request.body);
    const userToken = extractUserToken(request);
    return service.updateApontamento(codigo, body, userToken);
  });

  app.delete('/apontamentos/:codigo', async (request) => {
    const { codigo } = codigoSchema.parse(request.params);
    const userToken = extractUserToken(request);
    return service.deleteApontamento(codigo, userToken);
  });

  app.post('/apontamentos/:codigo/servicos', async (request, reply) => {
    const { codigo } = codigoSchema.parse(request.params);
    const body = addServicoSchema.parse(request.body);
    const userToken = extractUserToken(request);
    reply.status(201);
    return service.addServico(codigo, body, userToken);
  });

  app.put('/apontamentos/:codigo/servicos/:seq', async (request) => {
    const { codigo, seq } = codigoSeqSchema.parse(request.params);
    const body = updateServicoSchema.parse(request.body);
    const userToken = extractUserToken(request);
    return service.updateServico(codigo, seq, body, userToken);
  });

  app.delete('/apontamentos/:codigo/servicos/:seq', async (request) => {
    const { codigo, seq } = codigoSeqSchema.parse(request.params);
    const userToken = extractUserToken(request);
    return service.deleteServico(codigo, seq, userToken);
  });
}
