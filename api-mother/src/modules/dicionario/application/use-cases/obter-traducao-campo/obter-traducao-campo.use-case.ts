import { Injectable } from '@nestjs/common';
import { TraducaoService } from '../../../i18n/services';
import { ObterTraducaoCampoInput } from './obter-traducao-campo.input';
import { ObterTraducaoCampoOutput } from './obter-traducao-campo.output';

/**
 * Caso de uso para obter tradução de campo.
 *
 * Busca tradução da descrição de um campo no idioma especificado.
 *
 * @module Dicionario
 */
@Injectable()
export class ObterTraducaoCampoUseCase {
  constructor(private readonly traducaoService: TraducaoService) {}

  /**
   * Executa o caso de uso para obter tradução.
   *
   * @param entrada - Dados de entrada
   * @returns Tradução do campo
   */
  async executar(entrada: ObterTraducaoCampoInput): Promise<ObterTraducaoCampoOutput> {
    const nomeTabela = entrada.nomeTabela.toUpperCase();
    const nomeCampo = entrada.nomeCampo.toUpperCase();
    const idioma = entrada.idioma || 'pt-BR';

    const traducao = await this.traducaoService.obterTraducaoCampo(nomeTabela, nomeCampo, idioma, entrada.tokenUsuario);

    if (!traducao) {
      return {
        nomeTabela,
        nomeCampo,
        idioma,
        descricaoTraduzida: null,
        descricaoResumidaTraduzida: null,
        encontrada: false,
      };
    }

    return {
      nomeTabela: traducao.nomeTabela,
      nomeCampo: traducao.nomeCampo,
      idioma: traducao.idioma,
      descricaoTraduzida: traducao.descricaoTraduzida,
      descricaoResumidaTraduzida: traducao.descricaoResumidaTraduzida || null,
      encontrada: true,
    };
  }
}
