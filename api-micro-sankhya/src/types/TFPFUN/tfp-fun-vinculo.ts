import { SituacaoFuncionario } from './situacao';

export interface TfpFunVinculo {
  codemp: number;
  codfunc: number;
  codparc: number;
  situacao: SituacaoFuncionario;
  situacaoLabel: string;
  dtadm: string;
  dtdem: string | null;
  codcargahor: number | null;
  salario: number | null;
  codcargo: number | null;
  cargo: string | null;
  codfuncao: number | null;
  funcao: string | null;
  coddep: number | null;
  departamento: string | null;
  empresa: string | null;
}
