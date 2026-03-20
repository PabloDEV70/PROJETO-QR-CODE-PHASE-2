import { useState, useCallback, useRef } from 'react';
import { Autocomplete, TextField, Box, Typography, Chip, CircularProgress } from '@mui/material';
import { searchUsuarios, type UsuarioOption } from '@/api/hstvei-crud';
import { PessoaAvatar } from '@/components/shared/pessoa-avatar';

interface Props {
  value: UsuarioOption[];
  onChange: (usuarios: UsuarioOption[]) => void;
  label: string;
  placeholder?: string;
  size?: 'small' | 'medium';
  disabled?: boolean;
}

export function UsuarioMultiSelect({
  value, onChange, label,
  placeholder = 'Buscar usuario...', size = 'small', disabled,
}: Props) {
  const [options, setOptions] = useState<UsuarioOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleInputChange = useCallback((_: unknown, val: string, reason: string) => {
    setInputValue(val);
    if (reason !== 'input') return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 2) { setOptions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try { setOptions(await searchUsuarios(val)); }
      catch { setOptions([]); }
      finally { setLoading(false); }
    }, 300);
  }, []);

  return (
    <Autocomplete
      multiple
      value={value}
      onChange={(_, newVal) => onChange(newVal)}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={options}
      loading={loading}
      disabled={disabled}
      size={size}
      fullWidth
      getOptionLabel={(o) => o.nomeusu}
      getOptionKey={(o) => o.codusu}
      isOptionEqualToValue={(a, b) => a.codusu === b.codusu}
      filterOptions={(x) => x}
      noOptionsText={inputValue.length < 2 ? 'Digite 2+ caracteres' : 'Nenhum usuario'}
      loadingText="Buscando..."
      renderTags={(tags, getTagProps) =>
        tags.map((opt, idx) => {
          const { key, ...tagProps } = getTagProps({ index: idx });
          return (
            <Chip
              key={key}
              {...tagProps}
              avatar={<PessoaAvatar codparc={opt.codparc} nome={opt.nomeusu} size={24} />}
              label={opt.nomeusu.split(' ')[0]}
              size="small"
              sx={{ fontWeight: 600, fontSize: '0.72rem', height: 28 }}
            />
          );
        })
      }
      renderOption={({ key, ...props }, opt) => (
        <li key={key} {...props}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
            <PessoaAvatar codparc={opt.codparc} nome={opt.nomeusu} size={32} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>{opt.nomeusu}</Typography>
            </Box>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.disabled' }}>
              #{opt.codusu}
            </Typography>
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder={value.length === 0 ? placeholder : ''}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress size={16} />}
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
