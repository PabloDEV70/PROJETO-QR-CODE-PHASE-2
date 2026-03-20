import { Injectable } from '@nestjs/common';
import { Resultado } from '../../../shared/resultado';
import { Campo } from '../../../domain/entities/campo.entity';
import { IValidadorCampo } from '../../domain/interfaces/validador-campo.interface';

/**
 * Implementação de validador de campos via dicionário.
 *
 * Valida valores contra metadados de campos (tipo, tamanho, obrigatoriedade).
 */
@Injectable()
export class ValidadorCampoService implements IValidadorCampo {
  validarValor(campo: Campo, valor: any): Resultado<void> {
    // 1. Validar obrigatoriedade
    const resultadoObrigatorio = this.validarObrigatoriedade(campo, valor);
    if (resultadoObrigatorio.falhou) {
      return resultadoObrigatorio;
    }

    // Se valor é null/undefined e campo não é obrigatório, OK
    if (valor === null || valor === undefined) {
      return Resultado.ok<void>();
    }

    // 2. Validar tipo
    const resultadoTipo = this.validarTipo(campo, valor);
    if (resultadoTipo.falhou) {
      return resultadoTipo;
    }

    // 3. Validar tamanho
    const resultadoTamanho = this.validarTamanho(campo, valor);
    if (resultadoTamanho.falhou) {
      return resultadoTamanho;
    }

    // 4. Validar formato
    const resultadoFormato = this.validarFormato(campo, valor);
    if (resultadoFormato.falhou) {
      return resultadoFormato;
    }

    return Resultado.ok<void>();
  }

  validarTipo(campo: Campo, valor: any): Resultado<void> {
    if (valor === null || valor === undefined) {
      return Resultado.ok<void>();
    }

    const tipoEsperado = campo.tipo.valor;
    const tipoReal = typeof valor;

    switch (tipoEsperado) {
      case 'S': // String
      case 'C': // CLOB
        if (tipoReal !== 'string') {
          return Resultado.falhar(`Campo '${campo.nomeCampo}': esperado string, recebido ${tipoReal}`);
        }
        break;

      case 'I': // Inteiro
        if (tipoReal !== 'number' || !Number.isInteger(valor)) {
          return Resultado.falhar(`Campo '${campo.nomeCampo}': esperado inteiro, recebido ${tipoReal}`);
        }
        break;

      case 'F': // Float/Decimal
        if (tipoReal !== 'number' || !Number.isFinite(valor)) {
          return Resultado.falhar(`Campo '${campo.nomeCampo}': esperado number, recebido ${tipoReal}`);
        }
        break;

      case 'D': // Data
        if (!(valor instanceof Date) && !this.ehStringData(valor)) {
          return Resultado.falhar(`Campo '${campo.nomeCampo}': esperado Date ou string ISO, recebido ${tipoReal}`);
        }
        break;

      case 'B': // Booleano
        if (tipoReal !== 'boolean' && !['S', 'N'].includes(String(valor).toUpperCase())) {
          return Resultado.falhar(`Campo '${campo.nomeCampo}': esperado boolean ou 'S'/'N', recebido ${valor}`);
        }
        break;
    }

    return Resultado.ok<void>();
  }

  validarTamanho(campo: Campo, valor: any): Resultado<void> {
    if (valor === null || valor === undefined) {
      return Resultado.ok<void>();
    }

    const tamanhoMaximo = campo.tamanho;
    if (tamanhoMaximo <= 0) {
      return Resultado.ok<void>(); // Sem limite
    }

    let tamanhoAtual = 0;

    if (typeof valor === 'string') {
      tamanhoAtual = valor.length;
    } else if (Array.isArray(valor)) {
      tamanhoAtual = valor.length;
    } else if (typeof valor === 'number') {
      // Para números, validar dígitos
      const valorStr = Math.abs(valor).toString();
      tamanhoAtual = valorStr.replace('.', '').length;
    }

    if (tamanhoAtual > tamanhoMaximo) {
      return Resultado.falhar(`Campo '${campo.nomeCampo}': tamanho ${tamanhoAtual} excede máximo de ${tamanhoMaximo}`);
    }

    return Resultado.ok<void>();
  }

  validarObrigatoriedade(campo: Campo, valor: any): Resultado<void> {
    if (!campo.obrigatorio) {
      return Resultado.ok<void>();
    }

    if (valor === null || valor === undefined || valor === '') {
      return Resultado.falhar(`Campo '${campo.nomeCampo}' é obrigatório e não foi fornecido`);
    }

    return Resultado.ok<void>();
  }

  validarFormato(campo: Campo, valor: any): Resultado<void> {
    if (valor === null || valor === undefined) {
      return Resultado.ok<void>();
    }

    // Validações de formato específicas por tipo
    const tipoEsperado = campo.tipo.valor;

    switch (tipoEsperado) {
      case 'D': // Data
        if (typeof valor === 'string' && !this.ehStringData(valor)) {
          return Resultado.falhar(`Campo '${campo.nomeCampo}': formato de data inválido (esperado ISO 8601)`);
        }
        break;

      case 'F': // Float/Decimal
        if (typeof valor === 'number') {
          // Validar decimais
          const decimaisEsperados = campo.decimais;
          if (decimaisEsperados > 0) {
            const decimaisAtuais = this.contarDecimais(valor);
            if (decimaisAtuais > decimaisEsperados) {
              return Resultado.falhar(
                `Campo '${campo.nomeCampo}': máximo ${decimaisEsperados} casas decimais, recebido ${decimaisAtuais}`,
              );
            }
          }
        }
        break;
    }

    return Resultado.ok<void>();
  }

  /**
   * Verifica se string é data válida.
   */
  private ehStringData(valor: string): boolean {
    const data = new Date(valor);
    return !isNaN(data.getTime());
  }

  /**
   * Conta casas decimais de um número.
   */
  private contarDecimais(valor: number): number {
    if (Number.isInteger(valor)) return 0;
    const str = valor.toString();
    const partes = str.split('.');
    return partes.length > 1 ? partes[1].length : 0;
  }
}
