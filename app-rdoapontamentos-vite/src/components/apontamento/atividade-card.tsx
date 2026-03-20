import { Box, ButtonBase, Typography } from '@mui/material';
import { Edit as EditIcon, Assignment } from '@mui/icons-material';
import { getMotivoIcon } from '@/utils/motivo-icons';
import { getCategoryMeta } from '@/utils/wrench-time-categories';
import type { RdoDetalheItem } from '@/types/rdo-types';
import { hhmmToString, formatMinutos } from '@/utils/hora-utils';

interface AtividadeCardProps {
  item: RdoDetalheItem;
  onClick?: () => void;
}

function getDuracao(item: RdoDetalheItem): number {
  if (item.duracaoMinutos != null && item.duracaoMinutos > 0) return item.duracaoMinutos;
  if (item.HRINI == null || item.HRFIM == null) return 0;
  const ini = Math.floor(item.HRINI / 100) * 60 + (item.HRINI % 100);
  const fim = Math.floor(item.HRFIM / 100) * 60 + (item.HRFIM % 100);
  return fim > ini ? fim - ini : 0;
}

const MONO = '"SF Mono", "Roboto Mono", "Fira Code", monospace';

export function AtividadeCard({ item, onClick }: AtividadeCardProps) {
  const duracao = getDuracao(item);
  const catMeta = getCategoryMeta(item.motivoCategoria ?? 'wrenchTime');
  const accent = catMeta.color;
  const Icon = getMotivoIcon(item.motivoSigla);

  const content = (
    <Box sx={{
      display: 'flex', alignItems: 'stretch', gap: 0,
      borderBottom: '1px solid', borderColor: 'divider',
      ...(onClick ? {
        cursor: 'pointer',
        transition: 'background-color 150ms',
        '&:hover': { bgcolor: 'action.hover' },
        '&:active': { bgcolor: 'action.selected' },
      } : {}),
    }}>
      {/* Left accent bar */}
      <Box sx={{
        width: 4, flexShrink: 0, bgcolor: accent,
        borderRadius: '2px 0 0 2px',
      }} />

      {/* Content */}
      <Box sx={{ flex: 1, py: 1.25, px: 1.5, minWidth: 0 }}>
        {/* Line 1: time range + duration */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Typography sx={{
            fontFamily: MONO, fontSize: '0.95rem', fontWeight: 600,
            color: 'text.primary', fontVariantNumeric: 'tabular-nums',
            letterSpacing: '0.02em',
          }}>
            {item.hriniFormatada ?? hhmmToString(item.HRINI)}
            {' — '}
            {item.hrfimFormatada ?? hhmmToString(item.HRFIM)}
          </Typography>
          <Typography sx={{
            fontFamily: MONO, fontSize: '0.95rem', fontWeight: 700,
            color: accent, fontVariantNumeric: 'tabular-nums',
          }}>
            {duracao > 0 ? formatMinutos(duracao) : '—'}
          </Typography>
        </Box>

        {/* Line 2: icon + sigla + description */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.75 }}>
          <Box sx={{
            width: 28, height: 28, borderRadius: 1, flexShrink: 0,
            bgcolor: accent, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon sx={{ fontSize: 16 }} />
          </Box>
          <Typography sx={{
            fontFamily: MONO, fontSize: '0.85rem', fontWeight: 700,
            color: accent, letterSpacing: '0.04em',
          }}>
            {item.motivoSigla ?? '-'}
          </Typography>
          <Typography noWrap sx={{
            fontSize: '0.85rem', color: 'text.secondary', fontWeight: 500,
            flex: 1, minWidth: 0,
          }}>
            {item.motivoDescricao ?? ''}
          </Typography>
          {onClick && (
            <EditIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
          )}
        </Box>

        {/* Line 3: OS + OBS */}
        {(item.NUOS || item.OBS) && (
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
            {item.NUOS ? (
              <Typography sx={{
                fontFamily: MONO, fontSize: '0.8rem', fontWeight: 600,
                color: '#3B82F6',
              }}>
                OS {item.NUOS}
              </Typography>
            ) : null}
            {item.OBS ? (
              <Typography noWrap sx={{
                fontSize: '0.8rem', color: 'text.disabled', fontWeight: 500,
                fontStyle: 'italic', flex: 1, minWidth: 0,
              }}>
                {item.OBS}
              </Typography>
            ) : null}
          </Box>
        )}
      </Box>
    </Box>
  );

  if (onClick) {
    return (
      <ButtonBase onClick={onClick} sx={{ width: '100%', textAlign: 'left', display: 'block' }}>
        {content}
      </ButtonBase>
    );
  }

  return content;
}
