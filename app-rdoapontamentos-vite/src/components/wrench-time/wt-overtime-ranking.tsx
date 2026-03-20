import { Box, Paper, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import { AccessTime, Info } from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { fmtMin } from '@/utils/wrench-time-categories';
import type { ColabOvertimeRanking } from '@/types/rdo-analytics-types';

function OvertimeRow({ item, rank }: { item: ColabOvertimeRanking; rank: number }) {
  return (
    <Tooltip
      title={`${item.diasComHE} dias com hora extra de ${item.totalRdos} RDOs`}
      arrow placement="left"
    >
      <Stack
        direction="row" spacing={1.5} alignItems="center"
        sx={{
          py: 1, px: 0.5,
          '&:hover': { bgcolor: 'action.hover' },
          transition: 'background-color 0.15s', borderRadius: 1,
        }}
      >
        <Typography sx={{
          width: 18, fontSize: 12, fontWeight: 700,
          color: 'text.disabled', textAlign: 'center', flexShrink: 0,
        }}>
          {rank}
        </Typography>
        <FuncionarioAvatar
          codparc={item.codparc} nome={item.nomeparc} size="small"
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {item.nomeparc}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {item.cargo} — {item.diasComHE} dias com HE
          </Typography>
        </Box>
        <Typography
          variant="subtitle1" fontWeight={700}
          sx={{ flexShrink: 0, color: '#1D4ED8' }}
        >
          {fmtMin(item.horaExtraMin)}
        </Typography>
      </Stack>
    </Tooltip>
  );
}

function LoadingSkeleton() {
  return (
    <Paper sx={{ p: 2, flex: 1, borderRadius: 2.5 }}>
      <Skeleton width={180} height={24} sx={{ mb: 1 }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <Stack key={i} direction="row" spacing={1.5} alignItems="center" sx={{ py: 1 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="70%" height={18} />
            <Skeleton width="50%" height={14} sx={{ mt: 0.5 }} />
          </Box>
          <Skeleton width={50} height={20} />
        </Stack>
      ))}
    </Paper>
  );
}

interface WtOvertimeRankingProps {
  data: ColabOvertimeRanking[] | undefined;
  isLoading: boolean;
}

export function WtOvertimeRanking({ data, isLoading }: WtOvertimeRankingProps) {
  if (isLoading) return <LoadingSkeleton />;
  if (!data || data.length === 0) return null;

  const top5 = data.slice(0, 5);

  return (
    <Paper sx={{ p: 2, flex: 1, borderRadius: 2.5 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <AccessTime sx={{ fontSize: 20, color: '#1D4ED8' }} />
        <Typography variant="subtitle2" fontWeight={700}>
          Top 5 — Mais Hora Extra
        </Typography>
        <Tooltip
          title="Colaboradores com mais horas extras no periodo (total acima da jornada prevista)"
          arrow
        >
          <Info sx={{ fontSize: 16, color: 'text.disabled', ml: 'auto' }} />
        </Tooltip>
      </Stack>
      <Stack spacing={0} divider={
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />
      }>
        {top5.map((item, i) => (
          <OvertimeRow key={item.codparc} item={item} rank={i + 1} />
        ))}
      </Stack>
    </Paper>
  );
}
