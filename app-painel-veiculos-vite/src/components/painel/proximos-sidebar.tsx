import { memo } from 'react';
import {
  Box, Paper, Typography, List, ListItem,
  Chip, Divider, CircularProgress,
} from '@mui/material';
import { AccessTime, DirectionsCar } from '@mui/icons-material';
import { useHstVeiProximos } from '@/hooks/use-hstvei-proximos';
import { parseISO, isValid } from 'date-fns';
import type { PainelVeiculo } from '@/types/hstvei-types';

function getTempoRestante(dt: unknown): { label: string; color: 'default' | 'warning' | 'error' } {
  if (!dt || typeof dt !== 'string') return { label: 'Sem previsão', color: 'default' };
  const d = parseISO(dt);
  if (!isValid(d)) return { label: 'Sem previsão', color: 'default' };
  
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diff < 0) {
    const absHours = Math.abs(hours);
    if (absHours >= 24) {
      const days = Math.floor(absHours / 24);
      return { label: `${days}d atrasado`, color: 'error' };
    }
    return { label: `${absHours}h atrasado`, color: 'error' };
  }
  
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return { label: `${days}d ${hours % 24}h`, color: 'default' };
  }
  if (hours > 2) {
    return { label: `${hours}h ${minutes}m`, color: 'default' };
  }
  if (hours >= 1) {
    return { label: `${hours}h ${minutes}m`, color: 'warning' };
  }
  return { label: `${minutes}m`, color: 'error' };
}

const ProximoVeiculoItem = memo(function ProximoVeiculoItem({ veiculo }: { veiculo: PainelVeiculo }) {
  const situacao = veiculo.situacoesAtivas[0];
  const tempo = getTempoRestante(veiculo.previsaoMaisProxima);
  
  return (
    <ListItem sx={{ px: 1, py: 0.75, flexDirection: 'column', alignItems: 'stretch' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DirectionsCar sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
          {veiculo.placa}
        </Typography>
        <Chip
          label={tempo.label}
          size="small"
          color={tempo.color === 'error' ? 'error' : tempo.color === 'warning' ? 'warning' : 'default'}
          sx={{ height: 20, fontSize: '0.7rem', ml: 'auto' }}
        />
      </Box>
      {situacao && (
        <Box sx={{ mt: 0.5, ml: 3 }}>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            {situacao.situacao}
          </Typography>
          {situacao.operadores.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
              {situacao.operadores.slice(0, 3).map((op) => (
                <Chip
                  key={op.codusu}
                  label={op.nome?.split(' ')[0] || 'Op'}
                  size="small"
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              ))}
            </Box>
          )}
        </Box>
      )}
    </ListItem>
  );
});

export const ProximosSidebar = memo(function ProximosSidebar() {
  const { data: proximos, isLoading } = useHstVeiProximos();

  return (
    <Paper sx={{
      width: 280, height: '100%', display: 'flex', flexDirection: 'column',
      borderLeft: 1, borderColor: 'divider', overflow: 'hidden',
    }}>
      <Box sx={{ p: 1.5, pb: 1, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTime sx={{ fontSize: 18 }} />
          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
            Próximos a Liberar
          </Typography>
        </Box>
      </Box>
      
      <Divider />
      
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : proximos && proximos.length > 0 ? (
          <List dense sx={{ py: 0 }}>
            {proximos.map((v, idx) => (
              <Box key={v.codveiculo}>
                <ProximoVeiculoItem veiculo={v} />
                {idx < proximos.length - 1 && <Divider component="li" />}
              </Box>
            ))}
          </List>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              Nenhum veículo próximo
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
});
