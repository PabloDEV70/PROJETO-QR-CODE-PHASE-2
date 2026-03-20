import { Injectable } from '@nestjs/common';
import { Campo } from '../../../domain/entities/campo.entity';

/**
 * Interface para representar schemas de validação.
 *
 * Usado para descrever regras de validação sem depender de bibliotecas externas.
 *
 * @module FormBuilder
 */
export interface ValidationSchema {
  type: 'string' | 'number' | 'date' | 'boolean';
  optional: boolean;
  rules: ValidationRule[];
}

export interface ValidationRule {
  type: 'max' | 'min' | 'int' | 'email' | 'pattern';
  value?: number | string;
  message?: string;
}

/**
 * Conversor de TipoCampo para schemas de validação.
 *
 * Gera schemas de validação a partir de campos do dicionário.
 * Esta implementação retorna objetos que podem ser usados para
 * gerar schemas Zod, Yup, ou outras bibliotecas de validação.
 *
 * @module FormBuilder
 */
@Injectable()
export class TipoCampoZodConverter {
  /**
   * Converte um campo para schema de validação.
   */
  converterCampo(campo: Campo): ValidationSchema {
    const schema: ValidationSchema = {
      type: 'string',
      optional: !campo.obrigatorio,
      rules: [],
    };

    // Determinar tipo base
    if (campo.tipo.ehTexto()) {
      schema.type = 'string';
      if (campo.tamanho > 0) {
        schema.rules.push({
          type: 'max',
          value: campo.tamanho,
          message: `Máximo de ${campo.tamanho} caracteres`,
        });
      }
    } else if (campo.tipo.ehNumerico()) {
      schema.type = 'number';
      if (campo.decimais === 0) {
        schema.rules.push({
          type: 'int',
          message: 'Deve ser um número inteiro',
        });
      }
    } else if (campo.tipo.ehData()) {
      schema.type = 'date';
    } else if (campo.tipo.ehBooleano()) {
      schema.type = 'boolean';
    }

    return schema;
  }

  /**
   * Converte lista de campos para schema de objeto.
   */
  converterCampos(campos: Campo[]): Record<string, ValidationSchema> {
    const shape: Record<string, ValidationSchema> = {};

    for (const campo of campos) {
      shape[campo.nomeCampo] = this.converterCampo(campo);
    }

    return shape;
  }

  /**
   * Gera código Zod a partir do schema.
   *
   * Útil para geração de código TypeScript.
   */
  gerarCodigoZod(schema: ValidationSchema): string {
    let code = `z.${schema.type}()`;

    for (const rule of schema.rules) {
      switch (rule.type) {
        case 'max':
          code += `.max(${rule.value})`;
          break;
        case 'min':
          code += `.min(${rule.value})`;
          break;
        case 'int':
          code += '.int()';
          break;
        case 'email':
          code += '.email()';
          break;
        case 'pattern':
          code += `.regex(/${rule.value}/)`;
          break;
      }
    }

    if (schema.optional) {
      code += '.optional()';
    }

    return code;
  }

  /**
   * Gera código Zod completo para um objeto.
   */
  gerarCodigoZodObjeto(campos: Campo[]): string {
    const shapes = this.converterCampos(campos);
    const lines: string[] = ['z.object({'];

    for (const [nome, schema] of Object.entries(shapes)) {
      lines.push(`  ${nome}: ${this.gerarCodigoZod(schema)},`);
    }

    lines.push('})');
    return lines.join('\n');
  }
}
