import { useState, useCallback, useRef } from 'react';
import { Autocomplete, TextField, Box, Typography, CircularProgress, Avatar, alpha } from '@mui/material';
import { apiClient } from '@/api/client';
import { getFotoUrl } from '@/api/funcionarios';

interface UsuarioOption {
  codusu: number;
  nomeusu: string;
  codparc: number;
  nomeparc: string;
  codemp: number;
  codfunc: number;
  nomegrupo: string | null;
}

async function searchUsuarios(q: string): Promise<UsuarioOption[]> {
  const { data } = await apiClient.get('/usuarios/search', { params: { q } });
  const arr = Array.isArray(data) ? data : data?.data ?? [];
  return arr.slice(0, 15);
}

export interface ColaboradorComboboxProps {
  value: number | null;
  onChange: (codparc: number | null, nome?: string, nomeusu?: string) => void;
  label?: string;
  placeholder?: string;
  size?: 'small' | 'medium';
  disabled?: boolean;
}

export function ColaboradorCombobox({ value, onChange, label = 'Operador', placeholder = 'Buscar nome ou usuario...', size = 'small', disabled }: ColaboradorComboboxProps) {
  const [options, setOptions] = useState<UsuarioOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sel, setSel] = useState<UsuarioOption | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  const handleInput = useCallback((_: unknown, v: string, reason: string) => {
    setInput(v);
    if (reason !== 'input') return;
    if (timer.current) clearTimeout(timer.current);
    if (v.length < 2) { setOptions([]); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try { setOptions(await searchUsuarios(v)); } catch { setOptions([]); }
      finally { setLoading(false); }
    }, 300);
  }, []);

  const handleChange = useCallback((_: unknown, opt: UsuarioOption | null) => {
    setSel(opt);
    onChange(opt?.codparc ?? null, opt?.nomeparc, opt?.nomeusu);
  }, [onChange]);

  const cur = sel && sel.codparc === value ? sel : null;

  return (
    <Autocomplete
      value={cur} onChange={handleChange} inputValue={input} onInputChange={handleInput}
      options={options} loading={loading} disabled={disabled} size={size} fullWidth
      getOptionLabel={(o) => o.nomeparc} getOptionKey={(o) => o.codusu}
      isOptionEqualToValue={(a, b) => a.codusu === b.codusu}
      noOptionsText={input.length < 2 ? 'Digite 2+ caracteres' : 'Nenhum encontrado'}
      filterOptions={(x) => x}
      renderOption={({ key, ...props }, o) => (
        <li key={key} {...props}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
            <Avatar src={getFotoUrl(o.codparc)} sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.8rem', fontWeight: 700 }}>
              {o.nomeparc.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }} noWrap>{o.nomeparc}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{
                  fontSize: '0.62rem', fontWeight: 600, color: 'primary.main',
                  px: 0.4, py: 0.05, borderRadius: 0.4,
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                }}>
                  {o.nomeusu}
                </Typography>
                {o.nomegrupo && (
                  <Typography sx={{ fontSize: '0.55rem', color: 'text.disabled' }}>{o.nomegrupo}</Typography>
                )}
              </Box>
            </Box>
            <Typography sx={{ fontSize: '0.5rem', color: 'text.disabled', fontFamily: 'monospace', flexShrink: 0 }}>
              #{o.codparc}
            </Typography>
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params} label={label} placeholder={placeholder}
          slotProps={{ input: {
            ...params.InputProps,
            startAdornment: cur ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 0.5 }}>
                <Avatar src={getFotoUrl(cur.codparc)} sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: '0.6rem', fontWeight: 700 }}>
                  {cur.nomeparc.charAt(0)}
                </Avatar>
              </Box>
            ) : params.InputProps.startAdornment,
            endAdornment: <>{loading ? <CircularProgress size={16} /> : null}{params.InputProps.endAdornment}</>,
          }}}
        />
      )}
    />
  );
}
