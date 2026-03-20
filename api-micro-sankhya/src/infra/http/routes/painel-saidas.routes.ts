import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { painelSaidasStore } from '../../../domain/services/painel-saidas.service';

const operadorSchema = z.object({ codparc: z.number(), nome: z.string(), nomeusu: z.string().default('') });

const entrySchema = z.object({
  modelo: z.string().default(''),
  tag: z.string().default(''),
  placa: z.string(),
  specs: z.string().default(''),
  operadores: z.array(operadorSchema).default([]),
  contratante: z.string().default(''),
  local: z.string().default(''),
  previsao: z.string().default(''),
  status: z.enum(['FIXO', 'PARADA', 'MANUTENCAO', 'PROGRAMADO', 'DISPONIVEL']).default('FIXO'),
  updatedBy: z.string().nullable().default(null),
});

const updateSchema = entrySchema.partial();

export const painelSaidasRoutes = async (app: FastifyInstance) => {
  // SSE stream — real-time updates
  app.get('/painel-saidas/stream', async (request, reply) => {
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    // Send current state
    reply.raw.write(`event: reset\ndata: ${JSON.stringify(painelSaidasStore.list())}\n\n`);

    const send = (msg: string) => { reply.raw.write(msg); };
    painelSaidasStore.addClient(send);

    // Heartbeat every 15s
    const hb = setInterval(() => { reply.raw.write(': heartbeat\n\n'); }, 15_000);

    request.raw.on('close', () => {
      clearInterval(hb);
      painelSaidasStore.removeClient(send);
    });
  });

  // List all
  app.get('/painel-saidas', async () => {
    return { data: painelSaidasStore.list(), clients: painelSaidasStore.clientCount };
  });

  // Add entry
  app.post('/painel-saidas', async (request) => {
    const body = entrySchema.parse(request.body);
    const user = (request as any).userNome ?? 'unknown';
    return painelSaidasStore.add(body, user);
  });

  // Update entry
  app.put('/painel-saidas/:id', async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = updateSchema.parse(request.body);
    const user = (request as any).userNome ?? 'unknown';
    const result = painelSaidasStore.update(id, body, user);
    if (!result) throw { statusCode: 404, message: 'Entry not found' };
    return result;
  });

  // Delete entry
  app.delete('/painel-saidas/:id', async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const ok = painelSaidasStore.remove(id);
    if (!ok) throw { statusCode: 404, message: 'Entry not found' };
    return { ok: true };
  });
};
