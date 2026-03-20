export interface RdoTimelinePoint {
  DTREF: string;
  totalRdos: number;
  totalColaboradores: number;
  totalItens: number;
  totalHoras: number;
  /** Horas do motivo ATVP (cod=1) — base para produtividade ESTRITO */
  horasProdutivas: number;
  itensComOs: number;
  /** Jornada prevista para este dia (min), baseada em TFPHOR por DIASEM */
  minutosPrevistos: number;
  /** Hora extra total (min) — computada por colaborador antes de agregar */
  minutosHoraExtra: number;
  /** Hora extra produtiva (min) — proporcional ao wrenchTime de cada colab */
  minutosHoraExtraProd: number;
  /** Hora extra nao-produtiva (min) — derivado no service */
  minutosHoraExtraNaoProd: number;
}
