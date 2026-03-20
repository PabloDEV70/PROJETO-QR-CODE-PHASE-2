// Types matching backend AD_APONTSOL endpoints

export interface ApontamentoResumo {
  TOTAL_SERVICOS: number;
  TOTAL_APONTAMENTOS: number;
  TOTAL_COM_OS: number;
  TOTAL_PENDENTES_OS: number;
  TOTAL_GERA_OS: number;
  TOTAL_COM_PRODUTO: number;
  PRODUTOS_DISTINTOS: number;
  VEICULOS_DISTINTOS: number;
  PERC_COM_OS: number;
  PERC_PENDENTES: number;
}

export interface ApontamentoPendente {
  CODIGO: number;
  SEQ: number;
  DESCRITIVO: string | null;
  CODPROD: number | null;
  DESCRPROD: string | null;
  QTD: number | null;
  DTPROGRAMACAO: string | null;
  DTINCLUSAO: string | null;
  CODVEICULO: number | null;
  TAG: string | null;
  STATUSOS: string | null;
  PLACA: string | null;
  MARCAMODELO: string | null;
}

export interface ApontamentoComOs {
  CODIGO: number;
  SEQ: number;
  DESCRITIVO: string | null;
  CODPROD: number | null;
  DESCRPROD: string | null;
  QTD: number | null;
  NUOS: number;
  DTPROGRAMACAO: string | null;
  STATUS_OS: string | null;
  DTABERTURA_OS: string | null;
  DATAFIN_OS: string | null;
  CODPARC_OS: number | null;
  CODVEICULO: number | null;
  TAG: string | null;
  DTINCLUSAO: string | null;
}

export interface ServicoFrequente {
  DESCRITIVO: string;
  QTD_APONTAMENTOS: number;
}

export interface ProdutoUtilizado {
  CODPROD: number;
  DESCRPROD: string | null;
  QTD_UTILIZACOES: number;
  QTD_TOTAL: number;
  QTD_COM_OS: number;
  PRIMEIRO_USO: string | null;
  ULTIMO_USO: string | null;
}

export interface ApontamentoByVeiculo {
  CODVEICULO: number;
  PLACA: string | null;
  MARCAMODELO: string | null;
  TAG: string | null;
  QTD_SERVICOS: number;
  QTD_COM_OS: number;
  QTD_PENDENTES: number;
  PRIMEIRO_APONTAMENTO: string | null;
  ULTIMO_APONTAMENTO: string | null;
}

export interface ApontamentoTimeline {
  DTINCLUSAO: string | null;
  CODAPONTAMENTO: number;
  SEQ: number;
  DESCRITIVO: string | null;
  CODPROD: number | null;
  DESCRPROD: string | null;
  QTD: number | null;
  GERAOS: string | null;
  NUOS: number | null;
  DTPROGRAMACAO: string | null;
  STATUSOS: string | null;
  KM: number | null;
  HORIMETRO: number | null;
  PLACA: string | null;
  MARCAMODELO: string | null;
}

export interface ApontamentoServico {
  CODIGO: number;
  SEQ: number;
  DESCRITIVO: string | null;
  GERAOS: string | null;
  CODPROD: number | null;
  DESCRPROD: string | null;
  QTD: number | null;
  DTPROGRAMACAO: string | null;
  NUOS: number | null;
  HR: number | null;
  KM: number | null;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PeriodoParams extends PaginationParams {
  dtini: string;
  dtfim: string;
}
