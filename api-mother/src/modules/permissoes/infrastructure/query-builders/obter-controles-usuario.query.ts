/**
 * Query para obter controles de UI por usuário e tela (TRDCON).
 */
export class ObterControlesUsuarioQuery {
  constructor(
    private readonly codUsuario: number,
    private readonly codTela: number,
  ) {}

  get sql(): string {
    return `
      SELECT
        CODUSU as codUsuario,
        CODTELA as codTela,
        NOMECONTROLE as nomeControle,
        HABILITADO as habilitado,
        VISIVEL as visivel,
        OBRIGATORIO as obrigatorio,
        SOMENTELEITURA as somenteLeitura
      FROM TRDCON
      WHERE CODUSU = :codUsuario
        AND CODTELA = :codTela
      ORDER BY NOMECONTROLE
    `;
  }

  get parametros(): Record<string, unknown> {
    return {
      codUsuario: this.codUsuario,
      codTela: this.codTela,
    };
  }

  readonly tabelas = ['TRDCON'];
  readonly descricao = 'Busca controles de UI por usuário e tela';
}
