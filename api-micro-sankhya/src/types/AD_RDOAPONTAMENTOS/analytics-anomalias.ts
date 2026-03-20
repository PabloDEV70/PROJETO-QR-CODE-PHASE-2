export interface RdoAnomalia {
  DTREF: string;
  CODPARC: number;
  NOMEPARC: string;
  CODRDO: number;
  ITEM: number;
  HRINI: number | null;
  HRFIM: number | null;
  motivo: string | null;
  minutos: number;
  tipoAnomalia: string;
}
