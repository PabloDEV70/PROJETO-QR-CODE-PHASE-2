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

export interface TelaListResponse {
  data: TelaListItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
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

export interface UsuarioListResponse {
  data: UsuarioListItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
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

export interface TelaListParams {
  page?: number;
  limit?: number;
  termo?: string;
}

export interface UsuarioListParams {
  page?: number;
  limit?: number;
  termo?: string;
}
