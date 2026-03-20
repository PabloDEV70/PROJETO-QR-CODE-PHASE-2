import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import * as Q from '../../sql-queries/TGFCAB';
import {
  cabExistenciaCheck,
  cabLinkedByReqOrig,
  cabLinkedByVarPart1,
  cabLinkedByVarPart2,
  cabRelacionadosPorProduto,
} from '../../sql-queries/TGFCAB/cab-detalhamento-completo';
import { cabAuditLog } from '../../sql-queries/TGFCAB/cab-audit-log';
import { cabLixeiraCabPart1, cabLixeiraCabPart2, cabLixeiraItens } from '../../sql-queries/TGFCAB/cab-lixeira';
import { cabCotacao, cabCotacaoDocAtivos, cabCotacaoDocExcluidos } from '../../sql-queries/TGFCAB/cab-cotacao';
import { cabLiberacoes, cabLiberacoesSistema } from '../../sql-queries/TGFCAB/cab-liberacoes';
import type {
  NotaDetalheCab,
  NotaDetalheItem,
  NotaDetalheTop,
  NotaDetalheVar,
} from '../../types/TGFCAB';
import type {
  CabRelacionado,
  CabVarLink,
  CabExistencia,
  CabAuditLogEntry,
  CabDetalhamentoCompleto,
  CabLixeiraCab,
  CabLixeiraItem,
  CabCotacao,
  CabCotacaoDocumento,
  CabLiberacao,
  CabLiberacaoSistema,
} from '../../types/TGFCAB/cab-detalhamento';

export class CabDetalhamentoService {
  private qe: QueryExecutor;
  private warnings: string[] = [];

  constructor() {
    this.qe = new QueryExecutor();
  }

  /** Safe query — returns empty array on error, logs warning with label */
  private async safeQuery<T>(sql: string, label: string): Promise<T[]> {
    try {
      return await this.qe.executeQuery<T>(sql);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.warnings.push(`${label}: ${msg}`);
      return [];
    }
  }

  /** Merge two partial result sets by a shared key */
  private mergeByKey(
    primary: Record<string, unknown>[],
    secondary: Record<string, unknown>[],
    key: string,
  ): Record<string, unknown>[] {
    const map = new Map<unknown, Record<string, unknown>>();
    for (const row of secondary) map.set(row[key], row);
    return primary.map((p) => ({ ...p, ...map.get(p[key]) }));
  }

  /** Merge VarLink parts by NUNOTA+SEQUENCIA composite key */
  private mergeVarLinks(
    part1: Record<string, unknown>[],
    part2: Record<string, unknown>[],
  ): CabVarLink[] {
    const map = new Map<string, Record<string, unknown>>();
    for (const r of part2) map.set(`${r.NUNOTA}-${r.SEQUENCIA}`, r);
    return part1.map((p) => ({
      ...p,
      ...map.get(`${p.NUNOTA}-${p.SEQUENCIA}`),
    })) as unknown as CabVarLink[];
  }

  async getDetalhamentoCompleto(nunota: number): Promise<CabDetalhamentoCompleto> {
    this.warnings = [];
    const nu = String(nunota);

    // Phase 1: Check existence + audit log + lixeira + liberacoes (always runs)
    const [existRows, auditLog, lixP1, lixP2, lixeiraItens, liberacoes, liberacoesSistema] = await Promise.all([
      this.safeQuery<CabExistencia>(cabExistenciaCheck.replace(/@nunota/g, nu), 'EXISTENCIA_CHECK'),
      this.safeQuery<CabAuditLogEntry>(cabAuditLog.replace(/@nunota/g, nu), 'AD_GIG_LOG'),
      this.safeQuery<Record<string, unknown>>(cabLixeiraCabPart1.replace(/@nunota/g, nu), 'TGFCAB_EXC'),
      this.safeQuery<Record<string, unknown>>(cabLixeiraCabPart2.replace(/@nunota/g, nu), 'TGFCAB_EXC_DESC'),
      this.safeQuery<CabLixeiraItem>(cabLixeiraItens.replace(/@nunota/g, nu), 'TGFITE_EXC'),
      this.safeQuery<CabLiberacao>(cabLiberacoes.replace(/@nunota/g, nu), 'TGFLIB'),
      this.safeQuery<CabLiberacaoSistema>(cabLiberacoesSistema.replace(/@nunota/g, nu), 'TSILIB'),
    ]);

    const exist = existRows[0] ?? { existeNoCAB: 0, refsNoVAR: 0 };
    const exists = exist.existeNoCAB === 1;

    // Merge lixeira parts
    const lixMerged = this.mergeByKey(lixP1, lixP2, 'NUNOTA');
    const lixeira = (lixMerged[0] as unknown as CabLixeiraCab | undefined) ?? null;

    // Phase 2: If exists, fetch all data in parallel
    if (exists) {
      const [cabRows, itens, topRows, variacoes, varP1, varP2, reqLinks] = await Promise.all([
        this.safeQuery<NotaDetalheCab>(Q.notaDetalheCab.replace(/@nunota/g, nu), 'TGFCAB'),
        this.safeQuery<NotaDetalheItem>(Q.notaDetalheItens.replace(/@nunota/g, nu), 'TGFITE'),
        this.safeQuery<NotaDetalheTop>(Q.notaDetalheTop.replace(/@nunota/g, nu), 'TGFTOP'),
        this.safeQuery<NotaDetalheVar>(Q.notaDetalheVar.replace(/@nunota/g, nu), 'TGFVAR'),
        this.safeQuery<Record<string, unknown>>(cabLinkedByVarPart1.replace(/@nunota/g, nu), 'TGFVAR_LINKS'),
        this.safeQuery<Record<string, unknown>>(cabLinkedByVarPart2.replace(/@nunota/g, nu), 'TGFVAR_LINKS_CAB'),
        this.safeQuery<CabRelacionado>(cabLinkedByReqOrig.replace(/@nunota/g, nu), 'LINKED_BY_REQ'),
      ]);

      const cabecalho = cabRows[0] ?? null;
      const varLinks = this.mergeVarLinks(varP1, varP2);

      // Phase 3: Find related docs by same parceiro + products
      let relacionadosPorProduto: CabRelacionado[] = [];
      if (cabecalho && itens.length > 0) {
        const codprodList = [...new Set(itens.map((i) => i.CODPROD))].join(',');
        const relSql = cabRelacionadosPorProduto
          .replace(/@codparc/g, String(cabecalho.CODPARC))
          .replace(/@codcencus/g, String(cabecalho.CODCENCUS ?? 0))
          .replace(/@codprod_list/g, codprodList)
          .replace(/@nunota/g, nu);
        relacionadosPorProduto = await this.safeQuery<CabRelacionado>(relSql, 'RELACIONADOS_PRODUTO');
      }

      // Phase 2b: Cotacao
      const numcotacao = cabecalho?.NUMCOTACAO ?? lixeira?.NUMCOTACAO ?? 0;
      const { cotacao, cotacaoDocumentos } = await this.fetchCotacao(numcotacao, nu);

      return {
        existe: true,
        refsNoVAR: exist.refsNoVAR,
        cabecalho,
        itens,
        top: topRows[0] ?? null,
        variacoes,
        linkedByReq: reqLinks,
        linkedByVar: varLinks,
        relacionadosPorProduto,
        auditLog,
        lixeira,
        lixeiraItens,
        cotacao,
        cotacaoDocumentos,
        liberacoes,
        liberacoesSistema,
        _warnings: this.warnings.length > 0 ? this.warnings : undefined,
      };
    }

    // Document is DELETED — fetch TGFVAR + cotacao from lixeira
    const [varP1, varP2] = await Promise.all([
      this.safeQuery<Record<string, unknown>>(cabLinkedByVarPart1.replace(/@nunota/g, nu), 'TGFVAR_LINKS'),
      this.safeQuery<Record<string, unknown>>(cabLinkedByVarPart2.replace(/@nunota/g, nu), 'TGFVAR_LINKS_CAB'),
    ]);
    const varLinks = this.mergeVarLinks(varP1, varP2);

    const numcotacao = lixeira?.NUMCOTACAO ?? 0;
    const { cotacao, cotacaoDocumentos } = await this.fetchCotacao(numcotacao, nu);

    return {
      existe: false,
      refsNoVAR: exist.refsNoVAR,
      cabecalho: null,
      itens: [],
      top: null,
      variacoes: [],
      linkedByReq: [],
      linkedByVar: varLinks,
      relacionadosPorProduto: [],
      auditLog,
      lixeira,
      lixeiraItens,
      cotacao,
      cotacaoDocumentos,
      liberacoes,
      liberacoesSistema,
      _warnings: this.warnings.length > 0 ? this.warnings : undefined,
    };
  }

  private async fetchCotacao(numcotacao: number, nu: string) {
    let cotacao: CabCotacao | null = null;
    let cotacaoDocumentos: CabCotacaoDocumento[] = [];
    if (numcotacao > 0) {
      const nc = String(numcotacao);
      const [cotRows, docAtivos, docExcluidos] = await Promise.all([
        this.safeQuery<CabCotacao>(cabCotacao.replace(/@numcotacao/g, nc), 'TGFCOT'),
        this.safeQuery<CabCotacaoDocumento>(cabCotacaoDocAtivos.replace(/@numcotacao/g, nc), 'TGFCOT_ATIVOS'),
        this.safeQuery<CabCotacaoDocumento>(
          cabCotacaoDocExcluidos.replace(/@numcotacao/g, nc).replace(/@nunota/g, nu),
          'TGFCOT_EXCLUIDOS',
        ),
      ]);
      cotacao = cotRows[0] ?? null;
      cotacaoDocumentos = [...docAtivos, ...docExcluidos];
    }
    return { cotacao, cotacaoDocumentos };
  }
}
