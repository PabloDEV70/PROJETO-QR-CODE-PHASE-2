/**
 * Tipos de operacao CRUD para validacao de permissao.
 *
 * @module M3-T01
 */
export type OperacaoCrud = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LIST';

export interface ContextoPermissao {
  codUsuario: number;
  codTela: number;
  operacao: OperacaoCrud;
  tabela?: string;
  campos?: string[];
  tokenUsuario: string;
}

export interface ResultadoPermissao {
  permitido: boolean;
  motivo?: string;
  camposPermitidos?: string[];
  condicoesRls?: string;
  requerAprovacao?: boolean;
}
