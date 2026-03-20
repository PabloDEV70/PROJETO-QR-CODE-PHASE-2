export interface VeiculoAbastecimento {
  IDABT: number;
  CODVEICULO: number;
  KM: number | null;
  DHABT: string | null;
  STATUS: string | null;
  NUMABT: number | null;
  CODPOSTO: number | null;
  CODEMP: number | null;
  CODPARCMOTORISTA: number | null;
  HORIMETRO: number | null;
  NUNOTA: number | null;
}

export interface VeiculoHistoricoKm {
  CODVEICULO: number;
  SEQUENCIA: number;
  KM: number | null;
  ORIGEM: string | null;
  CODUSU: number | null;
  DHALTER: string | null;
  DHREFERENCIA: string | null;
  AD_HORIMETRO: number | null;
  AD_ODOMETRO: number | null;
}

export interface VeiculoDocumento {
  CODVEICULO: number;
  CODDOC: number;
  VIGENCIAINI: string | null;
  VIGENCIAFIN: string | null;
}

export interface VeiculoConsumo {
  ID: number;
  CODVEICULO: number;
  MODELO: string | null;
  FAMILIA: string | null;
  ANO: number | null;
  MARCA: string | null;
  NUMEROFROTA: string | null;
  TIPOCOMBUSTIVEL: string | null;
  ULTIMAKMH: number | null;
  KMRODADOS: number | null;
  HORASTRABALHADAS: number | null;
  VALORMEDIOLITRO: number | null;
  KMPORLITRO: number | null;
  LITROSPORHORA: number | null;
  TOTALTRANSACAO: number | null;
  LITROS: number | null;
  DATA_ABASTECIMENTO: string | null;
  PLACA_TAG: string | null;
  MOTORISTA: string | null;
  DT_UPDATE: string | null;
}

export interface UtilizacaoMensal {
  mes: string;
  diasManut: number;
  diasComercial: number;
  diasLivre: number;
  diasTotal: number;
}

export interface UtilizacaoResumo {
  primeiraAtividade: string | Date | null;
  totalOsManut: number;
  osManutAbertas: number;
  totalOsCom: number;
  totalDiarias: number;
  clientesAtendidos: number;
  motoristaNome: string | null;
  localParceiro: string | null;
}

export interface UtilizacaoPessoa {
  papel: string;
  nome: string;
  codUsuario: number;
  codparc: number | null;
  qtd: number;
  primeiroEnvolvimento: string | Date | null;
  ultimoEnvolvimento: string | Date | null;
}

export interface VeiculoUtilizacao {
  mensal: UtilizacaoMensal[];
  resumo: UtilizacaoResumo | null;
  pessoas: UtilizacaoPessoa[];
  dataInicio: string;
  dataFim: string;
}

export interface HistoricoCompletoItem {
  tipo: 'MANUTENCAO' | 'COMERCIAL';
  numOs: number;
  status: string;
  dataEvento: string | Date | null;
  dataFim: string | Date | null;
  codUsuario: number | null;
  nomeUsuario: string;
  codparcUsuario: number | null;
  codUsuario2: number | null;
  nomeUsuario2: string;
  codparcUsuario2: number | null;
  cliente: string;
  codparc: number;
  descricao: string;
  qtdDiarias: number;
  tipoManut: string;
  subtipo: string;
  km: number;
}

export interface VeiculoPlano {
  NUPLANO: number;
  CODVEICULO: number;
  DTINCLUSAO: string | null;
  DESCRICAO: string | null;
  TIPO: string | null;
  TEMPO: number | null;
  KMHORIMETRO: number | null;
  GERAAUTO: string | null;
  ATIVO: string | null;
  PERCTOLERANCIA: number | null;
  TIPOREP: string | null;
  REPETIR: string | null;
}
