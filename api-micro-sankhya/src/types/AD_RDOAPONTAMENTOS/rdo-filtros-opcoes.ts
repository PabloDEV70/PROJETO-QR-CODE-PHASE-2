export interface RdoFiltroOpcao {
  codigo: number;
  nome: string;
  qtdColaboradores?: number;
}

export interface RdoFiltrosOpcoes {
  departamentos: RdoFiltroOpcao[];
  cargos: RdoFiltroOpcao[];
  funcoes: RdoFiltroOpcao[];
  empresas: RdoFiltroOpcao[];
}
