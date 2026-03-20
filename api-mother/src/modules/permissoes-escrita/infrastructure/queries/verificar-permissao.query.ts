/**
 * Query para verificar se um usuário tem permissão para uma operação específica.
 *
 * Retorna 1 se tem permissão, 0 se não tem.
 */
export class VerificarPermissaoQuery {
  readonly sql = `
    SELECT
      CASE
        WHEN EXISTS (
          -- Permissão direta do usuário
          SELECT 1
          FROM API_PERMISSAO_ESCRITA pe
          WHERE pe.CODUSU = @param1
            AND pe.TABELA = @param2
            AND pe.OPERACAO = @param3
            AND pe.ATIVA = 'S'
            AND (pe.DATA_VALIDADE IS NULL OR pe.DATA_VALIDADE >= GETDATE())
        )
        OR EXISTS (
          -- Permissão via role
          SELECT 1
          FROM API_PERMISSAO_ESCRITA pe
          INNER JOIN API_USUARIO_ROLE ur ON pe.ROLEID = ur.ROLEID
          INNER JOIN API_ROLE r ON ur.ROLEID = r.ROLEID
          WHERE ur.CODUSU = @param1
            AND pe.TABELA = @param2
            AND pe.OPERACAO = @param3
            AND ur.ATIVA = 'S'
            AND (ur.DATA_EXPIRACAO IS NULL OR ur.DATA_EXPIRACAO >= GETDATE())
            AND r.ATIVA = 'S'
            AND pe.ATIVA = 'S'
            AND pe.CODUSU IS NULL
            AND (pe.DATA_VALIDADE IS NULL OR pe.DATA_VALIDADE >= GETDATE())
        )
        THEN 1
        ELSE 0
      END as temPermissao
  `;

  readonly parametros: (string | number)[];
  readonly tabelas = ['API_PERMISSAO_ESCRITA', 'API_USUARIO_ROLE', 'API_ROLE'];
  readonly descricao = 'Verifica se um usuário tem permissão para uma operação em uma tabela';

  constructor(codUsuario: number, tabela: string, operacao: string) {
    this.parametros = [codUsuario, tabela.toUpperCase(), operacao.toUpperCase()];
  }
}

/**
 * Query para obter a permissão específica de um usuário para uma operação.
 * Retorna detalhes da permissão se existir, incluindo condição RLS.
 */
export class ObterPermissaoEspecificaQuery {
  readonly sql = `
    -- Primeiro tenta permissão direta (maior prioridade)
    SELECT TOP 1
      pe.PERMISSAOID as permissaoId,
      pe.TABELA as tabela,
      pe.OPERACAO as operacao,
      pe.CONDICAO_RLS as condicaoRLS,
      pe.ROLEID as roleId,
      pe.CODUSU as codUsuario,
      pe.ATIVA as ativa,
      pe.DESCRICAO as descricao,
      pe.REQUER_APROVACAO as requerAprovacao,
      pe.DATA_VALIDADE as dataValidade,
      1 as prioridade
    FROM API_PERMISSAO_ESCRITA pe
    WHERE pe.CODUSU = @param1
      AND pe.TABELA = @param2
      AND pe.OPERACAO = @param3
      AND pe.ATIVA = 'S'
      AND (pe.DATA_VALIDADE IS NULL OR pe.DATA_VALIDADE >= GETDATE())

    UNION ALL

    -- Depois permissão via role
    SELECT TOP 1
      pe.PERMISSAOID as permissaoId,
      pe.TABELA as tabela,
      pe.OPERACAO as operacao,
      pe.CONDICAO_RLS as condicaoRLS,
      pe.ROLEID as roleId,
      pe.CODUSU as codUsuario,
      pe.ATIVA as ativa,
      pe.DESCRICAO as descricao,
      pe.REQUER_APROVACAO as requerAprovacao,
      pe.DATA_VALIDADE as dataValidade,
      2 as prioridade
    FROM API_PERMISSAO_ESCRITA pe
    INNER JOIN API_USUARIO_ROLE ur ON pe.ROLEID = ur.ROLEID
    INNER JOIN API_ROLE r ON ur.ROLEID = r.ROLEID
    WHERE ur.CODUSU = @param1
      AND pe.TABELA = @param2
      AND pe.OPERACAO = @param3
      AND ur.ATIVA = 'S'
      AND (ur.DATA_EXPIRACAO IS NULL OR ur.DATA_EXPIRACAO >= GETDATE())
      AND r.ATIVA = 'S'
      AND pe.ATIVA = 'S'
      AND pe.CODUSU IS NULL
      AND (pe.DATA_VALIDADE IS NULL OR pe.DATA_VALIDADE >= GETDATE())

    ORDER BY prioridade ASC
  `;

  readonly parametros: (string | number)[];
  readonly tabelas = ['API_PERMISSAO_ESCRITA', 'API_USUARIO_ROLE', 'API_ROLE'];
  readonly descricao = 'Busca a permissão específica de um usuário para uma operação';

  constructor(codUsuario: number, tabela: string, operacao: string) {
    this.parametros = [codUsuario, tabela.toUpperCase(), operacao.toUpperCase()];
  }
}
