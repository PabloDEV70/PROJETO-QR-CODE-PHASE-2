export interface QueryAtiva {
  idSessao: number;
  status: string;
  comando: string;
  tempoCpu: number;
  tempoTotalDecorrido: number;
  tipoEspera: string | null;
  idSessaoBloqueadora: number | null;
  nomeBancoDados: string;
  textoQuery: string;
}

export interface EstatisticasQuery {
  contagemExecucoes: number;
  cpuTotalMs: number;
  cpuMedioMs: number;
  duracaoTotalMs: number;
  duracaoMediaMs: number;
  leiturasLogicasTotais: number;
  textoQuery: string;
}

export interface SessaoAtiva {
  idSessao: number;
  horaLogin: string;
  nomeHost: string;
  nomePrograma: string;
  nomeLogin: string;
  status: string;
  tempoCpu: number;
}

export interface VisaoServidor {
  versaoSql: string;
  nomeServidor: string;
  bancoAtual: string;
  sessoesUsuarioAtivas: number;
  requisicaosAtivas: number;
  conexoesUsuario: number;
  horaServidor: string;
}

export interface EstatisticaEspera {
  tipoEspera: string;
  contagemTarefasEsperando: number;
  tempoEsperaMs: number;
  tempoMaximoEsperaMs: number;
  tempoMedioEsperaMs: number;
}
