import { Box, Paper, Typography, Skeleton, Stack, LinearProgress } from '@mui/material';
import {
  HourglassBottomRounded, SupportAgentRounded,
  ScheduleRounded, CheckCircleRounded, CancelRounded,
  AssignmentRounded, FlagRounded, TrendingUpRounded,
  PauseCircleRounded,
} from '@mui/icons-material';
import { STATUS_MAP, PRIO_MAP } from '@/utils/chamados-constants';
import type { ChamadoResumo } from '@/types/chamados-types';

interface ChamadosKpiRowProps {
  resumo: ChamadoResumo | undefined;
  isLoading: boolean;
}

interface KpiDef {
  label: string;
  color: string;
  icon: React.ReactNode;
  getValue: (r: ChamadoResumo) => number;
  suffix?: string;
}

const STATUS_KPIS: KpiDef[] = [
  { label: 'Total', color: '#1976d2', icon: <AssignmentRounded sx={{ fontSize: 20 }} />, getValue: (r) => r.total },
  { label: STATUS_MAP.P.label, color: STATUS_MAP.P.color, icon: <HourglassBottomRounded sx={{ fontSize: 20 }} />, getValue: (r) => r.porStatus.find((s) => s.status === 'P')?.total ?? 0 },
  { label: STATUS_MAP.E.label, color: STATUS_MAP.E.color, icon: <SupportAgentRounded sx={{ fontSize: 20 }} />, getValue: (r) => r.porStatus.find((s) => s.status === 'E')?.total ?? 0 },
  { label: STATUS_MAP.S.label, color: STATUS_MAP.S.color, icon: <PauseCircleRounded sx={{ fontSize: 20 }} />, getValue: (r) => r.porStatus.find((s) => s.status === 'S')?.total ?? 0 },
  { label: STATUS_MAP.A.label, color: STATUS_MAP.A.color, icon: <ScheduleRounded sx={{ fontSize: 20 }} />, getValue: (r) => r.porStatus.find((s) => s.status === 'A')?.total ?? 0 },
  { label: STATUS_MAP.F.label, color: STATUS_MAP.F.color, icon: <CheckCircleRounded sx={{ fontSize: 20 }} />, getValue: (r) => r.porStatus.find((s) => s.status === 'F')?.total ?? 0 },
  { label: STATUS_MAP.C.label, color: STATUS_MAP.C.color, icon: <CancelRounded sx={{ fontSize: 20 }} />, getValue: (r) => r.porStatus.find((s) => s.status === 'C')?.total ?? 0 },
];

function KpiCard({ kpi, resumo, isLoading }: { kpi: KpiDef; resumo?: ChamadoResumo; isLoading: boolean }) {
  return (
    <Paper
      elevation={0}
      sx={{
        px: 2, py: 1.5, borderRadius: 2,
        border: '1px solid', borderColor: 'divider',
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: kpi.color, transform: 'translateY(-1px)', boxShadow: `0 4px 12px ${kpi.color}15` },
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: `${kpi.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color }}>
          {kpi.icon}
        </Box>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {kpi.label}
        </Typography>
      </Stack>
      {isLoading ? (
        <Skeleton width={50} height={32} variant="rounded" sx={{ borderRadius: 1 }} />
      ) : (
        <Typography sx={{ fontSize: 26, fontWeight: 800, color: kpi.color, letterSpacing: '-0.03em', lineHeight: 1 }}>
          {resumo ? kpi.getValue(resumo) : 0}
          {kpi.suffix && <Typography component="span" sx={{ fontSize: 12, fontWeight: 500, color: 'text.disabled', ml: 0.5 }}>{kpi.suffix}</Typography>}
        </Typography>
      )}
    </Paper>
  );
}

function RateCard({ resumo, isLoading }: { resumo?: ChamadoResumo; isLoading: boolean }) {
  const finalizados = resumo?.porStatus.find((s) => s.status === 'F')?.total ?? 0;
  const total = resumo?.total ?? 0;
  const rate = total > 0 ? Math.round((finalizados / total) * 100) : 0;

  return (
    <Paper elevation={0} sx={{ px: 2, py: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#10b98114', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
          <TrendingUpRounded sx={{ fontSize: 20 }} />
        </Box>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Taxa Resolucao
        </Typography>
      </Stack>
      {isLoading ? (
        <Skeleton width={50} height={32} variant="rounded" />
      ) : (
        <>
          <Typography sx={{ fontSize: 26, fontWeight: 800, color: '#10b981', letterSpacing: '-0.03em', lineHeight: 1, mb: 0.75 }}>
            {rate}%
          </Typography>
          <LinearProgress variant="determinate" value={rate} sx={{ height: 4, borderRadius: 2, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { borderRadius: 2, bgcolor: '#10b981' } }} />
        </>
      )}
    </Paper>
  );
}

function PriorityCard({ resumo, isLoading }: { resumo?: ChamadoResumo; isLoading: boolean }) {
  const prios = resumo?.porPrioridade ?? [];
  const total = resumo?.total || 1;

  return (
    <Paper elevation={0} sx={{ px: 2, py: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#f59e0b14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
          <FlagRounded sx={{ fontSize: 20 }} />
        </Box>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Por Prioridade
        </Typography>
      </Stack>
      {isLoading ? (
        <Stack spacing={0.5}>{[1, 2, 3].map((i) => <Skeleton key={i} height={20} variant="rounded" />)}</Stack>
      ) : (
        <Stack spacing={0.75}>
          {(['A', 'M', 'B'] as const).map((code) => {
            const p = prios.find((x) => x.prioridade === code);
            const count = p?.total ?? 0;
            const pct = Math.round((count / total) * 100);
            const def = PRIO_MAP[code];
            return (
              <Box key={code}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.25 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary' }}>{def.label}</Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: def.color }}>{count}</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={pct} sx={{ height: 4, borderRadius: 2, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { borderRadius: 2, bgcolor: def.color } }} />
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}

export function ChamadosKpiRow({ resumo, isLoading }: ChamadosKpiRowProps) {
  return (
    <Stack spacing={2}>
      {/* Status KPIs */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: `repeat(${STATUS_KPIS.length}, 1fr)` },
        gap: 1.5,
      }}>
        {STATUS_KPIS.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} resumo={resumo} isLoading={isLoading} />
        ))}
      </Box>

      {/* Secondary KPIs: rate + priority breakdown */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: 1.5,
      }}>
        <RateCard resumo={resumo} isLoading={isLoading} />
        <PriorityCard resumo={resumo} isLoading={isLoading} />
      </Box>
    </Stack>
  );
}
