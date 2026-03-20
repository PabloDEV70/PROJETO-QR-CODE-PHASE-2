export interface GerarSchemaGridInput {
  tokenUsuario: string;
  nomeTabela: string;
  titulo?: string;
  descricao?: string;
  incluirCamposOcultos?: boolean;
  excluirCampos?: string[];
  permitirPaginacao?: boolean;
  tamanhoPagina?: number;
}
