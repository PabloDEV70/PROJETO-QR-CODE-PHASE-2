import { Campo } from '../../../domain/entities/campo.entity';

/**
 * Schema de validação para uma tabela do dicionário.
 *
 * Contém metadados de todos os campos da tabela para validação.
 */
export interface SchemaTabela {
  /**
   * Nome da tabela.
   */
  nomeTabela: string;

  /**
   * Campos da tabela indexados por nome.
   */
  campos: Map<string, Campo>;

  /**
   * Lista de campos obrigatórios.
   */
  camposObrigatorios: string[];

  /**
   * Lista de campos que são chave primária.
   */
  camposChavePrimaria: string[];

  /**
   * Versão do schema (para cache invalidation).
   */
  versao?: string;
}

/**
 * Provedor de schemas de tabelas.
 */
export interface IProvedorSchemaTabela {
  /**
   * Obtém schema de uma tabela.
   *
   * @param nomeTabela - Nome da tabela
   * @returns Promise com schema da tabela
   */
  obterSchema(nomeTabela: string): Promise<SchemaTabela>;

  /**
   * Limpa cache de schema (forçar reload).
   *
   * @param nomeTabela - Nome da tabela (opcional, limpa todas se omitido)
   */
  limparCache(nomeTabela?: string): void;
}

export const PROVEDOR_SCHEMA_TABELA = Symbol('IProvedorSchemaTabela');
