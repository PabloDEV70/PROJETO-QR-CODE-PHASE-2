export interface ContratoCompleto {
  ID: number;
  CODVEICULO: number | null;
  CODPARC: number | null;
  DHINIC: Date | null;
  DHFIN: Date | null;
  OBS: string | null;
  CREATEDDATE: Date | null;
  UPDATEDDATE: Date | null;
  CREATEBY: number | null;
  UPDATEDBY: number | null;
  PLACA: string | null;
  MARCAMODELO: string | null;
  AD_TAG: string | null;
  CONTRATANTE: string | null;
  STATUS: 'VIGENTE' | 'FUTURO' | 'ENCERRADO';
}
