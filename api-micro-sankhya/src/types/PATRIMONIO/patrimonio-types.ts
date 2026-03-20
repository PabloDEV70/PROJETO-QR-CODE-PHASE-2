export interface PatrimonioDashboardKpis {
  totalBens: number;
  valorPatrimonio: number;
  mobilizados: number;
  disponiveis: number;
  semPatrimonio: number;
  alertasComissionamento: number;
  totalVeiculos: number;
  totalBaixados: number;
}

export interface PatrimonioDashboard {
  kpis: PatrimonioDashboardKpis;
  valorPorCategoria: PatrimonioValorPorCategoria[];
  idadeFrota: PatrimonioIdadeFrota[];
  topClientes: PatrimonioTopCliente[];
  timelineAquisicoes: PatrimonioTimelineAquisicao[];
}

export interface PatrimonioBemListItem {
  codbem: string;
  codprod: number;
  descricaoAbreviada: string;
  categoria: string;
  vlrAquisicao: number;
  vlrDepreciacao: number;
  vlrSaldo: number;
  dtCompra: string | null;
  dtBaixa: string | null;
  empresa: number;
  vidaUtil: number | null;
  codveiculo: number | null;
  placa: string | null;
  marcaModelo: string | null;
  tipoEquipamento: string | null;
  anofabric: number | null;
  anomod: number | null;
  tag: string | null;
  ativo: string;
  capacidade: string | null;
  fabricante: string | null;
  kmAcum: number | null;
  mobilizado: boolean;
  clienteAtual: string | null;
  codparcAtual: number | null;
  numosAtual: number | null;
  dhChamadaAtual: string | null;
  statusComissionamento: string | null;
  diasVenceComissionamento: number | null;
  idadeMeses: number | null;
  percentualDepreciado: number;
  temPatrimonio: boolean;
}

export interface PatrimonioBemDetalhe extends PatrimonioBemListItem {
  descricaoBem: string | null;
  descricaoUtilBem: string | null;
  dtInicioDep: string | null;
  dtFimDep: string | null;
  nunota: number | null;
  nunotaBaixa: number | null;
  numContrato: string | null;
  temDepreciacao: string;
  vlrIcmsCiap: number | null;
  vlrTotDespesaBem: number | null;
  valorPresente: number | null;
  codbemOrig: string | null;
  codbemAtual: string | null;
  renavam: string | null;
  numMotor: string | null;
  chassis: string | null;
  cor: string | null;
  pesoMax: number | null;
  tara: number | null;
  combustivel: string | null;
  proprio: string | null;
  bloqueado: string | null;
  emContrato: string | null;
  tipoMotor: string | null;
  locEmpresa: number | null;
  locDepartamento: number | null;
  locDtEntrada: string | null;
}

export interface PatrimonioMobilizacaoItem {
  numos: number;
  situacao: string;
  dhChamada: string;
  dtFechamento: string | null;
  dias: number;
  codparc: number;
  cliente: string;
  servico: string | null;
}

export interface PatrimonioLocalizacaoItem {
  codbem: string;
  dtEntrada: string;
  empresa: number;
  departamento: number;
  usuario: number;
  nunota: number | null;
}

export interface PatrimonioDocumentoItem {
  codveiculo: number;
  coddoc: number;
  vigenciaIni: string | null;
  vigenciaFin: string | null;
  status: string;
}

export interface PatrimonioOsHistoricoItem {
  numos: number;
  situacao: string;
  dhChamada: string;
  dtFechamento: string | null;
  codparc: number;
  cliente: string;
  servico: string | null;
  kmIni: number | null;
  kmFim: number | null;
  vlrCobrado: number | null;
}

export interface PatrimonioValorPorCategoria {
  categoria: string;
  valor: number;
  quantidade: number;
}

export interface PatrimonioIdadeFrota {
  faixa: string;
  quantidade: number;
}

export interface PatrimonioTopCliente {
  cliente: string;
  codparc: number;
  veiculos: number;
  valorPatrimonio: number;
}

export interface PatrimonioTimelineAquisicao {
  mes: string;
  valorAcumulado: number;
  quantidade: number;
}

export interface PatrimonioMobilizacaoCliente {
  codparc: number;
  cliente: string;
  veiculos: PatrimonioMobilizacaoVeiculo[];
  totalVeiculos: number;
  valorPatrimonio: number;
}

export interface PatrimonioMobilizacaoVeiculo {
  codveiculo: number;
  codbem: string;
  tag: string;
  placa: string;
  tipoEquipamento: string;
  categoria: string;
  vlrAquisicao: number;
  numos: number;
  dhChamada: string;
  dias: number;
  servico: string | null;
  codparc: number;
  cliente: string;
}

export interface PatrimonioDepreciacaoConsolidada {
  categoria: string;
  quantidade: number;
  vlrAquisicaoTotal: number;
  vlrDepreciacaoTotal: number;
  vlrSaldoTotal: number;
  percentualMedio: number;
  completos: number;
  parciais: number;
  semDepreciacao: number;
}

export interface PatrimonioCategoriaResumo {
  codprod: number;
  categoria: string;
  quantidade: number;
  valorTotal: number;
  mobilizados: number;
  disponiveis: number;
  idadeMedia: number;
  percentualMobilizado: number;
}

export interface PatrimonioComissionamentoItem {
  codveiculo: number;
  tag: string;
  tipoEquipamento: string;
  statusVeiculo: string;
  valComissionamento: string | null;
  diasVence: number | null;
  situacao: string;
}

export interface PatrimonioDepreciacaoBem {
  codbem: string;
  vlrAquisicao: number;
  vlrDepreciacao: number;
  vlrSaldo: number;
  percentualDepreciado: number;
  temDepreciacao: string;
  vidaUtil: number | null;
  dtInicioDep: string | null;
  dtFimDep: string | null;
  dtCompra: string | null;
  vlrIcmsCiap: number | null;
  qtdMesesCiap: number | null;
  dtIniRefCiap: string | null;
  dtFimRefCiap: string | null;
  vlrTotDespesaBem: number;
  valorPresente: number;
  vlrCompraAquisicao: number;
}

export interface PatrimonioListFilters {
  search?: string;
  categoria?: string;
  status?: 'todos' | 'ativo' | 'baixado';
  mobilizado?: 'todos' | 'sim' | 'nao';
  temPatrimonio?: 'todos' | 'sim' | 'nao';
  empresa?: number;
}
