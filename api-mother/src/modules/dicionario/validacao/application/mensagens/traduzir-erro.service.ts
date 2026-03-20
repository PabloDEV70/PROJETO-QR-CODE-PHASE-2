import { Injectable } from '@nestjs/common';

/**
 * Traduções de mensagens de erro.
 */
interface TraducoesErro {
  pt: string;
  en?: string;
  es?: string;
}

/**
 * Serviço para tradução de mensagens de erro (i18n).
 *
 * Suporta múltiplos idiomas para mensagens de validação.
 */
@Injectable()
export class TraduzirErroService {
  private readonly traducoesComuns: Map<string, TraducoesErro> = new Map([
    [
      'CAMPO_OBRIGATORIO',
      {
        pt: 'O campo é obrigatório',
        en: 'The field is required',
        es: 'El campo es obligatorio',
      },
    ],
    [
      'TIPO_INVALIDO',
      {
        pt: 'Tipo de dado inválido',
        en: 'Invalid data type',
        es: 'Tipo de dato inválido',
      },
    ],
    [
      'TAMANHO_EXCEDIDO',
      {
        pt: 'Tamanho máximo excedido',
        en: 'Maximum size exceeded',
        es: 'Tamaño máximo excedido',
      },
    ],
    [
      'FORMATO_INVALIDO',
      {
        pt: 'Formato inválido',
        en: 'Invalid format',
        es: 'Formato inválido',
      },
    ],
    [
      'CAMPO_INEXISTENTE',
      {
        pt: 'Campo não existe na tabela',
        en: 'Field does not exist in table',
        es: 'Campo no existe en la tabla',
      },
    ],
  ]);

  /**
   * Traduz mensagem de erro para idioma especificado.
   *
   * @param chave - Chave da mensagem
   * @param idioma - Código do idioma (pt, en, es)
   * @param parametros - Parâmetros para interpolação
   * @returns Mensagem traduzida
   */
  traduzir(chave: string, idioma: string = 'pt', parametros?: Record<string, any>): string {
    const traducao = this.traducoesComuns.get(chave);

    if (!traducao) {
      return chave; // Fallback: retorna a chave se não encontrar tradução
    }

    let mensagem = traducao[idioma as keyof TraducoesErro] || traducao.pt;

    // Interpolação de parâmetros
    if (parametros) {
      for (const [key, value] of Object.entries(parametros)) {
        mensagem = mensagem.replace(`{${key}}`, String(value));
      }
    }

    return mensagem;
  }

  /**
   * Detecta idioma preferido do usuário via Accept-Language header.
   *
   * @param acceptLanguageHeader - Header Accept-Language
   * @returns Código do idioma (pt, en, es)
   */
  detectarIdioma(acceptLanguageHeader?: string): string {
    if (!acceptLanguageHeader) {
      return 'pt'; // Padrão: português
    }

    const idioma = acceptLanguageHeader.split(',')[0].split('-')[0].toLowerCase();

    // Apenas idiomas suportados
    if (['pt', 'en', 'es'].includes(idioma)) {
      return idioma;
    }

    return 'pt';
  }

  /**
   * Adiciona nova tradução dinamicamente.
   *
   * @param chave - Chave da mensagem
   * @param traducoes - Objeto com traduções
   */
  adicionarTraducao(chave: string, traducoes: TraducoesErro): void {
    this.traducoesComuns.set(chave, traducoes);
  }
}
