/**
 * Query para verificar acesso histórico (TRDEAC).
 */
export class VerificarAcessoHistoricoQuery {
  constructor(
    private readonly codUsuario: number,
    private readonly codTela: number,
  ) {}

  get sql(): string {
    return `
      SELECT TOP 1
        CODUSU as codUsuario,
        CODTELA as codTela,
        DTACESSO as dataAcesso,
        PERMITIDO as permitido
      FROM TRDEAC
      WHERE CODUSU = :codUsuario
        AND CODTELA = :codTela
      ORDER BY DTACESSO DESC
    `;
  }

  get parametros(): Record<string, unknown> {
    return {
      codUsuario: this.codUsuario,
      codTela: this.codTela,
    };
  }

  readonly tabelas = ['TRDEAC'];
  readonly descricao = 'Verifica último acesso do usuário à tela';
}
