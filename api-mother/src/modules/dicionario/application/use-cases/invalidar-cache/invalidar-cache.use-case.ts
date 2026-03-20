import { Injectable, BadRequestException } from '@nestjs/common';
import { DictionaryCacheService } from '../../../cache/services';
import { InvalidarCacheInput } from './invalidar-cache.input';
import { InvalidarCacheOutput } from './invalidar-cache.output';

/**
 * Caso de uso para invalidar cache do dicionário.
 *
 * Permite invalidação seletiva (tabela, campo, opções) ou total.
 * Apenas para administradores.
 *
 * @module Dicionario
 */
@Injectable()
export class InvalidarCacheUseCase {
  constructor(private readonly dictionaryCache: DictionaryCacheService) {}

  /**
   * Executa o caso de uso para invalidar cache.
   *
   * @param entrada - Dados de entrada contendo tipo de invalidação
   * @returns Confirmação da invalidação
   */
  async executar(entrada: InvalidarCacheInput): Promise<InvalidarCacheOutput> {
    const timestamp = new Date();

    switch (entrada.tipo) {
      case 'tudo':
        await this.dictionaryCache.invalidarTudo();
        return {
          mensagem: 'Todo o cache do dicionário foi invalidado',
          tipo: 'tudo',
          timestamp,
        };

      case 'tabela':
        if (!entrada.nomeTabela) {
          throw new BadRequestException('Nome da tabela é obrigatório para invalidação de tabela');
        }
        await this.dictionaryCache.invalidarTabelaCompleta(entrada.nomeTabela);
        return {
          mensagem: `Cache da tabela ${entrada.nomeTabela} foi invalidado`,
          tipo: 'tabela',
          timestamp,
        };

      case 'campo':
        if (!entrada.nomeTabela || !entrada.nomeCampo) {
          throw new BadRequestException('Nome da tabela e campo são obrigatórios para invalidação de campo');
        }
        await this.dictionaryCache.invalidarCampo(entrada.nomeTabela, entrada.nomeCampo);
        return {
          mensagem: `Cache do campo ${entrada.nomeTabela}.${entrada.nomeCampo} foi invalidado`,
          tipo: 'campo',
          timestamp,
        };

      case 'opcoes':
        if (!entrada.nomeTabela || !entrada.nomeCampo) {
          throw new BadRequestException('Nome da tabela e campo são obrigatórios para invalidação de opções');
        }
        await this.dictionaryCache.invalidarOpcoesCampo(entrada.nomeTabela, entrada.nomeCampo);
        return {
          mensagem: `Cache de opções do campo ${entrada.nomeTabela}.${entrada.nomeCampo} foi invalidado`,
          tipo: 'opcoes',
          timestamp,
        };

      default:
        throw new BadRequestException(`Tipo de invalidação inválido: ${entrada.tipo}`);
    }
  }
}
