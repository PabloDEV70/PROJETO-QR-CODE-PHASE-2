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
import { usePatrimonioBemComissionamento } from '@/hooks/use-patrimonio-bem-detalhe';

interface PatrimonioComissionamentoTabProps {
  codbem: string;
}

const SIT_COLORS: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  VIGENTE: 'success',
  VENCE_EM_30D: 'warning',
  VENCIDO: 'error',
};

export function PatrimonioComissionamentoTab({ codbem }: PatrimonioComissionamentoTabProps) {
  const { data: items, isLoading } = usePatrimonioBemComissionamento(codbem);

  if (isLoading) {
    return (
      <Stack spacing={1}>
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} variant="rounded" height={60} />
        ))}
      </Stack>
    );
  }

  if (!items?.length) {
    return <Alert severity="info">Sem dados de comissionamento</Alert>;
  }

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Comissionamento ({items.length})
      </Typography>

      {items.map((item, idx) => {
        const chipColor = SIT_COLORS[item.situacao] || 'default';

        return (
          <Card key={`${item.codveiculo}-${idx}`} variant="outlined">
            <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.tag || `Veiculo #${item.codveiculo}`}
                </Typography>
                <Chip
                  label={item.situacao}
                  size="small"
                  color={chipColor}
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
                {item.tipoEquipamento && (
                  <Chip
                    label={item.tipoEquipamento}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Status Veiculo: {item.statusVeiculo}
                </Typography>
                {item.valComissionamento && (
                  <Typography variant="caption" color="text.secondary">
                    Validade: {item.valComissionamento}
                  </Typography>
                )}
                {item.diasVence != null && (
                  <Typography
                    variant="caption"
                    color={item.diasVence <= 30 ? 'warning.main' : 'text.secondary'}
                    sx={{ fontWeight: item.diasVence <= 30 ? 600 : 400 }}
                  >
                    Vence em: {item.diasVence} dias
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
