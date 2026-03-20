import { useMemo } from 'react';
import {
  Drawer, Stack, TextField, Typography, Button, Checkbox,
  Autocomplete, IconButton, Divider, Box,
} from '@mui/material';
import { CheckBox, CheckBoxOutlineBlank, Close, FilterAltOff } from '@mui/icons-material';
import { useRdoFiltrosOpcoes } from '@/hooks/use-rdo-analytics';
import type { RdoFiltroOpcao } from '@/types/rdo-analytics-types';
import { ColaboradorDepartamentoFilter } from './colaborador-departamento-filter';

interface RdoFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  codparc: string | null;
  coddep: string | null;
  codfuncao: string | null;
  onUpdateParams: (u: Record<string, string | null>) => void;
  filterParams?: Record<string, string | number>;
}

function parseFuncaoCodes(raw: string | null): number[] {
  if (!raw) return [];
  return raw.split(',').map(Number).filter((n) => !isNaN(n) && n > 0);
}

export function RdoFilterDrawer({
  open, onClose, codparc, coddep, codfuncao,
  onUpdateParams, filterParams,
}: RdoFilterDrawerProps) {
  const filtros = useRdoFiltrosOpcoes(filterParams || {});

  const depOptions = filtros.data?.departamentos ?? [];
  const funcOptions = filtros.data?.funcoes ?? [];
  const selectedDep = useMemo(
    () => depOptions.find((d) => String(d.codigo) === coddep) ?? null,
    [depOptions, coddep],
  );
  const selectedFuncs = useMemo(() => {
    const codes = parseFuncaoCodes(codfuncao);
    return funcOptions.filter((f) => codes.includes(f.codigo));
  }, [funcOptions, codfuncao]);

  const hasEntityFilters = codparc || coddep || codfuncao;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: 360, p: 2.5 } }}>
      <Stack spacing={2.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>Filtros</Typography>
          <IconButton size="small" onClick={onClose}><Close /></IconButton>
        </Stack>

        <Divider />

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Departamento
          </Typography>
          <Autocomplete size="small" fullWidth
            options={depOptions} value={selectedDep} loading={filtros.isLoading}
            getOptionLabel={(o: RdoFiltroOpcao) =>
              o.qtdColaboradores ? `${o.nome} (${o.qtdColaboradores})` : o.nome}
            isOptionEqualToValue={(a, b) => a.codigo === b.codigo}
            onChange={(_, v) => onUpdateParams({
              coddep: v ? String(v.codigo) : null,
              codparc: null,
            })}
            renderInput={(p) => <TextField {...p} placeholder="Todos" />}
          />
        </Box>

        <ColaboradorDepartamentoFilter
          coddep={coddep} codparc={codparc}
          onUpdateCodparc={(v) => onUpdateParams({ codparc: v })}
        />

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Funcao {selectedFuncs.length > 0 && `(${selectedFuncs.length})`}
          </Typography>
          <Autocomplete multiple size="small" fullWidth disableCloseOnSelect
            options={funcOptions} value={selectedFuncs} loading={filtros.isLoading}
            getOptionLabel={(o: RdoFiltroOpcao) => o.nome}
            isOptionEqualToValue={(a, b) => a.codigo === b.codigo}
            onChange={(_, v) => onUpdateParams({
              codfuncao: v.length > 0 ? v.map((f) => f.codigo).join(',') : null,
            })}
            renderOption={(props, option, { selected }) => (
              <li {...props} key={option.codigo}>
                <Checkbox icon={<CheckBoxOutlineBlank fontSize="small" />}
                  checkedIcon={<CheckBox fontSize="small" />}
                  checked={selected} sx={{ mr: 1, p: 0 }} />
                {option.nome}
              </li>
            )}
            renderInput={(p) => <TextField {...p} placeholder="Todas" />}
            limitTags={2}
            ChipProps={{ size: 'small', sx: { height: 22, fontSize: '0.7rem' } }}
          />
        </Box>

        {hasEntityFilters && (
          <>
            <Divider />
            <Button
              size="small" startIcon={<FilterAltOff />} color="inherit"
              onClick={() => onUpdateParams({ codparc: null, coddep: null, codfuncao: null })}
            >
              Limpar filtros
            </Button>
          </>
        )}
      </Stack>
    </Drawer>
  );
}
