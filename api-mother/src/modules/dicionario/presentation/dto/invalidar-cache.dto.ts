/**
 * DTO para invalidação de cache.
 *
 * @module Dicionario/Presentation
 */
export class InvalidarCacheDto {
  tokenUsuario?: string;
  tipo: 'tudo' | 'tabela' | 'campo' | 'opcoes';
  nomeTabela?: string;
  nomeCampo?: string;
}
