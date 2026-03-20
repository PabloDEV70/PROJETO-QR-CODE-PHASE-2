/**
 * Query para obter parâmetros de usuário (TSIPAR).
 */
export class ObterParametrosUsuarioQuery {
  constructor(private readonly codUsuario: number) {}

  get sql(): string {
    return `
      SELECT
        CODUSU as codUsuario,
        CHAVE as chave,
        VALOR as valor,
        TIPO as tipo,
        DESCRICAO as descricao
      FROM TSIPAR
      WHERE CODUSU = :codUsuario
      ORDER BY CHAVE
    `;
  }

  get parametros(): Record<string, unknown> {
    return { codUsuario: this.codUsuario };
  }

  readonly tabelas = ['TSIPAR'];
  readonly descricao = 'Busca parâmetros de configuração do usuário';
}
