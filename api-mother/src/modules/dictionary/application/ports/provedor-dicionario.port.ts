/**
 * Port (Interface): IProvedorDicionario
 *
 * Define o contrato para obter informações do dicionário de dados Sankhya.
 * Implementado por adaptadores na camada de infraestrutura.
 *
 * @module dictionary-v2
 */

import { Tabela, Campo, OpcaoCampo } from '../../domain/entities';

/**
 * Opções de paginação
 */
export interface OpcoesPaginacao {
  limite?: number;
  offset?: number;
}

/**
 * Resultado paginado
 */
export interface ResultadoPaginado<T> {
  dados: T[];
  paginacao: {
    limite: number;
    offset: number;
    total: number;
  };
}

/**
 * Interface para provedor de tabelas
 */
export interface IProvedorTabelas {
  listarTabelas(opcoes?: OpcoesPaginacao): Promise<ResultadoPaginado<Tabela>>;
  obterTabelaPorNome(nome: string): Promise<Tabela | null>;
  buscarTabelas(termo: string, opcoes?: OpcoesPaginacao): Promise<ResultadoPaginado<Tabela>>;
}

/**
 * Interface para provedor de campos
 */
export interface IProvedorCampos {
  listarCamposDaTabela(nomeTabela: string, opcoes?: OpcoesPaginacao): Promise<ResultadoPaginado<Campo>>;
  obterCampo(nomeTabela: string, nomeCampo: string): Promise<Campo | null>;
  buscarCampos(termo: string, opcoes?: OpcoesPaginacao): Promise<ResultadoPaginado<Campo>>;
  obterOpcoesCampo(numeroCampo: number): Promise<OpcaoCampo[]>;
}

// Tokens para injeção de dependência (NestJS)
export const PROVEDOR_TABELAS = Symbol('PROVEDOR_TABELAS');
export const PROVEDOR_CAMPOS = Symbol('PROVEDOR_CAMPOS');
