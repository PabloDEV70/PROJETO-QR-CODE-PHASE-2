import { useState, useCallback, useRef } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Business, Badge } from '@mui/icons-material';
import { apiClient } from '@/api/client';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';

interface BuscarResponse {
  codparc: number;
  nomeparc: string;
  codfunc: number;
  codemp: number;
  cargo: string | null;
  departamento: string | null;
  temFoto: boolean;
}

interface FuncionarioOption {
  codparc: number;
  nome: string;
  codfunc?: number;
  codemp?: number;
  cargo?: string | null;
  departamento?: string | null;
  temFoto?: boolean;
}

export interface FuncionarioComboboxProps {
  value: number | null;
  onChange: (codparc: number | null, nome?: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}

async function searchFuncionarios(query: string): Promise<FuncionarioOption[]> {
  const { data } = await apiClient.get<BuscarResponse[]>(
    '/funcionarios/buscar',
    { params: { q: query } },
  );
  return data.map((r) => ({
    codparc: r.codparc,
    nome: r.nomeparc,
    codfunc: r.codfunc,
    codemp: r.codemp,
    cargo: r.cargo,
    departamento: r.departamento,
    temFoto: r.temFoto,
  }));
}

export function FuncionarioCombobox({
  value,
  onChange,
  label = 'Funcionario',
  placeholder = 'Digite nome ou codigo...',
  disabled = false,
  size = 'small',
  fullWidth = true,
}: FuncionarioComboboxProps) {
  const [options, setOptions] = useState<FuncionarioOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selected, setSelected] = useState<FuncionarioOption | null>(null);
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
          setOptions(await searchFuncionarios(newInput));
        } catch { setOptions([]); }
        finally { setLoading(false); }
      }, 300);
    },
    [],
  );

  const handleChange = useCallback(
    (_: unknown, option: FuncionarioOption | null) => {
      setSelected(option);
      onChange(option?.codparc ?? null, option?.nome);
    },
    [onChange],
  );

  const selectedOption = selected && selected.codparc === value ? selected : null;

  return (
    <Autocomplete
      value={selectedOption}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={options}
      loading={loading}
      disabled={disabled}
      fullWidth={fullWidth}
      size={size}
      getOptionLabel={(opt) => opt.nome}
      getOptionKey={(opt) => opt.codparc}
      isOptionEqualToValue={(opt, val) => opt.codparc === val.codparc}
      noOptionsText={
        inputValue.length < 2
          ? 'Digite pelo menos 2 caracteres'
          : 'Nenhum funcionario encontrado'
      }
      loadingText="Buscando..."
      filterOptions={(x) => x}
      renderOption={({ key, ...props }, option) => (
        <li key={key} {...props}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', width: '100%' }}>
            <FuncionarioAvatar
              codparc={option.codparc}
              codemp={option.codemp}
              codfunc={option.codfunc}
              nome={option.nome}
              size="small"
              sx={{ width: 36, height: 36, flexShrink: 0 }}
            />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {option.nome}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mt: 0.25 }}>
                {option.departamento && (
                  <Chip
                    icon={<Business sx={{ fontSize: '12px !important' }} />}
                    label={option.departamento}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 18, fontSize: 10, fontWeight: 500, borderRadius: 1,
                      '& .MuiChip-label': { px: 0.5 },
                      '& .MuiChip-icon': { ml: 0.25 },
                    }}
                  />
                )}
                {option.cargo && (
                  <Chip
                    icon={<Badge sx={{ fontSize: '12px !important' }} />}
                    label={option.cargo}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 18, fontSize: 10, fontWeight: 500, borderRadius: 1,
                      '& .MuiChip-label': { px: 0.5 },
                      '& .MuiChip-icon': { ml: 0.25 },
                    }}
                  />
                )}
              </Box>
            </Box>
            <Typography
              variant="caption"
              sx={{ color: 'text.disabled', fontSize: 10, fontFamily: 'monospace', flexShrink: 0 }}
            >
              #{option.codparc}
            </Typography>
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: selectedOption ? (
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
                  <FuncionarioAvatar
                    codparc={selectedOption.codparc}
                    codemp={selectedOption.codemp}
                    codfunc={selectedOption.codfunc}
                    nome={selectedOption.nome}
                    size="small"
                  />
                </Box>
              ) : undefined,
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
