import { useState, useCallback } from 'react';
import {
  Stack, Button, CircularProgress, Chip, Box,
  Typography, IconButton, useMediaQuery, useTheme,
  TextField, InputAdornment,
} from '@mui/material';
import { FilterAltOff, TuneRounded, SearchRounded } from '@mui/icons-material';
import { OS_STATUS_OPTIONS, TIPO_MANUT_OPTIONS, STATUSGIG_OPTIONS } from '@/utils/os-constants';
import { FilterSelect } from '@/components/shared/filter-select';
import { PeriodSelector } from '@/components/shared/period-selector';
import type { OsResumo } from '@/types/os-types';

interface OsToolbarProps {
  dataInicio: string;
  dataFim: string;
  status: string;
  manutencao: string;
  statusGig: string;
  search: string;
  onSetParam: (key: string, value: string) => void;
  onClearFilters: () => void;
  resumo?: OsResumo;
  isLoading?: boolean;
}

export function OsToolbar({
  dataInicio, dataFim, status, manutencao, statusGig, search,
  onSetParam, onClearFilters, resumo, isLoading,
}: OsToolbarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [filtersOpen, setFiltersOpen] = useState(!isMobile);
  const [searchLocal, setSearchLocal] = useState(search);

  const handleSearch = useCallback(() => {
    onSetParam('search', searchLocal.trim());
  }, [searchLocal, onSetParam]);

  const hasFilters = status || manutencao || statusGig || dataInicio || dataFim || search;
  const activeFilterCount = [status, manutencao, statusGig, dataInicio, search].filter(Boolean).length;

  const handlePeriodChange = (ini: string, fim: string) => {
    onSetParam('dataInicio', ini);
    onSetParam('dataFim', fim);
  };

  return (
    <Box sx={{
      px: { xs: 2, md: 3 }, py: 1,
      borderBottom: '1px solid', borderColor: 'divider',
      bgcolor: (t) => t.palette.mode === 'dark' ? 'background.paper' : '#fafbfc',
    }}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        {/* Search */}
        <TextField
          size="small"
          placeholder="Buscar OS, placa..."
          value={searchLocal}
          onChange={(e) => setSearchLocal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          onBlur={handleSearch}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded sx={{ fontSize: 18, color: 'text.disabled' }} />
                </InputAdornment>
              ),
              sx: { fontSize: 13, height: 36, borderRadius: '6px' },
            },
          }}
          sx={{ width: { xs: '100%', sm: 180 } }}
        />

        {isMobile && (
          <IconButton
            size="small"
            onClick={() => setFiltersOpen(!filtersOpen)}
            sx={{
              border: '1px solid',
              borderColor: filtersOpen ? 'primary.main' : 'divider',
              borderRadius: '6px', color: filtersOpen ? 'primary.main' : 'text.secondary',
              width: 36, height: 36, position: 'relative',
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
            <PeriodSelector 
              dataInicio={dataInicio}
              dataFim={dataFim}
              onChange={handlePeriodChange}
              onClear={() => handlePeriodChange('', '')}
            />

            <FilterSelect
              value={status}
              options={OS_STATUS_OPTIONS}
              onChange={(v) => onSetParam('status', v)}
              displayEmpty
              minWidth={{ xs: 'calc(50% - 4px)', sm: 130 }}
            />
            <FilterSelect
              value={manutencao}
              options={TIPO_MANUT_OPTIONS}
              onChange={(v) => onSetParam('manutencao', v)}
              displayEmpty
              minWidth={{ xs: 'calc(50% - 4px)', sm: 130 }}
            />
            <FilterSelect
              value={statusGig}
              options={STATUSGIG_OPTIONS}
              onChange={(v) => onSetParam('statusGig', v)}
              displayEmpty
              minWidth={{ xs: 'calc(50% - 4px)', sm: 140 }}
            />
            {hasFilters && (
              <Button
                size="small"
                startIcon={<FilterAltOff sx={{ fontSize: 16 }} />}
                onClick={onClearFilters}
                sx={{
                  whiteSpace: 'nowrap', minWidth: 'auto',
                  color: 'text.secondary', fontWeight: 500,
                  borderRadius: '6px', height: 36, fontSize: 13,
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

        {resumo && (
          <Stack direction="row" spacing={0.5}>
            <KpiChip label="Total" value={resumo.totalOs} />
            <KpiChip label="Abertas" value={resumo.abertas} color="#f59e0b" />
            <KpiChip label="Exec." value={resumo.emExecucao} color="#0ea5e9" />
            <KpiChip label="Veiculos" value={resumo.veiculosAtendidos} color="#2e7d32" />
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

function KpiChip({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <Chip
      size="small"
      label={
        <Typography sx={{ fontSize: 11, fontWeight: 600 }}>
          <Box component="span" sx={{ color: color ?? 'text.secondary', mr: 0.3 }}>
            {value.toLocaleString('pt-BR')}
          </Box>
          <Box component="span" sx={{ color: 'text.disabled' }}>{label}</Box>
        </Typography>
      }
      sx={{
        height: 24,
        bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
        borderRadius: '4px',
      }}
    />
  );
}
