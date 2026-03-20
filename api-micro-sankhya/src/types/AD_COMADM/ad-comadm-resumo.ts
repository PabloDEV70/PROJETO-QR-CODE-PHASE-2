export interface AdComadmResumo {
  porStatus: { status: string; label: string; total: number }[];
  porPrioridade: { prioridade: string; label: string; total: number }[];
  porTipo: { tipoChamado: string; total: number }[];
  total: number;
}
