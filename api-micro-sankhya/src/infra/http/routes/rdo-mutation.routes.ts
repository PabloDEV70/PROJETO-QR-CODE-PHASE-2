import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { RdoMutationService } from '../../../domain/services/rdo-mutation.service';
import { extractUserToken } from '../../../shared/utils/extract-token';

const codrdoSchema = z.object({
  codrdo: z.coerce.number(),
});

const codrdoItemSchema = z.object({
  codrdo: z.coerce.number(),
  item: z.coerce.number(),
});

const createRdoSchema = z.object({
  CODPARC: z.number(),
  DTREF: z.string(),
});

const updateRdoSchema = z.object({
  DTREF: z.string().optional(),
  CODPARC: z.number().optional(),
});

const addDetalheSchema = z.object({
  HRINI: z.number(),
  HRFIM: z.number(),
  RDOMOTIVOCOD: z.number(),
  NUOS: z.number().nullable().optional(),
  AD_SEQUENCIA_OS: z.number().nullable().optional(),
  CODVEICULO: z.number().nullable().optional(),
  OBS: z.string().nullable().optional(),
});

const updateDetalheSchema = z.object({
  HRINI: z.number().optional(),
  HRFIM: z.number().optional(),
  RDOMOTIVOCOD: z.number().optional(),
  NUOS: z.number().nullable().optional(),
  AD_SEQUENCIA_OS: z.number().nullable().optional(),
  CODVEICULO: z.number().nullable().optional(),
  OBS: z.string().nullable().optional(),
});

export async function rdoMutationRoutes(app: FastifyInstance) {
  const service = new RdoMutationService();

  app.post('/rdo', async (request, reply) => {
    const body = createRdoSchema.parse(request.body);
    const userToken = extractUserToken(request);
    reply.status(201);
    return service.createRdo(body, userToken);
  });

  app.put('/rdo/:codrdo', async (request) => {
    const { codrdo } = codrdoSchema.parse(request.params);
    const body = updateRdoSchema.parse(request.body);
    const userToken = extractUserToken(request);
    return service.updateRdo(codrdo, body, userToken);
  });

  app.delete('/rdo/:codrdo', async (request) => {
    const { codrdo } = codrdoSchema.parse(request.params);
    const userToken = extractUserToken(request);
    return service.deleteRdo(codrdo, userToken);
  });

  app.post('/rdo/:codrdo/detalhes', async (request, reply) => {
    const { codrdo } = codrdoSchema.parse(request.params);
    const body = addDetalheSchema.parse(request.body);
    const userToken = extractUserToken(request);
    reply.status(201);
    return service.addDetalhe(codrdo, body, userToken);
  });

  app.put('/rdo/:codrdo/detalhes/:item', async (request) => {
    const { codrdo, item } = codrdoItemSchema.parse(request.params);
    const body = updateDetalheSchema.parse(request.body);
    const userToken = extractUserToken(request);
    return service.updateDetalhe(codrdo, item, body, userToken);
  });

  app.delete('/rdo/:codrdo/detalhes/:item', async (request) => {
    const { codrdo, item } = codrdoItemSchema.parse(request.params);
    const userToken = extractUserToken(request);
    return service.deleteDetalhe(codrdo, item, userToken);
  });
}
