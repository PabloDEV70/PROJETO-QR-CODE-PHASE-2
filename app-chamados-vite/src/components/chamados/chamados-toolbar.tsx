import { useMemo, useState } from 'react';
import {
  Stack, Button, CircularProgress, Chip, Box,
  Typography, IconButton, useMediaQuery, useTheme,
} from '@mui/material';
import { FilterAltOff, ConfirmationNumberRounded, TuneRounded } from '@mui/icons-material';
import { getPeriodPresets, getActivePresetKey } from '@/utils/date-helpers';
import { STATUS_OPTIONS, PRIO_OPTIONS } from '@/utils/chamados-constants';
import { SearchInput } from '@/components/shared/search-input';
import { FilterSelect } from '@/components/shared/filter-select';
import { FilterDatePicker } from '@/components/shared/filter-date-picker';

interface ChamadosToolbarProps {
  dataInicio: string;
  dataFim: string;
  status: string;
  prioridade: string;
  busca?: string;
  onUpdateParams: (updates: Record<string, string | null>) => void;
  onClearAll: () => void;
  totalRegistros?: number;
  isLoading?: boolean;
}

export function ChamadosToolbar({
  dataInicio, dataFim, status, prioridade, busca,
  onUpdateParams, onClearAll, totalRegistros, isLoading,
}: ChamadosToolbarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [filtersOpen, setFiltersOpen] = useState(!isMobile);

  const presets = useMemo(() => getPeriodPresets(), []);
  const activePreset = useMemo(
    () => getActivePresetKey(dataInicio, dataFim), [dataInicio, dataFim],
  );

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
  const hasFilters = status || prioridade || dataInicio || dataFim || busca;
  const activeFilterCount = [status, prioridade, dataInicio, busca].filter(Boolean).length;

  const periodOptions = useMemo(() => {
    const opts = presets.map((p) => ({ value: p.key, label: p.label }));
    opts.push({ value: '__all', label: 'Tudo' });
    if (selectValue === '__custom') {
      opts.push({ value: '__custom', label: 'Personalizado' });
    }
    return opts;
  }, [presets, selectValue]);

  return (
    <Box sx={{
      px: { xs: 2, md: 3 },
      py: 1,
      borderBottom: '1px solid',
      borderColor: 'divider',
      bgcolor: (t) => t.palette.mode === 'dark' ? 'background.paper' : '#fafbfc',
    }}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
      >
        <SearchInput
          value={busca ?? ''}
          onChange={(v) => onUpdateParams({ busca: v || null })}
          placeholder="Buscar chamados..."
          width={{ xs: '100%', sm: 260 }}
        />

        {isMobile && (
          <IconButton
            size="small"
            onClick={() => setFiltersOpen(!filtersOpen)}
            sx={{
              border: '1px solid',
              borderColor: filtersOpen ? 'primary.main' : 'divider',
              borderRadius: '8px',
              color: filtersOpen ? 'primary.main' : 'text.secondary',
              width: 36, height: 36,
              position: 'relative',
            }}
          >
            <TuneRounded sx={{ fontSize: 18 }} />
            {activeFilterCount > 0 && (
              <Box sx={{
                position: 'absolute', top: -4, right: -4,
                width: 16, height: 16, borderRadius: '50%',
                bgcolor: 'warning.main', color: '#fff',
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {activeFilterCount}
              </Box>
            )}
          </IconButton>
        )}

        {(!isMobile || filtersOpen) && (
          <>
            <FilterSelect
              value={selectValue}
              options={periodOptions}
              onChange={handlePresetChange}
              minWidth={{ xs: 'calc(50% - 4px)', sm: 130 }}
            />

            <FilterDatePicker
              value={dataInicio}
              onChange={(v) => onUpdateParams({ dataInicio: v })}
              placeholder="Inicio"
              width={{ xs: 'calc(50% - 4px)', sm: 140 }}
            />
            <FilterDatePicker
              value={dataFim}
              onChange={(v) => onUpdateParams({ dataFim: v })}
              placeholder="Fim"
              width={{ xs: 'calc(50% - 4px)', sm: 140 }}
            />

            <FilterSelect
              value={status}
              options={STATUS_OPTIONS}
              onChange={(v) => onUpdateParams({ status: v || null })}
              displayEmpty
              minWidth={{ xs: 'calc(50% - 4px)', sm: 140 }}
            />

            <FilterSelect
              value={prioridade}
              options={PRIO_OPTIONS}
              onChange={(v) => onUpdateParams({ prioridade: v || null })}
              displayEmpty
              minWidth={{ xs: 'calc(50% - 4px)', sm: 140 }}
            />

            {hasFilters && (
              <Button
                size="small"
                startIcon={<FilterAltOff sx={{ fontSize: 16 }} />}
                onClick={onClearAll}
                sx={{
                  whiteSpace: 'nowrap', minWidth: 'auto',
                  color: 'text.secondary', fontWeight: 500,
                  borderRadius: '8px', height: 36,
                  fontSize: 13,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                Limpar
              </Button>
            )}
          </>
        )}

        <Box sx={{ flex: 1 }} />

        {isLoading && <CircularProgress size={16} sx={{ color: 'text.disabled' }} />}

        {totalRegistros != null && (
          <Chip
            icon={<ConfirmationNumberRounded sx={{ fontSize: '14px !important' }} />}
            size="small"
            label={
              <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                {totalRegistros.toLocaleString('pt-BR')}
              </Typography>
            }
            sx={{
              height: 28,
              bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              color: 'text.secondary',
              borderRadius: '8px',
              '& .MuiChip-icon': { color: 'text.disabled' },
            }}
          />
        )}
      </Stack>
    </Box>
  );
}
