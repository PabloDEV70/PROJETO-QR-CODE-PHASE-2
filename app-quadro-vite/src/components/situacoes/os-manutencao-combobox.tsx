import { useState, useCallback, useRef } from 'react';
import { Autocomplete, TextField, Box, Typography, Chip } from '@mui/material';
import { Build } from '@mui/icons-material';
import { apiClient } from '@/api/client';

interface OsManOption {
  NUOS: number;
  STATUS: string;
  placa: string | null;
  tagVeiculo: string | null;
  nomeParc: string | null;
  codparc: number | null;
  statusLabel: string | null;
}

interface OsManutencaoComboboxProps {
  value: number | '';
  onChange: (nuos: number | '') => void;
  onParceiroDetected?: (codparc: number, nomeParc: string) => void;
  disabled?: boolean;
}

export function OsManutencaoCombobox({ value: _value, onChange, onParceiroDetected, disabled }: OsManutencaoComboboxProps) {
  const [options, setOptions] = useState<OsManOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selected, setSelected] = useState<OsManOption | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController>(undefined);

  const search = useCallback((term: string) => {
    abortRef.current?.abort();
    if (term.length < 2) { setOptions(selected ? [selected] : []); setLoading(false); return; }
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    apiClient.get<OsManOption[]>('/os-manutencao/search', { params: { q: term }, signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setOptions(data); })
      .catch(() => {})
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
  }, [selected]);

  const handleInputChange = useCallback((_: unknown, val: string, reason: string) => {
    setInputValue(val);
    if (reason !== 'input') return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  }, [search]);

  return (
    <Autocomplete
      value={selected}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={(_, opt) => {
        setSelected(opt);
        onChange(opt?.NUOS ?? '');
        if (opt?.codparc && opt?.nomeParc && onParceiroDetected) {
          onParceiroDetected(opt.codparc, opt.nomeParc);
        }
      }}
      options={options}
      loading={loading}
      disabled={disabled}
      fullWidth
      size="small"
      filterOptions={(x) => x}
      getOptionLabel={(opt) => `OS ${opt.NUOS} — ${opt.placa ?? ''}`}
      getOptionKey={(opt) => opt.NUOS}
      isOptionEqualToValue={(opt, val) => opt.NUOS === val.NUOS}
      noOptionsText={inputValue.length < 2 ? 'Digite nº OS ou placa...' : 'Nenhuma OS encontrada'}
      loadingText="Buscando..."
      renderOption={({ key, ...props }, option) => (
        <li key={key} {...props}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
            <Build sx={{ fontSize: 18, color: 'text.secondary', flexShrink: 0 }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" fontWeight={700} noWrap>
                OS {option.NUOS} {option.placa && `— ${option.placa}`}
                {option.tagVeiculo && <Typography component="span" variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>({option.tagVeiculo})</Typography>}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.25 }}>
                {option.statusLabel && <Chip label={option.statusLabel} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />}
                {option.nomeParc && <Typography variant="caption" color="text.secondary" noWrap>{option.nomeParc}</Typography>}
              </Box>
            </Box>
          </Box>
        </li>
      )}
      renderInput={(params) => <TextField {...params} label="OS Manutencao" placeholder="Buscar por nº OS ou placa..." />}
    />
  );
}
