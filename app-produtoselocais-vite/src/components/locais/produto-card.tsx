import {
  Box,
  Card,
  CardActionArea,
  Typography,
  Chip,
  LinearProgress,
  Tooltip,
  alpha,
} from '@mui/material';
import { LocationOn, LocalShipping } from '@mui/icons-material';
import type { EstoqueLocal } from '@/types/local-produto';
import {
  getHealthLevel,
  getHealthLabel,
  getHealthChipColor,
  getDisponivel,
  isDesativado,
} from '@/utils/estoque-health';
import { ProdutoThumb } from '@/components/shared/produto-thumb';

interface ProdutoCardProps {
  item: EstoqueLocal;
  onClick: () => void;
}

const ACCENT: Record<string, string> = {
  critico: 'error.main',
  atencao: 'warning.main',
  excesso: 'info.main',
  ok: 'success.main',
};

export function ProdutoCard({ item, onClick }: ProdutoCardProps) {
  const health = getHealthLevel(item);
  const desativado = isDesativado(item);
  const nivelMax = item.estMax > 0 ? item.estMax : Math.max(item.estoque * 1.5, 1);
  const pctEstoque = Math.min((item.estoque / nivelMax) * 100, 100);
  const chipColor = getHealthChipColor(health);
  const disponivel = getDisponivel(item);
  const accent = ACCENT[health];

  const nameContent = (
    <Typography
      variant="body2"
      sx={{
        fontWeight: 600,
        lineHeight: 1.3,
        textDecoration: desativado ? 'line-through' : 'none',
        opacity: desativado ? 0.6 : 1,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}
    >
      {item.descrProd}
    </Typography>
  );

  return (
    <Card
      variant="outlined"
      sx={{
        position: 'relative',
        overflow: 'visible',
        bgcolor: desativado ? 'action.disabledBackground' : 'background.paper',
        borderColor: 'divider',
        transition: 'box-shadow 0.2s, transform 0.15s',
        '&:hover': { boxShadow: 4, transform: 'translateY(-1px)' },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          borderRadius: '4px 4px 0 0',
          bgcolor: accent,
        },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ p: 1.5, pt: 1.75 }}>
        {/* Header: Thumb + Name + Health badge */}
        <Box sx={{ display: 'flex', gap: 1.25, mb: 1.25 }}>
          <ProdutoThumb codProd={item.codProd} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {item.complDesc
              ? <Tooltip title={item.complDesc} arrow>{nameContent}</Tooltip>
              : <Tooltip title={item.descrProd} arrow>{nameContent}</Tooltip>}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <Typography
                variant="caption"
                sx={{ fontFamily: 'monospace', color: 'text.disabled', fontSize: '0.65rem' }}
              >
                #{item.codProd}
              </Typography>
              {item.descrGrupoProd && (
                <Chip
                  label={item.descrGrupoProd}
                  size="small"
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.6rem', maxWidth: 110 }}
                />
              )}
              {item.usoProd === 'I' && (
                <LocalShipping sx={{ fontSize: 14, color: 'primary.main' }} />
              )}
              {desativado && (
                <Chip label="DESATIV" size="small" color="error" sx={{ height: 18, fontSize: '0.6rem' }} />
              )}
            </Box>
          </Box>
          {health !== 'ok' && (
            <Chip
              label={getHealthLabel(health)}
              color={chipColor}
              size="small"
              sx={{ height: 22, fontSize: '0.65rem', fontWeight: 600, flexShrink: 0, alignSelf: 'flex-start' }}
            />
          )}
        </Box>

        {/* Localização */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mb: 1,
            px: 0.75,
            py: 0.35,
            borderRadius: 1,
            bgcolor: (t) => alpha(t.palette.text.primary, 0.04),
          }}
        >
          <LocationOn sx={{ fontSize: 13, color: 'text.disabled' }} />
          <Typography
            variant="caption"
            color={item.localizacao ? 'text.secondary' : 'text.disabled'}
            noWrap
            sx={{ fontSize: '0.7rem' }}
          >
            {item.localizacao || 'Sem localização'}
          </Typography>
        </Box>

        {/* Estoque bar */}
        <Box sx={{ mb: 0.75 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Estoque
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
              {item.estoque.toLocaleString('pt-BR')}
              {item.estMax > 0 && (
                <Typography
                  component="span"
                  variant="caption"
                  color="text.disabled"
                  sx={{ fontSize: '0.7rem' }}
                >
                  {' / '}{item.estMax.toLocaleString('pt-BR')}
                </Typography>
              )}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={pctEstoque}
            color={chipColor}
            sx={{ height: 5, borderRadius: 1 }}
          />
          {item.reservado > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block', fontSize: '0.65rem' }}>
              Disponível: {disponivel.toLocaleString('pt-BR')}
            </Typography>
          )}
        </Box>

        {/* Footer chips */}
        {(item.reservado > 0 || item.controle || item.estMin > 0) && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {item.reservado > 0 && (
              <Chip
                label={`Reserv: ${item.reservado.toLocaleString('pt-BR')}`}
                size="small"
                color="warning"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
            )}
            {item.controle && (
              <Chip
                label={item.controle}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.65rem', fontFamily: 'monospace' }}
              />
            )}
            {item.estMin > 0 && (
              <Chip
                label={`Mín: ${item.estMin.toLocaleString('pt-BR')}`}
                size="small"
                variant="outlined"
                color={health === 'critico' ? 'error' : 'default'}
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
            )}
          </Box>
        )}
      </CardActionArea>
    </Card>
  );
}
