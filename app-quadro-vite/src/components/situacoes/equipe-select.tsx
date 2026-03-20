import { useState, useCallback, useRef } from 'react';
import { Autocomplete, TextField, Box, Typography, Chip } from '@mui/material';
import { apiClient } from '@/api/client';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';

interface UsuarioOption {
  codusu: number;
  nomeusu: string;
  codparc: number | null;
  nomeparc?: string;
}

interface EquipeSelectProps {
  label: string;
  value: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function EquipeSelect({ label, value: _value, onChange, disabled, placeholder }: EquipeSelectProps) {
  const [options, setOptions] = useState<UsuarioOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selected, setSelected] = useState<UsuarioOption[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController>(undefined);

  const search = useCallback((term: string) => {
    abortRef.current?.abort();
    if (term.length < 2) { setOptions(selected); setLoading(false); return; }
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    apiClient.get<UsuarioOption[]>('/usuarios/search', { params: { q: term }, signal: controller.signal })
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

  return (
    <Autocomplete
      multiple
      value={selected}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={(_, opts) => {
        setSelected(opts);
        onChange(opts.map((o) => o.codusu));
      }}
      options={options}
      loading={loading}
      disabled={disabled}
      fullWidth
      size="small"
      filterOptions={(x) => x}
      getOptionLabel={(opt) => opt.nomeusu}
      getOptionKey={(opt) => opt.codusu}
      isOptionEqualToValue={(opt, val) => opt.codusu === val.codusu}
      noOptionsText={inputValue.length < 2 ? 'Digite nome...' : 'Nenhum usuario encontrado'}
      loadingText="Buscando..."
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const { key, ...chipProps } = getTagProps({ index });
          return (
            <Chip
              key={key}
              {...chipProps}
              avatar={
                <FuncionarioAvatar
                  codparc={option.codparc ?? 0}
                  nome={option.nomeusu}
                  size="small"
                  sx={{ width: 24, height: 24 }}
                />
              }
              label={option.nomeparc?.split(' ')[0] ?? option.nomeusu}
              size="small"
              sx={{ height: 28 }}
            />
          );
        })
      }
      renderOption={({ key, ...props }, option) => (
        <li key={key} {...props}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', width: '100%' }}>
            <FuncionarioAvatar
              codparc={option.codparc ?? 0}
              nome={option.nomeusu}
              size="small"
              sx={{ width: 32, height: 32, flexShrink: 0 }}
            />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {option.nomeparc ?? option.nomeusu}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                cod: {option.codusu}
              </Typography>
            </Box>
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={selected.length === 0 ? (placeholder ?? 'Buscar por nome...') : ''}
        />
      )}
    />
  );
}
