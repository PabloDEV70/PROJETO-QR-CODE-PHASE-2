import { Resultado } from '../../shared/resultado';
import { TipoOperacao, TipoOperacaoSigla } from '../value-objects/tipo-operacao.vo';
import { CondicaoSQL } from '../value-objects/condicao-sql.vo';

/**
 * Propriedades para criar uma PermissaoEscrita.
 */
export interface PropriedadesPermissaoEscrita {
  permissaoId: number;
  tabela: string;
  operacao: string;
  condicaoRLS?: string | null;
  roleId?: number | null;
  codUsuario?: number | null;
  ativa: string;
  descricao?: string | null;
  requerAprovacao?: string | null;
  dataValidade?: Date | null;
}

/**
 * Entidade que representa uma permissão de escrita (CRUD) em uma tabela.
 * Suporta Row Level Security (RLS) através de condições SQL.
 */
export class PermissaoEscrita {
  private constructor(
    private readonly _permissaoId: number,
    private readonly _tabela: string,
    private readonly _operacao: TipoOperacao,
    private readonly _condicaoRLS: CondicaoSQL,
    private readonly _roleId: number | null,
    private readonly _codUsuario: number | null,
    private readonly _ativa: boolean,
    private readonly _descricao: string | null,
    private readonly _requerAprovacao: boolean,
    private readonly _dataValidade: Date | null,
  ) {
    Object.freeze(this);
  }

  /**
   * Cria uma nova instância de PermissaoEscrita com validações.
   */
  static criar(props: PropriedadesPermissaoEscrita): Resultado<PermissaoEscrita> {
    if (!props.permissaoId || props.permissaoId <= 0) {
      return Resultado.falhar('ID da permissão inválido');
    }

    if (!props.tabela || props.tabela.trim().length === 0) {
      return Resultado.falhar('Nome da tabela não pode ser vazio');
    }

    // Validar nome da tabela (apenas letras, números e underscore)
    const tabelaLimpa = props.tabela.trim().toUpperCase();
    if (!/^[A-Z_][A-Z0-9_]*$/.test(tabelaLimpa)) {
      return Resultado.falhar('Nome da tabela contém caracteres inválidos');
    }

    // Criar e validar TipoOperacao
    const operacaoResultado = TipoOperacao.criar(props.operacao);
    if (operacaoResultado.falhou) {
      return Resultado.falhar(operacaoResultado.erro!);
    }

    // Criar e validar CondicaoSQL
    const condicaoResultado = CondicaoSQL.criar(props.condicaoRLS);
    if (condicaoResultado.falhou) {
      return Resultado.falhar(condicaoResultado.erro!);
    }

    // Validar que tem roleId OU codUsuario (não ambos vazios)
    if (!props.roleId && !props.codUsuario) {
      return Resultado.falhar('Permissão deve ter roleId ou codUsuario');
    }

    // Validar que não tem ambos (roleId E codUsuario)
    if (props.roleId && props.codUsuario) {
      return Resultado.falhar('Permissão não pode ter roleId e codUsuario simultaneamente');
    }

    return Resultado.ok(
      new PermissaoEscrita(
        props.permissaoId,
        tabelaLimpa,
        operacaoResultado.obterValor(),
        condicaoResultado.obterValor(),
        props.roleId || null,
        props.codUsuario || null,
        props.ativa?.toUpperCase() === 'S',
        props.descricao?.trim() || null,
        props.requerAprovacao?.toUpperCase() === 'S',
        props.dataValidade || null,
      ),
    );
  }

  get permissaoId(): number {
    return this._permissaoId;
  }

  get tabela(): string {
    return this._tabela;
  }

  get operacao(): TipoOperacao {
    return this._operacao;
  }

  get operacaoSigla(): TipoOperacaoSigla {
    return this._operacao.valor;
  }

  get condicaoRLS(): CondicaoSQL {
    return this._condicaoRLS;
  }

  get roleId(): number | null {
    return this._roleId;
  }

  get codUsuario(): number | null {
    return this._codUsuario;
  }

  get ativa(): boolean {
    return this._ativa;
  }

  get descricao(): string | null {
    return this._descricao;
  }

  get requerAprovacao(): boolean {
    return this._requerAprovacao;
  }

  get dataValidade(): Date | null {
    return this._dataValidade;
  }

  /**
   * Verifica se a permissão está ativa.
   */
  estaAtiva(): boolean {
    return this._ativa;
  }

  /**
   * Verifica se a permissão expirou.
   */
  expirou(): boolean {
    if (!this._dataValidade) return false;
    return this._dataValidade < new Date();
  }

  /**
   * Verifica se a permissão está válida (ativa e não expirada).
   */
  estaValida(): boolean {
    return this._ativa && !this.expirou();
  }

  /**
   * Verifica se é uma permissão de role (não direta ao usuário).
   */
  ehPermissaoDeRole(): boolean {
    return this._roleId !== null;
  }

  /**
   * Verifica se é uma permissão direta ao usuário.
   */
  ehPermissaoDireta(): boolean {
    return this._codUsuario !== null;
  }

  /**
   * Verifica se a permissão possui condição RLS.
   */
  possuiCondicaoRLS(): boolean {
    return !this._condicaoRLS.estaVazia();
  }

  /**
   * Verifica se a permissão é para uma operação de escrita.
   */
  ehOperacaoEscrita(): boolean {
    return this._operacao.ehEscrita();
  }

  /**
   * Verifica se a permissão aplica a uma determinada tabela e operação.
   */
  aplicaA(tabela: string, operacao: TipoOperacaoSigla): boolean {
    return this._tabela === tabela.toUpperCase() && this._operacao.valor === operacao;
  }

  equals(outra: PermissaoEscrita): boolean {
    if (!outra) return false;
    return this._permissaoId === outra._permissaoId;
  }

  toString(): string {
    const alvo = this._roleId ? `Role:${this._roleId}` : `Usuario:${this._codUsuario}`;
    return `Permissao[${this._permissaoId}]: ${this._operacao.descricao} em ${this._tabela} (${alvo})`;
  }
}
