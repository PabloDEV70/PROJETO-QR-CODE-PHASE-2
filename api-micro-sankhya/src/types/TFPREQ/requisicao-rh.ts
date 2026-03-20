export type OrigemTipo = 'R' | 'A' | 'S' | 'V' | 'G' | 'T' | 'D' | 'C' | 'E' | 'F';

export type StatusRequisicao = -2 | -1 | 0 | 1 | 2 | 3;

export const STATUS_LABELS: Record<string, string> = {
  '-2': 'Cancelado',
  '-1': 'Rejeitado',
  '0': 'Aguardando',
  '1': 'Aguardando',
  '2': 'Aprovado',
  '3': 'Executado',
};

export const ORIGEM_TIPO_LABELS: Record<string, string> = {
  R: 'Rescisão/Demissão',
  A: 'Admissão',
  V: 'Férias',
  S: 'Alt. Cargo/Salário',
  G: 'Alt. Carga Horária',
  D: 'Décimo Terceiro',
  T: 'Transferência',
  C: 'Alt. Cadastral',
  E: 'Alt. Endereço',
  F: 'Folha',
};

export interface RequisicaoRh {
  id: number;
  dtCriacao: string;
  status: number;
  statusLabel: string;
  origemTipo: string;
  origemTipoLabel: string;
  codemp: number;
  codfunc: number;
  codparc: number | null;
  observacao: string | null;
  prioridade: number | null;
  dtLimite: string | null;
  origemId: number | null;
  codusu: number;
  nomeFuncionario: string;
  nomeEmpresa: string;
  descricaoCargo: string;
  departamento: string | null;
  funcao: string | null;
  nomeSolicitante: string;
  diasRestantes: number | null;
}
