export interface ArmarioFuncionario {
  codarmario: number;
  codemp: number;
  codfunc: number;
  localArm: number;
  nuarmario: number;
  nucadeado: string;
  tagArmario: string;
  localDescricao: string;
}

export interface ArmarioPublico {
  codarmario: number;
  nuarmario: number;
  tagArmario: string;
  localDescricao: string;
  ocupado: boolean;
  funcionario: {
    nome: string;
    departamento: string;
    empresa: string;
    fotoBase64: string | null;
  } | null;
}

export interface ArmarioListItem {
  codarmario: number;
  nuarmario: number;
  localArm: number;
  tagArmario: string;
  localDescricao: string;
  nucadeado: string;
  codemp: number;
  codfunc: number;
  ocupado: number;
  codparc: number;
  nomeFuncionario: string;
  cargo: string;
  departamento: string;
  funcao: string;
  empresa: string;
}

export interface ArmarioLocal {
  valor: string;
  descricao: string;
}

export interface ArmarioListResponse {
  data: ArmarioListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ListarArmariosParams {
  page?: number;
  limit?: number;
  localArm?: number;
  ocupado?: boolean;
  departamento?: string;
  termo?: string;
  orderBy?: 'codarmario' | 'nuarmario' | 'localDescricao' | 'nomeFuncionario' | 'tagArmario';
  orderDir?: 'ASC' | 'DESC';
}
