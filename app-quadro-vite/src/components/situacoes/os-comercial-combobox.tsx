import { useState, useCallback, useRef } from 'react';
import { Autocomplete, TextField, Box, Typography, Chip, alpha } from '@mui/material';
import { Storefront, Person, Search } from '@mui/icons-material';
import { apiClient } from '@/api/client';

interface OsComOption {
  NUMOS: number;
  SITUACAO: string;
  CODPARC: number;
  nomeParc: string | null;
  situacaoLabel: string | null;
  DESCRICAO: string | null;
}

const SIT_COLORS: Record<string, string> = {
  Aberta: '#2e7d32', Fechada: '#546e7a', Pendente: '#e65100', Cancelada: '#c62828',
};

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
      getOptionLabel={(opt) => opt.nomeParc ? `OS ${opt.NUMOS} - ${opt.nomeParc}` : `OS ${opt.NUMOS}`}
      getOptionKey={(opt) => opt.NUMOS}
      isOptionEqualToValue={(opt, val) => opt.NUMOS === val.NUMOS}
      noOptionsText={inputValue.length < 2 ? 'Digite nome do cliente ou numero da OS...' : 'Nenhuma OS encontrada'}
      loadingText="Buscando..."
      renderOption={({ key, ...props }, option) => {
        const sitColor = SIT_COLORS[option.situacaoLabel ?? ''] ?? '#78909c';
        return (
          <Box component="li" key={key} {...props} sx={{
            display: 'flex', gap: 1.5, alignItems: 'center', py: 1.25, px: 2,
            '&:hover': { bgcolor: `${alpha('#c62828', 0.04)} !important` },
          }}>
            <Storefront sx={{ fontSize: 20, color: '#c62828', flexShrink: 0 }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              {option.nomeParc && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Person sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }} noWrap>{option.nomeParc}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', fontFamily: 'monospace', fontWeight: 600 }}>
                  OS {option.NUMOS}
                </Typography>
                {option.situacaoLabel && (
                  <Chip label={option.situacaoLabel} size="small" sx={{
                    height: 18, fontSize: 10, fontWeight: 700,
                    bgcolor: alpha(sitColor, 0.1), color: sitColor,
                  }} />
                )}
              </Box>
              {option.DESCRICAO && (
                <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: 0.25 }} noWrap>{option.DESCRICAO}</Typography>
              )}
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField {...params} label="Ordem de Servico Comercial"
          placeholder="Digite nome do cliente..."
          slotProps={{ input: { ...params.InputProps, startAdornment: (
            <><Search sx={{ fontSize: 18, color: 'text.disabled', mr: 0.5 }} />{params.InputProps.startAdornment}</>
          )}}}
        />
      )}
      slotProps={{
        paper: { sx: { borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid', borderColor: 'divider', mt: 0.5 } },
        listbox: { sx: { maxHeight: 320, p: 0 } },
      }}
    />
  );
}
