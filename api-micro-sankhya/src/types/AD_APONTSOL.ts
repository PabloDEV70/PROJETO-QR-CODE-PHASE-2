// =============================================================================
// AD_APONTSOL - Tipos e Interfaces
// Serviços/Solicitações vinculados aos Apontamentos
// =============================================================================

// Interface base do Serviço de Apontamento
export interface ApontamentoServico {
  CODIGO: number;
  SEQ: number;
  DESCRITIVO: string | null;
  GERAOS: string | null;
  CODPROD: number | null;
  QTD: number | null;
  DTPROGRAMACAO: Date | null;
  NUOS: number | null;
  HR: number | null;
  KM: number | null;
}

// Serviço com dados do produto
export interface ApontamentoServicoCompleto extends ApontamentoServico {
  DESCRPROD: string | null;
}

// Serviço frequente (ranking)
export interface ServicoFrequente {
  descritivo: string;
  quantidade: number;
  percentual: number;
}

// Produto mais utilizado
export interface ProdutoUtilizado {
  CODPROD: number;
  DESCRPROD: string | null;
  quantidadeUtilizacoes: number;
  quantidadeTotal: number;
}

// Resumo de serviços por apontamento
export interface ServicosResumo {
  totalServicos: number;
  servicosComOs: number;
  servicosSemOs: number;
  produtosUnicos: number;
}
