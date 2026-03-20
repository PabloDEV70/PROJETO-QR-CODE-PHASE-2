import { Resultado } from '../../shared/resultado';

/**
 * Tipos de operacao CRUD.
 */
export type TipoOperacao = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';

/**
 * Propriedades para criar uma PermissaoTabela.
 */
export interface PropriedadesPermissaoTabela {
  codPermissao?: number;
  codRole: number;
  nomeTabela: string;
  operacao: TipoOperacao;
  permitido: string;
  condicaoRls?: string;
  camposPermitidos?: string;
  camposRestritos?: string;
  dataCriacao?: Date;
  dataAlteracao?: Date;
}

/**
 * Entidade de dominio representando permissao de acesso a uma tabela.
 * Define quais operacoes uma role pode executar em uma tabela especifica.
 */
export class PermissaoTabela {
  private constructor(
    private readonly _codPermissao: number | undefined,
    private readonly _codRole: number,
    private readonly _nomeTabela: string,
    private readonly _operacao: TipoOperacao,
    private readonly _permitido: boolean,
    private readonly _condicaoRls: string | undefined,
    private readonly _camposPermitidos: string[] | undefined,
    private readonly _camposRestritos: string[] | undefined,
    private readonly _dataCriacao: Date | undefined,
    private readonly _dataAlteracao: Date | undefined,
  ) {
    Object.freeze(this);
  }

  static criar(props: PropriedadesPermissaoTabela): Resultado<PermissaoTabela> {
    if (!props.codRole || props.codRole <= 0) {
      return Resultado.falhar('Codigo da role invalido');
    }
    if (!props.nomeTabela || props.nomeTabela.trim().length === 0) {
      return Resultado.falhar('Nome da tabela nao pode ser vazio');
    }
    if (props.nomeTabela.length > 100) {
      return Resultado.falhar('Nome da tabela nao pode exceder 100 caracteres');
    }
    const operacoesValidas: TipoOperacao[] = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
    if (!operacoesValidas.includes(props.operacao)) {
      return Resultado.falhar('Operacao invalida. Use: SELECT, INSERT, UPDATE ou DELETE');
    }

    const camposPermitidos = props.camposPermitidos
      ? props.camposPermitidos
          .split(',')
          .map((c) => c.trim().toUpperCase())
          .filter((c) => c.length > 0)
      : undefined;

    const camposRestritos = props.camposRestritos
      ? props.camposRestritos
          .split(',')
          .map((c) => c.trim().toUpperCase())
          .filter((c) => c.length > 0)
      : undefined;

    return Resultado.ok(
      new PermissaoTabela(
        props.codPermissao,
        props.codRole,
        props.nomeTabela.trim().toUpperCase(),
        props.operacao,
        props.permitido?.toUpperCase() === 'S',
        props.condicaoRls?.trim(),
        camposPermitidos,
        camposRestritos,
        props.dataCriacao,
        props.dataAlteracao,
      ),
    );
  }

  get codPermissao(): number | undefined {
    return this._codPermissao;
  }
  get codRole(): number {
    return this._codRole;
  }
  get nomeTabela(): string {
    return this._nomeTabela;
  }
  get operacao(): TipoOperacao {
    return this._operacao;
  }
  get permitido(): boolean {
    return this._permitido;
  }
  get condicaoRls(): string | undefined {
    return this._condicaoRls;
  }
  get camposPermitidos(): string[] | undefined {
    return this._camposPermitidos;
  }
  get camposRestritos(): string[] | undefined {
    return this._camposRestritos;
  }
  get dataCriacao(): Date | undefined {
    return this._dataCriacao;
  }
  get dataAlteracao(): Date | undefined {
    return this._dataAlteracao;
  }

  estaPermitido(): boolean {
    return this._permitido;
  }

  temRls(): boolean {
    return !!this._condicaoRls && this._condicaoRls.length > 0;
  }

  verificarCampoPermitido(campo: string): boolean {
    if (!this._camposPermitidos || this._camposPermitidos.length === 0) {
      return true; // Se nao ha restricao, todos sao permitidos
    }
    return this._camposPermitidos.includes(campo.toUpperCase());
  }

  verificarCampoRestrito(campo: string): boolean {
    if (!this._camposRestritos || this._camposRestritos.length === 0) {
      return false; // Se nao ha restricao, nenhum e restrito
    }
    return this._camposRestritos.includes(campo.toUpperCase());
  }

  equals(outro: PermissaoTabela): boolean {
    if (!outro) return false;
    return this._codPermissao === outro._codPermissao;
  }
}
