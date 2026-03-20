export interface IProdutoUtilizado {
  CODPROD: number;
  DESCRPROD: string | null;
  QTD_UTILIZACOES: number;
  QTD_TOTAL: number;
  QTD_COM_OS: number;
  PRIMEIRO_USO: string | null;
  ULTIMO_USO: string | null;
}
