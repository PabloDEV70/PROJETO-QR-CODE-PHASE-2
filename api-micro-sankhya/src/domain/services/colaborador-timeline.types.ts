import { PRODUTIVIDADE_MODE, MOTIVO_ALMOCO } from '../../types/AD_RDOAPONTAMENTOS';
import { MotivoConfigMap } from '../../types/AD_RDOMOTIVOS';

export interface AtividadeRow {
  codrdo: number;
  dtref: string;
  diasem: number;
  item: number;
  hrini: number;
  hrfim: number;
  duracaoMinutos: number;
  rdomotivocod: number;
  motivoDescricao: string | null;
  motivoSigla: string | null;
  nuos: number | null;
  osStatus: string | null;
  veiculoPlaca: string | null;
  veiculoModelo: string | null;
  obs: string | null;
}

export interface CargaTurnoInfo {
  entrada: string;
  saida: string;
  minutos: number;
}

export interface CargaDiaInfo {
  diasem: number;
  minutosPrevistos: number;
  folga: boolean;
  turnos: CargaTurnoInfo[];
}

export interface ResumoDia {
  totalMinutos: number;
  minutosProdu: number;
  minutosOutros: number;
  minutosAlmoco: number;
  minutosBanheiro: number;
  motivoMinutos: Record<number, number>;
  percentProdutivo: number;
}

export function calcularResumoDia(
  items: AtividadeRow[],
  configMap: MotivoConfigMap,
): ResumoDia {
  let totalMinutos = 0;
  let minutosProdu = 0;
  let minutosOutros = 0;
  let minutosAlmoco = 0;
  let minutosBanheiro = 0;
  const motivoMinutos: Record<number, number> = {};

  for (const a of items) {
    const dur = a.duracaoMinutos;
    const cfg = configMap.get(a.rdomotivocod);
    totalMinutos += dur;
    motivoMinutos[a.rdomotivocod] = (motivoMinutos[a.rdomotivocod] || 0) + dur;
    if (a.rdomotivocod === MOTIVO_ALMOCO) {
      minutosAlmoco += dur;
    } else if ((cfg?.toleranciaMin ?? 0) > 0) {
      minutosBanheiro += dur;
    } else if ((cfg?.penalidadeMin ?? 0) > 0) {
      minutosOutros += dur;
    } else if (PRODUTIVIDADE_MODE === 'ESTRITO') {
      if (cfg?.produtivo) {
        minutosProdu += dur;
      } else {
        minutosOutros += dur;
      }
    } else {
      minutosProdu += dur;
    }
  }

  return {
    totalMinutos,
    minutosProdu,
    minutosOutros,
    minutosAlmoco,
    minutosBanheiro,
    motivoMinutos,
    percentProdutivo: totalMinutos > 0
      ? Math.round((minutosProdu / totalMinutos) * 100)
      : 0,
  };
}
