import { Injectable } from '@nestjs/common';
import { TraducaoService } from '../../../i18n/services';
import { ObterTraducaoTabelaInput } from './obter-traducao-tabela.input';
import { ObterTraducaoTabelaOutput } from './obter-traducao-tabela.output';

/**
 * Caso de uso para obter tradução de tabela.
 *
 * Busca tradução da descrição de uma tabela no idioma especificado.
 *
 * @module Dicionario
 */
@Injectable()
export class ObterTraducaoTabelaUseCase {
  constructor(private readonly traducaoService: TraducaoService) {}

  /**
   * Executa o caso de uso para obter tradução.
   *
   * @param entrada - Dados de entrada
   * @returns Tradução da tabela
   */
  async executar(entrada: ObterTraducaoTabelaInput): Promise<ObterTraducaoTabelaOutput> {
    const nomeTabela = entrada.nomeTabela.toUpperCase();
    const idioma = entrada.idioma || 'pt-BR';

    const traducao = await this.traducaoService.obterTraducaoTabela(nomeTabela, idioma, entrada.tokenUsuario);

    if (!traducao) {
      return {
        nomeTabela,
        idioma,
        descricaoTraduzida: null,
        encontrada: false,
      };
    }

    return {
      nomeTabela: traducao.nomeTabela,
      idioma: traducao.idioma,
      descricaoTraduzida: traducao.descricaoTraduzida,
      encontrada: true,
    };
  }
}
