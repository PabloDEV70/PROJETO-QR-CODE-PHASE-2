import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { logger } from '../../shared/logger';
import * as Q from '../../sql-queries/TGFCAB';
import type {
  NotaDetalheCab,
  NotaDetalheItem,
  NotaDetalheTop,
  NotaDetalheVar,
  NotaDetalheCompleta,
} from '../../types/TGFCAB';

const STATUS_MAP: Record<string, string> = { A: 'Aberta', L: 'Liberada', P: 'Pendente', E: 'Efetivada', C: 'Cancelada' };
const NFE_MAP: Record<string, string> = { A: 'Autorizada', D: 'Denegada', C: 'Cancelada', I: 'Inutilizada' };
const TIPMOV_MAP: Record<string, string> = { V: 'Venda', C: 'Compra', D: 'Devolucao', P: 'Pedido', O: 'Orcamento', T: 'Transferencia', R: 'Remessa', Q: 'Requisicao' };
const ATUALEST_MAP: Record<string, string> = { N: 'Nao atualiza', S: 'Atualiza', R: 'Reserva', B: 'Baixa' };
const ATUALFIN_MAP: Record<string, string> = { '1': 'Gera financeiro', '0': 'Nao gera', S: 'Sim', N: 'Nao' };
const USOPROD_MAP: Record<string, string> = { R: 'Revenda', C: 'Consumo', I: 'Industrializacao', A: 'Ativo' };

function enrichCab(cab: Record<string, unknown>): NotaDetalheCab {
  const s = (k: string) => (cab[k] as string) ?? '-';
  cab.STATUS_DESCRICAO = STATUS_MAP[s('STATUSNOTA')] ?? s('STATUSNOTA');
  cab.STATUS_NFE_DESCRICAO = NFE_MAP[s('STATUSNFE')] ?? s('STATUSNFE');
  cab.TIPMOV_DESCRICAO = TIPMOV_MAP[s('TIPMOV')] ?? s('TIPMOV');
  cab.ATUALEST_DESCRICAO = ATUALEST_MAP[s('ATUALEST')] ?? s('ATUALEST');
  cab.ATUALFIN_DESCRICAO = ATUALFIN_MAP[s('ATUALFIN')] ?? s('ATUALFIN');
  return cab as unknown as NotaDetalheCab;
}

function enrichItens(itens: Record<string, unknown>[]): NotaDetalheItem[] {
  for (const item of itens) {
    const uso = (item.USOPROD as string) ?? '-';
    item.USOPROD_DESCRICAO = USOPROD_MAP[uso] ?? uso;
  }
  return itens as unknown as NotaDetalheItem[];
}

function enrichTop(top: Record<string, unknown>): NotaDetalheTop {
  const s = (k: string) => (top[k] as string) ?? '-';
  top.TIPMOV_DESCRICAO = TIPMOV_MAP[s('TIPMOV')] ?? s('TIPMOV');
  top.ATUALEST_DESCRICAO = ATUALEST_MAP[s('ATUALEST')] ?? s('ATUALEST');
  top.ATUALFIN_DESCRICAO = ATUALFIN_MAP[s('ATUALFIN')] ?? s('ATUALFIN');
  return top as unknown as NotaDetalheTop;
}

export class NotaDetalheService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  private async safeQuery<T>(name: string, sql: string): Promise<T[]> {
    try {
      const rows = await this.qe.executeQuery<T>(sql);
      logger.info('[NotaDetalhe] %s OK: %d rows | sql_len=%d', name, rows.length, sql.length);
      return rows;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const axErr = err as { response?: { status?: number; data?: unknown } };
      const motherStatus = axErr?.response?.status;
      const motherBody = axErr?.response?.data ? JSON.stringify(axErr.response.data).substring(0, 200) : '';
      logger.error('[NotaDetalhe] QUERY FAILED: %s | sql_len=%d | motherStatus=%s | motherBody=%s | first150=%s',
        name, sql.length, motherStatus, motherBody, sql.substring(0, 150));
      throw new Error(`Query ${name} failed: ${msg}`);
    }
  }

  async getDetalhe(nunota: number): Promise<NotaDetalheCompleta | null> {
    const nu = String(nunota);
    const cabSql = Q.notaDetalheCab.replace(/@nunota/g, nu);
    const itensSql = Q.notaDetalheItens.replace(/@nunota/g, nu);
    const topSql = Q.notaDetalheTop.replace(/@nunota/g, nu);
    const varSql = Q.notaDetalheVar.replace(/@nunota/g, nu);

    logger.info('[NotaDetalhe] Fetching NUNOTA=%s cab=%d itens=%d top=%d var=%d chars',
      nu, cabSql.length, itensSql.length, topSql.length, varSql.length);

    const [cabRows, itensRaw, topRows, variacoes] = await Promise.all([
      this.safeQuery<Record<string, unknown>>('CAB', cabSql),
      this.safeQuery<Record<string, unknown>>('ITENS', itensSql),
      this.safeQuery<Record<string, unknown>>('TOP', topSql),
      this.safeQuery<NotaDetalheVar>('VAR', varSql),
    ]);

    if (!cabRows[0]) {
      logger.warn('[NotaDetalhe] No CAB data for NUNOTA=%s', nu);
      return null;
    }

    return {
      cabecalho: enrichCab(cabRows[0]),
      itens: enrichItens(itensRaw),
      top: topRows[0] ? enrichTop(topRows[0]) : null,
      variacoes,
    };
  }
}
