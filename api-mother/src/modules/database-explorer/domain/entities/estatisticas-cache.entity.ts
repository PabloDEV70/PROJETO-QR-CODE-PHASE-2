/**
 * Entity: EstatisticasCache
 *
 * Representa estatísticas do cache do serviço de exploração do banco.
 */
export interface DadosEstatisticasCache {
  hits: number;
  misses: number;
  keys: number;
  ksize: number;
  vsize: number;
}

export class EstatisticasCache {
  private constructor(
    public readonly acertos: number,
    public readonly erros: number,
    public readonly chaves: number,
    public readonly tamanhoChaves: number,
    public readonly tamanhoValores: number,
  ) {}

  static criar(dados: DadosEstatisticasCache): EstatisticasCache {
    return new EstatisticasCache(dados.hits, dados.misses, dados.keys, dados.ksize, dados.vsize);
  }

  /**
   * Calcula a taxa de acerto do cache (hit rate)
   */
  obterTaxaAcerto(): number {
    const total = this.acertos + this.erros;
    if (total === 0) return 0;
    return Math.round((this.acertos / total) * 100);
  }

  /**
   * Obtém o tamanho total do cache em bytes
   */
  obterTamanhoTotal(): number {
    return this.tamanhoChaves + this.tamanhoValores;
  }

  /**
   * Obtém o tamanho total formatado
   */
  obterTamanhoFormatado(): string {
    const bytes = this.obterTamanhoTotal();
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  /**
   * Verifica se o cache está eficiente (>70% hit rate)
   */
  estaEficiente(): boolean {
    return this.obterTaxaAcerto() >= 70;
  }

  /**
   * Verifica se o cache está vazio
   */
  estaVazio(): boolean {
    return this.chaves === 0;
  }

  /**
   * Retorna resumo das estatísticas
   */
  obterResumo(): Record<string, string | number> {
    return {
      taxaAcerto: `${this.obterTaxaAcerto()}%`,
      totalRequisicoes: this.acertos + this.erros,
      chavesArmazenadas: this.chaves,
      tamanhoTotal: this.obterTamanhoFormatado(),
      eficiente: this.estaEficiente() ? 'Sim' : 'Não',
    };
  }
}
