import { useMemo } from 'react';
import {
  Paper, TextField, Autocomplete, ToggleButtonGroup, ToggleButton,
  Chip, Stack, Grid, IconButton, InputAdornment, Typography,
} from '@mui/material';
import { Clear, FilterList } from '@mui/icons-material';
import { format, subDays, isEqual, startOfDay } from 'date-fns';
import type { RdoFiltrosOpcoes, RdoFiltroOpcao } from '@/types/rdo-analytics-types';

export interface AnalyticsFilterBarProps {
  dataInicio: string;
  dataFim: string;
  codparc: string | null;
  coddep: string | null;
  onUpdateParams: (updates: Record<string, string | null>) => void;
  onClearAll: () => void;
  filtrosOpcoes?: RdoFiltrosOpcoes;
}

const QUICK_PERIODS = [
  { label: '7d', days: 7 },
  { label: '15d', days: 15 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

export function AnalyticsFilterBar({
  dataInicio, dataFim, codparc, coddep,
  onUpdateParams, onClearAll, filtrosOpcoes,
}: AnalyticsFilterBarProps) {
  const activePeriod = useMemo(() => {
    const today = startOfDay(new Date());
    const endDate = startOfDay(new Date(dataFim));
    if (!isEqual(endDate, today)) return null;
    for (const period of QUICK_PERIODS) {
      const expectedStart = format(subDays(today, period.days), 'yyyy-MM-dd');
      if (dataInicio === expectedStart) return period.label;
    }
    return null;
  }, [dataInicio, dataFim]);

  const handleQuickPeriod = (_: unknown, value: string | null) => {
    if (!value) return;
    const period = QUICK_PERIODS.find((p) => p.label === value);
    if (!period) return;
    onUpdateParams({
      dataInicio: format(subDays(new Date(), period.days), 'yyyy-MM-dd'),
      dataFim: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const selectedDep = useMemo(() => {
    if (!coddep || !filtrosOpcoes?.departamentos) return null;
    return filtrosOpcoes.departamentos.find(
      (d) => String(d.codigo) === coddep,
    ) ?? null;
  }, [coddep, filtrosOpcoes?.departamentos]);

  const activeFilters = useMemo(() => {
    const f: { key: string; label: string }[] = [];
    if (codparc) f.push({ key: 'codparc', label: `Parceiro: ${codparc}` });
    if (selectedDep) f.push({ key: 'coddep', label: `Depto: ${selectedDep.nome}` });
    return f;
  }, [codparc, selectedDep]);

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterList color="action" />
          <Typography variant="subtitle2" color="text.secondary">
            Periodo:
          </Typography>
          <ToggleButtonGroup
            value={activePeriod}
            exclusive
            onChange={handleQuickPeriod}
            size="small"
          >
            {QUICK_PERIODS.map((p) => (
              <ToggleButton key={p.label} value={p.label} sx={{ px: 1.5 }}>
                {p.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>

        <Grid container spacing={1.5} alignItems="center">
          <Grid size={{ xs: 6, sm: 2 }}>
            <TextField
              label="Dt Inicio"
              type="date"
              size="small"
              fullWidth
              value={dataInicio}
              onChange={(e) => onUpdateParams({ dataInicio: e.target.value || null })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <TextField
              label="Dt Fim"
              type="date"
              size="small"
              fullWidth
              value={dataFim}
              onChange={(e) => onUpdateParams({ dataFim: e.target.value || null })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Autocomplete
              size="small"
              options={filtrosOpcoes?.departamentos ?? []}
              getOptionLabel={(o: RdoFiltroOpcao) => o.nome}
              value={selectedDep}
              onChange={(_, v) =>
                onUpdateParams({ coddep: v ? String(v.codigo) : null })
              }
              renderInput={(p) => <TextField {...p} label="Departamento" />}
              isOptionEqualToValue={(o, v) => o.codigo === v.codigo}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField
              label="Cod Parceiro"
              size="small"
              fullWidth
              value={codparc ?? ''}
              onChange={(e) =>
                onUpdateParams({ codparc: e.target.value || null })
              }
              slotProps={{
                input: {
                  endAdornment: codparc ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => onUpdateParams({ codparc: null })}
                      >
                        <Clear fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />
          </Grid>
        </Grid>

        {activeFilters.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {activeFilters.map((f) => (
              <Chip
                key={f.key}
                label={f.label}
                size="small"
                onDelete={() => onUpdateParams({ [f.key]: null })}
              />
            ))}
            {activeFilters.length > 1 && (
              <Chip
                label="Limpar todos"
                size="small"
                variant="outlined"
                onClick={onClearAll}
              />
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
