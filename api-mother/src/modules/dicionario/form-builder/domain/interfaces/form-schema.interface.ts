import { TipoCampoValor } from '../../../domain/value-objects/tipo-campo.vo';

/**
 * Regra de validação para um campo de formulário.
 *
 * @module FormBuilder
 */
export interface IValidationRule {
  /**
   * Tipo da validação (required, min, max, pattern, etc).
   */
  type: string;

  /**
   * Valor da regra (ex: valor mínimo, padrão regex, etc).
   */
  value?: any;

  /**
   * Mensagem de erro personalizada.
   */
  message?: string;
}

/**
 * Schema de campo individual de formulário.
 *
 * @module FormBuilder
 */
export interface ICampoFormSchema {
  /**
   * Nome do campo (igual ao da tabela).
   */
  name: string;

  /**
   * Label para exibição.
   */
  label: string;

  /**
   * Tipo do campo no formulário.
   */
  type: 'text' | 'number' | 'date' | 'time' | 'boolean' | 'select' | 'textarea';

  /**
   * Tipo original do campo Sankhya.
   */
  tipoSankhya: TipoCampoValor;

  /**
   * Se o campo é obrigatório.
   */
  required: boolean;

  /**
   * Se o campo é apenas leitura.
   */
  readonly: boolean;

  /**
   * Valor padrão.
   */
  defaultValue?: any;

  /**
   * Placeholder.
   */
  placeholder?: string;

  /**
   * Texto de ajuda.
   */
  helpText?: string;

  /**
   * Máscara de input (CPF, CNPJ, telefone, etc).
   */
  mask?: string;

  /**
   * Regras de validação.
   */
  validations: IValidationRule[];

  /**
   * Opções para campos select/radio.
   */
  options?: Array<{ value: any; label: string }>;

  /**
   * Tamanho máximo (para strings).
   */
  maxLength?: number;

  /**
   * Número de decimais (para números).
   */
  decimals?: number;

  /**
   * Valor mínimo (para números/datas).
   */
  min?: number | Date;

  /**
   * Valor máximo (para números/datas).
   */
  max?: number | Date;

  /**
   * Ordem de exibição.
   */
  order: number;

  /**
   * Se deve ser visível.
   */
  visible: boolean;

  /**
   * Se é chave primária.
   */
  isPrimaryKey: boolean;

  /**
   * Se é chave estrangeira.
   */
  isForeignKey: boolean;
}

/**
 * Schema completo de formulário.
 *
 * @module FormBuilder
 */
export interface IFormSchema {
  /**
   * Nome da tabela.
   */
  tableName: string;

  /**
   * Título do formulário.
   */
  title: string;

  /**
   * Descrição do formulário.
   */
  description?: string;

  /**
   * Campos do formulário.
   */
  fields: ICampoFormSchema[];

  /**
   * Metadados adicionais.
   */
  metadata?: {
    /**
     * Chave primária da tabela.
     */
    primaryKey?: string;

    /**
     * Chaves estrangeiras.
     */
    foreignKeys?: string[];

    /**
     * Campos obrigatórios.
     */
    requiredFields?: string[];
  };
}
