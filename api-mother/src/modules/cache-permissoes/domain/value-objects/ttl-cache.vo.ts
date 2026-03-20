/**
 * Value Object para TTL (Time To Live) de cache.
 *
 * Encapsula a logica de duracao de cache com valores predefinidos
 * e validacao de limites.
 *
 * @module M6 - Cache de Permissoes
 */

export type PresetTtl = 'curto' | 'medio' | 'longo' | 'permanente';

export class TtlCache {
  private readonly _segundos: number;

  private constructor(segundos: number) {
    this._segundos = segundos;
    Object.freeze(this);
  }

  // Presets de TTL em segundos
  static readonly PRESETS: Record<PresetTtl, number> = {
    curto: 60, // 1 minuto
    medio: 300, // 5 minutos
    longo: 900, // 15 minutos
    permanente: 86400, // 24 horas
  };

  // Limites
  static readonly MIN_TTL = 10; // 10 segundos
  static readonly MAX_TTL = 86400 * 7; // 7 dias

  static criar(segundos: number): TtlCache {
    if (segundos < TtlCache.MIN_TTL) {
      throw new Error(`TTL minimo e ${TtlCache.MIN_TTL} segundos`);
    }

    if (segundos > TtlCache.MAX_TTL) {
      throw new Error(`TTL maximo e ${TtlCache.MAX_TTL} segundos`);
    }

    return new TtlCache(segundos);
  }

  static criarDePreset(preset: PresetTtl): TtlCache {
    const segundos = TtlCache.PRESETS[preset];
    return new TtlCache(segundos);
  }

  static curto(): TtlCache {
    return TtlCache.criarDePreset('curto');
  }

  static medio(): TtlCache {
    return TtlCache.criarDePreset('medio');
  }

  static longo(): TtlCache {
    return TtlCache.criarDePreset('longo');
  }

  static permanente(): TtlCache {
    return TtlCache.criarDePreset('permanente');
  }

  static deMinutos(minutos: number): TtlCache {
    return TtlCache.criar(minutos * 60);
  }

  static deHoras(horas: number): TtlCache {
    return TtlCache.criar(horas * 3600);
  }

  get segundos(): number {
    return this._segundos;
  }

  get milissegundos(): number {
    return this._segundos * 1000;
  }

  get minutos(): number {
    return Math.floor(this._segundos / 60);
  }

  calcularExpiracao(): Date {
    return new Date(Date.now() + this.milissegundos);
  }

  toString(): string {
    if (this._segundos < 60) {
      return `${this._segundos}s`;
    }
    if (this._segundos < 3600) {
      return `${this.minutos}m`;
    }
    const horas = Math.floor(this._segundos / 3600);
    return `${horas}h`;
  }
}
