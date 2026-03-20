import { CampoDto } from '../../mappers/campo.mapper';
import { OpcaoCampoDto } from '../obter-opcoes-campo/obter-opcoes-campo.output';
import { PropriedadeCampoDto } from '../obter-propriedades-campo/obter-propriedades-campo.output';

/**
 * DTO de campo completo com opções e propriedades.
 */
export interface CampoCompletoDto extends CampoDto {
  /**
   * Lista de opções do campo (se houver).
   */
  opcoes: OpcaoCampoDto[];

  /**
   * Lista de propriedades customizadas do campo (se houver).
   */
  propriedades: PropriedadeCampoDto[];

  /**
   * Indica se o campo tem opções.
   */
  temOpcoes: boolean;

  /**
   * Indica se o campo tem propriedades customizadas.
   */
  temPropriedades: boolean;
}

/**
 * Dados de saída do caso de uso ObterCampoCompleto.
 *
 * @module Dicionario
 */
export interface ObterCampoCompletoOutput {
  /**
   * Campo com todas as informações, ou null se não encontrado.
   */
  campo: CampoCompletoDto | null;
}
