/** Presentation metadata per DB WTCATEGORIA key — mirrors frontend wrench-time-categories.ts */
export const CATEGORY_META: Record<string, { label: string; color: string }> = {
  wrenchTime: { label: 'Wrench Time',          color: '#16A34A' },
  desloc:     { label: 'Deslocamento',          color: '#3B82F6' },
  espera:     { label: 'Espera',                color: '#F59E0B' },
  buro:       { label: 'Burocracia',            color: '#8B5CF6' },
  trein:      { label: 'Treinamento/Seguranca', color: '#06B6D4' },
  pausas:     { label: 'Pausas/Pessoal',        color: '#64748B' },
  externos:   { label: 'Externos/Clima',        color: '#EF4444' },
};

export const FALLBACK_META = { label: 'Outros', color: '#9CA3AF' };
