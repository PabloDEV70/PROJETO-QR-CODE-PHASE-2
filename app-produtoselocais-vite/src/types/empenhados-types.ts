export interface ColaboradorComMateriais {
  CODUSU: number;
  NOMEUSU: string;
  CODPARC: number;
  NOMEPARC: string;
  QTD_PRODUTOS: number;
  QTD_TOTAL: number;
}

export interface MaterialEmpenhado {
  CODPROD: number;
  DESCRPROD: string;
  DESCRGRUPOPROD: string;
  NOMEPARC: string;
  QTDE: number;
}
