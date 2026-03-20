import { Resultado } from '../../shared/resultado';

export interface PropriedadesParametroUsuario {
  codUsuario: number;
  chave: string;
  valor: string;
  tipo?: string;
  descricao?: string;
}

export class ParametroUsuario {
  private constructor(
    private readonly _codUsuario: number,
    private readonly _chave: string,
    private readonly _valor: string,
    private readonly _tipo: 'S' | 'N' | 'B',
    private readonly _descricao?: string,
  ) {
    Object.freeze(this);
  }

  static criar(props: PropriedadesParametroUsuario): Resultado<ParametroUsuario> {
    if (!props.codUsuario || props.codUsuario <= 0) {
      return Resultado.falhar('Código do usuário inválido');
    }
    if (!props.chave || props.chave.trim().length === 0) {
      return Resultado.falhar('Chave do parâmetro não pode ser vazia');
    }
    if (props.valor === undefined || props.valor === null) {
      return Resultado.falhar('Valor do parâmetro não pode ser nulo');
    }

    let tipo: 'S' | 'N' | 'B' = 'S';
    if (props.tipo) {
      const t = props.tipo.toUpperCase();
      if (t === 'N' || t === 'B' || t === 'S') tipo = t as 'S' | 'N' | 'B';
    }

    return Resultado.ok(
      new ParametroUsuario(
        props.codUsuario,
        props.chave.trim().toUpperCase(),
        props.valor,
        tipo,
        props.descricao?.trim(),
      ),
    );
  }

  get codUsuario(): number {
    return this._codUsuario;
  }
  get chave(): string {
    return this._chave;
  }
  get valor(): string {
    return this._valor;
  }
  get tipo(): 'S' | 'N' | 'B' {
    return this._tipo;
  }
  get descricao(): string | undefined {
    return this._descricao;
  }

  obterValorBooleano(): boolean {
    if (this._tipo === 'B') {
      return this._valor.toUpperCase() === 'S' || this._valor === '1' || this._valor.toLowerCase() === 'true';
    }
    return false;
  }

  obterValorNumerico(): number {
    if (this._tipo === 'N') {
      const num = parseFloat(this._valor);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  }

  estaAtivo(): boolean {
    return this.obterValorBooleano();
  }

  equals(outro: ParametroUsuario): boolean {
    if (!outro) return false;
    return this._codUsuario === outro._codUsuario && this._chave === outro._chave;
  }
}
