import { useState, useCallback, useRef, useEffect } from 'react';
import { Autocomplete, TextField, Box, Typography, InputAdornment } from '@mui/material';
import { DirectionsCarRounded, Search } from '@mui/icons-material';
import { apiClient } from '@/api/client';

interface VeiculoOption {
  codveiculo: number;
  placa: string;
  tag: string | null;
  marcamodelo: string | null;
}

interface VeiculoComboboxProps {
  value: number | null;
  onChange: (codveiculo: number | null) => void;
  disabled?: boolean;
  required?: boolean;
}

export function VeiculoCombobox({ value, onChange, disabled, required }: VeiculoComboboxProps) {
  const [options, setOptions] = useState<VeiculoOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selected, setSelected] = useState<VeiculoOption | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController>(undefined);

  const search = useCallback((term: string) => {
    abortRef.current?.abort();
    if (term.length < 2) { setOptions(selected ? [selected] : []); setLoading(false); return; }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    apiClient.get<VeiculoOption[]>('/veiculos/search', { params: { q: term }, signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setOptions(data); })
      .catch(() => {})
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
  }, [selected]);

  const handleInputChange = useCallback((_: unknown, val: string, reason: string) => {
    setInputValue(val);
    if (reason !== 'input') return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 250);
  }, [search]);

  // Load selected vehicle on mount if value is set
  useEffect(() => {
    if (!value) return;
    apiClient.get<VeiculoOption[]>('/veiculos/search', { params: { q: String(value) } })
      .then(({ data }) => {
        const match = data.find((v) => v.codveiculo === value);
        if (match) { setSelected(match); setOptions([match]); }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Autocomplete
      value={selected}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={(_, opt) => {
        setSelected(opt);
        onChange(opt?.codveiculo ?? null);
      }}
      options={options}
      loading={loading}
      disabled={disabled}
      fullWidth
      size="small"
      filterOptions={(x) => x}
      getOptionLabel={(opt) => [opt.placa, opt.tag].filter(Boolean).join(' - ')}
      getOptionKey={(opt) => opt.codveiculo}
      isOptionEqualToValue={(opt, val) => opt.codveiculo === val.codveiculo}
      noOptionsText={inputValue.length < 2 ? 'Digite placa ou tag...' : 'Nenhum veiculo encontrado'}
      loadingText="Buscando..."
      renderOption={({ key, ...props }, option) => (
        <li key={key} {...props}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', width: '100%' }}>
            <DirectionsCarRounded sx={{ fontSize: 20, color: 'text.secondary', flexShrink: 0 }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" fontWeight={700} noWrap>
                {option.placa}
                {option.tag && <Typography component="span" variant="body2" sx={{ ml: 0.5, color: 'primary.main', fontWeight: 600 }}>({option.tag})</Typography>}
              </Typography>
              {option.marcamodelo && <Typography variant="caption" color="text.secondary" noWrap display="block">{option.marcamodelo}</Typography>}
            </Box>
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Veiculo"
          placeholder="Buscar por placa, tag, modelo..."
          required={required}
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
        />
      )}
    />
  );
}
