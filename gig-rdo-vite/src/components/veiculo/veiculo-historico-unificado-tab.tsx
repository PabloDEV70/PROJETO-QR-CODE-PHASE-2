import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Typography,
} from '@mui/material';
import { format, parseISO, isValid } from 'date-fns';
import type { HistoricoOsUnificado } from '@/types/os-detalhada-types';

interface Props {
  items?: HistoricoOsUnificado[];
  isLoading: boolean;
}

function safeFmt(v: string | Date | null, fmt = 'dd/MM/yyyy'): string {
  if (!v) return '-';
  const d = typeof v === 'string' ? parseISO(v) : new Date(v);
  return isValid(d) ? format(d, fmt) : '-';
}

function tipoChipColor(tipo: string): 'primary' | 'secondary' {
  return tipo === 'COMERCIAL' ? 'primary' : 'secondary';
}

function situacaoLabel(tipo: string, sit: string): string {
  if (tipo === 'COMERCIAL') {
    if (sit === 'P') return 'Pendente';
    if (sit === 'A') return 'Aberta';
    if (sit === 'F') return 'Fechada';
    if (sit === 'C') return 'Cancelada';
    return sit;
  }
  if (sit === 'A') return 'Aberta';
  if (sit === 'E') return 'Em Execucao';
  if (sit === 'F') return 'Finalizada';
  if (sit === 'C') return 'Cancelada';
  return sit;
}

function HistoricoRow({ item }: { item: HistoricoOsUnificado }) {
  const navigate = useNavigate();
  const isClosed = item.dataFim !== null;
  const route = item.tipoOs === 'COMERCIAL'
    ? null
    : `/manutencao/os/${item.numOs}`;

  return (
    <Card
      variant="outlined"
      sx={{
        cursor: route ? 'pointer' : 'default',
        '&:hover': route ? { bgcolor: 'action.hover' } : undefined,
        opacity: isClosed ? 0.75 : 1,
      }}
      onClick={() => route && navigate(route)}
    >
      <CardContent sx={{ py: 0.75, px: 1.5, '&:last-child': { pb: 0.75 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={item.tipoOs}
            size="small"
            color={tipoChipColor(item.tipoOs)}
            sx={{ height: 20, fontSize: '0.6rem', fontWeight: 700 }}
          />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            OS {item.numOs}
          </Typography>
          <Chip
            label={situacaoLabel(item.tipoOs, item.situacao)}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.6rem' }}
          />
          <Typography variant="caption" color="text.secondary">
            {item.descricao}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: 0.25, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">
            {safeFmt(item.dataInicio)} - {safeFmt(item.dataFim)}
          </Typography>
          {item.local && (
            <Typography variant="caption" color="text.secondary">
              {item.local}
            </Typography>
          )}
          {item.parceiro && (
            <Typography variant="caption" color="text.secondary">
              {item.parceiro}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export function VeiculoHistoricoUnificadoTab({ items, isLoading }: Props) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={56} />
        ))}
      </Box>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">Nenhum historico encontrado</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Historico Unificado — Manutencao + Comercial ({items.length})
      </Typography>
      {items.map((item, idx) => (
        <HistoricoRow key={`${item.tipoOs}-${item.numOs}-${idx}`} item={item} />
      ))}
    </Box>
  );
}
