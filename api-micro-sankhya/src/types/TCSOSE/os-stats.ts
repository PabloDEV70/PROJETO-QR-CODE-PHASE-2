export interface OsStats {
  totalOs: number;
  osAbertas: number;
  osFechadas: number;
  osCanceladas: number;
  mediaTempoSlaMinutos: number | null;
  topClientes: Array<{
    codparc: number;
    nomeParc: string | null;
    totalOs: number;
    osFechadas: number;
    osAbertas: number;
  }>;
}
