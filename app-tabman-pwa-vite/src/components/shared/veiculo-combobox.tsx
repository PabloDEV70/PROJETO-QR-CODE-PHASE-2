import { useState, useCallback, useRef } from 'react';
import { Autocomplete, TextField, Box, Typography, CircularProgress } from '@mui/material';
import { PlacaVeiculo } from './placa-veiculo';
import { apiClient } from '@/api/client';

interface VeicOption { codveiculo: number; placa: string; marcamodelo: string; tag: string | null; categoria: string | null }

async function search(q: string): Promise<VeicOption[]> {
  const { data } = await apiClient.get('/veiculos/search', { params: { q } });
  const arr = Array.isArray(data) ? data : data?.data ?? [];
  return arr.slice(0, 15).map((r: any) => ({
    codveiculo: r.codveiculo ?? r.CODVEICULO,
    placa: r.placa ?? r.PLACA ?? '',
    marcamodelo: r.marcamodelo ?? r.MARCAMODELO ?? '',
    tag: r.tag ?? r.AD_TAG ?? null,
    categoria: r.categoria ?? null,
  }));
}

export interface VeiculoComboboxProps {
  value: string | null;
  onChange: (placa: string | null, veiculo?: VeicOption) => void;
  label?: string;
  placeholder?: string;
  size?: 'small' | 'medium';
  disabled?: boolean;
}

export function VeiculoCombobox({ value, onChange, label = 'Veiculo', placeholder = 'Buscar placa, modelo...', size = 'small', disabled }: VeiculoComboboxProps) {
  const [options, setOptions] = useState<VeicOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sel, setSel] = useState<VeicOption | null>(null);
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

  const handleChange = useCallback((_: unknown, opt: VeicOption | null) => {
    setSel(opt);
    onChange(opt?.placa ?? null, opt ?? undefined);
  }, [onChange]);

  const cur = sel && sel.placa === value ? sel : null;

  return (
    <Autocomplete
      value={cur} onChange={handleChange} inputValue={input} onInputChange={handleInput}
      options={options} loading={loading} disabled={disabled} size={size} fullWidth
      getOptionLabel={(o) => `${o.placa} — ${o.marcamodelo}`} getOptionKey={(o) => o.codveiculo}
      isOptionEqualToValue={(a, b) => a.codveiculo === b.codveiculo}
      noOptionsText={input.length < 2 ? 'Digite 2+ caracteres' : 'Nenhum encontrado'}
      filterOptions={(x) => x}
      renderOption={({ key, ...props }, o) => (
        <li key={key} {...props}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
            <PlacaVeiculo placa={o.placa} label={o.tag || o.categoria || 'VEI'} scale={0.35} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }} noWrap>{o.marcamodelo}</Typography>
              {o.tag && <Typography sx={{ fontSize: '0.58rem', color: 'primary.main', fontWeight: 600 }}>{o.tag}</Typography>}
            </Box>
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params} label={label} placeholder={placeholder}
          slotProps={{ input: {
            ...params.InputProps,
            startAdornment: cur ? (
              <Box sx={{ ml: 0.5 }}><PlacaVeiculo placa={cur.placa} label={cur.tag || 'VEI'} scale={0.28} /></Box>
            ) : params.InputProps.startAdornment,
            endAdornment: <>{loading ? <CircularProgress size={16} /> : null}{params.InputProps.endAdornment}</>,
          }}}
        />
      )}
    />
  );
}
