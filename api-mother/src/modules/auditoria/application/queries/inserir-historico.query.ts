/**
 * Query: InserirHistorico
 *
 * Insere um novo registro de auditoria.
 */

export class InserirHistoricoQuery {
  readonly sql = `
    INSERT INTO API_AUDITORIA (
      CODUSU,
      TABELA,
      OPERACAO,
      DADOS_ANTIGOS,
      DADOS_NOVOS,
      DATA_HORA,
      IP_ORIGEM,
      USER_AGENT,
      CHAVE_REGISTRO,
      OBSERVACAO,
      SUCESSO,
      MENSAGEM_ERRO
    )
    OUTPUT INSERTED.AUDITORIAID
    VALUES (
      @param1,
      @param2,
      @param3,
      @param4,
      @param5,
      @param6,
      @param7,
      @param8,
      @param9,
      @param10,
      @param11,
      @param12
    )
  `;

  constructor(
    private readonly codUsuario: number,
    private readonly tabela: string,
    private readonly operacao: string,
    private readonly dadosAntigos: string | null,
    private readonly dadosNovos: string | null,
    private readonly dataHora: Date,
    private readonly ip: string | null,
    private readonly userAgent: string | null,
    private readonly chaveRegistro: string | null,
    private readonly observacao: string | null,
    private readonly sucesso: string,
    private readonly mensagemErro: string | null,
  ) {}

  get parametros(): unknown[] {
    return [
      this.codUsuario,
      this.tabela,
      this.operacao,
      this.dadosAntigos,
      this.dadosNovos,
      this.dataHora,
      this.ip,
      this.userAgent,
      this.chaveRegistro,
      this.observacao,
      this.sucesso,
      this.mensagemErro,
    ];
  }
}
