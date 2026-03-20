/**
 * Entidade: AprovacaoPendente
 *
 * Representa uma solicitacao de operacao que requer aprovacao.
 */

export type TipoOperacaoAprovacao = 'I' | 'U' | 'D';
export type StatusAprovacao = 'P' | 'A' | 'R' | 'E' | 'C';
export type PrioridadeAprovacao = 'A' | 'N' | 'B';

export interface DadosAprovacaoPendente {
  aprovacaoId?: number;
  codUsuario: number;
  codAprovador?: number | null;
  tabela: string;
  operacao: TipoOperacaoAprovacao;
  dados: string;
  chaveRegistro?: string | null;
  status: StatusAprovacao;
  dataSolicitacao: Date;
  dataExpiracao?: Date | null;
  dataProcessamento?: Date | null;
  motivoRejeicao?: string | null;
  observacaoSolicitante?: string | null;
  observacaoAprovador?: string | null;
  ipOrigem?: string | null;
  prioridade: PrioridadeAprovacao;
}

export interface DadosAprovacaoPendenteBruto {
  APROVACAOID?: number;
  CODUSU: number;
  CODAPROVADOR?: number | null;
  TABELA: string;
  OPERACAO: TipoOperacaoAprovacao;
  DADOS: string;
  CHAVE_REGISTRO?: string | null;
  STATUS: StatusAprovacao;
  DATA_SOLICITACAO: Date;
  DATA_EXPIRACAO?: Date | null;
  DATA_PROCESSAMENTO?: Date | null;
  MOTIVO_REJEICAO?: string | null;
  OBSERVACAO_SOLICITANTE?: string | null;
  OBSERVACAO_APROVADOR?: string | null;
  IP_ORIGEM?: string | null;
  PRIORIDADE: PrioridadeAprovacao;
}

export class AprovacaoPendente {
  private constructor(
    public readonly aprovacaoId: number | undefined,
    public readonly codUsuario: number,
    public readonly codAprovador: number | null,
    public readonly tabela: string,
    public readonly operacao: TipoOperacaoAprovacao,
    public readonly dados: string,
    public readonly chaveRegistro: string | null,
    public readonly status: StatusAprovacao,
    public readonly dataSolicitacao: Date,
    public readonly dataExpiracao: Date | null,
    public readonly dataProcessamento: Date | null,
    public readonly motivoRejeicao: string | null,
    public readonly observacaoSolicitante: string | null,
    public readonly observacaoAprovador: string | null,
    public readonly ipOrigem: string | null,
    public readonly prioridade: PrioridadeAprovacao,
  ) {}

  /**
   * Cria uma instancia de AprovacaoPendente
   */
  static criar(dados: DadosAprovacaoPendente): AprovacaoPendente {
    return new AprovacaoPendente(
      dados.aprovacaoId,
      dados.codUsuario,
      dados.codAprovador || null,
      dados.tabela.toUpperCase(),
      dados.operacao,
      dados.dados,
      dados.chaveRegistro || null,
      dados.status,
      dados.dataSolicitacao,
      dados.dataExpiracao || null,
      dados.dataProcessamento || null,
      dados.motivoRejeicao || null,
      dados.observacaoSolicitante || null,
      dados.observacaoAprovador || null,
      dados.ipOrigem || null,
      dados.prioridade,
    );
  }

  /**
   * Cria uma instancia a partir de dados brutos do banco
   */
  static deBruto(bruto: DadosAprovacaoPendenteBruto): AprovacaoPendente {
    return new AprovacaoPendente(
      bruto.APROVACAOID,
      bruto.CODUSU,
      bruto.CODAPROVADOR || null,
      bruto.TABELA,
      bruto.OPERACAO,
      bruto.DADOS,
      bruto.CHAVE_REGISTRO || null,
      bruto.STATUS,
      bruto.DATA_SOLICITACAO,
      bruto.DATA_EXPIRACAO || null,
      bruto.DATA_PROCESSAMENTO || null,
      bruto.MOTIVO_REJEICAO || null,
      bruto.OBSERVACAO_SOLICITANTE || null,
      bruto.OBSERVACAO_APROVADOR || null,
      bruto.IP_ORIGEM || null,
      bruto.PRIORIDADE,
    );
  }

  /**
   * Verifica se esta pendente
   */
  estaPendente(): boolean {
    return this.status === 'P';
  }

  /**
   * Verifica se foi aprovada
   */
  foiAprovada(): boolean {
    return this.status === 'A';
  }

  /**
   * Verifica se foi rejeitada
   */
  foiRejeitada(): boolean {
    return this.status === 'R';
  }

  /**
   * Verifica se expirou
   */
  estaExpirada(): boolean {
    if (this.status === 'E') return true;
    if (!this.dataExpiracao) return false;
    return new Date() > this.dataExpiracao;
  }

  /**
   * Verifica se foi cancelada
   */
  foiCancelada(): boolean {
    return this.status === 'C';
  }

  /**
   * Retorna descricao legivel do status
   */
  obterDescricaoStatus(): string {
    const mapa: Record<StatusAprovacao, string> = {
      P: 'Pendente',
      A: 'Aprovada',
      R: 'Rejeitada',
      E: 'Expirada',
      C: 'Cancelada',
    };
    return mapa[this.status] || this.status;
  }

  /**
   * Retorna descricao legivel da operacao
   */
  obterDescricaoOperacao(): string {
    const mapa: Record<TipoOperacaoAprovacao, string> = {
      I: 'Insert',
      U: 'Update',
      D: 'Delete',
    };
    return mapa[this.operacao] || this.operacao;
  }

  /**
   * Retorna descricao legivel da prioridade
   */
  obterDescricaoPrioridade(): string {
    const mapa: Record<PrioridadeAprovacao, string> = {
      A: 'Alta',
      N: 'Normal',
      B: 'Baixa',
    };
    return mapa[this.prioridade] || this.prioridade;
  }

  /**
   * Parseia dados como objeto
   */
  obterDadosParseados(): Record<string, unknown> | null {
    if (!this.dados) return null;
    try {
      return JSON.parse(this.dados);
    } catch {
      return null;
    }
  }

  /**
   * Calcula tempo restante ate expiracao em horas
   */
  obterHorasRestantes(): number | null {
    if (!this.dataExpiracao) return null;
    const agora = new Date();
    const diff = this.dataExpiracao.getTime() - agora.getTime();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60));
  }
}
