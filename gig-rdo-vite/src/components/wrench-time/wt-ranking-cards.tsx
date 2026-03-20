import { Box, Paper, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import { TrendingUp, TrendingDown, Info } from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { fmtMin } from '@/utils/wrench-time-categories';
import type { ColabRanking } from '@/types/rdo-analytics-types';

function RankingRow({ item, rank }: { item: ColabRanking; rank: number }) {
  return (
    <Tooltip
      title={`${fmtMin(item.minutosProdu)} produtivas de ${fmtMin(item.tempoNoTrabalho)} | ${item.totalRdos} RDOs`}
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
            {item.cargo} — {item.totalRdos} RDOs
          </Typography>
        </Box>
        <Typography variant="subtitle1" fontWeight={700} sx={{ flexShrink: 0 }}>
          {item.produtividadePercent}%
        </Typography>
      </Stack>
    </Tooltip>
  );
}

function RankingCard({ title, icon, items, startRank }: {
  title: string; icon: React.ReactNode;
  items: ColabRanking[]; startRank: number;
}) {
  return (
    <Paper sx={{ p: 2, flex: 1, borderRadius: 2.5 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        {icon}
        <Typography variant="subtitle2" fontWeight={700}>{title}</Typography>
        <Tooltip
          title="Soma de horas em Atividade Produtiva (RDOMOTIVO PRODUTIVO=S) no periodo"
          arrow
        >
          <Info sx={{ fontSize: 16, color: 'text.disabled', ml: 'auto' }} />
        </Tooltip>
      </Stack>
      {items.length === 0 && (
        <Typography variant="caption" color="text.secondary">
          Sem dados no periodo
        </Typography>
      )}
      <Stack spacing={0} divider={
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />
      }>
        {items.map((item, i) => (
          <RankingRow key={item.codparc} item={item} rank={startRank + i} />
        ))}
      </Stack>
    </Paper>
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

interface WtRankingCardsProps {
  ranking: ColabRanking[] | undefined;
  isLoading: boolean;
  extra?: React.ReactNode;
}

export function WtRankingCards({ ranking, isLoading, extra }: WtRankingCardsProps) {
  if (isLoading) {
    return (
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        <LoadingSkeleton />
        <LoadingSkeleton />
        {extra && <LoadingSkeleton />}
      </Stack>
    );
  }

  if (!ranking || ranking.length === 0) return null;

  const top5 = ranking.slice(0, 5);
  const bottom5 = ranking.length > 5
    ? ranking.slice(-5).reverse()
    : [];

  return (
    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
      <RankingCard
        title="Top 5 — Mais Horas Produtivas"
        icon={<TrendingUp sx={{ fontSize: 20, color: '#16A34A' }} />}
        items={top5} startRank={1}
      />
      <RankingCard
        title="Bottom 5 — Menos Produtivos"
        icon={<TrendingDown sx={{ fontSize: 20, color: '#EF4444' }} />}
        items={bottom5}
        startRank={Math.max(ranking.length - 4, 1)}
      />
      {extra}
    </Stack>
  );
}
