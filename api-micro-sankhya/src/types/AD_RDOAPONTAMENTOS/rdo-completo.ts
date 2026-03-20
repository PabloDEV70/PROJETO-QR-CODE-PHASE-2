export interface RdoCompleto {
  CODRDO: number;
  CODPARC: number | null;
  DTREF: Date | null;
  nomeparc: string | null;
  cgc_cpf: string | null;
  totalItens: number;
  totalMinutos: number | null;
  totalHoras: number | null;
}
