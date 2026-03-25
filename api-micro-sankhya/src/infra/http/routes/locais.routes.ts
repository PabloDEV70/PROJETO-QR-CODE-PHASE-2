import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { LocaisService } from '../../../domain/services/locais.service';
import { enterUserToken } from '../../api-mother/database-context';

const codLocalSchema = z.object({ codLocal: z.coerce.number() });
const codProdSchema = z.object({ codProd: z.coerce.number() });

export async function locaisRoutes(app: FastifyInstance) {
  const service = new LocaisService();

  app.get('/locais/arvore', async () => {
    return service.getArvoreCompleta();
  });

  app.get('/locais', async () => {
    return service.getLocais();
  });

  app.get('/locais/:codLocal/estoque', async (request) => {
    const { codLocal } = codLocalSchema.parse(request.params);
    return service.getEstoquePorLocal(codLocal);
  });

  app.get('/produtos/:codProd/imagem', async (request, reply) => {
    // Garantir que o token do usuario esta no contexto (pode vir via ?token= query param)
    const auth = request.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      enterUserToken(auth.slice(7));
    }
    const { codProd } = codProdSchema.parse(request.params);
    const base64 = await service.getProdutoImagem(codProd);
    if (!base64) {
      reply.code(404);
      return { message: `Imagem nao encontrada para produto ${codProd}` };
    }
    const buf = Buffer.from(base64, 'base64');
    return reply
      .type('image/jpeg')
      .header('Cache-Control', 'public, max-age=3600')
      .send(buf);
  });

  app.get('/produtos/:codProd/veiculos', async (request) => {
    const { codProd } = codProdSchema.parse(request.params);
    return service.getVeiculosPorProduto(codProd);
  });

  app.get('/produtos/:codProd/detalhes', async (request, reply) => {
    const { codProd } = codProdSchema.parse(request.params);
    const detalhes = await service.getProdutoDetalhes(codProd);
    if (!detalhes) {
      reply.code(404);
      return { message: `Produto ${codProd} nao encontrado` };
    }
    return detalhes;
  });
}
