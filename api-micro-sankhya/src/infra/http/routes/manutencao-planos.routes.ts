import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ManutencaoPlanosService } from '../../../domain/services/manutencao-planos.service';
import { ManutencaoProdutividadeService } from '../../../domain/services/manutencao-produtividade.service';
import { NotFoundError } from '../../../domain/errors';

const produtividadeSchema = z.object({
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

const aderenciaSchema = z.object({
  situacao: z.enum(['ATRASADA', 'PROXIMA', 'EM_DIA', 'SEM_HISTORICO']).optional(),
  codveiculo: z.coerce.number().optional(),
});

const codusuexecSchema = z.object({
  codusuexec: z.coerce.number(),
});

/**
 * Rotas de Planos de Manutenção e Produtividade (/man/planos e /man/tecnicos)
 */
export async function manutencaoPlanosRoutes(app: FastifyInstance) {
  const planosService = new ManutencaoPlanosService();
  const produtividadeService = new ManutencaoProdutividadeService();

  // === Planos de Manutenção Preventiva ===
  app.get('/man/planos', async () => planosService.listarPlanos());

  app.get('/man/planos/aderencia', async (request) => {
    const filtros = aderenciaSchema.parse(request.query);
    return planosService.getAderencia(filtros);
  });

  app.get('/man/planos/atrasadas', async () => planosService.getAtrasadas());

  app.get('/man/planos/resumo', async () => planosService.getResumoAderencia());

  // === Produtividade de Técnicos ===
  app.get('/man/tecnicos/produtividade', async (request) => {
    const filtros = produtividadeSchema.parse(request.query);
    return produtividadeService.getProdutividadeTecnicos(filtros);
  });

  app.get('/man/tecnicos/:codusuexec/produtividade', async (request) => {
    const { codusuexec } = codusuexecSchema.parse(request.params);
    const prod = await produtividadeService.getProdutividadePorTecnico(codusuexec);
    if (!prod) throw new NotFoundError('Tecnico nao encontrado ou sem dados de produtividade');
    return prod;
  });
}
