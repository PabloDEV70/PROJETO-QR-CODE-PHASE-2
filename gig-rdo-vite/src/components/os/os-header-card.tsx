import { Paper, Typography, Stack, Chip, Skeleton, Box } from '@mui/material';
import { format, parseISO } from 'date-fns';
import type { OsEnrichedResponse } from '@/types/os-detail-types';

interface OsHeaderCardProps {
  os: OsEnrichedResponse | undefined;
  isLoading: boolean;
}

const STATUS_COLORS = {
  A: 'success',
  E: 'info',
  F: 'default',
  C: 'error',
} as const;

function formatDate(date: string | null): string {
  if (!date) return '-';
  try {
    return format(parseISO(date), 'dd/MM/yyyy HH:mm');
  } catch {
    return '-';
  }
}

export function OsHeaderCard({ os, isLoading }: OsHeaderCardProps) {
  if (isLoading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Skeleton variant="text" width="40%" height={32} />
          <Skeleton variant="rectangular" width="100%" height={24} />
          <Skeleton variant="rectangular" width="100%" height={24} />
          <Skeleton variant="rectangular" width="100%" height={24} />
        </Stack>
      </Paper>
    );
  }

  if (!os) return null;

  const statusColor = STATUS_COLORS[os.STATUS as keyof typeof STATUS_COLORS] || 'default';

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Typography variant="h6">OS #{os.NUOS}</Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={os.statusLabel || os.STATUS}
            color={statusColor}
            size="small"
          />
          {os.manutencaoLabel && (
            <Chip
              label={os.manutencaoLabel}
              variant="outlined"
              size="small"
            />
          )}
        </Stack>

        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Datas
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Box>
              <Typography variant="caption" color="text.secondary">Abertura:</Typography>
              <Typography variant="body2">{formatDate(os.DTABERTURA)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Inicio:</Typography>
              <Typography variant="body2">{formatDate(os.DATAINI)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Fim:</Typography>
              <Typography variant="body2">{formatDate(os.DATAFIN)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Previsao:</Typography>
              <Typography variant="body2">{formatDate(os.PREVISAO)}</Typography>
            </Box>
          </Stack>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Veiculo
          </Typography>
          {os.CODVEICULO ? (
            <Stack direction="row" spacing={1}>
              <Typography variant="body2">
                {os.veiculo.marca || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">|</Typography>
              <Typography variant="body2">
                {os.veiculo.placa || '-'}
              </Typography>
              {os.veiculo.tag && (
                <>
                  <Typography variant="body2" color="text.secondary">|</Typography>
                  <Typography variant="body2">{os.veiculo.tag}</Typography>
                </>
              )}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">Sem veiculo</Typography>
          )}
        </Box>

        {os.nomeParc && (
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Parceiro
            </Typography>
            <Typography variant="body2">{os.nomeParc}</Typography>
          </Box>
        )}

        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Contadores
          </Typography>
          <Stack direction="row" spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">Servicos:</Typography>
              <Typography variant="body2">{os.totalServicos}</Typography>
            </Box>
            {os.HORIMETRO !== null && (
              <Box>
                <Typography variant="caption" color="text.secondary">Horimetro:</Typography>
                <Typography variant="body2">{os.HORIMETRO}</Typography>
              </Box>
            )}
            {os.KM !== null && (
              <Box>
                <Typography variant="caption" color="text.secondary">KM:</Typography>
                <Typography variant="body2">{os.KM}</Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
