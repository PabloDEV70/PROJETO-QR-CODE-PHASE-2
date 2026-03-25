import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { FuncionariosService } from '../../../domain/services/funcionarios.service';
import { FuncionariosListaService } from '../../../domain/services/funcionarios-lista.service';
import { FuncionarioPerfilService } from '../../../domain/services/funcionario-perfil.service';
import { FuncionariosResumoService } from '../../../domain/services/funcionarios-resumo.service';
import { FuncionarioPerfilSuperService } from '../../../domain/services/funcionario-perfil-super.service';
import { FuncionariosFiltrosService } from '../../../domain/services/funcionarios-filtros.service';
import { FuncionarioCardService } from '../../../domain/services/funcionario-card.service';
import { NotFoundError } from '../../../domain/errors';
import { enterUserToken } from '../../api-mother/database-context';

const codparcSchema = z.object({
  codparc: z.coerce.number(),
});

const vinculoSchema = z.object({
  codemp: z.coerce.number(),
  codfunc: z.coerce.number(),
});

const codcargahorSchema = z.object({
  codcargahor: z.coerce.number(),
});

const buscaSchema = z.object({
  q: z.string().min(1).max(100),
});

const listarSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  situacao: z.string().optional(),
  codemp: z.coerce.number().optional(),
  coddep: z.coerce.number().optional(),
  codcargo: z.coerce.number().optional(),
  codfuncao: z.coerce.number().optional(),
  termo: z.string().optional(),
  comUsuario: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  temFoto: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  orderBy: z.enum([
    'nomeparc', 'codparc', 'cargo', 'departamento', 'dtadm', 'idade', 'diasNaEmpresa',
  ]).optional(),
  orderDir: z.enum(['ASC', 'DESC']).optional(),
});

export async function funcionariosRoutes(app: FastifyInstance) {
  const funcionariosService = new FuncionariosService();
  const listaService = new FuncionariosListaService();
  const perfilService = new FuncionarioPerfilService();
  const resumoService = new FuncionariosResumoService();
  const perfilSuperService = new FuncionarioPerfilSuperService();
  const filtrosService = new FuncionariosFiltrosService();
  const cardService = new FuncionarioCardService();

  // Resumo para dashboard (totais por situação, empresa, departamento)
  app.get('/funcionarios/resumo', async () => {
    return resumoService.getResumo();
  });

  // Lista funcionários com paginação e filtros
  app.get('/funcionarios/listar', async (request) => {
    const params = listarSchema.parse(request.query);
    return listaService.listar(params);
  });

  // Busca funcionários por nome ou código
  app.get('/funcionarios/buscar', async (request) => {
    const { q } = buscaSchema.parse(request.query);
    return funcionariosService.buscar(q);
  });

  app.get('/funcionarios/parceiro/:codparc/vinculos', async (request, reply) => {
    const { codparc } = codparcSchema.parse(request.params);
    return funcionariosService.getVinculos(codparc);
  });

  app.get('/funcionarios/parceiro/:codparc/historico', async (request, reply) => {
    const { codparc } = codparcSchema.parse(request.params);
    return funcionariosService.getHistorico(codparc);
  });

  app.get('/funcionarios/carga-horaria/:codcargahor', async (request, reply) => {
    const { codcargahor } = codcargahorSchema.parse(request.params);
    return funcionariosService.getCargaHoraria(codcargahor);
  });

  // Opções para dropdowns de filtros
  app.get('/funcionarios/filtros-opcoes', async () => {
    return filtrosService.getOpcoesFiltros();
  });

  // Card publico do funcionario (SEM autenticacao - pattern no auth-guard)
  app.get('/funcionarios/card/:codemp/:codfunc', async (request, reply) => {
    const { codemp, codfunc } = vinculoSchema.parse(request.params);
    const card = await cardService.getCardPublico(codemp, codfunc);
    if (!card) throw new NotFoundError('Funcionario nao encontrado');
    return reply
      .header('Cache-Control', 'public, max-age=300')
      .send({ data: card });
  });

  // Perfil super enriquecido - com gestor, centro resultado e salario
  app.get('/funcionarios/:codparc/perfil-super', async (request) => {
    const { codparc } = codparcSchema.parse(request.params);
    const perfil = await perfilSuperService.getPerfilSuper(codparc);
    if (!perfil) throw new NotFoundError('Parceiro não encontrado');
    return perfil;
  });

  // Perfil enriquecido - funciona para QUALQUER situação (ativo, demitido, etc.)
  app.get('/funcionarios/:codparc/perfil-enriquecido', async (request) => {
    const { codparc } = codparcSchema.parse(request.params);
    const perfil = await perfilService.getPerfilEnriquecido(codparc);
    if (!perfil) throw new NotFoundError('Parceiro não encontrado');
    return perfil;
  });

  // Foto do funcionário (com cache em memória para evitar queries repetidas)
  const fotoCache = new Map<number, { buf: Buffer | null; ts: number }>();
  const FOTO_TTL = 5 * 60 * 1000; // 5min

  app.get('/funcionarios/:codparc/foto', async (request, reply) => {
    const auth = request.headers.authorization;
    if (auth?.startsWith('Bearer ')) enterUserToken(auth.slice(7));
    const { codparc } = codparcSchema.parse(request.params);

    const cached = fotoCache.get(codparc);
    if (cached && Date.now() - cached.ts < FOTO_TTL) {
      if (!cached.buf) throw new NotFoundError('Foto não encontrada para este funcionário');
      return reply
        .type('image/jpeg')
        .header('Cache-Control', 'public, max-age=3600')
        .send(cached.buf);
    }

    let buf: Buffer | null = null;
    try {
      const foto = await funcionariosService.getFoto(codparc);
      buf = foto ? Buffer.from(foto.imagem) : null;
    } catch {
      // Query failure (API Mother error, VARBINARY issue, etc.)
      buf = null;
    }
    fotoCache.set(codparc, { buf, ts: Date.now() });

    if (!buf) throw new NotFoundError('Foto não encontrada para este funcionário');
    return reply
      .type('image/jpeg')
      .header('Cache-Control', 'public, max-age=3600')
      .send(buf);
  });

  // Foto do funcionário por CODEMP+CODFUNC (para quando não tem CODPARC)
  app.get('/funcionarios/foto/:codemp/:codfunc', async (request, reply) => {
    const { codemp, codfunc } = vinculoSchema.parse(request.params);
    const foto = await funcionariosService.getFotoByCodfunc(codemp, codfunc);
    if (!foto) throw new NotFoundError('Foto não encontrada para este funcionário');

    return reply
      .type('image/jpeg')
      .header('Cache-Control', 'public, max-age=3600')
      .send(Buffer.from(foto.imagem));
  });

  // Verifica se tem foto (metadata only)
  app.get('/funcionarios/:codparc/foto/info', async (request) => {
    const { codparc } = codparcSchema.parse(request.params);
    const info = await funcionariosService.verificaFoto(codparc);
    if (!info) throw new NotFoundError('Funcionário não encontrado');
    return info;
  });
}
