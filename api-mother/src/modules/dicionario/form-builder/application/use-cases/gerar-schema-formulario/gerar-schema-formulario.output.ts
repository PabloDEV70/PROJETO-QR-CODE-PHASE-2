import { IFormSchema } from '../../../domain/interfaces';

/**
 * Dados de saída do caso de uso GerarSchemaFormulario.
 *
 * @module FormBuilder
 */
export interface GerarSchemaFormularioOutput {
  /**
   * Schema do formulário gerado.
   */
  schema: IFormSchema;
}
