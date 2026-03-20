import { Stack } from '@mui/material';
import { People, Timer, Speed, AccessTime } from '@mui/icons-material';
import { KpiCard } from '@/components/shared/kpi-card';
import type { PerfServicoResumo } from '@/types/os-types';

function fmtMin(min: number): string {
  if (min <= 0) return '-';
  if (min < 60) return `${min.toFixed(0)} min`;
  const h = min / 60;
  return h < 24 ? `${h.toFixed(1)} h` : `${(h / 24).toFixed(1)} dias`;
}

export function PerfServicoKpis({ resumo }: { resumo: PerfServicoResumo }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }} useFlexGap>
      <KpiCard
        icon={<People fontSize="small" />}
        label="Executores"
        value={resumo.totalExecutores}
        color="primary.main"
      />
      <KpiCard
        icon={<AccessTime fontSize="small" />}
        label="Execucoes"
        value={resumo.totalExecucoes}
        color="info.main"
      />
      <KpiCard
        icon={<Timer fontSize="small" />}
        label="Media"
        value={fmtMin(resumo.mediaMinutos)}
        sub={`Min: ${fmtMin(resumo.minMinutos)} | Max: ${fmtMin(resumo.maxMinutos)}`}
        color="warning.main"
      />
      <KpiCard
        icon={<Speed fontSize="small" />}
        label="Total Horas"
        value={resumo.totalMinutos > 0 ? `${(resumo.totalMinutos / 60).toFixed(1)}h` : '-'}
        color="success.main"
      />
    </Stack>
  );
}
