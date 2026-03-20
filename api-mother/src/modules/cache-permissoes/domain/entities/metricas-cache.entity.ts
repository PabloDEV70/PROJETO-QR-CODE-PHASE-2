/**
 * Entidade que representa as metricas de cache.
 *
 * Rastreia hits, misses, evictions e outras metricas
 * para monitoramento de performance do cache.
 *
 * @module M6 - Cache de Permissoes
 */

export interface DadosMetricasCache {
  hits?: number;
  misses?: number;
  evictions?: number;
  tamanhoAtual?: number;
  tamanhoMaximo?: number;
  iniciadoEm?: Date;
}

export class MetricasCache {
  private _hits: number;
  private _misses: number;
  private _evictions: number;
  private _tamanhoAtual: number;
  private _tamanhoMaximo: number;
  private readonly _iniciadoEm: Date;
  private _ultimaAtualizacao: Date;

  private constructor(dados: DadosMetricasCache = {}) {
    this._hits = dados.hits || 0;
    this._misses = dados.misses || 0;
    this._evictions = dados.evictions || 0;
    this._tamanhoAtual = dados.tamanhoAtual || 0;
    this._tamanhoMaximo = dados.tamanhoMaximo || 10000;
    this._iniciadoEm = dados.iniciadoEm || new Date();
    this._ultimaAtualizacao = new Date();
  }

  static criar(dados?: DadosMetricasCache): MetricasCache {
    return new MetricasCache(dados);
  }

  get hits(): number {
    return this._hits;
  }

  get misses(): number {
    return this._misses;
  }

  get evictions(): number {
    return this._evictions;
  }

  get tamanhoAtual(): number {
    return this._tamanhoAtual;
  }

  get tamanhoMaximo(): number {
    return this._tamanhoMaximo;
  }

  get iniciadoEm(): Date {
    return this._iniciadoEm;
  }

  get ultimaAtualizacao(): Date {
    return this._ultimaAtualizacao;
  }

  get totalRequisicoes(): number {
    return this._hits + this._misses;
  }

  get taxaHit(): number {
    const total = this.totalRequisicoes;
    if (total === 0) return 0;
    return Number(((this._hits / total) * 100).toFixed(2));
  }

  get taxaMiss(): number {
    const total = this.totalRequisicoes;
    if (total === 0) return 0;
    return Number(((this._misses / total) * 100).toFixed(2));
  }

  get percentualOcupacao(): number {
    if (this._tamanhoMaximo === 0) return 0;
    return Number(((this._tamanhoAtual / this._tamanhoMaximo) * 100).toFixed(2));
  }

  get tempoAtivo(): number {
    return Date.now() - this._iniciadoEm.getTime();
  }

  get tempoAtivoFormatado(): string {
    const ms = this.tempoAtivo;
    const segundos = Math.floor(ms / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (dias > 0) return `${dias}d ${horas % 24}h`;
    if (horas > 0) return `${horas}h ${minutos % 60}m`;
    if (minutos > 0) return `${minutos}m ${segundos % 60}s`;
    return `${segundos}s`;
  }

  registrarHit(): void {
    this._hits++;
    this._ultimaAtualizacao = new Date();
  }

  registrarMiss(): void {
    this._misses++;
    this._ultimaAtualizacao = new Date();
  }

  registrarEviction(): void {
    this._evictions++;
    this._ultimaAtualizacao = new Date();
  }

  atualizarTamanho(tamanho: number): void {
    this._tamanhoAtual = tamanho;
    this._ultimaAtualizacao = new Date();
  }

  definirTamanhoMaximo(tamanho: number): void {
    this._tamanhoMaximo = tamanho;
  }

  resetar(): void {
    this._hits = 0;
    this._misses = 0;
    this._evictions = 0;
    this._tamanhoAtual = 0;
    this._ultimaAtualizacao = new Date();
  }

  toJSON(): object {
    return {
      hits: this._hits,
      misses: this._misses,
      evictions: this._evictions,
      totalRequisicoes: this.totalRequisicoes,
      taxaHit: `${this.taxaHit}%`,
      taxaMiss: `${this.taxaMiss}%`,
      tamanhoAtual: this._tamanhoAtual,
      tamanhoMaximo: this._tamanhoMaximo,
      percentualOcupacao: `${this.percentualOcupacao}%`,
      iniciadoEm: this._iniciadoEm.toISOString(),
      ultimaAtualizacao: this._ultimaAtualizacao.toISOString(),
      tempoAtivo: this.tempoAtivoFormatado,
    };
  }
}
