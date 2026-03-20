import { useState, useCallback, useRef } from 'react';
import { Autocomplete, TextField, Box, Typography, CircularProgress } from '@mui/material';
import { apiClient } from '@/api/client';

interface ProdutoOption {
  CODPROD: number;
  DESCRPROD: string;
}

export interface ProdutoComboboxProps {
  value: number | null;
  onChange: (codprod: number | null, descricao?: string) => void;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  size?: 'small' | 'medium';
  error?: boolean;
  helperText?: string;
}

export function ProdutoCombobox({
  value, onChange, label = 'Produto / Servico',
  disabled = false, required = false, size = 'small',
  error = false, helperText,
}: ProdutoComboboxProps) {
  const [options, setOptions] = useState<ProdutoOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selected, setSelected] = useState<ProdutoOption | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleInputChange = useCallback(
    (_: unknown, newInput: string, reason: string) => {
      setInputValue(newInput);
      if (reason !== 'input') return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (newInput.length < 2) { setOptions([]); return; }
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const { data } = await apiClient.get<ProdutoOption[]>(
            '/produtos/buscar', { params: { q: newInput } },
          );
          setOptions(Array.isArray(data) ? data : []);
        } catch {
          setOptions([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    [],
  );

  const handleChange = useCallback(
    (_: unknown, option: ProdutoOption | null) => {
      setSelected(option);
      onChange(option?.CODPROD ?? null, option?.DESCRPROD);
    },
    [onChange],
  );

  const selectedOption = selected && selected.CODPROD === value ? selected : null;

  return (
    <Autocomplete
      value={selectedOption}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={options}
      loading={loading}
      disabled={disabled}
      fullWidth
      size={size}
      getOptionLabel={(opt) => opt.DESCRPROD}
      getOptionKey={(opt) => opt.CODPROD}
      isOptionEqualToValue={(opt, val) => opt.CODPROD === val.CODPROD}
      noOptionsText={inputValue.length < 2 ? 'Digite pelo menos 2 caracteres' : 'Nenhum produto encontrado'}
      loadingText="Buscando..."
      filterOptions={(x) => x}
      renderOption={({ key, ...props }, option) => (
        <li key={key} {...props}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" fontWeight={600} noWrap>{option.DESCRPROD}</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10, fontFamily: 'monospace' }}>
              #{option.CODPROD}
            </Typography>
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params} label={label} required={required} error={error} helperText={helperText}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={18} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
