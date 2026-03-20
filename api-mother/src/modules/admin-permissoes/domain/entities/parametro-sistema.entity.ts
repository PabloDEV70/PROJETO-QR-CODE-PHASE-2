import { Resultado } from '../../shared/resultado';

/**
 * Propriedades para criar um ParametroSistema.
 */
export interface PropriedadesParametroSistema {
  codParametro?: number;
  chave: string;
  valor: string;
  descricao?: string;
  tipo: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  ativo: string;
  dataCriacao?: Date;
  dataAlteracao?: Date;
}

/**
 * Entidade de dominio representando um parametro de configuracao do sistema.
 */
export class ParametroSistema {
  private constructor(
    private readonly _codParametro: number | undefined,
    private readonly _chave: string,
    private readonly _valor: string,
    private readonly _descricao: string | undefined,
    private readonly _tipo: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON',
    private readonly _ativo: boolean,
    private readonly _dataCriacao: Date | undefined,
    private readonly _dataAlteracao: Date | undefined,
  ) {
    Object.freeze(this);
  }

  static criar(props: PropriedadesParametroSistema): Resultado<ParametroSistema> {
    if (!props.chave || props.chave.trim().length === 0) {
      return Resultado.falhar('Chave do parametro nao pode ser vazia');
    }
    if (props.chave.length > 100) {
      return Resultado.falhar('Chave do parametro nao pode exceder 100 caracteres');
    }
    if (!props.valor && props.valor !== '') {
      return Resultado.falhar('Valor do parametro nao pode ser nulo');
    }
    if (props.valor.length > 4000) {
      return Resultado.falhar('Valor do parametro nao pode exceder 4000 caracteres');
    }
    const tiposValidos = ['STRING', 'NUMBER', 'BOOLEAN', 'JSON'];
    if (!tiposValidos.includes(props.tipo)) {
      return Resultado.falhar('Tipo invalido. Use: STRING, NUMBER, BOOLEAN ou JSON');
    }

    // Validar valor conforme tipo
    if (props.tipo === 'NUMBER') {
      if (isNaN(Number(props.valor))) {
        return Resultado.falhar('Valor deve ser um numero valido');
      }
    }
    if (props.tipo === 'BOOLEAN') {
      const valoresBooleanos = ['true', 'false', '1', '0', 'S', 'N'];
      if (!valoresBooleanos.includes(props.valor.toUpperCase())) {
        return Resultado.falhar('Valor deve ser um booleano valido');
      }
    }
    if (props.tipo === 'JSON') {
      try {
        JSON.parse(props.valor);
      } catch {
        return Resultado.falhar('Valor deve ser um JSON valido');
      }
    }

    return Resultado.ok(
      new ParametroSistema(
        props.codParametro,
        props.chave.trim().toUpperCase(),
        props.valor,
        props.descricao?.trim(),
        props.tipo,
        props.ativo?.toUpperCase() === 'S',
        props.dataCriacao,
        props.dataAlteracao,
      ),
    );
  }

  get codParametro(): number | undefined {
    return this._codParametro;
  }
  get chave(): string {
    return this._chave;
  }
  get valor(): string {
    return this._valor;
  }
  get descricao(): string | undefined {
    return this._descricao;
  }
  get tipo(): 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' {
    return this._tipo;
  }
  get ativo(): boolean {
    return this._ativo;
  }
  get dataCriacao(): Date | undefined {
    return this._dataCriacao;
  }
  get dataAlteracao(): Date | undefined {
    return this._dataAlteracao;
  }

  estaAtivo(): boolean {
    return this._ativo;
  }

  obterValorComoNumero(): number {
    return Number(this._valor);
  }

  obterValorComoBooleano(): boolean {
    const valoresVerdadeiros = ['TRUE', '1', 'S'];
    return valoresVerdadeiros.includes(this._valor.toUpperCase());
  }

  obterValorComoJson<T>(): T {
    return JSON.parse(this._valor) as T;
  }

  equals(outro: ParametroSistema): boolean {
    if (!outro) return false;
    return this._codParametro === outro._codParametro;
  }
}
