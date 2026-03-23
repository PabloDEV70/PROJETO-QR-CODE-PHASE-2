import { useState, useCallback, useRef, useEffect } from 'react';
import { Autocomplete, TextField, Box, Typography, alpha, Chip } from '@mui/material';
import { Search } from '@mui/icons-material';
import { apiClient } from '@/api/client';
import { PlacaVeiculo } from '@/components/shared/placa-veiculo';

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
      filterOptions={(x) => x}
      getOptionLabel={(opt) => [opt.placa, opt.tag].filter(Boolean).join(' - ')}
      getOptionKey={(opt) => opt.codveiculo}
      isOptionEqualToValue={(opt, val) => opt.codveiculo === val.codveiculo}
      noOptionsText={inputValue.length < 2 ? 'Digite placa ou tag...' : 'Nenhum veiculo encontrado'}
      loadingText="Buscando..."
      renderOption={({ key, ...props }, option) => (
        <Box
          component="li"
          key={key}
          {...props}
          sx={{
            display: 'flex',
            gap: 1.5,
            alignItems: 'center',
            py: 1.5,
            px: 2,
            '&:hover': {
              bgcolor: (t) => `${alpha(t.palette.primary.main, 0.06)} !important`,
            },
          }}
        >
          <PlacaVeiculo placa={option.placa} scale={0.55} />

          <Box sx={{ minWidth: 0, flex: 1 }}>
            {option.tag && (
              <Chip
                label={option.tag}
                size="small"
                sx={{
                  height: 20, fontSize: 11, fontWeight: 800, mb: 0.25,
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                  color: 'primary.main',
                  fontFamily: '"JetBrains Mono", monospace',
                }}
              />
            )}
            {option.marcamodelo && (
              <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.3 }} noWrap>
                {option.marcamodelo}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <Box>
          {/* Placa visual quando selecionado */}
          {selected && (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5,
              p: 1.5, borderRadius: 2,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
              border: '1px solid',
              borderColor: (t) => alpha(t.palette.primary.main, 0.15),
            }}>
              <PlacaVeiculo placa={selected.placa} scale={0.7} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {selected.tag && (
                  <Typography sx={{
                    fontSize: 15, fontWeight: 800, color: 'primary.main',
                    fontFamily: '"JetBrains Mono", monospace', lineHeight: 1.2,
                  }}>
                    {selected.tag}
                  </Typography>
                )}
                {selected.marcamodelo && (
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.3 }} noWrap>
                    {selected.marcamodelo}
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          <TextField
            {...params}
            label="Veiculo"
            placeholder={selected ? 'Trocar veiculo...' : 'Buscar por placa, tag, modelo...'}
            required={required}
            slotProps={{
              input: {
                ...params.InputProps,
                startAdornment: (
                  <>
                    <Search sx={{ fontSize: 20, color: 'text.disabled', mr: 0.5 }} />
                    {params.InputProps.startAdornment}
                  </>
                ),
              },
            }}
          />
        </Box>
      )}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            border: '1px solid',
            borderColor: 'divider',
            mt: 0.5,
          },
        },
        listbox: {
          sx: { maxHeight: 320, p: 0 },
        },
      }}
    />
  );
}
