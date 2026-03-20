export interface ListRdoOptions {
  page: number;
  limit: number;
  codparc?: string;
  dataInicio?: string;
  dataFim?: string;
  comOs?: boolean;
  semOs?: boolean;
  coddep?: string;
  codcargo?: string;
  codfuncao?: string;
  codemp?: string;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}
