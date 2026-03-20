export interface EmTempoRealItem {
  NUNOTA: number;
  SEQUENCIA: number;
  NUNOTA_ORIGEM: number | null;
  SEQUENCIA_ORIGEM: number | null;
  NUMERO_NOTA: number | null;
  EMPRESA: number;
  CODPARC_NOTA: number;
  PARCEIRO_NOME: string | null;
  DATA_NEGOCIACAO: string;
  DATA_HORA_MOVIMENTO: string;
  STATUS_CODIGO: string;
  STATUS_DESCRICAO: string;
  CODIGO_TIPO_OPER: number;
  DESCRICAO_TIPO_OPER: string | null;
  COD_ATUALIZA_ESTOQUE: string | null;
  DESCRICAO_ATUALIZA_ESTOQUE: string;
  CODIGO_USUARIO: number;
  NOME_USUARIO: string | null;
  CODPARC_USUARIO: number | null;
  VALOR_NOTA: number | null;
}

export interface EmTempoRealResumo {
  total: number;
  atendimento: number;
  liberada: number;
  pendente: number;
  baixa_estoque: number;
  entrada_estoque: number;
  sem_movimentacao: number;
  reserva_estoque: number;
  valor_total: number;
}
