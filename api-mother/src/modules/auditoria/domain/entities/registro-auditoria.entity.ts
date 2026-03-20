/**
 * Entidade: RegistroAuditoria
 *
 * Representa um registro de auditoria no sistema.
 * Armazena informacoes sobre operacoes realizadas em tabelas.
 */

export type TipoOperacao = 'I' | 'U' | 'D' | 'S';
export type StatusSucesso = 'S' | 'N';

export interface DadosRegistroAuditoria {
  auditoriaId?: number;
  codUsuario: number;
  tabela: string;
  operacao: TipoOperacao;
  dadosAntigos?: string | null;
  dadosNovos?: string | null;
  dataHora: Date;
  ip?: string | null;
  userAgent?: string | null;
  chaveRegistro?: string | null;
  observacao?: string | null;
  sucesso: StatusSucesso;
  mensagemErro?: string | null;
}

export interface DadosRegistroAuditoriaBruto {
  AUDITORIAID?: number;
  CODUSU: number;
  TABELA: string;
  OPERACAO: TipoOperacao;
  DADOS_ANTIGOS?: string | null;
  DADOS_NOVOS?: string | null;
  DATA_HORA: Date;
  IP_ORIGEM?: string | null;
  USER_AGENT?: string | null;
  CHAVE_REGISTRO?: string | null;
  OBSERVACAO?: string | null;
  SUCESSO: StatusSucesso;
  MENSAGEM_ERRO?: string | null;
}

export class RegistroAuditoria {
  private constructor(
    public readonly auditoriaId: number | undefined,
    public readonly codUsuario: number,
    public readonly tabela: string,
    public readonly operacao: TipoOperacao,
    public readonly dadosAntigos: string | null,
    public readonly dadosNovos: string | null,
    public readonly dataHora: Date,
    public readonly ip: string | null,
    public readonly userAgent: string | null,
    public readonly chaveRegistro: string | null,
    public readonly observacao: string | null,
    public readonly sucesso: StatusSucesso,
    public readonly mensagemErro: string | null,
  ) {}

  /**
   * Cria uma instancia de RegistroAuditoria a partir de dados
   */
  static criar(dados: DadosRegistroAuditoria): RegistroAuditoria {
    return new RegistroAuditoria(
      dados.auditoriaId,
      dados.codUsuario,
      dados.tabela.toUpperCase(),
      dados.operacao,
      dados.dadosAntigos || null,
      dados.dadosNovos || null,
      dados.dataHora,
      dados.ip || null,
      dados.userAgent || null,
      dados.chaveRegistro || null,
      dados.observacao || null,
      dados.sucesso,
      dados.mensagemErro || null,
    );
  }

  /**
   * Cria uma instancia a partir de dados brutos do banco
   */
  static deBruto(bruto: DadosRegistroAuditoriaBruto): RegistroAuditoria {
    return new RegistroAuditoria(
      bruto.AUDITORIAID,
      bruto.CODUSU,
      bruto.TABELA,
      bruto.OPERACAO,
      bruto.DADOS_ANTIGOS || null,
      bruto.DADOS_NOVOS || null,
      bruto.DATA_HORA,
      bruto.IP_ORIGEM || null,
      bruto.USER_AGENT || null,
      bruto.CHAVE_REGISTRO || null,
      bruto.OBSERVACAO || null,
      bruto.SUCESSO,
      bruto.MENSAGEM_ERRO || null,
    );
  }

  /**
   * Verifica se a operacao foi bem sucedida
   */
  foiSucesso(): boolean {
    return this.sucesso === 'S';
  }

  /**
   * Retorna descricao legivel da operacao
   */
  obterDescricaoOperacao(): string {
    const mapa: Record<TipoOperacao, string> = {
      I: 'Insert',
      U: 'Update',
      D: 'Delete',
      S: 'Select',
    };
    return mapa[this.operacao] || this.operacao;
  }

  /**
   * Parseia dados antigos como objeto
   */
  obterDadosAntigosParseados(): Record<string, unknown> | null {
    if (!this.dadosAntigos) return null;
    try {
      return JSON.parse(this.dadosAntigos);
    } catch {
      return null;
    }
  }

  /**
   * Parseia dados novos como objeto
   */
  obterDadosNovosParseados(): Record<string, unknown> | null {
    if (!this.dadosNovos) return null;
    try {
      return JSON.parse(this.dadosNovos);
    } catch {
      return null;
    }
  }

  /**
   * Calcula diferencas entre dados antigos e novos
   */
  obterDiferencas(): Record<string, { antigo: unknown; novo: unknown }> | null {
    const antigos = this.obterDadosAntigosParseados();
    const novos = this.obterDadosNovosParseados();

    if (!antigos || !novos) return null;

    const diferencas: Record<string, { antigo: unknown; novo: unknown }> = {};

    const todasChaves = new Set([...Object.keys(antigos), ...Object.keys(novos)]);

    for (const chave of todasChaves) {
      const valorAntigo = antigos[chave];
      const valorNovo = novos[chave];

      if (JSON.stringify(valorAntigo) !== JSON.stringify(valorNovo)) {
        diferencas[chave] = { antigo: valorAntigo, novo: valorNovo };
      }
    }

    return Object.keys(diferencas).length > 0 ? diferencas : null;
  }
}
