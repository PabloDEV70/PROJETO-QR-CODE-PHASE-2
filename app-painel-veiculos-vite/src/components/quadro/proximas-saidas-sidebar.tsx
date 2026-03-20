import { memo, useMemo } from 'react';
import {
  Box, Paper, Typography, List, ListItem,
  Chip, Divider, CircularProgress,
} from '@mui/material';
import { ExitToApp, Schedule } from '@mui/icons-material';
import { useHstVeiPainel } from '@/hooks/use-hstvei-painel';
import { getVeiculoStatusInfo } from '@/utils/status-utils';
import type { PainelVeiculo } from '@/types/hstvei-types';

function getTempoRestante(dt: string | null): { label: string; color: 'default' | 'warning' | 'error' | 'success' } {
  if (!dt) return { label: 'Sem previsao', color: 'default' };
  const d = new Date(dt);
  if (isNaN(d.getTime())) return { label: 'Sem previsao', color: 'default' };

  const diff = d.getTime() - Date.now();
  const hours = Math.floor(Math.abs(diff) / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (diff < 0) {
    return { label: days > 0 ? `${days}d atrasado` : `${hours}h atrasado`, color: 'error' };
  }
  if (days > 7) return { label: `${days}d`, color: 'default' };
  if (days > 2) return { label: `${days}d`, color: 'success' };
  if (hours > 12) return { label: `${days}d ${hours % 24}h`, color: 'warning' };
  return { label: `${hours}h`, color: 'error' };
}

const ProximaSaidaItem = memo(function ProximaSaidaItem({ veiculo }: { veiculo: PainelVeiculo }) {
  const sit = veiculo.situacoesAtivas[0];
  const statusInfo = getVeiculoStatusInfo(veiculo);
  const tempo = getTempoRestante(veiculo.previsaoMaisProxima);

  return (
    <ListItem sx={{ px: 1.5, py: 1, flexDirection: 'column', alignItems: 'stretch' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: statusInfo.color, flexShrink: 0 }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', fontFamily: 'monospace' }}>
          {veiculo.placa}
        </Typography>
        <Chip
          label={tempo.label}
          size="small"
          color={tempo.color}
          sx={{ height: 20, fontSize: '0.65rem', ml: 'auto' }}
        />
      </Box>
      {veiculo.tag && (
        <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', ml: 2.5 }}>
          {veiculo.tag} — {veiculo.tipo}
        </Typography>
      )}
      {sit && (
        <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled', ml: 2.5 }} noWrap>
          {sit.situacao}{sit.nomeParc ? ` — ${sit.nomeParc}` : ''}
        </Typography>
      )}
    </ListItem>
  );
});

export const ProximasSaidasSidebar = memo(function ProximasSaidasSidebar() {
  const { data: painel, isLoading } = useHstVeiPainel();

  const proximas = useMemo(() => {
    if (!painel?.veiculos) return [];

    return painel.veiculos
      .filter((v) => {
        if (!v.previsaoMaisProxima) return false;
        // Only vehicles with an expected return date
        return true;
      })
      .sort((a, b) => {
        const da = new Date(a.previsaoMaisProxima!).getTime();
        const db = new Date(b.previsaoMaisProxima!).getTime();
        return da - db;
      })
      .slice(0, 15);
  }, [painel]);

  return (
    <Paper sx={{
      width: 280, height: '100%', display: 'flex', flexDirection: 'column',
      borderLeft: 1, borderColor: 'divider', overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Header */}
      <Box sx={{ px: 1.5, py: 1, bgcolor: '#f9a825' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Schedule sx={{ fontSize: 18, color: '#000' }} />
          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#000', letterSpacing: '0.04em' }}>
            PROXIMAS SAIDAS
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : proximas.length > 0 ? (
          <List dense sx={{ py: 0 }}>
            {proximas.map((v, idx) => (
              <Box key={v.codveiculo}>
                <ProximaSaidaItem veiculo={v} />
                {idx < proximas.length - 1 && <Divider component="li" />}
              </Box>
            ))}
          </List>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <ExitToApp sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              Nenhuma saida prevista
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
});
