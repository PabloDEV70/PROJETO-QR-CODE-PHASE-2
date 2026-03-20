/**
 * Cores consistentes para status de OS e Serviços.
 *
 * OS  (TCFOSCAB):  A=Aberta, E=Em execução, F=Finalizada, C=Cancelada
 * SRV (TCFSERVOS): null/A=Pendente, E=Em execução, F=Finalizado, R=Rejeitado
 */

export const OS_STATUS_COLORS = {
  /** Aberta — aguardando inicio → LARANJA */
  A: { bg: '#e65100', text: '#fff', label: 'Aberta', accent: '#ff6d00' },
  /** Em execução — trabalho ativo → AMARELO */
  E: { bg: '#f9a825', text: '#1a1a1a', label: 'Em execucao', accent: '#fdd835' },
  /** Finalizada → AZUL */
  F: { bg: '#1565c0', text: '#fff', label: 'Finalizada', accent: '#42a5f5' },
  /** Cancelada → VERMELHO */
  C: { bg: '#c62828', text: '#fff', label: 'Cancelada', accent: '#ef5350' },
} as const;

export const SRV_STATUS_COLORS = {
  /** Pendente / Aberto → LARANJA mais claro */
  A: { bg: '#ef6c00', text: '#fff', label: 'Pendente', accent: '#ff9800' },
  /** Em execução → AMARELO */
  E: { bg: '#f9a825', text: '#1a1a1a', label: 'Executando', accent: '#fdd835' },
  /** Finalizado → AZUL */
  F: { bg: '#1565c0', text: '#fff', label: 'Finalizado', accent: '#42a5f5' },
  /** Rejeitado → VERMELHO */
  R: { bg: '#c62828', text: '#fff', label: 'Rejeitado', accent: '#ef5350' },
} as const;

type StatusKey = string | null | undefined;

const fallback = { bg: '#757575', text: '#fff', label: '—', accent: '#9e9e9e' };

export function getOsStatusColor(status: StatusKey) {
  return OS_STATUS_COLORS[status as keyof typeof OS_STATUS_COLORS] ?? fallback;
}

export function getSrvStatusColor(status: StatusKey) {
  if (!status || status === 'A' || status === '') return SRV_STATUS_COLORS.A;
  return SRV_STATUS_COLORS[status as keyof typeof SRV_STATUS_COLORS] ?? fallback;
}
