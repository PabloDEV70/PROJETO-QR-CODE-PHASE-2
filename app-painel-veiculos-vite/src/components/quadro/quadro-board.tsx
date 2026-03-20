import { memo } from 'react';
import { Box, Typography } from '@mui/material';
import { QuadroRow } from './quadro-row';
import type { PainelVeiculo } from '@/types/hstvei-types';

interface QuadroBoardProps {
  titulo: string;
  veiculos: PainelVeiculo[];
}

const HEADER_COLS = [
  { label: 'PLACA', width: 100 },
  { label: 'EQUIPE', width: 120 },
  { label: 'CLIENTE', width: 180 },
  { label: 'LOCAL', width: 140 },
  { label: 'SAIDA', width: 100 },
  { label: 'DATA', width: 130 },
  { label: 'SITUACAO', width: 160 },
];

export const QuadroBoard = memo(function QuadroBoard({ titulo, veiculos }: QuadroBoardProps) {
  return (
    <Box>
      {/* Title bar — yellow like the physical board, sticky */}
      <Box sx={{
        bgcolor: '#f9a825',
        px: 2, py: 0.75,
        borderRadius: '6px 6px 0 0',
        display: 'flex', alignItems: 'center', gap: 1,
        position: 'sticky',
        top: 0,
        zIndex: 3,
      }}>
        <Typography sx={{
          fontWeight: 900, fontSize: '0.9rem', color: '#000',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          ESCALA DE SERVICOS
        </Typography>
        <Typography sx={{
          fontWeight: 700, fontSize: '0.85rem', color: '#d32f2f',
          textTransform: 'uppercase',
        }}>
          {titulo}
        </Typography>
        <Typography sx={{
          ml: 'auto', fontWeight: 600, fontSize: '0.75rem', color: '#000',
        }}>
          {veiculos.length} veiculos
        </Typography>
      </Box>

      {/* Column headers — colored like the physical board, sticky */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: HEADER_COLS.map((c) => `${c.width}px`).join(' ') + ' 1fr',
        bgcolor: '#e0e0e0',
        borderBottom: '2px solid #bdbdbd',
        position: 'sticky',
        top: 33,
        zIndex: 2,
      }}>
        {HEADER_COLS.map((col, i) => {
          const colors = ['#f44336', '#1565c0', '#2e7d32', '#f57c00', '#7b1fa2', '#00838f', '#455a64'];
          return (
            <Box key={col.label} sx={{
              px: 1, py: 0.5,
              bgcolor: colors[i % colors.length],
            }}>
              <Typography sx={{
                fontWeight: 900, fontSize: '0.7rem', color: '#fff',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                {col.label}
              </Typography>
            </Box>
          );
        })}
        <Box sx={{ bgcolor: '#455a64', px: 1, py: 0.5 }}>
          <Typography sx={{
            fontWeight: 900, fontSize: '0.7rem', color: '#fff',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            OBS
          </Typography>
        </Box>
      </Box>

      {/* Rows */}
      <Box sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderTop: 0,
        borderRadius: '0 0 6px 6px',
        overflow: 'hidden',
      }}>
        {veiculos.length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>
              Nenhum veiculo nesta secao
            </Typography>
          </Box>
        ) : (
          veiculos.map((v, idx) => (
            <QuadroRow key={v.codveiculo} veiculo={v} isEven={idx % 2 === 0} />
          ))
        )}
      </Box>
    </Box>
  );
});
