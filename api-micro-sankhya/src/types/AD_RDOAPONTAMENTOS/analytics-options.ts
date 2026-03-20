export interface RdoAnalyticsOptions {
  dataInicio?: string;
  dataFim?: string;
  codparc?: string;
  coddep?: string;
  codcargo?: string;
  codfuncao?: string;
  codemp?: string;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
  limit?: number;
}
