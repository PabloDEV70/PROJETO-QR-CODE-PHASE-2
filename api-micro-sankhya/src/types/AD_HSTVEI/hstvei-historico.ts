import { PainelPessoa } from './hstvei-painel';

export interface HistoricoItem {
  id: number;
  idsit: number;
  situacao: string;
  situacaoCoddep: number;
  departamento: string | null;
  prioridadeSigla: string | null;
  idpri: number | null;
  descricao: string | null;
  obs: string | null;
  dtinicio: string;
  dtprevisao: string | null;
  dtfim: string | null;
  duracaoMinutos: number | null;
  nuos: number | null;
  numos: number | null;
  nunota: number | null;
  codparc: number | null;
  nomeParc: string | null;
  exeope: string | null;
  exemec: string | null;
  nomeUsuInc: string | null;
  nomeUsuAlt: string | null;
  operadores?: PainelPessoa[];
  mecanicos?: PainelPessoa[];
  criadoPor?: PainelPessoa;
}

export interface HistoricoResponse {
  codveiculo: number;
  placa: string;
  marcaModelo: string | null;
  historico: HistoricoItem[];
  meta: {
    page: number;
    limit: number;
    totalRegistros: number;
  };
}
