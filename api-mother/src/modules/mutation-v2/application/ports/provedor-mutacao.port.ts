/**
 * Ports para operações de mutação
 *
 * Define interfaces para injeção de dependência seguindo Clean Architecture.
 */

import { OperacaoMutacao, ResultadoMutacao } from '../../domain/entities';

/**
 * Interface para provedor de operações de mutação
 */
export interface IProvedorMutacao {
  /**
   * Insere um novo registro na tabela
   */
  inserir(operacao: OperacaoMutacao): Promise<ResultadoMutacao>;

  /**
   * Atualiza registro(s) na tabela
   */
  atualizar(operacao: OperacaoMutacao): Promise<ResultadoMutacao>;

  /**
   * Exclui registro(s) da tabela (soft ou hard delete)
   */
  excluir(operacao: OperacaoMutacao): Promise<ResultadoMutacao>;

  /**
   * Busca registros que serão afetados pela operação (para preview/dry-run)
   */
  buscarRegistrosAfetados(operacao: OperacaoMutacao): Promise<Record<string, unknown>[]>;
}

/**
 * Interface para validação de tabela e dados
 */
export interface IProvedorValidacao {
  /**
   * Verifica se a tabela existe no banco
   */
  tabelaExiste(nomeTabela: string): Promise<boolean>;

  /**
   * Obtém metadados das colunas da tabela
   */
  obterColunas(nomeTabela: string): Promise<MetadadosColuna[]>;

  /**
   * Valida se os dados atendem aos requisitos da tabela
   * @param opcoes.ignorarObrigatorios - Se true, não verifica campos obrigatórios não fornecidos (útil para UPDATE)
   */
  validarDados(
    nomeTabela: string,
    dados: Record<string, unknown>,
    opcoes?: { ignorarObrigatorios?: boolean },
  ): Promise<ResultadoValidacao>;

  /**
   * Verifica se uma coluna específica existe na tabela
   */
  colunaExiste(nomeTabela: string, nomeColuna: string): Promise<boolean>;

  /**
   * Obtém chaves primárias da tabela
   */
  obterChavesPrimarias(nomeTabela: string): Promise<string[]>;

  /**
   * Verifica se há violação de FK
   */
  validarChavesEstrangeiras(nomeTabela: string, dados: Record<string, unknown>): Promise<ResultadoValidacao>;
}

/**
 * Metadados de uma coluna
 */
export interface MetadadosColuna {
  nome: string;
  tipo: string;
  tamanho: number | null;
  obrigatorio: boolean;
  chavePrimaria: boolean;
  chaveEstrangeira: boolean;
  valorPadrao: unknown;
}

/**
 * Resultado de validação
 */
export interface ResultadoValidacao {
  valido: boolean;
  erros: ErroValidacao[];
}

/**
 * Erro de validação
 */
export interface ErroValidacao {
  campo: string;
  mensagem: string;
  codigo: string;
}

/**
 * Symbols para injeção de dependência
 */
export const PROVEDOR_MUTACAO = Symbol('PROVEDOR_MUTACAO');
export const PROVEDOR_VALIDACAO = Symbol('PROVEDOR_VALIDACAO');
