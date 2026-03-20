import { Injectable, Inject, Logger } from '@nestjs/common';
import { ICacheMetadados, CACHE_METADADOS } from '../interfaces';

/**
 * Serviço de cache do dicionário de dados.
 *
 * Provê métodos de alto nível para cache de tabelas, campos e opções,
 * abstraindo a complexidade de geração de chaves e invalidação.
 *
 * @module Dicionario/Cache
 */
@Injectable()
export class DictionaryCacheService {
  private readonly logger = new Logger(DictionaryCacheService.name);

  // TTLs padrão (em segundos)
  private readonly TTL_TABELA = 3600; // 1 hora
  private readonly TTL_CAMPO = 3600; // 1 hora
  private readonly TTL_OPCOES = 1800; // 30 minutos
  private readonly TTL_LISTA = 600; // 10 minutos

  constructor(
    @Inject(CACHE_METADADOS)
    private readonly cache: ICacheMetadados,
  ) {}

  // ========== TABELAS ==========

  /**
   * Obtém tabela do cache.
   */
  async obterTabela(nomeTabela: string): Promise<any | null> {
    const chave = this.gerarChaveTabela(nomeTabela);
    return await this.cache.obter(chave);
  }

  /**
   * Armazena tabela no cache.
   */
  async armazenarTabela(nomeTabela: string, tabela: any): Promise<void> {
    const chave = this.gerarChaveTabela(nomeTabela);
    await this.cache.definir(chave, tabela, this.TTL_TABELA);
    this.logger.debug(`Tabela armazenada no cache: ${nomeTabela}`);
  }

  /**
   * Invalida cache de tabela.
   */
  async invalidarTabela(nomeTabela: string): Promise<void> {
    const chave = this.gerarChaveTabela(nomeTabela);
    await this.cache.remover(chave);
    this.logger.log(`Cache de tabela invalidado: ${nomeTabela}`);
  }

  /**
   * Obtém lista de tabelas do cache.
   */
  async obterListaTabelas(filtro?: string): Promise<any[] | null> {
    const chave = this.gerarChaveListaTabelas(filtro);
    return await this.cache.obter(chave);
  }

  /**
   * Armazena lista de tabelas no cache.
   */
  async armazenarListaTabelas(tabelas: any[], filtro?: string): Promise<void> {
    const chave = this.gerarChaveListaTabelas(filtro);
    await this.cache.definir(chave, tabelas, this.TTL_LISTA);
    this.logger.debug(`Lista de tabelas armazenada no cache (filtro: ${filtro || 'nenhum'})`);
  }

  // ========== CAMPOS ==========

  /**
   * Obtém campo do cache.
   */
  async obterCampo(nomeTabela: string, nomeCampo: string): Promise<any | null> {
    const chave = this.gerarChaveCampo(nomeTabela, nomeCampo);
    return await this.cache.obter(chave);
  }

  /**
   * Armazena campo no cache.
   */
  async armazenarCampo(nomeTabela: string, nomeCampo: string, campo: any): Promise<void> {
    const chave = this.gerarChaveCampo(nomeTabela, nomeCampo);
    await this.cache.definir(chave, campo, this.TTL_CAMPO);
    this.logger.debug(`Campo armazenado no cache: ${nomeTabela}.${nomeCampo}`);
  }

  /**
   * Invalida cache de campo.
   */
  async invalidarCampo(nomeTabela: string, nomeCampo: string): Promise<void> {
    const chave = this.gerarChaveCampo(nomeTabela, nomeCampo);
    await this.cache.remover(chave);
    this.logger.log(`Cache de campo invalidado: ${nomeTabela}.${nomeCampo}`);
  }

  /**
   * Obtém lista de campos de tabela do cache.
   */
  async obterCamposTabela(nomeTabela: string): Promise<any[] | null> {
    const chave = this.gerarChaveCamposTabela(nomeTabela);
    return await this.cache.obter(chave);
  }

  /**
   * Armazena lista de campos de tabela no cache.
   */
  async armazenarCamposTabela(nomeTabela: string, campos: any[]): Promise<void> {
    const chave = this.gerarChaveCamposTabela(nomeTabela);
    await this.cache.definir(chave, campos, this.TTL_LISTA);
    this.logger.debug(`Campos de tabela armazenados no cache: ${nomeTabela}`);
  }

  /**
   * Invalida cache de todos os campos de uma tabela.
   */
  async invalidarCamposTabela(nomeTabela: string): Promise<void> {
    const prefixo = `campo:${nomeTabela.toUpperCase()}:`;
    await this.cache.removerPorPrefixo(prefixo);

    // Também remover lista de campos
    const chave = this.gerarChaveCamposTabela(nomeTabela);
    await this.cache.remover(chave);

    this.logger.log(`Cache de campos da tabela invalidado: ${nomeTabela}`);
  }

  // ========== OPÇÕES ==========

  /**
   * Obtém opções de campo do cache.
   */
  async obterOpcoesCampo(nomeTabela: string, nomeCampo: string): Promise<any[] | null> {
    const chave = this.gerarChaveOpcoes(nomeTabela, nomeCampo);
    return await this.cache.obter(chave);
  }

  /**
   * Armazena opções de campo no cache.
   */
  async armazenarOpcoesCampo(nomeTabela: string, nomeCampo: string, opcoes: any[]): Promise<void> {
    const chave = this.gerarChaveOpcoes(nomeTabela, nomeCampo);
    await this.cache.definir(chave, opcoes, this.TTL_OPCOES);
    this.logger.debug(`Opções de campo armazenadas no cache: ${nomeTabela}.${nomeCampo}`);
  }

  /**
   * Invalida cache de opções de campo.
   */
  async invalidarOpcoesCampo(nomeTabela: string, nomeCampo: string): Promise<void> {
    const chave = this.gerarChaveOpcoes(nomeTabela, nomeCampo);
    await this.cache.remover(chave);
    this.logger.log(`Cache de opções invalidado: ${nomeTabela}.${nomeCampo}`);
  }

  // ========== INVALIDAÇÃO GLOBAL ==========

  /**
   * Invalida todo o cache de uma tabela (tabela + campos + opções).
   */
  async invalidarTabelaCompleta(nomeTabela: string): Promise<void> {
    const nome = nomeTabela.toUpperCase();

    // Invalidar tabela
    await this.invalidarTabela(nome);

    // Invalidar todos os campos
    await this.invalidarCamposTabela(nome);

    // Invalidar listas
    const prefixoLista = 'lista:tabelas:';
    await this.cache.removerPorPrefixo(prefixoLista);

    this.logger.log(`Cache completo da tabela invalidado: ${nomeTabela}`);
  }

  /**
   * Invalida todo o cache do dicionário.
   */
  async invalidarTudo(): Promise<void> {
    await this.cache.limpar();
    this.logger.warn('TODO o cache do dicionário foi invalidado');
  }

  // ========== WARM-UP ==========

  /**
   * Pré-carrega cache com tabelas mais acessadas.
   *
   * @param tabelasParaPreCarregar - Lista de nomes de tabelas
   */
  async warmUp(tabelasParaPreCarregar: string[]): Promise<void> {
    this.logger.log(`Iniciando warm-up do cache para ${tabelasParaPreCarregar.length} tabelas...`);

    // Nota: Warm-up real seria implementado pelos use cases que buscam dados
    // Este método serve como hook para inicialização

    this.logger.log('Warm-up concluído');
  }

  // ========== ESTATÍSTICAS ==========

  /**
   * Obtém estatísticas do cache.
   */
  async obterEstatisticas() {
    return await this.cache.obterEstatisticas();
  }

  // ========== GERAÇÃO DE CHAVES ==========

  private gerarChaveTabela(nomeTabela: string): string {
    return `tabela:${nomeTabela.toUpperCase()}`;
  }

  private gerarChaveCampo(nomeTabela: string, nomeCampo: string): string {
    return `campo:${nomeTabela.toUpperCase()}:${nomeCampo.toUpperCase()}`;
  }

  private gerarChaveOpcoes(nomeTabela: string, nomeCampo: string): string {
    return `opcoes:${nomeTabela.toUpperCase()}:${nomeCampo.toUpperCase()}`;
  }

  private gerarChaveCamposTabela(nomeTabela: string): string {
    return `campos:tabela:${nomeTabela.toUpperCase()}`;
  }

  private gerarChaveListaTabelas(filtro?: string): string {
    const sufixo = filtro ? `:${filtro.toLowerCase()}` : ':todas';
    return `lista:tabelas${sufixo}`;
  }
}
