/**
 * Entidade que representa uma permissao em cache.
 *
 * Armazena o resultado de uma verificacao de permissao
 * para evitar consultas repetidas ao banco de dados.
 *
 * @module M6 - Cache de Permissoes
 */

export type TipoPermissao = 'tela' | 'controle' | 'campo' | 'operacao';

export interface DadosPermissaoCache {
  codUsuario: number;
  codTela: number;
  tipoPermissao: TipoPermissao;
  nomeRecurso: string;
  permitido: boolean;
  motivo?: string;
  camposPermitidos?: string[];
  condicoesRls?: string;
  requerAprovacao?: boolean;
}

export class PermissaoCache {
  private readonly _codUsuario: number;
  private readonly _codTela: number;
  private readonly _tipoPermissao: TipoPermissao;
  private readonly _nomeRecurso: string;
  private readonly _permitido: boolean;
  private readonly _motivo: string | null;
  private readonly _camposPermitidos: string[];
  private readonly _condicoesRls: string | null;
  private readonly _requerAprovacao: boolean;
  private readonly _verificadoEm: Date;

  private constructor(dados: DadosPermissaoCache) {
    this._codUsuario = dados.codUsuario;
    this._codTela = dados.codTela;
    this._tipoPermissao = dados.tipoPermissao;
    this._nomeRecurso = dados.nomeRecurso;
    this._permitido = dados.permitido;
    this._motivo = dados.motivo ?? null;
    this._camposPermitidos = dados.camposPermitidos || [];
    this._condicoesRls = dados.condicoesRls ?? null;
    this._requerAprovacao = dados.requerAprovacao ?? false;
    this._verificadoEm = new Date();
    Object.freeze(this._camposPermitidos);
  }

  static criar(dados: DadosPermissaoCache): PermissaoCache {
    return new PermissaoCache(dados);
  }

  static criarPermitido(dados: Omit<DadosPermissaoCache, 'permitido' | 'motivo'>): PermissaoCache {
    return new PermissaoCache({
      ...dados,
      permitido: true,
    });
  }

  static criarNegado(dados: Omit<DadosPermissaoCache, 'permitido'> & { motivo: string }): PermissaoCache {
    return new PermissaoCache({
      ...dados,
      permitido: false,
    });
  }

  get codUsuario(): number {
    return this._codUsuario;
  }

  get codTela(): number {
    return this._codTela;
  }

  get tipoPermissao(): TipoPermissao {
    return this._tipoPermissao;
  }

  get nomeRecurso(): string {
    return this._nomeRecurso;
  }

  get permitido(): boolean {
    return this._permitido;
  }

  get motivo(): string | null {
    return this._motivo;
  }

  get camposPermitidos(): readonly string[] {
    return this._camposPermitidos;
  }

  get condicoesRls(): string | null {
    return this._condicoesRls;
  }

  get requerAprovacao(): boolean {
    return this._requerAprovacao;
  }

  get verificadoEm(): Date {
    return this._verificadoEm;
  }

  campoEstaPermitido(campo: string): boolean {
    if (this._camposPermitidos.length === 0) {
      return true; // Sem restricao = todos permitidos
    }
    return this._camposPermitidos.includes(campo.toUpperCase());
  }

  toJSON(): object {
    return {
      codUsuario: this._codUsuario,
      codTela: this._codTela,
      tipoPermissao: this._tipoPermissao,
      nomeRecurso: this._nomeRecurso,
      permitido: this._permitido,
      motivo: this._motivo,
      camposPermitidos: [...this._camposPermitidos],
      condicoesRls: this._condicoesRls,
      requerAprovacao: this._requerAprovacao,
      verificadoEm: this._verificadoEm.toISOString(),
    };
  }
}
