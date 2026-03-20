import { Injectable } from '@nestjs/common';
import { Campo } from '../../../domain/entities/campo.entity';

/**
 * Conversor de TipoCampo para tipos TypeScript.
 *
 * Gera definições de tipo TypeScript a partir de campos do dicionário.
 *
 * @module FormBuilder
 */
@Injectable()
export class TipoCampoTypeScriptConverter {
  /**
   * Converte um campo para tipo TypeScript.
   */
  converterCampo(campo: Campo): string {
    let tipo = this.mapearTipo(campo);

    if (!campo.obrigatorio) {
      tipo += ' | null';
    }

    return tipo;
  }

  /**
   * Gera interface TypeScript para lista de campos.
   */
  gerarInterface(nomeTabela: string, campos: Campo[]): string {
    const nomeInterface = this.formatarNomeInterface(nomeTabela);
    const propriedades = campos
      .map((campo) => {
        const opcional = campo.obrigatorio ? '' : '?';
        const tipo = this.converterCampo(campo);
        const comentario = campo.descricao ? `  /** ${campo.descricao} */\n` : '';
        return `${comentario}  ${campo.nomeCampo}${opcional}: ${tipo};`;
      })
      .join('\n');

    return `export interface ${nomeInterface} {\n${propriedades}\n}`;
  }

  private mapearTipo(campo: Campo): string {
    if (campo.tipo.ehTexto()) return 'string';
    if (campo.tipo.ehNumerico()) return 'number';
    if (campo.tipo.ehData()) return 'Date';
    if (campo.tipo.ehBooleano()) return 'boolean';
    return 'string';
  }

  private formatarNomeInterface(nomeTabela: string): string {
    return nomeTabela.replace(/^(TGF|TCF|TSI|AD_)/, '').replace(/_/g, '');
  }
}
