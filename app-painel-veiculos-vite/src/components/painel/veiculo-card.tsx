import { memo } from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { DirectionsCar } from '@mui/icons-material';
import { SituacaoRow } from '@/components/painel/situacao-row';
import { getPrioridadeInfo } from '@/utils/prioridade-constants';
import type { PainelVeiculo } from '@/types/hstvei-types';

interface VeiculoCardProps {
  veiculo: PainelVeiculo;
}

export const VeiculoCard = memo(function VeiculoCard({ veiculo }: VeiculoCardProps) {
  const prioColor = getPrioridadeInfo(veiculo.prioridadeMaxima).color;

  return (
    <Paper sx={{
      p: 1.5, borderLeft: 4, borderColor: prioColor,
      bgcolor: 'background.paper',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
        <DirectionsCar sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
          {veiculo.placa}
        </Typography>
        {veiculo.tag && (
          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            ({veiculo.tag})
          </Typography>
        )}
        {veiculo.marcaModelo && (
          <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled', ml: 'auto' }} noWrap>
            {veiculo.marcaModelo}
          </Typography>
        )}
      </Box>
      {veiculo.situacoesAtivas.map((sit) => (
        <SituacaoRow key={sit.id} situacao={sit} />
      ))}
    </Paper>
  );
});
