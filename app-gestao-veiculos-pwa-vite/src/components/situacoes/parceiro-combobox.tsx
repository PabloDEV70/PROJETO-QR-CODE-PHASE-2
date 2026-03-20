import { useState, useCallback, useRef } from 'react';
import { Autocomplete, TextField, Box, Typography } from '@mui/material';
import { Business } from '@mui/icons-material';
import { apiClient } from '@/api/client';

interface ParceiroOption {
  codparc: number;
  nomeparc: string;
  cgc_cpf: string;
  tippessoa: string;
}

interface ParceiroComboboxProps {
  value: number | '';
  onChange: (codparc: number | '') => void;
  disabled?: boolean;
}

export function ParceiroCombobox({ value: _value, onChange, disabled }: ParceiroComboboxProps) {
  const [options, setOptions] = useState<ParceiroOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selected, setSelected] = useState<ParceiroOption | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController>(undefined);

  const search = useCallback((term: string) => {
    abortRef.current?.abort();
    if (term.length < 2) { setOptions(selected ? [selected] : []); setLoading(false); return; }
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    apiClient.get<ParceiroOption[]>('/parceiros/search', { params: { q: term }, signal: controller.signal })
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

  function formatCpfCnpj(val: string): string {
    if (!val) return '';
    const clean = val.replace(/\D/g, '');
    if (clean.length === 11) return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    if (clean.length === 14) return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    return val;
  }

  return (
    <Autocomplete
      value={selected}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={(_, opt) => { setSelected(opt); onChange(opt?.codparc ?? ''); }}
      options={options}
      loading={loading}
      disabled={disabled}
      fullWidth
      size="small"
      filterOptions={(x) => x}
      getOptionLabel={(opt) => `${opt.nomeparc} (${opt.codparc})`}
      getOptionKey={(opt) => opt.codparc}
      isOptionEqualToValue={(opt, val) => opt.codparc === val.codparc}
      noOptionsText={inputValue.length < 2 ? 'Digite nome ou CNPJ...' : 'Nenhum parceiro encontrado'}
      loadingText="Buscando..."
      renderOption={({ key, ...props }, option) => (
        <li key={key} {...props}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
            <Business sx={{ fontSize: 18, color: 'text.secondary', flexShrink: 0 }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" fontWeight={700} noWrap>{option.nomeparc}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {option.tippessoa === 'J' ? 'PJ' : 'PF'} — {formatCpfCnpj(option.cgc_cpf)}
              </Typography>
            </Box>
          </Box>
        </li>
      )}
      renderInput={(params) => <TextField {...params} label="Parceiro / Fornecedor" placeholder="Buscar por nome ou CNPJ..." />}
    />
  );
}
