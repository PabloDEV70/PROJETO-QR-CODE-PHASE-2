import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import * as Q from '../../sql-queries/COMPRAS';

const PRIORIDADE_MAP: Record<number, string> = {
  0: 'EMERGENCIA', 1: 'MUITO URGENTE', 2: 'URGENTE',
  3: 'POUCO URGENTE', 4: 'PROGRAMADA',
};

const DIAS_LIMITE_MAP: Record<number, number> = { 0: 1, 1: 3, 2: 5, 3: 10, 4: 30 };
const PRAZO_MAP: Record<number, string> = { 0: '0 Dia(s)', 1: '1 Dia(s)', 2: '2 Dia(s)', 3: '5 Dia(s)', 4: '7 Dia(s) ou +' };

function enrichRequisicaoManutencao(row: Record<string, unknown>): Record<string, unknown> {
  const pri = Number(row.AD_PRIORIDADE);
  const dtNegIso = row.DTNEG_ISO as string | null;
  const dtLimiteIso = row.DTLIMITE_ISO as string | null;

  // Calcular data limite e dias restantes
  let controleDias: number | null = null;
  if (dtNegIso) {
    const dtNeg = new Date(dtNegIso);
    const diasLimite = DIAS_LIMITE_MAP[pri] ?? 0;
    const dhLimiteCalc = new Date(dtNeg.getTime() + diasLimite * 86400000);
    controleDias = Math.floor((dhLimiteCalc.getTime() - Date.now()) / 86400000);
  }

  // Prioridade dinâmica
  let prioridadeLabel = PRIORIDADE_MAP[pri] ?? '';
  if (pri === 4 && dtLimiteIso) {
    const dtLimite = new Date(dtLimiteIso);
    const diasAteVencer = Math.floor((dtLimite.getTime() - Date.now()) / 86400000);
    if (diasAteVencer <= 1) prioridadeLabel = 'PROGRAMADA URGENTE';
  }

  return {
    ...row,
    PRIORIDADE: prioridadeLabel,
    DIAS_LIMITE: DIAS_LIMITE_MAP[pri] ?? 0,
    PRAZO: PRAZO_MAP[pri] ?? null,
    CONTROLE_DIAS: controleDias,
  };
}

export class ComprasService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async getRequisicoesPendentes(tipo: 'compras' | 'manutencao') {
    if (tipo === 'manutencao') {
      const rows = await this.qe.executeQuery<Record<string, unknown>>(Q.requisicoesPendentesManutencao);
      return rows.map(enrichRequisicaoManutencao)
        .sort((a, b) => ((a.CONTROLE_DIAS as number) ?? 99) - ((b.CONTROLE_DIAS as number) ?? 99));
    }

    // Compras — query each CODTIPOPER separately (API Mother doesn't support IN())
    const results: Record<string, unknown>[] = [];
    for (const cod of [502, 504, 506, 507]) {
      const sql = Q.requisicoesPendentesCompras.replace('PLACEHOLDER_TIPOPER', String(cod));
      const rows = await this.qe.executeQuery<Record<string, unknown>>(sql);
      results.push(...rows);
    }

    // Map prioridade label in JS for compras (simpler query)
    return results.map((r) => ({
      ...r,
      PRIORIDADE: PRIORIDADE_MAP[Number(r.AD_PRIORIDADE)] ?? '',
    })).sort((a, b) =>
      (Number((a as Record<string, unknown>).AD_PRIORIDADE) || 99) - (Number((b as Record<string, unknown>).AD_PRIORIDADE) || 99),
    );
  }

  async getCotacoesPendentes() {
    return this.qe.executeQuery<Record<string, unknown>>(Q.cotacoesPendentes);
  }

  async getResumoDashboard() {
    const compras = await this.qe.executeQuery<{ total: number }>(Q.countReqCompras);
    const manut = await this.qe.executeQuery<{ total: number }>(Q.countReqManut);
    const cotacoes = await this.qe.executeQuery<{ total: number }>(Q.countCotacoes);

    return {
      requisicoesPendentesCompras: compras[0]?.total ?? 0,
      requisicoesPendentesManut: manut[0]?.total ?? 0,
      cotacoesPendentes: cotacoes[0]?.total ?? 0,
      pedidosPendentes: 0,
    };
  }
}
