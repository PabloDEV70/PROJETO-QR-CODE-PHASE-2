export interface PainelPessoa {
  codusu: number;
  nome: string;
  codparc: number | null;
}

export interface PainelSituacao {
  id: number;
  idsit: number;
  situacao: string;
  categoria: string;
  departamento: string | null;
  coddep: number;
  prioridadeSigla: string | null;
  prioridadeDescricao: string | null;
  idpri: number | null;
  descricao: string | null;
  obs: string | null;
  dtinicio: string;
  dtprevisao: string | null;
  nuos: number | null;
  numos: number | null;
  nunota: number | null;
  codparc: number | null;
  nomeParc: string | null;
  osStatus: string | null;
  osTipo: string | null;
  mosCliente: string | null;
  mosSituacao: string | null;
  operadores: PainelPessoa[];
  mecanicos: PainelPessoa[];
  criadoPor: PainelPessoa;
}

export interface PainelVeiculo {
  codveiculo: number;
  placa: string;
  marcaModelo: string | null;
  tag: string | null;
  tipo: string | null;
  capacidade: string | null;
  fabricante: string | null;
  situacoesAtivas: PainelSituacao[];
  totalSituacoes: number;
  prioridadeMaxima: number | null;
  previsaoMaisProxima: string | null;
}

export interface PainelResponse {
  veiculos: PainelVeiculo[];
  totalVeiculos: number;
  totalSituacoesAtivas: number;
  atualizadoEm: string;
}
