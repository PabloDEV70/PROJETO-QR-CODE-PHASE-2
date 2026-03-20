import { Injectable } from '@nestjs/common';
import { Resultado } from '../../../shared/resultado';
import { Campo } from '../../../domain/entities/campo.entity';

/**
 * Token de injeção de dependência do serviço ValidadorCampo.
 */
export const VALIDADOR_CAMPO_SERVICE = Symbol('ValidadorCampoService');

/**
 * Interface do serviço ValidadorCampo.
 */
export interface IValidadorCampoService {
  validarValor(campo: Campo, valor: any): Resultado<void>;
  validarObjeto(campos: Campo[], objeto: Record<string, any>): Resultado<Record<string, string>>;
}

/**
 * Resultado de validação de um campo.
 */
export interface ResultadoValidacaoCampo {
  valido: boolean;
  erros: string[];
}

/**
 * Serviço de domínio para validar valores de campos.
 *
 * Valida valores contra as regras de um campo do dicionário.
 *
 * @module FormBuilder
 */
@Injectable()
export class ValidadorCampoService implements IValidadorCampoService {
  /**
   * Valida um valor individual contra as regras de um campo.
   *
   * @param campo - Campo do dicionário
   * @param valor - Valor a ser validado
   * @returns Resultado da validação (sucesso ou erro com mensagem)
   */
  validarValor(campo: Campo, valor: any): Resultado<void> {
    const erros: string[] = [];

    // Validar obrigatório
    if (campo.obrigatorio && this.ehValorVazio(valor)) {
      erros.push(`${campo.descricao || campo.nomeCampo} é obrigatório`);
    }

    // Se valor está vazio e não é obrigatório, não validar mais nada
    if (this.ehValorVazio(valor)) {
      return erros.length > 0 ? Resultado.falhar(erros.join('; ')) : Resultado.ok();
    }

    // Validar tipo
    const erroTipo = this.validarTipo(campo, valor);
    if (erroTipo) {
      erros.push(erroTipo);
    }

    // Validar tamanho (strings)
    if (campo.tipo.ehTexto()) {
      const erroTamanho = this.validarTamanho(campo, valor);
      if (erroTamanho) {
        erros.push(erroTamanho);
      }
    }

    // Validar decimais (números)
    if (campo.tipo.ehNumerico()) {
      const erroDecimais = this.validarDecimais(campo, valor);
      if (erroDecimais) {
        erros.push(erroDecimais);
      }
    }

    return erros.length > 0 ? Resultado.falhar(erros.join('; ')) : Resultado.ok();
  }

  /**
   * Valida um objeto completo contra uma lista de campos.
   *
   * @param campos - Lista de campos do dicionário
   * @param objeto - Objeto com valores a serem validados
   * @returns Resultado com mapa de erros por campo (vazio se válido)
   */
  validarObjeto(campos: Campo[], objeto: Record<string, any>): Resultado<Record<string, string>> {
    const erros: Record<string, string> = {};

    for (const campo of campos) {
      const valor = objeto[campo.nomeCampo];
      const resultado = this.validarValor(campo, valor);

      if (resultado.falhou) {
        erros[campo.nomeCampo] = resultado.erro!;
      }
    }

    return Object.keys(erros).length > 0 ? Resultado.falhar(JSON.stringify(erros)) : Resultado.ok(erros);
  }

  // Métodos auxiliares privados

  private ehValorVazio(valor: any): boolean {
    return valor === null || valor === undefined || valor === '';
  }

  private validarTipo(campo: Campo, valor: any): string | null {
    // String
    if (campo.tipo.ehTexto()) {
      if (typeof valor !== 'string') {
        return `${campo.descricao || campo.nomeCampo} deve ser texto`;
      }
      return null;
    }

    // Número
    if (campo.tipo.ehNumerico()) {
      const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
      if (isNaN(numero) || typeof numero !== 'number') {
        return `${campo.descricao || campo.nomeCampo} deve ser um número válido`;
      }
      return null;
    }

    // Data
    if (campo.tipo.ehData()) {
      const data = valor instanceof Date ? valor : new Date(valor);
      if (isNaN(data.getTime())) {
        return `${campo.descricao || campo.nomeCampo} deve ser uma data válida`;
      }
      return null;
    }

    // Hora
    if (campo.tipo.ehHora()) {
      if (typeof valor !== 'string' || !/^\d{2}:\d{2}(:\d{2})?$/.test(valor)) {
        return `${campo.descricao || campo.nomeCampo} deve ser uma hora válida (HH:mm ou HH:mm:ss)`;
      }
      return null;
    }

    // Booleano
    if (campo.tipo.ehBooleano()) {
      if (typeof valor !== 'boolean' && valor !== 'S' && valor !== 'N') {
        return `${campo.descricao || campo.nomeCampo} deve ser verdadeiro/falso ou S/N`;
      }
      return null;
    }

    return null;
  }

  private validarTamanho(campo: Campo, valor: string): string | null {
    if (campo.tamanho > 0 && valor.length > campo.tamanho) {
      return `${campo.descricao || campo.nomeCampo} não pode ter mais de ${campo.tamanho} caracteres`;
    }
    return null;
  }

  private validarDecimais(campo: Campo, valor: number | string): string | null {
    if (campo.decimais === 0) {
      // Inteiro
      const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
      if (!Number.isInteger(numero)) {
        return `${campo.descricao || campo.nomeCampo} deve ser um número inteiro`;
      }
      return null;
    }

    if (campo.decimais > 0) {
      const valorStr = typeof valor === 'string' ? valor : valor.toString();
      const partes = valorStr.split('.');
      if (partes.length > 1 && partes[1].length > campo.decimais) {
        return `${campo.descricao || campo.nomeCampo} pode ter no máximo ${campo.decimais} casas decimais`;
      }
    }

    return null;
  }
}
