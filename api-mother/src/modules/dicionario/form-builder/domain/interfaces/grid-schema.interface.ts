import { TipoCampoValor } from '../../../domain/value-objects/tipo-campo.vo';

/**
 * Schema de coluna de grid.
 *
 * @module FormBuilder
 */
export interface IColunaGridSchema {
  /**
   * Nome do campo (chave).
   */
  field: string;

  /**
   * Cabeçalho da coluna.
   */
  header: string;

  /**
   * Tipo de dado da coluna.
   */
  type: TipoCampoValor;

  /**
   * Largura da coluna (em pixels ou %).
   */
  width?: number | string;

  /**
   * Se a coluna é ordenável.
   */
  sortable: boolean;

  /**
   * Se a coluna é filtrável.
   */
  filterable: boolean;

  /**
   * Se a coluna é editável inline.
   */
  editable: boolean;

  /**
   * Formato de exibição (data, número, moeda).
   */
  format?: string;

  /**
   * Alinhamento do texto.
   */
  align?: 'left' | 'center' | 'right';

  /**
   * Se deve ser visível por padrão.
   */
  visible: boolean;

  /**
   * Ordem de exibição.
   */
  order: number;

  /**
   * Se é chave primária.
   */
  isPrimaryKey: boolean;

  /**
   * Função de renderização customizada (nome da função).
   */
  renderer?: string;
}

/**
 * Schema completo de grid/tabela.
 *
 * @module FormBuilder
 */
export interface IGridSchema {
  /**
   * Nome da tabela.
   */
  tableName: string;

  /**
   * Título do grid.
   */
  title: string;

  /**
   * Descrição do grid.
   */
  description?: string;

  /**
   * Colunas do grid.
   */
  columns: IColunaGridSchema[];

  /**
   * Configurações do grid.
   */
  config?: {
    /**
     * Se permite paginação.
     */
    pageable: boolean;

    /**
     * Tamanho padrão da página.
     */
    pageSize: number;

    /**
     * Tamanhos de página disponíveis.
     */
    pageSizeOptions: number[];

    /**
     * Se permite seleção de linhas.
     */
    selectable: boolean;

    /**
     * Modo de seleção.
     */
    selectionMode?: 'single' | 'multiple';

    /**
     * Se permite exportação.
     */
    exportable: boolean;

    /**
     * Formatos de exportação disponíveis.
     */
    exportFormats?: ('csv' | 'excel' | 'pdf')[];
  };

  /**
   * Metadados adicionais.
   */
  metadata?: {
    /**
     * Chave primária da tabela.
     */
    primaryKey?: string;

    /**
     * Total de registros (se conhecido).
     */
    totalRecords?: number;
  };
}
