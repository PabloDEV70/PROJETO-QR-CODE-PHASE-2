import { ProdResult } from './rdo-produtividade-calc';
import { MotivoConfigMap } from '../../types/AD_RDOMOTIVOS';
import { WtCategoriaBreakdown } from '../../types/AD_RDOAPONTAMENTOS/rdo-list-item';
import { CATEGORY_META, FALLBACK_META } from './rdo-category-meta';

const MOTIVO_ALMOCO = 3;
const MOTIVO_BANHEIRO = 2;

function getCategoryMeta(cat: string): { label: string; color: string } {
  return CATEGORY_META[cat] ?? FALLBACK_META;
}

/**
 * Build wtCategorias breakdown from a ProdResult.
 * Replicates frontend buildSlices logic (rdo-prod-pie.tsx):
 * - Almoco: only excess beyond jornada interval counts
 * - Banheiro: only excess beyond tolerance counts
 * - All others: raw motivo minutes attributed to their wtCategoria
 */
export function buildWtCategorias(
  prodResult: ProdResult,
  configMap: MotivoConfigMap,
): WtCategoriaBreakdown[] {
  const {
    motivoMinutos,
    almocoMin,
    almocoDescontadoMin,
    banheiroMin,
    banheiroDescontadoMin,
    tempoNoTrabalho,
  } = prodResult;

  if (tempoNoTrabalho <= 0) return [];

  const almocoExcesso = Math.max(almocoMin - almocoDescontadoMin, 0);
  const banheiroExcesso = Math.max(banheiroMin - banheiroDescontadoMin, 0);

  const catMap = new Map<string, number>();

  for (const [codStr, mins] of Object.entries(motivoMinutos)) {
    const cod = Number(codStr);

    if (cod === MOTIVO_ALMOCO) {
      if (almocoExcesso > 0) {
        const cat = configMap.get(cod)?.wtCategoria ?? 'pausas';
        catMap.set(cat, (catMap.get(cat) ?? 0) + almocoExcesso);
      }
      continue;
    }

    if (cod === MOTIVO_BANHEIRO) {
      if (banheiroExcesso > 0) {
        const cat = configMap.get(cod)?.wtCategoria ?? 'pausas';
        catMap.set(cat, (catMap.get(cat) ?? 0) + banheiroExcesso);
      }
      continue;
    }

    const cat = configMap.get(cod)?.wtCategoria ?? 'externos';
    catMap.set(cat, (catMap.get(cat) ?? 0) + mins);
  }

  return Array.from(catMap.entries())
    .filter(([, v]) => v > 0)
    .sort((a, b) => {
      if (a[0] === 'wrenchTime') return -1;
      if (b[0] === 'wrenchTime') return 1;
      return b[1] - a[1];
    })
    .map(([cat, minutos]) => {
      const meta = getCategoryMeta(cat);
      return {
        categoria: cat,
        label: meta.label,
        color: meta.color,
        minutos,
        percent: Math.round((minutos / tempoNoTrabalho) * 100),
      };
    });
}
