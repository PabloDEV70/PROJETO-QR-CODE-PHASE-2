export const OS_STATUS_MAP: Record<string, { label: string; color: string }> = {
  A: { label: 'Aberta', color: '#ed6c02' },
  E: { label: 'Em Execucao', color: '#2e7d32' },
  F: { label: 'Finalizada', color: '#757575' },
  C: { label: 'Cancelada', color: '#d32f2f' },
};

export const OS_MANUTENCAO_MAP: Record<string, string> = {
  P: 'Preventiva',
  C: 'Corretiva',
  R: 'Reforma',
  S: 'Socorro',
  T: 'Retorno',
  O: 'Outros',
  '1': 'Revisao em Garantia',
  '2': 'Corretiva Programada',
  '3': 'Inventariado',
  '4': 'Logistica',
  '5': 'Borracharia',
};

export const OS_STATUSGIG_MAP: Record<string, { label: string; blocking: boolean }> = {
  AI: { label: 'Aguardando Pecas (Impeditivo)', blocking: true },
  AN: { label: 'Aguardando Pecas', blocking: false },
  AV: { label: 'Avaliacao', blocking: true },
  MA: { label: 'Manutencao', blocking: true },
  SI: { label: 'Servico (Impeditivo)', blocking: true },
  SN: { label: 'Servico 3os', blocking: false },
};

export function getOsStatusLabel(status: string | null): string {
  if (!status) return '-';
  return OS_STATUS_MAP[status]?.label || status;
}

export function getOsStatusColor(status: string | null): string {
  if (!status) return '#757575';
  return OS_STATUS_MAP[status]?.color || '#757575';
}

export function getOsManutencaoLabel(tipo: string | null): string {
  if (!tipo) return '-';
  return OS_MANUTENCAO_MAP[tipo] || tipo;
}

export function getOsStatusGigLabel(code: string | null): string | null {
  if (!code) return null;
  return OS_STATUSGIG_MAP[code]?.label || code;
}

export function isOsBlocking(statusGig: string | null): boolean {
  if (!statusGig) return false;
  return OS_STATUSGIG_MAP[statusGig]?.blocking ?? false;
}

export function formatDateBR(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}
