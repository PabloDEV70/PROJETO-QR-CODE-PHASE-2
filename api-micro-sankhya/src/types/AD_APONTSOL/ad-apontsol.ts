export interface IAdAponTsol {
  CODIGO: number;
  SEQ: number;
  DESCRITIVO: string | null;
  GERAOS: string | null;
  CODPROD: number | null;
  QTD: number | null;
  DTPROGRAMACAO: string | null;
  NUOS: number | null;
  HR: number | null;
  KM: number | null;
}

export interface IAdAponTsolWithProduto extends IAdAponTsol {
  DESCRPROD?: string | null;
}
