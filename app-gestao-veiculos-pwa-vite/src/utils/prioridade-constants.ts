export interface PrioridadeInfo {
  sigla: string;
  label: string;
  color: string;
}

export const PRIORIDADE_MAP: Record<number, PrioridadeInfo> = {
  0: { sigla: 'U', label: 'Urgente', color: '#f44336' },
  1: { sigla: 'A', label: 'Alta', color: '#ff9800' },
  2: { sigla: 'M', label: 'Media', color: '#ffc107' },
  3: { sigla: 'B', label: 'Baixa', color: '#4caf50' },
};

export function getPrioridadeInfo(idpri: number | null): PrioridadeInfo {
  if (idpri === null || idpri === undefined) return { sigla: '-', label: 'Sem prioridade', color: '#9e9e9e' };
  return PRIORIDADE_MAP[idpri] ?? { sigla: '?', label: 'Desconhecida', color: '#9e9e9e' };
}
