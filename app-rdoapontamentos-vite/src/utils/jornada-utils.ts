import type { RdoDetalheItem } from '@/types/rdo-types';

export interface CategoriaResumo {
  label: string;
  sigla: string;
  minutos: number;
  count: number;
  produtivo: boolean;
}

export interface JornadaCalc {
  totalMin: number;
  prodMin: number;
  naoProdMin: number;
  pctProdutivo: number;
  categorias: CategoriaResumo[];
  prodCategorias: CategoriaResumo[];
  naoProdCategorias: CategoriaResumo[];
}

function getDuracaoMin(d: RdoDetalheItem): number {
  // Prefer server-calculated value
  if (d.duracaoMinutos != null && d.duracaoMinutos > 0) return d.duracaoMinutos;
  // Fallback to client calc
  if (d.HRINI == null || d.HRFIM == null) return 0;
  const ini = Math.floor(d.HRINI / 100) * 60 + (d.HRINI % 100);
  const fim = Math.floor(d.HRFIM / 100) * 60 + (d.HRFIM % 100);
  return fim > ini ? fim - ini : 0;
}

/**
 * Determine if detalhe is produtivo.
 * Uses motivoProdutivo from backend (mot.PRODUTIVO) when available.
 * Falls back to sigla/descricao heuristic when backend hasn't restarted yet.
 */
const SIGLAS_PRODUTIVAS = new Set(['ATVP', 'ATIV', 'PROD', 'SERV', 'EXEC']);

export function isProdutivo(d: RdoDetalheItem): boolean {
  if (d.motivoProdutivo === 'S') return true;
  if (d.motivoProdutivo === 'N') return false;
  // Fallback: null means backend didn't send the field yet
  const sigla = (d.motivoSigla ?? '').toUpperCase();
  if (SIGLAS_PRODUTIVAS.has(sigla)) return true;
  const desc = (d.motivoDescricao ?? '').toUpperCase();
  if (desc.includes('PRODUTIV') || desc.includes('ATIVIDADE PROD')) return true;
  return false;
}

export function calcJornada(detalhes: RdoDetalheItem[]): JornadaCalc {
  const map = new Map<string, CategoriaResumo>();

  let totalMin = 0;
  let prodMin = 0;

  for (const d of detalhes) {
    const min = getDuracaoMin(d);
    const isProd = isProdutivo(d);
    const key = d.motivoSigla ?? d.motivoDescricao ?? 'SEM MOTIVO';
    const label = d.motivoDescricao ?? key;

    totalMin += min;
    if (isProd) prodMin += min;

    const curr = map.get(key) ?? { label, sigla: key, minutos: 0, count: 0, produtivo: isProd };
    curr.minutos += min;
    curr.count += 1;
    map.set(key, curr);
  }

  const naoProdMin = totalMin - prodMin;
  const pctProdutivo = totalMin > 0 ? Math.round((prodMin / totalMin) * 100) : 0;

  const categorias = [...map.values()].sort((a, b) => b.minutos - a.minutos);
  const prodCategorias = categorias.filter((c) => c.produtivo);
  const naoProdCategorias = categorias.filter((c) => !c.produtivo);

  return { totalMin, prodMin, naoProdMin, pctProdutivo, categorias, prodCategorias, naoProdCategorias };
}
