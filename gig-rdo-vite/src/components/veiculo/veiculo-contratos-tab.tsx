import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
} from '@mui/material';
import { format, parseISO, isValid } from 'date-fns';
import type { ContratoVeiculo } from '@/types/veiculo-perfil-types';

interface Props {
  items: ContratoVeiculo[];
}

function safeFmt(v: string | Date | null, fmt = 'dd/MM/yyyy'): string {
  if (!v) return '-';
  const d = typeof v === 'string' ? parseISO(v) : new Date(v);
  return isValid(d) ? format(d, fmt) : '-';
}

function statusColor(s: string): 'success' | 'info' | 'default' {
  if (s === 'VIGENTE') return 'success';
  if (s === 'FUTURO') return 'info';
  return 'default';
}

function ContratoRow({ contrato }: { contrato: ContratoVeiculo }) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Contrato #{contrato.id}
          </Typography>
          <Chip
            label={contrato.statusContrato}
            size="small"
            color={statusColor(contrato.statusContrato)}
            sx={{ height: 20, fontSize: '0.65rem' }}
          />
          {contrato.diasRestantes != null && contrato.statusContrato === 'VIGENTE' && (
            <Typography variant="caption" color="text.secondary">
              {contrato.diasRestantes} dias restantes
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">
            Parceiro: {contrato.nomeParc}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Inicio: {safeFmt(contrato.dhinic)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Fim: {safeFmt(contrato.dhfin)}
          </Typography>
        </Box>
        {contrato.obs && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
            {contrato.obs}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export function VeiculoContratosTab({ items }: Props) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">Nenhum contrato encontrado</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Contratos ({items.length})
      </Typography>
      {items.map((c) => (
        <ContratoRow key={c.id} contrato={c} />
      ))}
    </Box>
  );
}
