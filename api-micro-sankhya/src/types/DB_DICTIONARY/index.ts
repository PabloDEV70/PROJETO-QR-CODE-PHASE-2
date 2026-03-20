export interface TabelaDicionario {
  nomeTabela: string;
  descricao: string;
  ativa: boolean;
}

export interface CampoDicionario {
  nomeCampo: string;
  descricao: string;
  tipoCampo: string;
  obrigatorio: boolean;
}

export interface InstanciaDicionario {
  nomeInstancia: string;
  nomeTabela: string;
  descricao: string;
}

export interface ResultadoPesquisa {
  tabelas: TabelaDicionario[];
  campos: CampoDicionario[];
}
