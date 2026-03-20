import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Stack, TextField, Select, MenuItem, Autocomplete, Chip, Button,
  type SelectChangeEvent,
} from '@mui/material';
import { FilterAltOffRounded } from '@mui/icons-material';
import { useFiltrosOpcoes } from '@/hooks/use-funcionarios-module';
import { getPeriodPresets, getActivePresetKey } from '@/utils/rdo-filter-helpers';
import type { OpcaoFiltro } from '@/types/funcionario-types';

interface FuncionariosFilterBarProps {
  situacao: string;
  codemp: string;
  coddep: string;
  codcargo: string;
  codfuncao: string;
  termo: string;
  dataInicio: string;
  dataFim: string;
  onUpdateParams: (updates: Record<string, string | null>) => void;
  onClearAll: () => void;
}

export function FuncionariosFilterBar({
  situacao, codemp, coddep, codcargo, codfuncao, termo,
  dataInicio, dataFim, onUpdateParams, onClearAll,
}: FuncionariosFilterBarProps) {
  const { data: opcoes } = useFiltrosOpcoes();
  const [search, setSearch] = useState(termo);
  const presets = useMemo(() => getPeriodPresets(), []);

  useEffect(() => { setSearch(termo); }, [termo]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      const handler = setTimeout(() => {
        onUpdateParams({ termo: value || null });
      }, 300);
      return () => clearTimeout(handler);
    },
    [onUpdateParams],
  );

  const handleSituacao = (e: SelectChangeEvent) => {
    onUpdateParams({ situacao: e.target.value || null });
  };

  const activePreset = dataInicio && dataFim
    ? getActivePresetKey(dataInicio, dataFim) ?? '__custom'
    : '';

  const handlePreset = (e: SelectChangeEvent) => {
    const key = e.target.value;
    if (!key) {
      onUpdateParams({ dataInicio: null, dataFim: null });
      return;
    }
    const preset = presets.find((p) => p.key === key);
    if (preset) {
      onUpdateParams({ dataInicio: preset.ini, dataFim: preset.fim });
    }
  };

  const findOpcao = (list: OpcaoFiltro[] | undefined, code: string): OpcaoFiltro | null => {
    if (!list || !code) return null;
    return list.find((o) => String(o.codigo) === code) ?? null;
  };

  const hasFilters = situacao !== '1' || codemp || coddep || codcargo
    || codfuncao || termo || dataInicio || dataFim;

  const activeChips: { label: string; key: string }[] = [];
  if (dataInicio && dataFim) {
    const pre = presets.find((p) => p.ini === dataInicio && p.fim === dataFim);
    activeChips.push({
      label: `Periodo: ${pre?.label ?? `${dataInicio} a ${dataFim}`}`,
      key: '__period',
    });
  }
  if (codemp && opcoes) {
    const e = findOpcao(opcoes.empresas, codemp);
    if (e) activeChips.push({ label: `Emp: ${e.nome}`, key: 'codemp' });
  }
  if (coddep && opcoes) {
    const d = findOpcao(opcoes.departamentos, coddep);
    if (d) activeChips.push({ label: `Dep: ${d.nome}`, key: 'coddep' });
  }
  if (codcargo && opcoes) {
    const c = findOpcao(opcoes.cargos, codcargo);
    if (c) activeChips.push({ label: `Cargo: ${c.nome}`, key: 'codcargo' });
  }
  if (codfuncao && opcoes) {
    const f = findOpcao(opcoes.funcoes, codfuncao);
    if (f) activeChips.push({ label: `Funcao: ${f.nome}`, key: 'codfuncao' });
  }

  const handleChipDelete = (key: string) => {
    if (key === '__period') {
      onUpdateParams({ dataInicio: null, dataFim: null });
    } else {
      onUpdateParams({ [key]: null });
    }
  };

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
        <TextField
          size="small"
          placeholder="Buscar por nome ou codigo..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <Select
          size="small"
          value={situacao}
          onChange={handleSituacao}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="all">Todos</MenuItem>
          <MenuItem value="1">Ativos</MenuItem>
          <MenuItem value="0">Demitidos</MenuItem>
          <MenuItem value="2">Afastados</MenuItem>
          <MenuItem value="8">Transferidos</MenuItem>
        </Select>
        <Select
          size="small"
          displayEmpty
          value={activePreset === '__custom' ? '__custom' : (activePreset || '')}
          onChange={handlePreset}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Sem periodo</MenuItem>
          {presets.map((p) => (
            <MenuItem key={p.key} value={p.key}>{p.label}</MenuItem>
          ))}
          {activePreset === '__custom' && (
            <MenuItem value="__custom">Personalizado</MenuItem>
          )}
        </Select>
        <TextField
          size="small"
          type="date"
          label="De"
          value={dataInicio}
          onChange={(e) => onUpdateParams({ dataInicio: e.target.value || null })}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 150 }}
        />
        <TextField
          size="small"
          type="date"
          label="Ate"
          value={dataFim}
          onChange={(e) => onUpdateParams({ dataFim: e.target.value || null })}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 150 }}
        />
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
        <Autocomplete
          size="small"
          options={opcoes?.empresas ?? []}
          getOptionLabel={(o) => o.nome}
          value={findOpcao(opcoes?.empresas, codemp)}
          onChange={(_, v) => onUpdateParams({ codemp: v ? String(v.codigo) : null })}
          renderInput={(p) => <TextField {...p} placeholder="Empresa" />}
          sx={{ minWidth: 180 }}
          isOptionEqualToValue={(o, v) => o.codigo === v.codigo}
        />
        <Autocomplete
          size="small"
          options={opcoes?.departamentos ?? []}
          getOptionLabel={(o) => o.nome}
          value={findOpcao(opcoes?.departamentos, coddep)}
          onChange={(_, v) => onUpdateParams({ coddep: v ? String(v.codigo) : null })}
          renderInput={(p) => <TextField {...p} placeholder="Departamento" />}
          sx={{ minWidth: 180 }}
          isOptionEqualToValue={(o, v) => o.codigo === v.codigo}
        />
        <Autocomplete
          size="small"
          options={opcoes?.cargos ?? []}
          getOptionLabel={(o) => o.nome}
          value={findOpcao(opcoes?.cargos, codcargo)}
          onChange={(_, v) => onUpdateParams({ codcargo: v ? String(v.codigo) : null })}
          renderInput={(p) => <TextField {...p} placeholder="Cargo" />}
          sx={{ minWidth: 180 }}
          isOptionEqualToValue={(o, v) => o.codigo === v.codigo}
        />
        {hasFilters && (
          <Button
            size="small"
            startIcon={<FilterAltOffRounded />}
            onClick={onClearAll}
            sx={{ textTransform: 'none' }}
          >
            Limpar
          </Button>
        )}
      </Stack>
      {activeChips.length > 0 && (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {activeChips.map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              size="small"
              onDelete={() => handleChipDelete(c.key)}
              sx={{ fontSize: 11 }}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
