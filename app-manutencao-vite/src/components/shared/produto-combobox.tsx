import { useState, useCallback, useRef, useEffect } from 'react';
import { Autocomplete, TextField, Box, Typography, CircularProgress, Chip } from '@mui/material';
import { Build, Inventory2 } from '@mui/icons-material';
import { apiClient } from '@/api/client';

interface ProdutoOption {
  CODPROD: number;
  DESCRPROD: string;
  grupo?: string;
  complemento?: string;
  marca?: string;
  unidade?: string;
  USOPROD?: string;
  referencia?: string;
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

interface ApiProduto {
  CODPROD: number;
  nome?: string;
  DESCRPROD?: string;
  complemento?: string;
  marca?: string;
  referencia?: string;
  CODGRUPOPROD?: number;
  grupo?: string;
  unidade?: string;
  USOPROD?: string;
}

function mapApiToProduto(p: ApiProduto): ProdutoOption {
  return {
    CODPROD: p.CODPROD,
    DESCRPROD: p.nome ?? p.DESCRPROD ?? `#${p.CODPROD}`,
    grupo: p.grupo ?? undefined,
    complemento: p.complemento || undefined,
    marca: p.marca || undefined,
    unidade: p.unidade ?? undefined,
    USOPROD: p.USOPROD ?? undefined,
    referencia: p.referencia || undefined,
  };
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
  const initialFetchDone = useRef(false);

  // Fetch product by ID when editing
  useEffect(() => {
    if (value && !selected && !initialFetchDone.current) {
      initialFetchDone.current = true;
      apiClient.get<ApiProduto>(`/produtos/${value}/full`)
        .then(({ data }) => {
          const opt = mapApiToProduto(data);
          setSelected(opt);
          setInputValue(opt.DESCRPROD);
          setOptions((prev) => prev.some((p) => p.CODPROD === value) ? prev : [...prev, opt]);
        })
        .catch(() => { /* ignore */ });
    }
    if (!value) {
      initialFetchDone.current = false;
      setSelected(null);
    }
  }, [value, selected]);

  const handleInputChange = useCallback(
    (_: unknown, newInput: string, reason: string) => {
      setInputValue(newInput);
      if (reason !== 'input') return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (newInput.length < 2) { setOptions([]); return; }
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const { data } = await apiClient.get<ApiProduto[]>(
            '/produtos/buscar', { params: { q: newInput, limit: 20 } },
          );
          const arr = Array.isArray(data) ? data : [];
          setOptions(arr.map(mapApiToProduto));
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
      noOptionsText={inputValue.length < 2 ? 'Digite pelo menos 2 caracteres para buscar' : 'Nenhum produto encontrado'}
      loadingText="Buscando produtos..."
      filterOptions={(x) => x}
      renderOption={({ key, ...props }, option) => (
        <li key={key} {...props}>
          <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start', width: '100%', py: 0.25 }}>
            {/* Icon by type */}
            <Box sx={{
              width: 32, height: 32, borderRadius: '6px',
              bgcolor: option.USOPROD === 'S' ? 'rgba(46,125,50,0.08)' : 'rgba(25,118,210,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, mt: 0.25,
            }}>
              {option.USOPROD === 'S'
                ? <Build sx={{ fontSize: 16, color: 'success.main' }} />
                : <Inventory2 sx={{ fontSize: 16, color: 'primary.main' }} />
              }
            </Box>

            {/* Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }} noWrap>
                {option.DESCRPROD}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.15 }}>
                {option.grupo && (
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }} noWrap>
                    {option.grupo}
                  </Typography>
                )}
                {option.complemento && (
                  <>
                    <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>|</Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.disabled' }} noWrap>
                      {option.complemento}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>

            {/* Right badges */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.25, flexShrink: 0 }}>
              <Typography sx={{ fontSize: 10, color: 'text.disabled', fontFamily: 'monospace' }}>
                #{option.CODPROD}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {option.USOPROD && (
                  <Chip
                    label={option.USOPROD === 'S' ? 'Servico' : 'Produto'}
                    size="small"
                    color={option.USOPROD === 'S' ? 'success' : 'primary'}
                    variant="outlined"
                    sx={{ fontSize: 9, height: 16, '& .MuiChip-label': { px: 0.5 } }}
                  />
                )}
                {option.unidade && (
                  <Chip
                    label={option.unidade}
                    size="small" variant="outlined"
                    sx={{ fontSize: 9, height: 16, '& .MuiChip-label': { px: 0.5 } }}
                  />
                )}
              </Box>
            </Box>
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
