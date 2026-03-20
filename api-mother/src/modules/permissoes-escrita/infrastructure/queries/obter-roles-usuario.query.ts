/**
 * Query para obter todas as roles atribuídas a um usuário.
 * Retorna apenas roles ativas e com associações válidas.
 */
export class ObterRolesUsuarioQuery {
  readonly sql = `
    SELECT
      r.ROLEID as roleId,
      r.NOME as nome,
      r.DESCRICAO as descricao,
      r.ATIVA as ativa,
      r.DATA_CRIACAO as dataCriacao,
      r.DATA_ATUALIZACAO as dataAtualizacao,
      ur.DATA_ATRIBUICAO as dataAtribuicao,
      ur.DATA_EXPIRACAO as dataExpiracao,
      ur.ATIVA as associacaoAtiva
    FROM API_ROLE r
    INNER JOIN API_USUARIO_ROLE ur ON r.ROLEID = ur.ROLEID
    WHERE ur.CODUSU = @param1
      AND ur.ATIVA = 'S'
      AND (ur.DATA_EXPIRACAO IS NULL OR ur.DATA_EXPIRACAO >= GETDATE())
      AND r.ATIVA = 'S'
    ORDER BY r.NOME
  `;

  readonly parametros: (string | number)[];
  readonly tabelas = ['API_ROLE', 'API_USUARIO_ROLE'];
  readonly descricao = 'Busca todas as roles ativas atribuídas a um usuário';

  constructor(codUsuario: number) {
    this.parametros = [codUsuario];
  }
}

/**
 * Query para listar todas as roles ativas do sistema.
 */
export class ListarRolesAtivasQuery {
  readonly sql = `
    SELECT
      r.ROLEID as roleId,
      r.NOME as nome,
      r.DESCRICAO as descricao,
      r.ATIVA as ativa,
      r.DATA_CRIACAO as dataCriacao,
      r.DATA_ATUALIZACAO as dataAtualizacao
    FROM API_ROLE r
    WHERE r.ATIVA = 'S'
    ORDER BY r.NOME
  `;

  readonly parametros: (string | number)[] = [];
  readonly tabelas = ['API_ROLE'];
  readonly descricao = 'Lista todas as roles ativas do sistema';
}

/**
 * Query para listar todas as roles do sistema (incluindo inativas).
 */
export class ListarTodasRolesQuery {
  readonly sql = `
    SELECT
      r.ROLEID as roleId,
      r.NOME as nome,
      r.DESCRICAO as descricao,
      r.ATIVA as ativa,
      r.DATA_CRIACAO as dataCriacao,
      r.DATA_ATUALIZACAO as dataAtualizacao
    FROM API_ROLE r
    ORDER BY r.ATIVA DESC, r.NOME
  `;

  readonly parametros: (string | number)[] = [];
  readonly tabelas = ['API_ROLE'];
  readonly descricao = 'Lista todas as roles do sistema';
}

/**
 * Query para buscar uma role pelo ID.
 */
export class BuscarRolePorIdQuery {
  readonly sql = `
    SELECT
      r.ROLEID as roleId,
      r.NOME as nome,
      r.DESCRICAO as descricao,
      r.ATIVA as ativa,
      r.DATA_CRIACAO as dataCriacao,
      r.DATA_ATUALIZACAO as dataAtualizacao
    FROM API_ROLE r
    WHERE r.ROLEID = @param1
  `;

  readonly parametros: (string | number)[];
  readonly tabelas = ['API_ROLE'];
  readonly descricao = 'Busca uma role pelo ID';

  constructor(roleId: number) {
    this.parametros = [roleId];
  }
}

/**
 * Query para buscar uma role pelo nome.
 */
export class BuscarRolePorNomeQuery {
  readonly sql = `
    SELECT
      r.ROLEID as roleId,
      r.NOME as nome,
      r.DESCRICAO as descricao,
      r.ATIVA as ativa,
      r.DATA_CRIACAO as dataCriacao,
      r.DATA_ATUALIZACAO as dataAtualizacao
    FROM API_ROLE r
    WHERE r.NOME = @param1
  `;

  readonly parametros: (string | number)[];
  readonly tabelas = ['API_ROLE'];
  readonly descricao = 'Busca uma role pelo nome';

  constructor(nome: string) {
    this.parametros = [nome.trim()];
  }
}

/**
 * Query para buscar associação específica entre usuário e role.
 */
export class BuscarAssociacaoUsuarioRoleQuery {
  readonly sql = `
    SELECT
      ur.CODUSU as codUsuario,
      ur.ROLEID as roleId,
      ur.ATIVA as ativa,
      ur.DATA_ATRIBUICAO as dataAtribuicao,
      ur.DATA_EXPIRACAO as dataExpiracao
    FROM API_USUARIO_ROLE ur
    WHERE ur.CODUSU = @param1
      AND ur.ROLEID = @param2
  `;

  readonly parametros: (string | number)[];
  readonly tabelas = ['API_USUARIO_ROLE'];
  readonly descricao = 'Busca associação específica entre usuário e role';

  constructor(codUsuario: number, roleId: number) {
    this.parametros = [codUsuario, roleId];
  }
}

/**
 * Query para listar todas as associações de um usuário com roles.
 */
export class ListarAssociacoesUsuarioQuery {
  readonly sql = `
    SELECT
      ur.CODUSU as codUsuario,
      ur.ROLEID as roleId,
      ur.ATIVA as ativa,
      ur.DATA_ATRIBUICAO as dataAtribuicao,
      ur.DATA_EXPIRACAO as dataExpiracao
    FROM API_USUARIO_ROLE ur
    WHERE ur.CODUSU = @param1
    ORDER BY ur.DATA_ATRIBUICAO DESC
  `;

  readonly parametros: (string | number)[];
  readonly tabelas = ['API_USUARIO_ROLE'];
  readonly descricao = 'Lista todas as associações de um usuário com roles';

  constructor(codUsuario: number) {
    this.parametros = [codUsuario];
  }
}

/**
 * Query para listar todos os usuários com uma determinada role.
 */
export class ListarUsuariosDaRoleQuery {
  readonly sql = `
    SELECT
      ur.CODUSU as codUsuario,
      ur.ROLEID as roleId,
      ur.ATIVA as ativa,
      ur.DATA_ATRIBUICAO as dataAtribuicao,
      ur.DATA_EXPIRACAO as dataExpiracao
    FROM API_USUARIO_ROLE ur
    WHERE ur.ROLEID = @param1
    ORDER BY ur.DATA_ATRIBUICAO DESC
  `;

  readonly parametros: (string | number)[];
  readonly tabelas = ['API_USUARIO_ROLE'];
  readonly descricao = 'Lista todos os usuários com uma determinada role';

  constructor(roleId: number) {
    this.parametros = [roleId];
  }
}
