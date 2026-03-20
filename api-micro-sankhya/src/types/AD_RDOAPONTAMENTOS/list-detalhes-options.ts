export interface ListRdoDetalhesOptions {
  page: number;
  limit: number;
  dataInicio?: string;
  dataFim?: string;
  codparc?: string;
  rdomotivocod?: string;
  comOs?: boolean;
  semOs?: boolean;
  coddep?: string;
  codcargo?: string;
  codfuncao?: string;
  codemp?: string;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}
