import { useState, useCallback, useRef } from 'react';
import { Autocomplete, TextField, Box, Typography, CircularProgress } from '@mui/material';
import { apiClient } from '@/api/client';

interface ServicoOption {
  CODPROD: number;
  nome: string;
}

export interface ServicoComboboxProps {
  value: number | null;
  onChange: (codprod: number | null, descricao?: string) => void;
  label?: string;
  disabled?: boolean;
  size?: 'small' | 'medium';
}

export function ServicoCombobox({
  value, onChange, label = 'Buscar Servico',
  disabled = false, size = 'small',
}: ServicoComboboxProps) {
  const [options, setOptions] = useState<ServicoOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selected, setSelected] = useState<ServicoOption | null>(null);
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
          const { data } = await apiClient.get<ServicoOption[]>(
            '/produtos/buscar', { params: { q: newInput, usoprod: 'S' } },
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
    (_: unknown, option: ServicoOption | null) => {
      setSelected(option);
      onChange(option?.CODPROD ?? null, option?.nome);
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
      getOptionLabel={(opt) => opt.nome}
      getOptionKey={(opt) => opt.CODPROD}
      isOptionEqualToValue={(opt, val) => opt.CODPROD === val.CODPROD}
      noOptionsText={inputValue.length < 2 ? 'Digite pelo menos 2 caracteres' : 'Nenhum servico encontrado'}
      loadingText="Buscando..."
      filterOptions={(x) => x}
      renderOption={({ key, ...props }, option) => (
        <li key={key} {...props}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" fontWeight={600} noWrap>{option.nome}</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10, fontFamily: 'monospace' }}>
              #{option.CODPROD}
            </Typography>
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params} label={label}
          placeholder="Digite para buscar servico..."
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
