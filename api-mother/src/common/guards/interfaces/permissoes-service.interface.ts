/**
 * Interface para o servico de permissoes usado pelos guards.
 *
 * @module M3-T01
 */
import { ContextoPermissao, ResultadoPermissao, OperacaoCrud } from '../types';

export interface IPermissoesService {
  /**
   * Verifica se o usuario tem permissao para executar a operacao CRUD.
   */
  verificarPermissaoCrud(contexto: ContextoPermissao): Promise<ResultadoPermissao>;

  /**
   * Verifica quais campos o usuario pode acessar.
   */
  obterCamposPermitidos(
    codUsuario: number,
    tabela: string,
    operacao: OperacaoCrud,
    tokenUsuario: string,
  ): Promise<string[]>;

  /**
   * Obtem as condicoes RLS (Row Level Security) para o usuario.
   */
  obterCondicoesRls(codUsuario: number, tabela: string, tokenUsuario: string): Promise<string | null>;

  /**
   * Verifica se a operacao requer aprovacao.
   */
  verificarRequerAprovacao(
    codUsuario: number,
    tabela: string,
    operacao: OperacaoCrud,
    tokenUsuario: string,
  ): Promise<boolean>;
}

export const PERMISSOES_SERVICE = Symbol('IPermissoesService');
