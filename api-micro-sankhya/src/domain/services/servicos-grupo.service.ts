import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  ServicoGrupo,
  ServicoItem,
  ArvoreGrupo,
} from '../../types/servico-grupo';
import * as Q from '../../sql-queries/TGFPRO/get-grupo-hierarquia';
import * as QCrud from '../../sql-queries/TGFPRO/crud-grupo-servico';
import { cache } from '../../shared/cache/memory-cache';
import { cacheKey } from '../../shared/cache/cache-keys';
import { CACHE_TTL } from '../../shared/cache/cache-ttl';

export class ServicosGrupoService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async getGrupos(): Promise<ServicoGrupo[]> {
    const key = cacheKey('servicos-grupo:grupos');
    const cached = cache.get<ServicoGrupo[]>(key);
    if (cached) return cached;

    const rows = await this.queryExecutor.executeQuery<Record<string, unknown>>(Q.getGruposHierarquia);
    const mapped = rows.map((r) => ({
      codGrupoProd: r.CODGRUPOPROD as number,
      descrGrupoProd: (r.DESCRGRUPOPROD as string) || '',
      codGrupoPai: r.CODGRUPAI as number | null,
      grau: r.GRAU as number,
      analitico: (r.ANALITICO as string) || 'N',
    }));
    cache.set(key, mapped, CACHE_TTL.FILTERS);
    return mapped;
  }

  async getServicosPorGrupo(codGrupoProd: number): Promise<ServicoItem[]> {
    const key = cacheKey('servicos-grupo:servicos', { codGrupoProd });
    const cached = cache.get<ServicoItem[]>(key);
    if (cached) return cached;

    const sql = Q.getServicosPorGrupo.replace(
      /@CODGRUPOPROD/g,
      codGrupoProd.toString(),
    );
    const rows = await this.queryExecutor.executeQuery<Record<string, unknown>>(sql);
    const mapped = rows.map((r) => ({
      codProd: r.CODPROD as number,
      descrProd: (r.DESCRPROD as string) || '',
      codGrupoProd: r.CODGRUPOPROD as number,
      utilizacoes: Number(r.UTILIZACOES) || 0,
    }));
    cache.set(key, mapped, CACHE_TTL.FILTERS);
    return mapped;
  }

  async getArvoreCompleta(): Promise<ArvoreGrupo[]> {
    const key = cacheKey('servicos-grupo:arvore-completa');
    const cached = cache.get<ArvoreGrupo[]>(key);
    if (cached) return cached;

    const [grupos, servicos] = await Promise.all([
      this.getGrupos(),
      this.getTodosServicosComGrupo(),
    ]);

    const servicosMap = new Map<number, ServicoItem[]>();
    for (const servico of servicos) {
      const existing = servicosMap.get(servico.codGrupoProd) || [];
      existing.push(servico);
      servicosMap.set(servico.codGrupoProd, existing);
    }

    const buildTree = (codPai: number | null): ArvoreGrupo[] => {
      return grupos
        .filter((g) => {
          if (codPai === null) {
            return g.codGrupoPai === null || g.codGrupoPai === -999999999;
          }
          return g.codGrupoPai === codPai;
        })
        .map((g) => ({
          codGrupoProd: g.codGrupoProd,
          descrGrupoProd: g.descrGrupoProd,
          codGrupoPai: g.codGrupoPai,
          grau: g.grau,
          children: buildTree(g.codGrupoProd),
          servicos: servicosMap.get(g.codGrupoProd) || [],
        }));
    };

    const tree = buildTree(null);
    cache.set(key, tree, CACHE_TTL.FILTERS);
    return tree;
  }

  private async getTodosServicosComGrupo(): Promise<ServicoItem[]> {
    const rows = await this.queryExecutor.executeQuery<Record<string, unknown>>(Q.getTodosServicosComGrupo);
    return rows.map((r) => ({
      codProd: r.CODPROD as number,
      descrProd: (r.DESCRPROD as string) || '',
      codGrupoProd: r.CODGRUPOPROD as number,
      utilizacoes: Number(r.UTILIZACOES) || 0,
    }));
  }

  async getGruposTodos(): Promise<ServicoGrupo[]> {
    const key = cacheKey('servicos-grupo:grupos-todos');
    const cached = cache.get<ServicoGrupo[]>(key);
    if (cached) return cached;

    const rows = await this.queryExecutor.executeQuery<Record<string, unknown>>(QCrud.getGruposTodos);
    const mapped = rows.map((r) => ({
      codGrupoProd: r.CODGRUPOPROD as number,
      descrGrupoProd: (r.DESCRGRUPOPROD as string) || '',
      codGrupoPai: r.CODGRUPAI as number | null,
      grau: r.GRAU as number,
      analitico: (r.ANALITICO as string) || 'N',
      ativo: (r.ATIVO as string) || 'S',
    }));
    cache.set(key, mapped, CACHE_TTL.FILTERS);
    return mapped;
  }

  async getArvoreCompletaTodos(): Promise<ArvoreGrupo[]> {
    const key = cacheKey('servicos-grupo:arvore-completa-todos');
    const cached = cache.get<ArvoreGrupo[]>(key);
    if (cached) return cached;

    const [grupos, servicos] = await Promise.all([
      this.getGruposTodos(),
      this.getTodosServicosComGrupoTodos(),
    ]);

    const servicosMap = new Map<number, ServicoItem[]>();
    for (const servico of servicos) {
      const existing = servicosMap.get(servico.codGrupoProd) || [];
      existing.push(servico);
      servicosMap.set(servico.codGrupoProd, existing);
    }

    const buildTree = (codPai: number | null): ArvoreGrupo[] => {
      return grupos
        .filter((g) => {
          if (codPai === null) {
            return g.codGrupoPai === null || g.codGrupoPai === -999999999;
          }
          return g.codGrupoPai === codPai;
        })
        .map((g) => ({
          codGrupoProd: g.codGrupoProd,
          descrGrupoProd: g.descrGrupoProd,
          codGrupoPai: g.codGrupoPai,
          grau: g.grau,
          ativo: (g as unknown as { ativo: string }).ativo,
          children: buildTree(g.codGrupoProd),
          servicos: servicosMap.get(g.codGrupoProd) || [],
        }));
    };

    const tree = buildTree(null);
    cache.set(key, tree, CACHE_TTL.FILTERS);
    return tree;
  }

  private async getTodosServicosComGrupoTodos(): Promise<ServicoItem[]> {
    const rows = await this.queryExecutor.executeQuery<Record<string, unknown>>(QCrud.getTodosServicosComGrupoTodos);
    return rows.map((r) => ({
      codProd: r.CODPROD as number,
      descrProd: (r.DESCRPROD as string) || '',
      codGrupoProd: r.CODGRUPOPROD as number,
      utilizacoes: Number(r.UTILIZACOES) || 0,
      ativo: (r.ATIVO as string) || 'S',
    }));
  }
}
