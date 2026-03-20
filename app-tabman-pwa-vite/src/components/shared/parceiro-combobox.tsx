import { useState, useCallback, useRef } from 'react';
import { Autocomplete, TextField, Box, Typography, CircularProgress } from '@mui/material';
import { Business } from '@mui/icons-material';
import { apiClient } from '@/api/client';

interface ParcOption { codparc: number; nome: string; cgcCpf: string | null; tippessoa: string | null }

async function search(q: string): Promise<ParcOption[]> {
  const { data } = await apiClient.get('/parceiros/search', { params: { q } });
  const arr = Array.isArray(data) ? data : data?.data ?? [];
  return arr.map((r: any) => ({ codparc: r.codparc ?? r.CODPARC, nome: r.nomeparc ?? r.NOMEPARC ?? r.nome, cgcCpf: r.cgc_cpf ?? r.cgcCpf ?? null, tippessoa: r.tippessoa ?? null }));
}

export interface ParceiroComboboxProps {
  value: number | null;
  onChange: (codparc: number | null, nome?: string) => void;
  label?: string;
  placeholder?: string;
  size?: 'small' | 'medium';
  disabled?: boolean;
}

export function ParceiroCombobox({ value, onChange, label = 'Contratante', placeholder = 'Buscar cliente...', size = 'small', disabled }: ParceiroComboboxProps) {
  const [options, setOptions] = useState<ParcOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sel, setSel] = useState<ParcOption | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  const handleInput = useCallback((_: unknown, v: string, reason: string) => {
    setInput(v);
    if (reason !== 'input') return;
    if (timer.current) clearTimeout(timer.current);
    if (v.length < 2) { setOptions([]); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try { setOptions(await search(v)); } catch { setOptions([]); }
      finally { setLoading(false); }
    }, 300);
  }, []);

  const handleChange = useCallback((_: unknown, opt: ParcOption | null) => {
    setSel(opt);
    onChange(opt?.codparc ?? null, opt?.nome);
  }, [onChange]);

  const cur = sel && sel.codparc === value ? sel : null;

  return (
    <Autocomplete
      value={cur} onChange={handleChange} inputValue={input} onInputChange={handleInput}
      options={options} loading={loading} disabled={disabled} size={size} fullWidth
      getOptionLabel={(o) => o.nome} getOptionKey={(o) => o.codparc}
      isOptionEqualToValue={(a, b) => a.codparc === b.codparc}
      noOptionsText={input.length < 2 ? 'Digite 2+ caracteres' : 'Nenhum encontrado'}
      filterOptions={(x) => x}
      renderOption={({ key, ...props }, o) => (
        <li key={key} {...props}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
            <Business sx={{ fontSize: 20, color: 'text.disabled' }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }} noWrap>{o.nome}</Typography>
              <Typography sx={{ fontSize: '0.58rem', color: 'text.disabled', fontFamily: 'monospace' }}>
                #{o.codparc}{o.cgcCpf ? ` · ${o.cgcCpf}` : ''}
              </Typography>
            </Box>
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params} label={label} placeholder={placeholder}
          slotProps={{ input: {
            ...params.InputProps,
            endAdornment: <>{loading ? <CircularProgress size={16} /> : null}{params.InputProps.endAdornment}</>,
          }}}
        />
      )}
    />
  );
}
