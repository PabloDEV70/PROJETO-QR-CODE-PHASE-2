import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { analiseFlota, analiseVeiculoOS, notasComerciais } from '../../sql-queries/TGFVEI/analise-frota';
import { cache } from '../../shared/cache';
// Period filtering done client-side from ultimaOS date

interface FrotaRow {
  codveiculo: number;
  placa: string;
  marcamodelo: string;
  tag: string | null;
  tipoEqpto: string | null;
  tipoGrupo: string | null;
  categoria: string | null;
  anoFabric: number | null;
  idadeAnos: number;
  totalOS: number;
  osFechadas: number;
  osAbertas: number;
  diasEmManutencao: number;
  custoTotal: number;
  custo6m: number;
  custo6mAnterior: number;
  primeiraOS: string | null;
  ultimaOS: string | null;
  diasDesdeUltimaOS: number;
  scoreRisco: number;
  tendencia: 'subindo' | 'estavel' | 'descendo';
  risco: 'alto' | 'medio' | 'baixo';
}

function calcScore(row: Record<string, unknown>): { score: number; risco: 'alto' | 'medio' | 'baixo'; tendencia: 'subindo' | 'estavel' | 'descendo' } {
  const idade = (row.idadeAnos as number) ?? 0;
  const custoTotal = (row.custoTotal as number) ?? 0;
  const diasManut = (row.diasEmManutencao as number) ?? 0;
  const totalOS = (row.totalOS as number) ?? 1;
  const custo6m = (row.custo6m as number) ?? 0;
  const custo6mAnt = (row.custo6mAnterior as number) ?? 0;

  // Score 0-100: higher = worse
  const idadeScore = Math.min(idade / 25, 1) * 30;          // 30% peso — até 25 anos
  const custoScore = Math.min(custoTotal / 300000, 1) * 25;  // 25% peso — até 300k
  const manutScore = Math.min(diasManut / 5000, 1) * 25;     // 25% peso — até 5000 dias
  const freqScore = Math.min(totalOS / 200, 1) * 20;         // 20% peso — até 200 OS

  const score = Math.round(idadeScore + custoScore + manutScore + freqScore);

  const risco = score >= 65 ? 'alto' : score >= 40 ? 'medio' : 'baixo';

  const tendencia = custo6m > custo6mAnt * 1.3 ? 'subindo'
    : custo6m < custo6mAnt * 0.7 ? 'descendo'
    : 'estavel';

  return { score, risco, tendencia };
}

export class AnaliseFrotaService {
  constructor(private queryExecutor: QueryExecutor) {}

  async getRanking(dataInicio?: string, dataFim?: string): Promise<FrotaRow[]> {
    const ck = `frota:ranking:${dataInicio ?? 'all'}:${dataFim ?? 'all'}`;
    const cached = cache.get<FrotaRow[]>(ck);
    if (cached) return cached;

    const rows = await this.queryExecutor.executeQuery<Record<string, unknown>>(analiseFlota);

    const result: FrotaRow[] = rows.map((r) => {
      const { score, risco, tendencia } = calcScore(r);
      return {
        codveiculo: r.codveiculo as number,
        placa: (r.placa as string) ?? '',
        marcamodelo: (r.marcamodelo as string) ?? '',
        tag: r.tag as string | null,
        tipoEqpto: r.tipoEqpto as string | null,
        tipoGrupo: r.tipoGrupo as string | null,
        categoria: r.categoria as string | null,
        anoFabric: r.anoFabric as number | null,
        idadeAnos: (r.idadeAnos as number) ?? 0,
        totalOS: (r.totalOS as number) ?? 0,
        osFechadas: (r.osFechadas as number) ?? 0,
        osAbertas: (r.osAbertas as number) ?? 0,
        diasEmManutencao: Math.round(((r.mediaDiasOS as number) ?? 0) * Math.min((r.totalOS as number) ?? 0, 50)), // avg days per OS * capped count
        custoTotal: (r.custoTotal as number) ?? 0,
        custo6m: (r.custo6m as number) ?? 0,
        custo6mAnterior: (r.custo6mAnterior as number) ?? 0,
        primeiraOS: r.primeiraOS as string | null,
        ultimaOS: r.ultimaOS as string | null,
        diasDesdeUltimaOS: (r.diasDesdeUltimaOS as number) ?? 0,
        scoreRisco: score,
        tendencia,
        risco,
      };
    });

    result.sort((a, b) => b.scoreRisco - a.scoreRisco);
    cache.set(ck, result, 5 * 60_000);
    return result;
  }

  async getDetalheOS(codveiculo: number) {
    const sql = analiseVeiculoOS.replace(/@CODVEICULO/g, String(codveiculo));
    return this.queryExecutor.executeQuery<Record<string, unknown>>(sql);
  }

  async getNotasComerciais(codveiculo: number) {
    const sql = notasComerciais.replace(/@CODVEICULO/g, String(codveiculo));
    return this.queryExecutor.executeQuery<Record<string, unknown>>(sql);
  }
}
