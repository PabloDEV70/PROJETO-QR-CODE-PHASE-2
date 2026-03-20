/**
 * Value Object para chave de cache.
 *
 * Encapsula a logica de geracao de chaves de cache,
 * garantindo consistencia e formatacao correta.
 *
 * @module M6 - Cache de Permissoes
 */

export type TipoChaveCache = 'permissao' | 'contexto' | 'parametro' | 'controle';

export interface DadosChaveCache {
  tipo: TipoChaveCache;
  codUsuario: number;
  recurso?: string;
  operacao?: string;
}

export class ChaveCache {
  private readonly _valor: string;
  private readonly _tipo: TipoChaveCache;

  private constructor(valor: string, tipo: TipoChaveCache) {
    this._valor = valor;
    this._tipo = tipo;
    Object.freeze(this);
  }

  static criar(dados: DadosChaveCache): ChaveCache {
    const partes = ['cache', dados.tipo, `user:${dados.codUsuario}`];

    if (dados.recurso) {
      partes.push(`recurso:${dados.recurso}`);
    }

    if (dados.operacao) {
      partes.push(`op:${dados.operacao}`);
    }

    const valor = partes.join(':');
    return new ChaveCache(valor, dados.tipo);
  }

  static criarParaPermissao(codUsuario: number, codTela: number, operacao: string): ChaveCache {
    return ChaveCache.criar({
      tipo: 'permissao',
      codUsuario,
      recurso: `tela:${codTela}`,
      operacao,
    });
  }

  static criarParaContexto(codUsuario: number): ChaveCache {
    return ChaveCache.criar({
      tipo: 'contexto',
      codUsuario,
    });
  }

  static criarParaParametro(codUsuario: number, nomeParametro: string): ChaveCache {
    return ChaveCache.criar({
      tipo: 'parametro',
      codUsuario,
      recurso: nomeParametro,
    });
  }

  static criarParaControle(codUsuario: number, codTela: number, nomeControle: string): ChaveCache {
    return ChaveCache.criar({
      tipo: 'controle',
      codUsuario,
      recurso: `tela:${codTela}`,
      operacao: nomeControle,
    });
  }

  static criarPadrao(tipo: TipoChaveCache, codUsuario: number): ChaveCache {
    return ChaveCache.criar({ tipo, codUsuario });
  }

  get valor(): string {
    return this._valor;
  }

  get tipo(): TipoChaveCache {
    return this._tipo;
  }

  toString(): string {
    return this._valor;
  }

  equals(outro: ChaveCache): boolean {
    if (!outro) return false;
    return this._valor === outro._valor;
  }
}
