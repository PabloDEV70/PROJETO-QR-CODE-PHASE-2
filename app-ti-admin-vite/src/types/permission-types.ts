export interface SankhyaUser {
  codusu: number;
  nomeusu: string;
  email?: string | null;
  codparc?: number | null;
  nomeparc?: string;
  codemp?: number | null;
  nomeempresa?: string;
  codfunc?: number | null;
  codgrupo?: number | null;
  nomegrupo?: string;
  ativo?: string;
  // Campos antigos uppercase (compatibilidade)
  CODUSU?: number;
  NOMEUSU?: string;
  EMAIL?: string;
  CODFUNC?: number;
  CODEMP?: number;
  CODCENCUSPAD?: string;
}

export interface PermissaoTela {
  idAcesso: string;
  nomeAmigavel: string;
  qtdGrupos: number;
  qtdUsuarios: number;
}

export interface UsuarioPermDireta {
  idAcesso: string;
  nomeAmigavel: string;
  acesso: string;
}

export interface UsuarioPermHerdada {
  idAcesso: string;
  nomeAmigavel: string;
  acesso: string;
  codGrupo: number;
  nomeGrupo: string;
}

export interface UsuarioDetalhes {
  codUsu: number;
  nomeUsu: string;
  codGrupo: number;
  nomeGrupo: string | null;
  diretas: UsuarioPermDireta[];
  herdadas: UsuarioPermHerdada[];
  conflitos: ConflitoItem[];
}

export interface ConflitoItem {
  idAcesso: string;
  nomeAmigavel: string;
  codUsu: number;
  nomeUsu: string;
  codGrupo: number;
  nomeGrupo: string;
  acessoUsuario: string;
  acessoGrupo: string;
}

// Legacy types for backwards compat
export interface UserPermission {
  CODUSU: number;
  IDACESSO: string;
  ACESSO: string;
  CODGRUPO: number;
}

export interface TDPER {
  CODUSU: number;
  CODGRUPO: number;
  IDACESSO: string;
  ACESSO: string;
  VERSAO?: number;
}

export interface GrupoUsuario {
  CODUSU: number;
  CODGRUPO: number;
  DATAINICIO?: string;
  DATAFIM?: string;
}

export interface SankhyaAccessResource {
  IDACESSO: string;
  DESCRICAO?: string;
  SIGLA?: string;
}
