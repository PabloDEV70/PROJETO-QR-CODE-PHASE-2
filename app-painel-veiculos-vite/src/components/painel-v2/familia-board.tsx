import { memo, useState } from 'react';
import { Box, Typography, Collapse, IconButton, Chip } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { VeiculoRowV2 } from './veiculo-row-v2';
import type { PainelVeiculo } from '@/types/hstvei-types';

interface FamiliaBoardProps {
  familia: string;
  veiculos: PainelVeiculo[];
}

function countByStatus(veiculos: PainelVeiculo[]) {
  let livres = 0, manutencao = 0, locados = 0, bloqueados = 0;
  for (const v of veiculos) {
    const sit = v.situacoesAtivas[0]?.situacao?.toLowerCase() ?? '';
    if (sit.includes('livre') || sit.includes('disponivel') || sit.includes('pátio')) livres++;
    else if (sit.includes('locad') || sit.includes('contrato') || sit.includes('operação')) locados++;
    else if (sit.includes('bloqueio') || sit.includes('parad') || sit.includes('pausad')) bloqueados++;
    else manutencao++;
  }
  return { livres, manutencao, locados, bloqueados };
}

export const FamiliaBoard = memo(function FamiliaBoard({ familia, veiculos }: FamiliaBoardProps) {
  const [expanded, setExpanded] = useState(true);
  const counts = countByStatus(veiculos);

  return (
    <Box sx={{ mb: 1 }}>
      {/* Header */}
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          px: 2, py: 1,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          cursor: 'pointer',
          borderRadius: expanded ? '10px 10px 0 0' : '10px',
          transition: 'border-radius 0.2s',
          '&:hover': { bgcolor: 'primary.dark' },
        }}
      >
        <IconButton size="small" sx={{ color: 'inherit', p: 0 }}>
          {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </IconButton>

        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {familia}
        </Typography>

        <Chip
          label={veiculos.length}
          size="small"
          sx={{ height: 22, fontSize: '0.75rem', fontWeight: 700, bgcolor: 'rgba(255,255,255,0.2)', color: 'inherit' }}
        />

        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          {counts.livres > 0 && (
            <Chip size="small" label={`${counts.livres} livres`}
              sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#4caf5044', color: '#a5d6a7', border: '1px solid #4caf5066' }} />
          )}
          {counts.locados > 0 && (
            <Chip size="small" label={`${counts.locados} locados`}
              sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#2196f344', color: '#90caf9', border: '1px solid #2196f366' }} />
          )}
          {counts.manutencao > 0 && (
            <Chip size="small" label={`${counts.manutencao} manut.`}
              sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#ff980044', color: '#ffcc80', border: '1px solid #ff980066' }} />
          )}
          {counts.bloqueados > 0 && (
            <Chip size="small" label={`${counts.bloqueados} bloq.`}
              sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#f4433644', color: '#ef9a9a', border: '1px solid #f4433666' }} />
          )}
        </Box>
      </Box>

      {/* Table header */}
      <Collapse in={expanded}>
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderTop: 0, borderRadius: '0 0 10px 10px', overflow: 'hidden' }}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: '80px 100px 1fr 120px 90px 70px 50px',
            gap: 1,
            px: 1.5,
            py: 0.5,
            bgcolor: 'action.hover',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Placa</Typography>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tag</Typography>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Situacao</Typography>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Depto</Typography>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Equipe</Typography>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Prev.</Typography>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Pri</Typography>
          </Box>

          {veiculos.map((v) => (
            <VeiculoRowV2 key={v.codveiculo} veiculo={v} />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
});
