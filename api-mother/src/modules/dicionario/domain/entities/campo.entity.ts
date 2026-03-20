import { Resultado } from '../../shared/resultado';
import { TipoCampo } from '../value-objects/tipo-campo.vo';
import { TipoApresentacao } from '../value-objects/tipo-apresentacao.vo';

export interface PropriedadesCampo {
  nomeTabela: string;
  nomeCampo: string;
  descricao?: string;
  tipo: string;
  tamanho?: number;
  decimais?: number;
  obrigatorio?: string;
  chavePrimaria?: string;
  chaveEstrangeira?: string;
  apresentacao?: string;
  valorPadrao?: string;
}

export class Campo {
  private constructor(
    private readonly _nomeTabela: string,
    private readonly _nomeCampo: string,
    private readonly _descricao: string,
    private readonly _tipo: TipoCampo,
    private readonly _tamanho: number,
    private readonly _decimais: number,
    private readonly _obrigatorio: boolean,
    private readonly _chavePrimaria: boolean,
    private readonly _chaveEstrangeira: boolean,
    private readonly _apresentacao: TipoApresentacao | null,
    private readonly _valorPadrao: string,
  ) {
    Object.freeze(this);
  }

  static criar(props: PropriedadesCampo): Resultado<Campo> {
    if (!props.nomeTabela || !props.nomeCampo) {
      return Resultado.falhar('Nome da tabela e do campo são obrigatórios');
    }
    const tipoResult = TipoCampo.criar(props.tipo);
    if (tipoResult.falhou) return Resultado.falhar(tipoResult.erro!);

    let apresentacao: TipoApresentacao | null = null;
    if (props.apresentacao) {
      const aprResult = TipoApresentacao.criar(props.apresentacao);
      if (aprResult.sucesso) apresentacao = aprResult.obterValor();
    }

    return Resultado.ok(
      new Campo(
        props.nomeTabela.toUpperCase(),
        props.nomeCampo.toUpperCase(),
        props.descricao?.trim() || '',
        tipoResult.obterValor(),
        props.tamanho || 0,
        props.decimais || 0,
        props.obrigatorio?.toUpperCase() === 'S',
        props.chavePrimaria?.toUpperCase() === 'S',
        props.chaveEstrangeira?.toUpperCase() === 'S',
        apresentacao,
        props.valorPadrao || '',
      ),
    );
  }

  get nomeTabela(): string {
    return this._nomeTabela;
  }
  get nomeCampo(): string {
    return this._nomeCampo;
  }
  get descricao(): string {
    return this._descricao;
  }
  get tipo(): TipoCampo {
    return this._tipo;
  }
  get tamanho(): number {
    return this._tamanho;
  }
  get decimais(): number {
    return this._decimais;
  }
  get obrigatorio(): boolean {
    return this._obrigatorio;
  }
  get chavePrimaria(): boolean {
    return this._chavePrimaria;
  }
  get chaveEstrangeira(): boolean {
    return this._chaveEstrangeira;
  }
  get apresentacao(): TipoApresentacao | null {
    return this._apresentacao;
  }
  get valorPadrao(): string {
    return this._valorPadrao;
  }
  ehChave(): boolean {
    return this._chavePrimaria || this._chaveEstrangeira;
  }
  ehVisivel(): boolean {
    return this._apresentacao?.ehVisivel() ?? true;
  }
  obterNomeCompleto(): string {
    return `${this._nomeTabela}.${this._nomeCampo}`;
  }
  equals(outro: Campo): boolean {
    return outro ? this._nomeTabela === outro._nomeTabela && this._nomeCampo === outro._nomeCampo : false;
  }
}
