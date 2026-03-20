import { Box, Paper, Typography, Skeleton, Stack, LinearProgress } from '@mui/material';
import {
  BuildRounded, EngineeringRounded,
  CheckCircleRounded, CancelRounded,
  AssignmentRounded, TrendingUpRounded,
} from '@mui/icons-material';
import { OS_STATUS_MAP, TIPO_MANUT_MAP } from '@/utils/os-constants';
import type { OsResumo } from '@/types/os-types';

interface OsKpiRowProps {
  resumo: OsResumo | undefined;
  isLoading: boolean;
}

interface KpiDef {
  label: string;
  color: string;
  icon: React.ReactNode;
  getValue: (r: OsResumo) => number;
}

const STATUS_KPIS: KpiDef[] = [
  { label: 'Total', color: '#1976d2', icon: <AssignmentRounded sx={{ fontSize: 20 }} />, getValue: (r) => r.total ?? r.totalOs ?? 0 },
  { label: OS_STATUS_MAP.A.label, color: OS_STATUS_MAP.A.color, icon: <BuildRounded sx={{ fontSize: 20 }} />, getValue: (r) => r.porStatus?.find((s) => s.status === 'A')?.total ?? r.abertas ?? 0 },
  { label: OS_STATUS_MAP.E.label, color: OS_STATUS_MAP.E.color, icon: <EngineeringRounded sx={{ fontSize: 20 }} />, getValue: (r) => r.porStatus?.find((s) => s.status === 'E')?.total ?? r.emExecucao ?? 0 },
  { label: OS_STATUS_MAP.F.label, color: OS_STATUS_MAP.F.color, icon: <CheckCircleRounded sx={{ fontSize: 20 }} />, getValue: (r) => r.porStatus?.find((s) => s.status === 'F')?.total ?? r.fechadas ?? 0 },
  { label: OS_STATUS_MAP.C.label, color: OS_STATUS_MAP.C.color, icon: <CancelRounded sx={{ fontSize: 20 }} />, getValue: (r) => r.porStatus?.find((s) => s.status === 'C')?.total ?? r.canceladas ?? 0 },
];

function KpiCard({ kpi, resumo, isLoading }: { kpi: KpiDef; resumo?: OsResumo; isLoading: boolean }) {
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
        </Typography>
      )}
    </Paper>
  );
}

function RateCard({ resumo, isLoading }: { resumo?: OsResumo; isLoading: boolean }) {
  const finalizados = resumo?.porStatus?.find((s) => s.status === 'F')?.total ?? resumo?.fechadas ?? 0;
  const total = resumo?.total ?? resumo?.totalOs ?? 0;
  const rate = total > 0 ? Math.round((finalizados / total) * 100) : 0;

  return (
    <Paper elevation={0} sx={{ px: 2, py: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#10b98114', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
          <TrendingUpRounded sx={{ fontSize: 20 }} />
        </Box>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Taxa Finalizacao
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

function CustoCard({ resumo, isLoading }: { resumo?: OsResumo; isLoading: boolean }) {
  const custo = resumo?.custoTotal ?? 0;

  return (
    <Paper elevation={0} sx={{ px: 2, py: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#f59e0b14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
          <Typography sx={{ fontSize: 14, fontWeight: 800 }}>R$</Typography>
        </Box>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Custo Total
        </Typography>
      </Stack>
      {isLoading ? (
        <Skeleton width={80} height={32} variant="rounded" />
      ) : (
        <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#f59e0b', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {custo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Typography>
      )}
    </Paper>
  );
}

function TipoBreakdown({ resumo, isLoading }: { resumo?: OsResumo; isLoading: boolean }) {
  const tipos = resumo?.porTipo ?? [];
  const total = resumo?.total || 1;

  return (
    <Paper elevation={0} sx={{ px: 2, py: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
        Por Tipo Manutencao
      </Typography>
      {isLoading ? (
        <Stack spacing={0.5}>{[1, 2, 3].map((i) => <Skeleton key={i} height={20} variant="rounded" />)}</Stack>
      ) : (
        <Stack spacing={0.75}>
          {tipos.slice(0, 6).map((t) => {
            const pct = Math.round((t.total / total) * 100);
            const def = TIPO_MANUT_MAP[t.tipo];
            const color = def?.color ?? '#64748b';
            return (
              <Box key={t.tipo}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.25 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary' }}>{t.label}</Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color }}>{t.total}</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={pct} sx={{ height: 4, borderRadius: 2, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { borderRadius: 2, bgcolor: color } }} />
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}

export function OsKpiRow({ resumo, isLoading }: OsKpiRowProps) {
  return (
    <Stack spacing={2}>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: `repeat(${STATUS_KPIS.length}, 1fr)` },
        gap: 1.5,
      }}>
        {STATUS_KPIS.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} resumo={resumo} isLoading={isLoading} />
        ))}
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
        gap: 1.5,
      }}>
        <RateCard resumo={resumo} isLoading={isLoading} />
        <CustoCard resumo={resumo} isLoading={isLoading} />
        <TipoBreakdown resumo={resumo} isLoading={isLoading} />
      </Box>
    </Stack>
  );
}
