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

// Tipo interno (resultado da query SQL — contem _codparcInterno para buscar foto)
export interface ArmarioPublicoRow {
  codarmario: number;
  nuarmario: number;
  localArm: number;
  tagArmario: string;
  localDescricao: string;
  ocupado: number;
  nomeFuncionario: string;
  departamento: string;
  empresa: string;
  _codparcInterno: number;
}

export interface ArmarioLocal {
  valor: string;
  descricao: string;
}

// Tipo seguro (resposta publica — ZERO dados sensiveis)
export interface ArmarioPublicoSeguro {
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
