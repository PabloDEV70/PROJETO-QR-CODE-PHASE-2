/**
 * Query para obter todas as permissões de escrita de um usuário.
 * Inclui permissões diretas e permissões via roles.
 *
 * Tabela: API_PERMISSAO_ESCRITA (tabela customizada para permissões CRUD)
 *
 * Retorna:
 * - Permissões diretas do usuário (CODUSU = @codUsuario)
 * - Permissões via roles atribuídas ao usuário
 */
export class ObterPermissoesUsuarioQuery {
  readonly sql = `
    -- Permissões diretas do usuário
    SELECT
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
      'DIRETA' as tipoPermissao
    FROM API_PERMISSAO_ESCRITA pe
    WHERE pe.CODUSU = @param1
      AND pe.ATIVA = 'S'
      AND (pe.DATA_VALIDADE IS NULL OR pe.DATA_VALIDADE >= GETDATE())

    UNION ALL

    -- Permissões via roles do usuário
    SELECT
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
      'VIA_ROLE' as tipoPermissao
    FROM API_PERMISSAO_ESCRITA pe
    INNER JOIN API_USUARIO_ROLE ur ON pe.ROLEID = ur.ROLEID
    INNER JOIN API_ROLE r ON ur.ROLEID = r.ROLEID
    WHERE ur.CODUSU = @param1
      AND ur.ATIVA = 'S'
      AND (ur.DATA_EXPIRACAO IS NULL OR ur.DATA_EXPIRACAO >= GETDATE())
      AND r.ATIVA = 'S'
      AND pe.ATIVA = 'S'
      AND pe.CODUSU IS NULL
      AND (pe.DATA_VALIDADE IS NULL OR pe.DATA_VALIDADE >= GETDATE())

    ORDER BY tipoPermissao, tabela, operacao
  `;

  readonly parametros: (string | number)[];
  readonly tabelas = ['API_PERMISSAO_ESCRITA', 'API_USUARIO_ROLE', 'API_ROLE'];
  readonly descricao = 'Busca todas as permissões de escrita de um usuário (diretas e via roles)';

  constructor(codUsuario: number) {
    this.parametros = [codUsuario];
  }
}

/**
 * Query para obter permissões de um usuário para uma tabela específica.
 */
export class ObterPermissoesUsuarioTabelaQuery {
  readonly sql = `
    -- Permissões diretas do usuário para a tabela
    SELECT
      pe.PERMISSAOID as permissaoId,
      pe.TABELA as tabela,
      pe.OPERACAO as operacao,
      pe.CONDICAO_RLS as condicaoRLS,
      pe.ROLEID as roleId,
      pe.CODUSU as codUsuario,
      pe.ATIVA as ativa,
      pe.DESCRICAO as descricao,
      pe.REQUER_APROVACAO as requerAprovacao,
      pe.DATA_VALIDADE as dataValidade
    FROM API_PERMISSAO_ESCRITA pe
    WHERE pe.CODUSU = @param1
      AND pe.TABELA = @param2
      AND pe.ATIVA = 'S'
      AND (pe.DATA_VALIDADE IS NULL OR pe.DATA_VALIDADE >= GETDATE())

    UNION ALL

    -- Permissões via roles para a tabela
    SELECT
      pe.PERMISSAOID as permissaoId,
      pe.TABELA as tabela,
      pe.OPERACAO as operacao,
      pe.CONDICAO_RLS as condicaoRLS,
      pe.ROLEID as roleId,
      pe.CODUSU as codUsuario,
      pe.ATIVA as ativa,
      pe.DESCRICAO as descricao,
      pe.REQUER_APROVACAO as requerAprovacao,
      pe.DATA_VALIDADE as dataValidade
    FROM API_PERMISSAO_ESCRITA pe
    INNER JOIN API_USUARIO_ROLE ur ON pe.ROLEID = ur.ROLEID
    INNER JOIN API_ROLE r ON ur.ROLEID = r.ROLEID
    WHERE ur.CODUSU = @param1
      AND pe.TABELA = @param2
      AND ur.ATIVA = 'S'
      AND (ur.DATA_EXPIRACAO IS NULL OR ur.DATA_EXPIRACAO >= GETDATE())
      AND r.ATIVA = 'S'
      AND pe.ATIVA = 'S'
      AND pe.CODUSU IS NULL
      AND (pe.DATA_VALIDADE IS NULL OR pe.DATA_VALIDADE >= GETDATE())

    ORDER BY operacao
  `;

  readonly parametros: (string | number)[];
  readonly tabelas = ['API_PERMISSAO_ESCRITA', 'API_USUARIO_ROLE', 'API_ROLE'];
  readonly descricao = 'Busca permissões de escrita de um usuário para uma tabela específica';

  constructor(codUsuario: number, tabela: string) {
    this.parametros = [codUsuario, tabela.toUpperCase()];
  }
}
