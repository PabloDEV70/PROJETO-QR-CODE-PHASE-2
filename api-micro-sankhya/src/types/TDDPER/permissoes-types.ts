// Row types (match SQL aliases exactly)
export interface ResumoRow {
  totalTelas: number;
  totalUsuarios: number;
  totalGrupos: number;
  totalAtribuicoes: number;
}

export interface TelaListRow {
  IDACESSO: string;
  qtdGrupos: number;
  qtdUsuarios: number;
}

export interface TelaPermissaoRow {
  CODUSU: number;
  CODGRUPO: number;
  ACESSO: string;
  NOMEUSU: string | null;
  NOMEGRUPO: string | null;
}

export interface TelaAcaoRow {
  SIGLA: string;
  SEQUENCIA: number;
  DESCRICAO: string;
  CONTROLE: string;
}

export interface GrupoListRow {
  CODGRUPO: number;
  NOMEGRUPO: string;
  qtdMembros: number;
  qtdTelas: number;
}

export interface GrupoMembroRow {
  CODUSU: number;
  NOMEUSU: string;
  DTLIMACESSO: string | null;
}

export interface GrupoTelaRow {
  IDACESSO: string;
  ACESSO: string;
}

export interface UsuarioListRow {
  CODUSU: number;
  NOMEUSU: string;
  CODGRUPO: number;
  NOMEGRUPO: string | null;
  qtdDiretas: number;
}

export interface UsuarioPermDiretaRow {
  IDACESSO: string;
  ACESSO: string;
}

export interface UsuarioPermHerdadaRow {
  IDACESSO: string;
  ACESSO: string;
  CODGRUPO: number;
  NOMEGRUPO: string;
}

export interface ConflitoRow {
  IDACESSO: string;
  CODUSU: number;
  NOMEUSU: string;
  CODGRUPO: number;
  NOMEGRUPO: string;
  acessoUsuario: string;
  acessoGrupo: string;
}

// Output types
export interface PermissoesResumo {
  totalTelas: number;
  totalUsuarios: number;
  totalGrupos: number;
  totalAtribuicoes: number;
}

export interface TelaListItem {
  idAcesso: string;
  nomeAmigavel: string;
  qtdGrupos: number;
  qtdUsuarios: number;
}

export interface AcaoTela {
  sigla: string;
  sequencia: number;
  descricao: string;
  controle: string;
}

export interface PermissaoTela {
  codUsu: number;
  codGrupo: number;
  acesso: string;
  nomeUsu: string | null;
  nomeGrupo: string | null;
  tipo: 'usuario' | 'grupo';
}

export interface TelaDetalhes {
  idAcesso: string;
  nomeAmigavel: string;
  acoes: AcaoTela[];
  permissoes: PermissaoTela[];
}

export interface GrupoListItem {
  codGrupo: number;
  nomeGrupo: string;
  qtdMembros: number;
  qtdTelas: number;
}

export interface GrupoMembro {
  codUsu: number;
  nomeUsu: string;
  ativo: boolean;
}

export interface GrupoTela {
  idAcesso: string;
  nomeAmigavel: string;
  acesso: string;
}

export interface GrupoDetalhes {
  codGrupo: number;
  nomeGrupo: string;
  membros: GrupoMembro[];
  telas: GrupoTela[];
}

export interface UsuarioListItem {
  codUsu: number;
  nomeUsu: string;
  codGrupo: number;
  nomeGrupo: string | null;
  qtdDiretas: number;
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

export interface UsuarioDetalhes {
  codUsu: number;
  nomeUsu: string;
  codGrupo: number;
  nomeGrupo: string | null;
  diretas: UsuarioPermDireta[];
  herdadas: UsuarioPermHerdada[];
  conflitos: ConflitoItem[];
}
