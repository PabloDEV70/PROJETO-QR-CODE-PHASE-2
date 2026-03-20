import { Injectable } from '@nestjs/common';
import { Campo } from '../../../domain/entities/campo.entity';

export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
}

export interface JSONSchemaProperty {
  type: string;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  format?: string;
  description?: string;
}

/**
 * Conversor de TipoCampo para JSON Schema.
 *
 * @module FormBuilder
 */
@Injectable()
export class TipoCampoJSONSchemaConverter {
  converterCampo(campo: Campo): JSONSchemaProperty {
    const prop: JSONSchemaProperty = {
      type: this.mapearTipo(campo),
      description: campo.descricao,
    };

    if (campo.tipo.ehTexto() && campo.tamanho > 0) {
      prop.maxLength = campo.tamanho;
    }

    if (campo.tipo.ehData()) {
      prop.format = 'date';
    }

    return prop;
  }

  converterCampos(campos: Campo[]): JSONSchema {
    const properties: Record<string, JSONSchemaProperty> = {};
    const required: string[] = [];

    for (const campo of campos) {
      properties[campo.nomeCampo] = this.converterCampo(campo);
      if (campo.obrigatorio) {
        required.push(campo.nomeCampo);
      }
    }

    return {
      type: 'object',
      properties,
      required,
    };
  }

  private mapearTipo(campo: Campo): string {
    if (campo.tipo.ehTexto()) return 'string';
    if (campo.tipo.ehNumerico()) return 'number';
    if (campo.tipo.ehData()) return 'string';
    if (campo.tipo.ehBooleano()) return 'boolean';
    return 'string';
  }
}
