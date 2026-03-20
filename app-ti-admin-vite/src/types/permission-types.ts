export interface SankhyaUser {
  CODUSU: number;
  NOMEUSU: string;
  EMAIL?: string;
  CODFUNC?: number;
  CODEMP?: number;
  CODCENCUSPAD?: string;
}

export interface UserPermission {
  CODUSU: number;
  IDACESSO: string;
  ACESSO: string;
  CODGRUPO: number;
}

export interface PermissionComparison {
  usuarioA: number;
  usuarioB: number;
  onlyInA: string[];
  onlyInB: string[];
  common: string[];
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
