import { useState, useCallback, useRef } from 'react';
import { Autocomplete, TextField, Box, Typography, CircularProgress } from '@mui/material';
import { searchParceiros, type ParceiroOption } from '@/api/hstvei-crud';

function formatCpfCnpj(val: string): string {
  const clean = val.replace(/\D/g, '');
  if (clean.length === 11) return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (clean.length === 14) return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return val;
}

interface Props {
  value: number | null;
  nomeParceiro?: string | null;
  onChange: (codparc: number | null, nome?: string) => void;
  label?: string;
  size?: 'small' | 'medium';
  disabled?: boolean;
}

export function ParceiroAutocomplete({
  value, nomeParceiro, onChange,
  label = 'Parceiro', size = 'small', disabled,
}: Props) {
  const [options, setOptions] = useState<ParceiroOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(nomeParceiro ?? '');
  const [selected, setSelected] = useState<ParceiroOption | null>(
    value && nomeParceiro ? { codparc: value, nomeparc: nomeParceiro } : null,
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleInputChange = useCallback((_: unknown, val: string, reason: string) => {
    setInputValue(val);
    if (reason !== 'input') return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 2) { setOptions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try { setOptions(await searchParceiros(val)); }
      catch { setOptions([]); }
      finally { setLoading(false); }
    }, 300);
  }, []);

  const handleChange = useCallback((_: unknown, opt: ParceiroOption | null) => {
    setSelected(opt);
    onChange(opt?.codparc ?? null, opt?.nomeparc);
  }, [onChange]);

  return (
    <Autocomplete
      value={selected?.codparc === value ? selected : null}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={options}
      loading={loading}
      disabled={disabled}
      size={size}
      fullWidth
      getOptionLabel={(o) => o.nomeparc}
      getOptionKey={(o) => o.codparc}
      isOptionEqualToValue={(a, b) => a.codparc === b.codparc}
      filterOptions={(x) => x}
      noOptionsText={inputValue.length < 2 ? 'Digite 2+ caracteres' : 'Nenhum parceiro'}
      loadingText="Buscando..."
      renderOption={({ key, ...props }, opt) => {
        const doc = opt.cgc_cpf || opt.cgcCpf;
        return (
          <li key={key} {...props}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" fontWeight={600}>{opt.nomeparc}</Typography>
                {doc && (
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{formatCpfCnpj(doc)}</Typography>
                )}
              </Box>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.disabled' }}>
                #{opt.codparc}
              </Typography>
            </Box>
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder="Buscar parceiro..."
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
