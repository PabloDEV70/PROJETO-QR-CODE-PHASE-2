export interface AtividadeRecente {
  tipoAtividade: 'RDO' | 'OS_MANUTENCAO' | 'OS_COMERCIAL';
  referencia: string;
  dataAtividade: string;
  descricao: string | null;
  extra: string | null;
}
