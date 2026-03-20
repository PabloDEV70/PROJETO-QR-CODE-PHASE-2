import { PreventiveStatusType } from '../../types/TCFMAN/preventiva';

interface PreventivaCalcInput {
  ultimaData: string | null;
  intervaloDias: number;
  intervaloKm: number;
  tolerancia: number;
  ultimoKm: number | null;
}

export interface NextMaintenanceResult {
  diasParaVencer: number | null;
  kmParaVencer: number | null;
  proximaData: string | null;
  proximoKm: number | null;
}

export function determineStatus(
  ultimaData: string | null,
  intervaloDias: number,
  _intervaloKm: number,
  tolerancia: number,
): PreventiveStatusType {
  if (!ultimaData) return 'SEM_HISTORICO';

  const hoje = new Date();
  const dataUltima = new Date(ultimaData);
  const diasAtras = Math.floor(
    (hoje.getTime() - dataUltima.getTime()) / (1000 * 60 * 60 * 24),
  );
  const toleranciaDias = Math.floor(intervaloDias * (tolerancia / 100));

  if (diasAtras > intervaloDias + toleranciaDias) return 'ATRASADA';
  return 'EM_DIA';
}

export function calculateNextMaintenance(row: PreventivaCalcInput): NextMaintenanceResult {
  if (!row.ultimaData) {
    return { diasParaVencer: null, kmParaVencer: null, proximaData: null, proximoKm: null };
  }

  const dataUltima = new Date(row.ultimaData);
  const hoje = new Date();
  const dataProxima = new Date(dataUltima);
  dataProxima.setDate(dataProxima.getDate() + row.intervaloDias);

  const diasParaVencer = Math.floor(
    (dataProxima.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24),
  );

  let proximoKm: number | null = null;
  if (row.ultimoKm && row.intervaloKm > 0) {
    proximoKm = row.ultimoKm + row.intervaloKm;
  }

  return {
    diasParaVencer,
    kmParaVencer: null,
    proximaData: dataProxima.toISOString(),
    proximoKm,
  };
}

export function calculateResumo(statuses: PreventiveStatusType[]): {
  total: number;
  emDia: number;
  atrasadas: number;
  semHistorico: number;
} {
  let emDia = 0;
  let atrasadas = 0;
  let semHistorico = 0;

  for (const s of statuses) {
    if (s === 'EM_DIA') emDia++;
    else if (s === 'ATRASADA') atrasadas++;
    else semHistorico++;
  }

  return { total: statuses.length, emDia, atrasadas, semHistorico };
}
