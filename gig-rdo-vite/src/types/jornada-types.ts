/** Jornada diaria pre-computada pela API (horas previstas vs realizadas) */
export interface RdoJornada {
  /** Horas previstas na escala: HH:MM */
  horasPrevistas: string;
  /** Horas efetivamente trabalhadas: HH:MM */
  horasRealizadas: string;
  /** Saldo em minutos (negativo = deficit) */
  saldo: number;
  /** Representacao formatada do |saldo|: HH:MM */
  saldoFormatado: string;
  /** true se saldo >= 0 */
  saldoPositivo: boolean;
  /** Hora extra em minutos (0 se nao houve) */
  horaExtra: number;
  /** Hora extra formatada: HH:MM */
  horaExtraFormatado: string;
}

/** Configuracao embutida de um motivo RDO retornada pela API */
export interface MotivoConfigEmbutido {
  rdomotivocod: number;
  produtivo: boolean;
  toleranciaMin: number;
  penalidadeMin: number;
  /** DB key: 'wrenchTime' | 'desloc' | 'espera' | 'buro' | 'trein' | 'pausas' | 'externos' */
  wtCategoria: string;
  /** Label em portugues */
  wtLabel: string;
  /** Cor hex */
  wtColor: string;
}
