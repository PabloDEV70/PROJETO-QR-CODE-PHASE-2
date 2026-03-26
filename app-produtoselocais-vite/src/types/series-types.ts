export interface ProdutoComSeries {
  CODPROD: number;
  DESCRPROD: string;
  QTD_SERIES: number;
}

export interface SerieAtual {
  SERIE: string;
  CODPROD: number;
  DESCRPROD: string;
  ULTIMA_MOVIMENTACAO: string | null;
  TIPMOV: string | null;
  DESCROPER: string | null;
  CODPARC: number | null;
  COM_QUEM: string | null;
  CODUSU: number | null;
  MOVIMENTADO_POR: string | null;
  AVARIADO: string | null;
  CODLOCALORIG: number | null;
  LOCAL_ATUAL: string | null;
}

export interface SerieHistorico {
  SERIE: string;
  NUNOTA: number;
  SEQUENCIA: number;
  ATUALESTOQUE: number;
  CODPROD: number;
  DESCRPROD: string;
  CODUSU: number | null;
  NOMEUSU: string | null;
  DTNEG: string;
  TIPMOV: string;
  CODTIPOPER: number;
  DESCROPER: string;
  CODPARC: number | null;
  NOMEPARC: string | null;
  CODLOCALORIG: number | null;
  LOCAL_NOME: string | null;
  AVARIADO: string | null;
  SERIEFAB: string | null;
  SMARTCARD: string | null;
  NUMNOTA: number | null;
  STATUSNOTA: string | null;
  QTDNEG: number | null;
}
