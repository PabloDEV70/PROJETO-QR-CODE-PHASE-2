/**
 * Alertas críticos de manutenção
 * Foco em bloqueios comerciais sem previsão
 */
export interface OsAlerta {
  tipo: string;
  mensagem: string;
  codveiculo: number;
  placa: string | null;
  nuos: number;
  status: string | null;
  manutencao: string | null;
  adStatusGig: string | null;
  dtAbertura: Date | null;
  diasAtraso: number;
}
