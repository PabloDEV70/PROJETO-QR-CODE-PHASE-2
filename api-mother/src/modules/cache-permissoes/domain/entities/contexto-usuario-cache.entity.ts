/**
 * Entidade que representa o contexto do usuario em cache.
 *
 * Armazena informacoes do usuario que sao frequentemente consultadas
 * para verificacao de permissoes.
 *
 * @module M6 - Cache de Permissoes
 */

export interface DadosContextoUsuario {
  codUsuario: number;
  nomeUsuario: string;
  codGrupo?: number;
  codEmpresa?: number;
  grupos?: number[];
  perfis?: string[];
  parametros?: Record<string, unknown>;
  permissoesGlobais?: string[];
}

export class ContextoUsuarioCache {
  private readonly _codUsuario: number;
  private readonly _nomeUsuario: string;
  private readonly _codGrupo: number | null;
  private readonly _codEmpresa: number | null;
  private readonly _grupos: number[];
  private readonly _perfis: string[];
  private readonly _parametros: Record<string, unknown>;
  private readonly _permissoesGlobais: string[];
  private readonly _carregadoEm: Date;

  private constructor(dados: DadosContextoUsuario) {
    this._codUsuario = dados.codUsuario;
    this._nomeUsuario = dados.nomeUsuario;
    this._codGrupo = dados.codGrupo ?? null;
    this._codEmpresa = dados.codEmpresa ?? null;
    this._grupos = dados.grupos || [];
    this._perfis = dados.perfis || [];
    this._parametros = dados.parametros || {};
    this._permissoesGlobais = dados.permissoesGlobais || [];
    this._carregadoEm = new Date();
    Object.freeze(this._grupos);
    Object.freeze(this._perfis);
    Object.freeze(this._permissoesGlobais);
  }

  static criar(dados: DadosContextoUsuario): ContextoUsuarioCache {
    if (!dados.codUsuario) {
      throw new Error('Codigo do usuario e obrigatorio');
    }
    if (!dados.nomeUsuario) {
      throw new Error('Nome do usuario e obrigatorio');
    }
    return new ContextoUsuarioCache(dados);
  }

  get codUsuario(): number {
    return this._codUsuario;
  }

  get nomeUsuario(): string {
    return this._nomeUsuario;
  }

  get codGrupo(): number | null {
    return this._codGrupo;
  }

  get codEmpresa(): number | null {
    return this._codEmpresa;
  }

  get grupos(): readonly number[] {
    return this._grupos;
  }

  get perfis(): readonly string[] {
    return this._perfis;
  }

  get parametros(): Record<string, unknown> {
    return { ...this._parametros };
  }

  get permissoesGlobais(): readonly string[] {
    return this._permissoesGlobais;
  }

  get carregadoEm(): Date {
    return this._carregadoEm;
  }

  pertenceAoGrupo(codGrupo: number): boolean {
    return this._grupos.includes(codGrupo);
  }

  possuiPerfil(perfil: string): boolean {
    return this._perfis.includes(perfil.toUpperCase());
  }

  possuiPermissaoGlobal(permissao: string): boolean {
    return this._permissoesGlobais.includes(permissao.toUpperCase());
  }

  obterParametro<T>(chave: string): T | undefined {
    return this._parametros[chave] as T | undefined;
  }

  toJSON(): object {
    return {
      codUsuario: this._codUsuario,
      nomeUsuario: this._nomeUsuario,
      codGrupo: this._codGrupo,
      codEmpresa: this._codEmpresa,
      grupos: [...this._grupos],
      perfis: [...this._perfis],
      parametros: { ...this._parametros },
      permissoesGlobais: [...this._permissoesGlobais],
      carregadoEm: this._carregadoEm.toISOString(),
    };
  }
}
