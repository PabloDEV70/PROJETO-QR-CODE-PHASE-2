import { Box, LinearProgress, Typography, alpha } from '@mui/material';
import { Build, Coffee, AccessTime, ListAlt } from '@mui/icons-material';
import type { RdoCabecalho, RdoDetalheItem } from '@/types/rdo-types';
import { duracaoMinutos, formatMinutos } from '@/utils/hora-utils';

interface ResumoDiaCardProps {
  cabecalho: RdoCabecalho;
  detalhes: RdoDetalheItem[];
}

const MONO = '"SF Mono", "Roboto Mono", "Fira Code", monospace';

function StatItem({ icon, value, label, color }: {
  icon: React.ReactNode; value: string; label: string; color: string;
}) {
  return (
    <Box sx={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 0.5, py: 1.25,
    }}>
      {icon}
      <Typography sx={{
        fontSize: '1.1rem', fontWeight: 800, color, lineHeight: 1,
        fontFamily: MONO, fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </Typography>
      <Typography sx={{
        fontSize: '0.7rem', color: 'text.secondary', fontWeight: 600,
      }}>
        {label}
      </Typography>
    </Box>
  );
}

export function ResumoDiaCard({ detalhes }: ResumoDiaCardProps) {
  const totalMin = detalhes.reduce((a, d) => a + duracaoMinutos(d.HRINI, d.HRFIM), 0);
  const prodMin = detalhes
    .filter((d) => d.motivoProdutivo === 'S')
    .reduce((a, d) => a + duracaoMinutos(d.HRINI, d.HRFIM), 0);
  const nprodMin = totalMin - prodMin;
  const pct = totalMin > 0 ? Math.round((prodMin / totalMin) * 100) : 0;
  const barColor = pct >= 85 ? '#16A34A' : pct >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <Box>
      {/* Barra de produtividade */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Typography sx={{
          fontSize: '1.6rem', fontWeight: 900, color: barColor, lineHeight: 1,
          fontFamily: MONO, fontVariantNumeric: 'tabular-nums', minWidth: 56,
        }}>
          {pct}%
        </Typography>
        <Box sx={{ flex: 1 }}>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 10, borderRadius: 99,
              bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.08) : alpha('#000', 0.06),
              '& .MuiLinearProgress-bar': {
                bgcolor: barColor, borderRadius: 99,
                transition: 'transform 0.6s ease',
              },
            }}
          />
          <Typography sx={{
            fontSize: '0.65rem', color: 'text.disabled', mt: 0.3, textAlign: 'right',
            fontWeight: 500,
          }}>
            produtividade
          </Typography>
        </Box>
      </Box>

      {/* Stats 4 colunas */}
      <Box sx={{
        display: 'flex',
        borderRadius: 2.5,
        bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.04) : alpha('#000', 0.02),
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        '& > *:not(:last-child)': {
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}>
        <StatItem
          icon={<Build sx={{ fontSize: 20, color: '#16A34A' }} />}
          value={formatMinutos(prodMin)}
          label="Produtivo"
          color="#16A34A"
        />
        <StatItem
          icon={<Coffee sx={{ fontSize: 20, color: '#F59E0B' }} />}
          value={formatMinutos(nprodMin)}
          label="Pausa"
          color="#F59E0B"
        />
        <StatItem
          icon={<AccessTime sx={{ fontSize: 20, color: 'text.secondary' }} />}
          value={formatMinutos(totalMin)}
          label="Total"
          color="text.primary"
        />
        <StatItem
          icon={<ListAlt sx={{ fontSize: 20, color: 'text.secondary' }} />}
          value={String(detalhes.length)}
          label={detalhes.length === 1 ? 'Atividade' : 'Atividades'}
          color="text.primary"
        />
      </Box>
    </Box>
  );
}
