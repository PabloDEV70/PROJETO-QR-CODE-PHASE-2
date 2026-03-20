import { Paper, Typography, Skeleton } from '@mui/material';
import type { RdoAnalyticsResumo } from '@/types/rdo-analytics-types';
import type { ProductivityResult } from '@/utils/motivo-productivity';
import type { RdoAlert } from '@/utils/rdo-alert-engine';

interface Props {
  resumo?: RdoAnalyticsResumo;
  productivity?: ProductivityResult;
  alerts: RdoAlert[];
  dataInicio?: string;
  dataFim?: string;
  isLoading: boolean;
}

function fmtDate(d?: string): string {
  if (!d) return '';
  const parts = d.split('-');
  return `${parts[2]}/${parts[1]}`;
}

export function RdoResumoTexto({
  resumo, productivity, alerts, dataInicio, dataFim, isLoading,
}: Props) {
  if (isLoading) {
    return <Skeleton variant="rounded" height={56} sx={{ borderRadius: 2.5 }} />;
  }
  if (!resumo) return null;

  const parts: string[] = [];

  const periodo = dataInicio && dataFim
    ? `${fmtDate(dataInicio)} a ${fmtDate(dataFim)}`
    : '';
  parts.push(
    `${periodo ? `No periodo ${periodo}, a` : 'A'} equipe de ${resumo.totalColaboradores} colaboradores registrou ${resumo.totalRdos} RDOs`,
  );

  if (productivity) {
    parts.push(
      `com produtividade de ${productivity.produtividadePercent}%`,
    );
    if (productivity.prodVsMetaPercent != null) {
      parts.push(`(meta atingida em ${productivity.prodVsMetaPercent}%)`);
    }
  }

  parts.push(`— media de ${resumo.mediaHorasDia?.toFixed(1) || 0}h/dia.`);

  if (resumo.topMotivoSigla) {
    parts.push(
      `Principal motivo: ${resumo.topMotivoSigla} (${resumo.topMotivoPercentual?.toFixed(0)}%).`,
    );
  }

  const critical = alerts.find((a) => a.severity === 'critical');
  if (critical) {
    parts.push(`Atencao: ${critical.title}.`);
  }

  return (
    <Paper sx={{
      px: 2.5, py: 1.5, borderRadius: 2.5,
      bgcolor: 'rgba(59,130,246,0.04)',
      borderLeft: '3px solid rgba(59,130,246,0.3)',
    }}>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
        {parts.join(' ')}
      </Typography>
    </Paper>
  );
}
