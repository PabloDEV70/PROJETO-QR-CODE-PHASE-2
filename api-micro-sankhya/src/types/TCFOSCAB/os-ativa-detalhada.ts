/**
 * OS Ativa com detalhes operacionais
 * Inclui dias em manutenção, situação de prazo, progresso de serviços
 */
export interface OsAtivaDetalhada {
  nuos: number;
  codveiculo: number;
  placa: string | null;
  status: string | null;
  statusDesc: string | null;
  manutencao: string | null;
  manutencaoDesc: string | null;
  dataIni: Date | null;
  previsao: Date | null;
  diasEmManutencao: number;
  situacaoPrazo: 'ATRASADA' | 'PROXIMA' | 'NO_PRAZO';
  qtdServicos: number;
  servicosConcluidos: number;
  adStatusGig: string | null;
  adBloqueios: string | null;
}
