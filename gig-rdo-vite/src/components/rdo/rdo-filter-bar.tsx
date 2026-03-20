import { useMemo } from 'react';
import {
  Paper, Stack, Button, Chip, Box, CircularProgress, Badge,
  IconButton, Tooltip, Select, MenuItem, FormControl,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { parseISO, format, isValid } from 'date-fns';
import { FilterAltOff, TuneRounded, Settings, ContentCopy } from '@mui/icons-material';
import { getPeriodPresets, getActivePresetKey } from '@/utils/rdo-filter-helpers';
import type { SxProps, Theme } from '@mui/material';

interface RdoFilterBarProps {
  dataInicio: string;
  dataFim: string;
  codparc: string | null;
  coddep: string | null;
  codfuncao: string | null;
  onUpdateParams: (updates: Record<string, string | null>) => void;
  onClearAll: () => void;
  onOpenFilters: () => void;
  onOpenProdConfig?: () => void;
  onCopyConfig?: () => void;
  isCustomConfig?: boolean;
  totalRegistros?: number;
  totalLabel?: string;
  isLoading?: boolean;
  sx?: SxProps<Theme>;
}

export function RdoFilterBar({
  dataInicio, dataFim, codparc, coddep, codfuncao,
  onUpdateParams, onClearAll, onOpenFilters,
  onOpenProdConfig, onCopyConfig, isCustomConfig,
  totalRegistros, totalLabel = 'RDOs', isLoading, sx,
}: RdoFilterBarProps) {
  const presets = useMemo(() => getPeriodPresets(), []);
  const activePreset = useMemo(
    () => getActivePresetKey(dataInicio, dataFim), [dataInicio, dataFim],
  );

  const entityCount = [codparc, coddep, codfuncao].filter(Boolean).length;
  const hasFilters = codparc || dataInicio || dataFim || coddep || codfuncao;

  const handlePresetChange = (key: string) => {
    if (key === '__all') {
      onUpdateParams({ dataInicio: null, dataFim: null });
      return;
    }
    if (key === '__custom') return;
    const preset = presets.find((p) => p.key === key);
    if (preset) onUpdateParams({ dataInicio: preset.ini, dataFim: preset.fim });
  };

  const selectValue = activePreset ?? (dataInicio || dataFim ? '__custom' : '__all');

  return (
    <Paper sx={[
      { px: 1.5, py: 1, borderRadius: 3 },
      ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
    ]}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={selectValue}
            onChange={(e) => handlePresetChange(e.target.value)}
            sx={{ fontWeight: 600, fontSize: 13, height: 32, borderRadius: 2 }}
          >
            {presets.map((p) => (
              <MenuItem key={p.key} value={p.key}>{p.label}</MenuItem>
            ))}
            <MenuItem value="__all">Tudo</MenuItem>
            {selectValue === '__custom' && (
              <MenuItem value="__custom">Personalizado</MenuItem>
            )}
          </Select>
        </FormControl>

        <DatePicker
          value={dataInicio ? parseISO(dataInicio) : null}
          onChange={(d) => onUpdateParams({
            dataInicio: d && isValid(d) ? format(d, 'yyyy-MM-dd') : null,
          })}
          format="dd/MM/yyyy"
          slotProps={{ textField: { size: 'small', sx: { width: 145 } } }}
        />
        <DatePicker
          value={dataFim ? parseISO(dataFim) : null}
          onChange={(d) => onUpdateParams({
            dataFim: d && isValid(d) ? format(d, 'yyyy-MM-dd') : null,
          })}
          format="dd/MM/yyyy"
          slotProps={{ textField: { size: 'small', sx: { width: 145 } } }}
        />

        <Badge badgeContent={entityCount} color="primary"
          invisible={entityCount === 0}
          sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 18, minWidth: 18 } }}
        >
          <Button size="small" variant="outlined" startIcon={<TuneRounded />}
            onClick={onOpenFilters}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Filtros
          </Button>
        </Badge>

        <Box sx={{ flex: 1 }} />

        {onOpenProdConfig && (
          <Tooltip title="Configurar Produtividade">
            <IconButton size="small" onClick={onOpenProdConfig}
              sx={{
                color: isCustomConfig ? 'warning.main' : 'action.active',
                bgcolor: isCustomConfig ? 'rgba(255,152,0,0.08)' : 'transparent',
                borderRadius: 1,
              }}>
              <Settings fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {isCustomConfig && onCopyConfig && (
          <Tooltip title="Copiar Config JSON">
            <IconButton size="small" onClick={onCopyConfig}
              sx={{ color: 'warning.main', borderRadius: 1 }}>
              <ContentCopy sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
        {isCustomConfig && (
          <Chip label="Custom" size="small" color="warning" variant="outlined"
            sx={{ height: 22, fontSize: 11 }} />
        )}

        {hasFilters && (
          <Button size="small" startIcon={<FilterAltOff />} onClick={onClearAll}
            sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }}>Limpar</Button>
        )}
        {isLoading && <CircularProgress size={16} />}
        {totalRegistros != null && (
          <Chip size="small" variant="outlined"
            label={`${totalRegistros.toLocaleString('pt-BR')} ${totalLabel}`} />
        )}
      </Stack>
    </Paper>
  );
}
