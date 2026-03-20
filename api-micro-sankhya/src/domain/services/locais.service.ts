import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { escapeSqlString } from '../../shared/sql-sanitize';
import { logger } from '../../shared/logger';
import {
  LocalItem,
  EstoqueLocal,
  ArvoreLocal,
} from '../../types/local-produto';
import * as Q from '../../sql-queries/TGFLOC/get-local-hierarquia';
import {
  getProdutoDetalhes as prodDetalhesQuery,
  getProdutoImagem as prodImagemQuery,
} from '../../sql-queries/TGFPRO/get-produto-detalhes';
import { getVeiculosPorProduto } from '../../sql-queries/TGFPRO/get-veiculos-por-produto';
import { AnexosService } from './anexos.service';
import { cache } from '../../shared/cache/memory-cache';
import { cacheKey } from '../../shared/cache/cache-keys';
import { CACHE_TTL } from '../../shared/cache/cache-ttl';

export class LocaisService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async getLocais(): Promise<LocalItem[]> {
    const key = cacheKey('locais:locais');
    const cached = cache.get<LocalItem[]>(key);
    if (cached) return cached;

    try {
      logger.info('Executing getLocais query');
      const result = await this.queryExecutor
        .executeQuery<Record<string, unknown>>(Q.getLocaisHierarquia);
      
      logger.info({ rowCount: result.length }, 'Got locais result');

      if (!result || result.length === 0) {
        logger.warn('No locais found in database');
        return [];
      }

      const mapped = result.map((r) => ({
        codLocal: r.CODLOCAL as number,
        descrLocal: ((r.DESCRLOCAL as string) || '').trim(),
        codLocalPai: r.CODLOCALPAI as number,
        grau: r.GRAU as number,
        ativo: (r.ATIVO as string) || 'S',
        analitico: (r.ANALITICO as string) || 'S',
        totalProdutosEstoque: 0,
        codUsuario: (r.AD_CODUSU as number) || null,
        codparcUsuario: (r.USU_CODPARC as number) || null,
        nomeUsuario: ((r.NOMEUSU as string) || '').trim() || null,
      }));
      cache.set(key, mapped, CACHE_TTL.FILTERS);
      return mapped;
    } catch (err) {
      logger.error({ err }, 'Error fetching locais');
      throw err;
    }
  }

  async getEstoquePorLocal(codLocal: number): Promise<EstoqueLocal[]> {
    const key = cacheKey('locais:estoque', { codLocal });
    const cached = cache.get<EstoqueLocal[]>(key);
    if (cached) return cached;

    try {
      const sql = Q.getEstoquePorLocal.replace(
        /@CODLOCAL/g,
        codLocal.toString(),
      );
      const result = await this.queryExecutor
        .executeQuery<Record<string, unknown>>(sql);
      const mapped = result.map((r) => ({
        codProd: r.CODPROD as number,
        descrProd: ((r.DESCRPROD as string) || '').trim(),
        controle: ((r.CONTROLE as string) || '').trim(),
        estoque: Number(r.ESTOQUE) || 0,
        reservado: Number(r.RESERVADO) || 0,
        estMin: Number(r.ESTMIN) || 0,
        estMax: Number(r.ESTMAX) || 0,
        codGrupoProd: r.CODGRUPOPROD as number | undefined,
        descrGrupoProd: ((r.DESCRGRUPOPROD as string) || '').trim(),
        prodAtivo: (r.PRODATIVO as string) || 'S',
        complDesc: ((r.COMPLDESC as string) || '').trim(),
        localizacao: ((r.LOCALIZACAO as string) || '').trim(),
        usoProd: ((r.USOPROD as string) || '').trim(),
      }));
      cache.set(key, mapped, CACHE_TTL.FILTERS);
      return mapped;
    } catch (err) {
      logger.error({ err, codLocal }, '[LocaisService] Error fetching estoque');
      throw err;
    }
  }

  async getArvoreCompleta(): Promise<ArvoreLocal[]> {
    const key = cacheKey('locais:arvore-completa');
    const cached = cache.get<ArvoreLocal[]>(key);
    if (cached) return cached;

    const locais = await this.getLocais();
    if (locais.length === 0) return [];

    const isRoot = (l: LocalItem): boolean => {
      const pai = l.codLocalPai;
      return pai === null || pai === 0 || pai === -999999999
        || pai === l.codLocal;
    };

    const visited = new Set<number>();
    const buildTree = (codPai: number | null): ArvoreLocal[] => {
      return locais
        .filter((l) => {
          if (visited.has(l.codLocal)) return false;
          if (codPai === null) return isRoot(l);
          return l.codLocalPai === codPai && !isRoot(l);
        })
        .map((l) => {
          visited.add(l.codLocal);
          return {
            codLocal: l.codLocal,
            descrLocal: l.descrLocal,
            codLocalPai: l.codLocalPai,
            grau: l.grau,
            analitico: l.analitico,
            totalProdutosEstoque: l.totalProdutosEstoque,
            codUsuario: l.codUsuario,
            codparcUsuario: l.codparcUsuario,
            nomeUsuario: l.nomeUsuario,
            children: buildTree(l.codLocal),
          };
        });
    };

    const tree = buildTree(null);
    cache.set(key, tree, CACHE_TTL.FILTERS);
    return tree;
  }

  async getProdutoDetalhes(codProd: number) {
    try {
      const sql = prodDetalhesQuery.replace(/@CODPROD/g, codProd.toString());
      logger.debug({ codProd, sql }, '[LocaisService] Executing getProdutoDetalhes');
      const result = await this.queryExecutor
        .executeQuery<Record<string, unknown>>(sql);

      logger.debug({ codProd, rowCount: result?.length ?? 0 }, '[LocaisService] getProdutoDetalhes result');
      if (!result || result.length === 0) return null;

      const r = result[0];
      const produto = {
        codProd: r.CODPROD as number,
        descrProd: ((r.DESCRPROD as string) || '').trim(),
        codGrupoProd: r.CODGRUPOPROD as number | undefined,
        descrGrupoProd: ((r.DESCRGRUPOPROD as string) || '').trim(),
        ativo: (r.ATIVO as string) || 'S',
        complDesc: ((r.COMPLDESC as string) || '').trim(),
        codVol: ((r.CODVOL as string) || '').trim(),
        marca: ((r.MARCA as string) || '').trim(),
        referencia: ((r.REFERENCIA as string) || '').trim(),
        localizacao: ((r.LOCALIZACAO as string) || '').trim(),
        pesoBruto: Number(r.PESOBRUTO) || 0,
        pesoLiq: Number(r.PESOLIQ) || 0,
        codLocalPadrao: r.CODLOCALPADRAO as number | undefined,
        temImagem: r.TEMIMAGEM === 'S',
        usoProd: ((r.USOPROD as string) || '').trim(),
        ncm: ((r.NCM as string) || '').trim(),
        anexos: [] as unknown[],
      };

      try {
        const anexosService = new AnexosService();
        produto.anexos = await anexosService.getAnexos('TGFPRO', codProd);
      } catch {
        logger.warn({ codProd }, 'Could not fetch anexos for produto');
      }

      return produto;
    } catch (err) {
      const sql = prodDetalhesQuery.replace(/@CODPROD/g, codProd.toString());
      logger.error({ err, codProd, sql }, '[LocaisService] Error fetching produto detalhes');
      throw err;
    }
  }

  async getVeiculosPorProduto(codProd: number) {
    try {
      const detalhes = await this.getProdutoDetalhes(codProd);
      if (!detalhes || !detalhes.usoProd || detalhes.usoProd !== 'I') {
        return [];
      }

      const nome = detalhes.descrProd.trim();
      const prefix = nome.length >= 7 ? nome.substring(0, 7).trim() : nome;

      const sql = getVeiculosPorProduto.replace(/@PREFIX/g, `'${escapeSqlString(prefix)}'`);
      const result = await this.queryExecutor
        .executeQuery<Record<string, unknown>>(sql);

      return result.map((r) => ({
        codVeiculo: r.CODVEICULO as number,
        placa: ((r.PLACA as string) || '').trim(),
        marcaModelo: ((r.MARCAMODELO as string) || '').trim(),
        tag: ((r.TAG as string) || '').trim(),
        tipoEqpto: ((r.TIPOEQPTO as string) || '').trim(),
        ativo: (r.ATIVO as string) || 'S',
        kmAcum: Number(r.KMACUM) || 0,
        anoFabric: r.ANOFABRIC as number | null,
        anoMod: r.ANOMOD as number | null,
        combustivel: ((r.COMBUSTIVEL as string) || '').trim(),
        chassis: ((r.CHASSIS as string) || '').trim(),
        renavam: ((r.RENAVAM as string) || '').trim(),
        categoria: ((r.CATEGORIA as string) || '').trim(),
        fabricante: ((r.FABRICANTE as string) || '').trim(),
        capacidade: ((r.CAPACIDADE as string) || '').trim(),
        tipoMotor: ((r.TIPOMOTOR as string) || '').trim(),
        bloqueado: ((r.BLOQUEADO as string) || '').trim(),
        emContrato: ((r.EMCONTRATO as string) || '').trim(),
      }));
    } catch (err) {
      logger.error({ err, codProd }, '[LocaisService] Error fetching veiculos por produto');
      return [];
    }
  }

  async getProdutoImagem(codProd: number): Promise<string | null> {
    const key = cacheKey('locais:produto-imagem', { codProd });
    const cached = cache.get<string>(key);
    if (cached) return cached;

    try {
      const sql = prodImagemQuery.replace(/@CODPROD/g, codProd.toString());
      const result = await this.queryExecutor
        .executeQuery<Record<string, unknown>>(sql);

      if (!result || result.length === 0) return null;

      const base64 = result[0].IMAGEM_B64 as string;
      if (!base64) return null;

      cache.set(key, base64, CACHE_TTL.FILTERS);
      return base64;
    } catch (err) {
      logger.error({ err, codProd }, '[LocaisService] Error fetching produto imagem');
      return null;
    }
  }
}
