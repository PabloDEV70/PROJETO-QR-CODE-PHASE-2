import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Chip,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import type { EstoqueLocal } from '@/types/local-produto';
import {
  getHealthLevel,
  getHealthColor,
  getHealthChipColor,
  getHealthLabel,
  isDesativado,
} from '@/utils/estoque-health';
import { ProdutoThumb } from '@/components/shared/produto-thumb';

interface EstoqueListViewProps {
  items: EstoqueLocal[];
  onSelect: (item: EstoqueLocal) => void;
}

export function EstoqueListView({ items, onSelect }: EstoqueListViewProps) {
  return (
    <List dense disablePadding>
      {items.map((item, idx) => {
        const health = getHealthLevel(item);
        const desativado = isDesativado(item);
        const nivelMax = item.estMax > 0
          ? item.estMax
          : Math.max(item.estoque * 1.5, 1);
        const pct = Math.min((item.estoque / nivelMax) * 100, 100);

        const borderStyle = health === 'critico'
          ? { borderLeft: '3px solid', borderColor: 'error.main' }
          : health === 'atencao'
            ? { borderLeft: '3px solid', borderColor: 'warning.main' }
            : health === 'excesso'
              ? { borderLeft: '3px solid', borderColor: 'info.main' }
              : {};

        const nameNode = (
          <ListItemText
            primary={item.descrProd}
            primaryTypographyProps={{
              variant: 'body2',
              noWrap: true,
              sx: {
                fontWeight: 500,
                ...(desativado && { textDecoration: 'line-through', opacity: 0.6 }),
              },
            }}
            sx={{ mx: 1, minWidth: 0 }}
          />
        );

        return (
          <ListItemButton
            key={`${item.codProd}-${item.controle}-${idx}`}
            onClick={() => onSelect(item)}
            sx={{
              py: 1.25,
              borderRadius: 1,
              mb: 0.5,
              ...borderStyle,
              bgcolor: desativado ? 'action.hover' : undefined,
              opacity: desativado ? 0.7 : 1,
            }}
          >
            <ProdutoThumb codProd={item.codProd} size={40} />

            <Typography
              variant="caption"
              sx={{
                fontFamily: 'monospace',
                color: 'text.secondary',
                minWidth: 56,
                flexShrink: 0,
              }}
            >
              #{item.codProd}
            </Typography>

            {item.complDesc
              ? (
                <Tooltip title={item.complDesc} placement="top">
                  {nameNode}
                </Tooltip>
              )
              : nameNode
            }

            {desativado && (
              <Chip
                label="DESATIV"
                size="small"
                color="error"
                variant="outlined"
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  flexShrink: 0,
                  mr: 0.5,
                }}
              />
            )}

            {item.descrGrupoProd && (
              <Chip
                label={item.descrGrupoProd}
                size="small"
                variant="outlined"
                sx={{
                  height: 20,
                  fontSize: '0.6rem',
                  maxWidth: 100,
                  flexShrink: 0,
                  mr: 0.5,
                }}
              />
            )}

            <Typography
              variant="caption"
              color="text.disabled"
              noWrap
              sx={{ maxWidth: 120, flexShrink: 0, mr: 1, fontSize: '0.65rem' }}
            >
              {item.localizacao || '—'}
            </Typography>

            <Box sx={{ width: 80, flexShrink: 0, mr: 1 }}>
              <LinearProgress
                variant="determinate"
                value={pct}
                color={getHealthChipColor(health)}
                sx={{ height: 5, borderRadius: 1 }}
              />
            </Box>

            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                minWidth: 40,
                textAlign: 'right',
                flexShrink: 0,
                color: health !== 'ok' ? getHealthColor(health) : 'text.primary',
              }}
            >
              {item.estoque.toLocaleString('pt-BR')}
            </Typography>

            {health !== 'ok' && (
              <Chip
                label={getHealthLabel(health)}
                color={getHealthChipColor(health)}
                size="small"
                sx={{ height: 18, fontSize: '0.6rem', ml: 0.5, flexShrink: 0 }}
              />
            )}
          </ListItemButton>
        );
      })}
    </List>
  );
}
