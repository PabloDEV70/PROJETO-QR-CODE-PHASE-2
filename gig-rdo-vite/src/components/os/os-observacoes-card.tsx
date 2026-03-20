import { Paper, Typography, Skeleton, Alert } from '@mui/material';
import { useOsObservacao } from '@/hooks/use-os-detail';

interface OsObservacoesCardProps {
  nuos: number | null;
}

export function OsObservacoesCard({ nuos }: OsObservacoesCardProps) {
  const { data, isLoading } = useOsObservacao(nuos);

  if (isLoading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Observacoes
        </Typography>
        <Skeleton variant="rectangular" width="100%" height={80} />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Observacoes
      </Typography>

      {!data?.observacao ? (
        <Alert severity="info">Sem observacoes</Alert>
      ) : (
        <Typography
          variant="body2"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {data.observacao}
        </Typography>
      )}
    </Paper>
  );
}
