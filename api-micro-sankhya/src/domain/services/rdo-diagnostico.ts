import { ProdResult } from './rdo-produtividade-calc';
import { MotivoConfigMap } from '../../types/AD_RDOMOTIVOS';

export interface ToleranciaItem {
  aplicada: boolean;
  minutos: number;
}

export interface DiagnosticoFaixaResult {
  label: string;
  color: string;
}

export interface DiagnosticoResult {
  texto: string;
  faixa: DiagnosticoFaixaResult;
}

export interface ToleranciaResult {
  almoco: ToleranciaItem;
  banheiro: ToleranciaItem;
  fumar: ToleranciaItem;
}

/** Thresholds for produtividadePercent → faixa label + hex color (descending order) */
export const FAIXA_META: Array<{ minPct: number; label: string; color: string }> = [
  { minPct: 95, label: 'Na meta',  color: '#16A34A' },
  { minPct: 85, label: 'Quase la', color: '#F59E0B' },
  { minPct: 70, label: 'Atencao',  color: '#F59E0B' },
  { minPct: 0,  label: 'Critico',  color: '#EF4444' },
];

function getFaixa(pct: number): DiagnosticoFaixaResult {
  for (const entry of FAIXA_META) {
    if (pct >= entry.minPct) {
      return { label: entry.label, color: entry.color };
    }
  }
  // Fallback to last (Critico)
  const last = FAIXA_META[FAIXA_META.length - 1];
  return { label: last.label, color: last.color };
}

/**
 * Build diagnosticoFaixa from ProdResult.
 * - texto: full diagnostico string (may include "(com HE)")
 * - faixa.label: clean label derived from FAIXA_META threshold, no HE suffix
 * - faixa.color: hex color for the threshold
 */
export function buildDiagnostico(prodResult: ProdResult): DiagnosticoResult {
  const faixa = getFaixa(prodResult.produtividadePercent);
  return {
    texto: prodResult.diagnostico,
    faixa,
  };
}

/**
 * Build tolerancias breakdown from ProdResult.
 * - almoco/banheiro: aplicada = deducao > 0, minutos = deducao aplicada
 * - fumar: aplicada = qtd > 0, minutos = minutosFumarPenalidade (penalty, not real time)
 * - _configMap: reserved for future label enrichment
 */
export function buildTolerancias(
  prodResult: ProdResult,
  _configMap: MotivoConfigMap,
): ToleranciaResult {
  return {
    almoco: {
      aplicada: prodResult.almocoDescontadoMin > 0,
      minutos: prodResult.almocoDescontadoMin,
    },
    banheiro: {
      aplicada: prodResult.banheiroDescontadoMin > 0,
      minutos: prodResult.banheiroDescontadoMin,
    },
    fumar: {
      aplicada: prodResult.fumarQtd > 0,
      minutos: prodResult.minutosFumarPenalidade,
    },
  };
}
