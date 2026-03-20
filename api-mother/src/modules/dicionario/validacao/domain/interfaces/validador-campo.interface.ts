import { Resultado } from '../../../shared/resultado';
import { Campo } from '../../../domain/entities/campo.entity';

/**
 * Interface para validação de campos via dicionário.
 *
 * Define contrato para validadores que verificam conformidade
 * de dados com metadados do dicionário Sankhya.
 */
export interface IValidadorCampo {
  /**
   * Valida valor de um campo contra suas regras no dicionário.
   *
   * @param campo - Entidade do campo com metadados
   * @param valor - Valor a ser validado
   * @returns Resultado indicando sucesso ou erro de validação
   */
  validarValor(campo: Campo, valor: any): Resultado<void>;

  /**
   * Valida tipo de dado do valor.
   *
   * @param campo - Campo com tipo esperado
   * @param valor - Valor a validar
   */
  validarTipo(campo: Campo, valor: any): Resultado<void>;

  /**
   * Valida tamanho do valor (strings/arrays).
   *
   * @param campo - Campo com tamanho máximo
   * @param valor - Valor a validar
   */
  validarTamanho(campo: Campo, valor: any): Resultado<void>;

  /**
   * Valida se campo obrigatório foi fornecido.
   *
   * @param campo - Campo com flag obrigatorio
   * @param valor - Valor a validar
   */
  validarObrigatoriedade(campo: Campo, valor: any): Resultado<void>;

  /**
   * Valida formato de valor (regex, padrões).
   *
   * @param campo - Campo com regras de formato
   * @param valor - Valor a validar
   */
  validarFormato(campo: Campo, valor: any): Resultado<void>;
}

export const VALIDADOR_CAMPO = Symbol('IValidadorCampo');
