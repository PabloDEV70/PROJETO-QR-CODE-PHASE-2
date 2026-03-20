import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { usePatrimonioBemOs } from '@/hooks/use-patrimonio-bem-detalhe';

interface PatrimonioHistoricoOsTabProps {
  codbem: string;
}

const fmtDate = (v: string | null) => {
  if (!v) return '-';
  try {
    return new Date(v).toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
};

const fmtBRL = (v: number | null) =>
  v != null ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-';

const SIT_COLORS: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
  FECHADA: 'success',
  ABERTA: 'warning',
  LIBERADA: 'info',
};

export function PatrimonioHistoricoOsTab({ codbem }: PatrimonioHistoricoOsTabProps) {
  const navigate = useNavigate();
  const { data: items, isLoading } = usePatrimonioBemOs(codbem);

  if (isLoading) {
    return (
      <Stack spacing={1}>
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} variant="rounded" height={72} />
        ))}
      </Stack>
    );
  }

  if (!items?.length) {
    return <Alert severity="info">Nenhuma OS registrada para este bem</Alert>;
  }

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Ordens de Servico ({items.length})
      </Typography>

      {items.map((os, idx) => (
        <Card
          key={`${os.numos}-${idx}`}
          variant="outlined"
          sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
          onClick={() => navigate(`/manutencao/os/${os.numos}`)}
        >
          <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                OS #{os.numos}
              </Typography>
              <Chip
                label={os.situacao}
                size="small"
                color={SIT_COLORS[os.situacao] || 'default'}
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {os.cliente}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Chamada: {fmtDate(os.dhChamada)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Fechamento: {fmtDate(os.dtFechamento)}
              </Typography>
              {os.servico && (
                <Typography variant="caption" color="text.secondary">
                  Servico: {os.servico}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 0.25 }}>
              {os.kmIni != null && (
                <Typography variant="caption" color="text.secondary">
                  KM: {os.kmIni.toLocaleString('pt-BR')}
                  {os.kmFim != null && ` - ${os.kmFim.toLocaleString('pt-BR')}`}
                </Typography>
              )}
              {os.vlrCobrado != null && (
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Valor: {fmtBRL(os.vlrCobrado)}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
