import { useRdoById, useRdoDetalhesById } from '@/hooks/use-rdo';
import { useRdoMetricas } from '@/hooks/use-rdo-extra';
import { useFuncionarioPerfilSuper } from '@/hooks/use-funcionario';
import { useHorasEsperadas } from '@/hooks/use-horas-esperadas';
export function useRdoDetail(codrdoNum: number | null) {
  const rdo = useRdoById(codrdoNum);
  const detalhes = useRdoDetalhesById(codrdoNum);
  const metricas = useRdoMetricas(codrdoNum);
  const perfil = useFuncionarioPerfilSuper(rdo.data?.CODPARC);

  // Horas esperadas para este colaborador neste dia
  const rdoDate = rdo.data?.DTREF?.slice(0, 10);
  const horasEsp = useHorasEsperadas({
    dataInicio: rdoDate, dataFim: rdoDate,
    codparc: rdo.data?.CODPARC ? String(rdo.data.CODPARC) : undefined,
  });

  const esperadoRawH = horasEsp.data?.resumo.totalHorasEsperadas;
  const jornadaMin = metricas.data?.minutosPrevistosDia ?? 0;
  const metaEfMin = metricas.data?.tempoNoTrabalho ?? 0;
  const tolRatio = 1; // no longer adjusted (meta = tempoNoTrabalho)
  const esperadoAjustado = esperadoRawH != null
    ? esperadoRawH.toFixed(1) : null;

  const diagnostico = metricas.data?.diagnostico;
  const faixa = metricas.data?.diagnosticoFaixa?.faixa ?? null;

  return {
    rdo: rdo.data,
    loadingRdo: rdo.isLoading,
    errorRdo: rdo.error,
    detalhes: detalhes.data,
    loadingDetalhes: detalhes.isLoading,
    metricas: metricas.data,
    loadingMetricas: metricas.isLoading,
    perfil: perfil.data,
    loadingPerfil: perfil.isLoading,
    horasEsperadas: horasEsp.data,
    esperadoRawH,
    jornadaMin,
    metaEfMin,
    tolRatio,
    esperadoAjustado,
    diagnostico,
    faixa,
  };
}
