import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { getPreventivasByVeiculo, getPreventivasFrota } from '../../sql-queries/TCFMAN';
import {
  VeiculoPreventivasResponse,
  PreventiveStatus,
  PreventiveCode,
  PreventivaQuadroItem,
  VeiculoQuadro,
  QuadroResponse,
} from '../../types/TCFMAN/preventiva';
import { determineStatus, calculateNextMaintenance, calculateResumo } from './preventiva-utils';

interface PreventivaRaw {
  codveiculo: number;
  placa: string;
  tipoEquipamento: string | null;
  codigo: string;
  descricao: string;
  tipoIntervalo: string;
  intervaloDias: number;
  intervaloKm: number;
  tolerancia: number;
  ultimaData: string | null;
  ultimoKm: number | null;
  ultimaOs: number | null;
}

interface FrotaRaw extends PreventivaRaw {
  marcaModelo: string;
  tag: string | null;
}

export interface PreventivaService {
  getVeiculoPreventivas(codveiculo: number): Promise<VeiculoPreventivasResponse | null>;
  getFrotaPreventivas(): Promise<QuadroResponse>;
}

export class PreventivaServiceImpl implements PreventivaService {
  constructor(private readonly qe: QueryExecutor) {}

  async getVeiculoPreventivas(codveiculo: number): Promise<VeiculoPreventivasResponse | null> {
    const sql = getPreventivasByVeiculo.replace('@codveiculo', codveiculo.toString());
    const rawData = await this.qe.executeQuery<PreventivaRaw>(sql);

    if (rawData.length === 0) return null;

    const veiculo = rawData[0];
    const preventivas: PreventiveStatus[] = rawData.map((row) => {
      const status = determineStatus(row.ultimaData, row.intervaloDias, row.intervaloKm, row.tolerancia);
      const calc = calculateNextMaintenance(row);
      return {
        codigo: row.codigo as PreventiveCode,
        descricao: row.descricao,
        tipoIntervalo: row.tipoIntervalo as 'T' | 'K' | 'KT',
        intervaloDias: row.intervaloDias,
        intervaloKm: row.intervaloKm,
        tolerancia: row.tolerancia,
        ultimaManutencao: { data: row.ultimaData, km: row.ultimoKm, nuos: row.ultimaOs },
        status,
        diasParaVencer: status === 'SEM_HISTORICO' ? null : calc.diasParaVencer,
        kmParaVencer: status === 'SEM_HISTORICO' ? null : calc.kmParaVencer,
        proximaData: status === 'SEM_HISTORICO' ? null : calc.proximaData,
        proximoKm: status === 'SEM_HISTORICO' ? null : calc.proximoKm,
      };
    });

    const resumo = calculateResumo(preventivas.map((p) => p.status));

    return {
      codveiculo: veiculo.codveiculo,
      placa: veiculo.placa.trim(),
      tipoEquipamento: veiculo.tipoEquipamento,
      preventivas,
      resumo,
    };
  }

  async getFrotaPreventivas(): Promise<QuadroResponse> {
    const rawData = await this.qe.executeQuery<FrotaRaw>(getPreventivasFrota);

    const veiculoMap = new Map<number, FrotaRaw[]>();
    for (const row of rawData) {
      const existing = veiculoMap.get(row.codveiculo) || [];
      existing.push(row);
      veiculoMap.set(row.codveiculo, existing);
    }

    const veiculos: VeiculoQuadro[] = [];
    let geralEmDia = 0;
    let geralAtrasados = 0;
    let geralSemHistorico = 0;
    const categoriasSet = new Set<string>();

    for (const [codveiculo, rows] of veiculoMap) {
      const first = rows[0];
      if (first.tipoEquipamento) categoriasSet.add(first.tipoEquipamento);

      // Deduplicate by codigo — multiple TCFMAN plans can share same AD_AGRUPADOR
      const codigoMap = new Map<string, FrotaRaw>();
      for (const row of rows) {
        const existing = codigoMap.get(row.codigo);
        if (!existing || (row.ultimaData && (!existing.ultimaData || row.ultimaData > existing.ultimaData))) {
          codigoMap.set(row.codigo, row);
        }
      }

      const preventivas: PreventivaQuadroItem[] = Array.from(codigoMap.values()).map((row) => {
        const status = determineStatus(row.ultimaData, row.intervaloDias, row.intervaloKm, row.tolerancia);
        const calc = calculateNextMaintenance(row);
        return {
          codigo: row.codigo,
          status,
          ultimaData: row.ultimaData,
          diasParaVencer: status === 'SEM_HISTORICO' ? null : calc.diasParaVencer,
          proximaData: status === 'SEM_HISTORICO' ? null : calc.proximaData,
        };
      });

      const resumo = calculateResumo(preventivas.map((p) => p.status));
      const hasAtrasada = preventivas.some((p) => p.status === 'ATRASADA');
      if (hasAtrasada) geralAtrasados++;
      else if (preventivas.every((p) => p.status === 'SEM_HISTORICO')) geralSemHistorico++;
      else geralEmDia++;

      veiculos.push({
        codveiculo,
        placa: (first.placa || '').trim(),
        marcaModelo: (first.marcaModelo || '').trim(),
        tipoEquipamento: first.tipoEquipamento,
        tag: first.tag ? first.tag.trim() : null,
        preventivas,
        resumo,
      });
    }

    return {
      data: veiculos,
      categorias: Array.from(categoriasSet).sort(),
      resumoGeral: {
        totalVeiculos: veiculos.length,
        emDia: geralEmDia,
        atrasados: geralAtrasados,
        semHistorico: geralSemHistorico,
      },
    };
  }
}

let preventivaServiceInstance: PreventivaService | null = null;

export function getPreventivaService(): PreventivaService {
  if (!preventivaServiceInstance) {
    preventivaServiceInstance = new PreventivaServiceImpl(new QueryExecutor());
  }
  return preventivaServiceInstance;
}
