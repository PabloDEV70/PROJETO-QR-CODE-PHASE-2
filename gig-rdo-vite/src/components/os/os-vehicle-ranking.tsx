import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import type { MtbfByVehicle } from '@/types/os-dashboard-types';

interface OsVehicleRankingProps {
  mtbfByVehicle: MtbfByVehicle[] | undefined;
  isLoading: boolean;
}

function RankingRow({ vehicle, rank }: { vehicle: MtbfByVehicle; rank: number }) {
  return (
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
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {vehicle.PLACA ?? 'Sem Placa'}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          Cod. {vehicle.CODVEICULO}
        </Typography>
      </Box>
      <Stack alignItems="flex-end" sx={{ flexShrink: 0 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          {vehicle.totalFalhas}
        </Typography>
        {vehicle.mtbfDias !== null && (
          <Typography variant="caption" color="text.secondary">
            MTBF: {vehicle.mtbfDias.toFixed(1)}d
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <Stack key={i} direction="row" spacing={1.5} alignItems="center" sx={{ py: 1 }}>
          <Skeleton variant="text" width={18} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="60%" height={18} />
            <Skeleton width="40%" height={14} sx={{ mt: 0.5 }} />
          </Box>
          <Skeleton width={40} height={20} />
        </Stack>
      ))}
    </>
  );
}

export function OsVehicleRanking({ mtbfByVehicle, isLoading }: OsVehicleRankingProps) {
  const top10 = mtbfByVehicle
    ? [...mtbfByVehicle].sort((a, b) => b.totalFalhas - a.totalFalhas).slice(0, 10)
    : [];

  return (
    <Paper sx={{ p: 2, borderRadius: 2.5 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <EmojiEvents sx={{ fontSize: 20, color: 'warning.main' }} />
        <Typography variant="subtitle2" fontWeight={700}>
          Top 10 Veiculos — Mais OS
        </Typography>
      </Stack>
      {isLoading && <LoadingSkeleton />}
      {!isLoading && top10.length === 0 && (
        <Typography variant="caption" color="text.secondary">
          Sem dados de veiculos
        </Typography>
      )}
      {!isLoading && top10.length > 0 && (
        <Stack spacing={0} divider={
          <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />
        }>
          {top10.map((vehicle, i) => (
            <RankingRow key={vehicle.CODVEICULO} vehicle={vehicle} rank={i + 1} />
          ))}
        </Stack>
      )}
    </Paper>
  );
}
