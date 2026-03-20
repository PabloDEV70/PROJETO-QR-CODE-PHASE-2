import { MotivoConfigMap } from '../../types/AD_RDOMOTIVOS';
import { CATEGORY_META, FALLBACK_META } from './rdo-category-meta';

export interface MotivoConfigEmbutido {
  rdomotivocod: number;
  produtivo: boolean;
  toleranciaMin: number;
  penalidadeMin: number;
  wtCategoria: string;
  wtLabel: string;
  wtColor: string;
}

/**
 * Transforma o MotivoConfigMap em array serializable com label/color embutidos.
 * Computar UMA vez por request, antes do loop de items.
 */
export function buildMotivosConfig(configMap: MotivoConfigMap): MotivoConfigEmbutido[] {
  return Array.from(configMap.entries()).map(([cod, item]) => {
    const meta = CATEGORY_META[item.wtCategoria] ?? FALLBACK_META;
    return {
      rdomotivocod: cod,
      produtivo: item.produtivo,
      toleranciaMin: item.toleranciaMin,
      penalidadeMin: item.penalidadeMin,
      wtCategoria: item.wtCategoria,
      wtLabel: meta.label,
      wtColor: meta.color,
    };
  });
}
