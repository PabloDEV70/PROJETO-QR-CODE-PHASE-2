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
import type { PatrimonioBemDetalhe } from '@/types/patrimonio-types';
import { usePatrimonioBemMobilizacao } from '@/hooks/use-patrimonio-bem-detalhe';

interface PatrimonioMobilizacaoTabProps {
  codbem: string;
  bem: PatrimonioBemDetalhe;
}

const fmtDate = (v: string | null) => {
  if (!v) return '-';
  try {
    return new Date(v).toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
};

export function PatrimonioMobilizacaoTab({ codbem, bem }: PatrimonioMobilizacaoTabProps) {
  const { data: items, isLoading } = usePatrimonioBemMobilizacao(codbem);

  return (
    <Stack spacing={2}>
      {/* Status atual */}
      {bem.mobilizado ? (
        <Alert severity="success" variant="outlined">
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            MOBILIZADO em {bem.clienteAtual || 'cliente'}
            {bem.dhChamadaAtual && ` desde ${fmtDate(bem.dhChamadaAtual)}`}
          </Typography>
          {bem.numosAtual && (
            <Typography variant="caption" color="text.secondary">
              OS #{bem.numosAtual}
            </Typography>
          )}
        </Alert>
      ) : (
        <Alert severity="info" variant="outlined">
          <Typography variant="body2" sx={{ fontWeight: 600 }}>DISPONIVEL</Typography>
        </Alert>
      )}

      {/* Historico de mobilizacoes */}
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Historico de Mobilizacoes ({isLoading ? '...' : items?.length ?? 0})
      </Typography>

      {isLoading ? (
        <Stack spacing={1}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} variant="rounded" height={72} />
          ))}
        </Stack>
      ) : !items?.length ? (
        <Typography color="text.secondary">Nenhuma mobilizacao registrada</Typography>
      ) : (
        <Stack spacing={1}>
          {items.map((mob, idx) => (
            <Card key={`${mob.numos}-${idx}`} variant="outlined">
              <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {mob.cliente}
                  </Typography>
                  <Chip
                    label={mob.situacao}
                    size="small"
                    color={mob.dtFechamento ? 'default' : 'success'}
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                  <Chip
                    label={`${mob.dias} dias`}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  OS #{mob.numos} | {fmtDate(mob.dhChamada)}
                  {mob.dtFechamento && ` - ${fmtDate(mob.dtFechamento)}`}
                </Typography>
                {mob.servico && (
                  <Typography variant="caption" color="text.secondary">
                    Servico: {mob.servico}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
