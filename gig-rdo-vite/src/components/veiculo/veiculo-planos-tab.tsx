import {
  Box,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Typography,
} from '@mui/material';
import { format, parseISO, isValid } from 'date-fns';
import type { VeiculoPlano } from '@/types/veiculo-tabs-types';

interface Props {
  items?: VeiculoPlano[];
  isLoading: boolean;
}

function safeFmt(v: string | Date | null, fmt = 'dd/MM/yyyy'): string {
  if (!v) return '-';
  const d = typeof v === 'string' ? parseISO(v) : new Date(v);
  return isValid(d) ? format(d, fmt) : '-';
}

function PlanoCard({ plano }: { plano: VeiculoPlano }) {
  const ativo = plano.ATIVO === 'S';
  const auto = plano.GERAAUTO === 'S';

  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Plano #{plano.NUPLANO}: {plano.DESCRICAO ?? '-'}
          </Typography>
          {plano.TIPO && (
            <Chip
              label={plano.TIPO}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.65rem' }}
            />
          )}
          <Chip
            label={ativo ? 'Ativo' : 'Inativo'}
            size="small"
            color={ativo ? 'success' : 'default'}
            sx={{ height: 20, fontSize: '0.65rem' }}
          />
          <Chip
            label={auto ? 'Auto' : 'Manual'}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.65rem' }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">
            Tempo: {plano.TEMPO ?? '-'} dias
          </Typography>
          <Typography variant="caption" color="text.secondary">
            KM/Horimetro: {plano.KMHORIMETRO ?? '-'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Tolerancia: {plano.PERCTOLERANCIA ?? '-'}%
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
          Inclusao: {safeFmt(plano.DTINCLUSAO)}
        </Typography>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <Card variant="outlined" key={i}>
          <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="50%" />
            <Skeleton variant="text" width="30%" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export function VeiculoPlanosTab({ items, isLoading }: Props) {
  const list = items ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Planos Preventivos ({isLoading ? '...' : list.length})
      </Typography>

      {isLoading ? (
        <LoadingSkeleton />
      ) : list.length === 0 ? (
        <Typography color="text.secondary">Nenhum plano preventivo</Typography>
      ) : (
        list.map((p) => (
          <PlanoCard key={p.NUPLANO} plano={p} />
        ))
      )}
    </Box>
  );
}
