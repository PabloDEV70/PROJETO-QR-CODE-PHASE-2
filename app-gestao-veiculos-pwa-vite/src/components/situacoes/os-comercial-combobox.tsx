import { useState, useCallback, useRef } from 'react';
import { Autocomplete, TextField, Box, Typography, Chip } from '@mui/material';
import { Engineering } from '@mui/icons-material';
import { apiClient } from '@/api/client';

interface OsComOption {
  NUMOS: number;
  SITUACAO: string;
  CODPARC: number;
  nomeParc: string | null;
  situacaoLabel: string | null;
  DESCRICAO: string | null;
}

interface OsComercialComboboxProps {
  value: number | '';
  onChange: (numos: number | '') => void;
  disabled?: boolean;
}

export function OsComercialCombobox({ value: _value, onChange, disabled }: OsComercialComboboxProps) {
  const [options, setOptions] = useState<OsComOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selected, setSelected] = useState<OsComOption | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController>(undefined);

  const search = useCallback((term: string) => {
    abortRef.current?.abort();
    if (term.length < 2) { setOptions(selected ? [selected] : []); setLoading(false); return; }
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    apiClient.get<OsComOption[]>('/os-comercial/search', { params: { q: term }, signal: controller.signal })
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
      onChange={(_, opt) => { setSelected(opt); onChange(opt?.NUMOS ?? ''); }}
      options={options}
      loading={loading}
      disabled={disabled}
      fullWidth
      size="small"
      filterOptions={(x) => x}
      getOptionLabel={(opt) => `MOS ${opt.NUMOS} — ${opt.nomeParc ?? ''}`}
      getOptionKey={(opt) => opt.NUMOS}
      isOptionEqualToValue={(opt, val) => opt.NUMOS === val.NUMOS}
      noOptionsText={inputValue.length < 2 ? 'Digite nº MOS ou parceiro...' : 'Nenhuma OS encontrada'}
      loadingText="Buscando..."
      renderOption={({ key, ...props }, option) => (
        <li key={key} {...props}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
            <Engineering sx={{ fontSize: 18, color: 'text.secondary', flexShrink: 0 }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" fontWeight={700} noWrap>
                MOS {option.NUMOS}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.25 }}>
                {option.situacaoLabel && <Chip label={option.situacaoLabel} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />}
                {option.nomeParc && <Typography variant="caption" color="text.secondary" noWrap>{option.nomeParc}</Typography>}
              </Box>
            </Box>
          </Box>
        </li>
      )}
      renderInput={(params) => <TextField {...params} label="OS Comercial (NUMOS)" placeholder="Buscar por nº MOS ou parceiro..." />}
    />
  );
}
