import { useState, useEffect } from 'react';
import { Autocomplete, TextField, Box, Typography } from '@mui/material';
import { DirectionsCarRounded } from '@mui/icons-material';
import { apiClient } from '@/api/client';
import type { FrotaStatusResponse } from '@/types/os-types';

interface VeiculoOption {
  codveiculo: number;
  placa: string;
  adTag: string | null;
}

export interface VeiculoComboboxProps {
  value: number | null;
  onChange: (codveiculo: number | null, veiculo?: VeiculoOption | null) => void;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  size?: 'small' | 'medium';
  error?: boolean;
  helperText?: string;
}

export function VeiculoCombobox({
  value, onChange, label = 'Veiculo',
  disabled = false, required = false, size = 'small',
  error = false, helperText,
}: VeiculoComboboxProps) {
  const [options, setOptions] = useState<VeiculoOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiClient.get<FrotaStatusResponse>('/man/frota/status')
      .then(({ data }) => {
        if (!cancelled) {
          // Flatten veiculos from porStatus
          const veiculos = (data.porStatus ?? []).flatMap((s) => s.veiculos);
          // Deduplicate by codveiculo
          const map = new Map<number, VeiculoOption>();
          for (const v of veiculos) {
            if (!map.has(v.codveiculo)) map.set(v.codveiculo, v);
          }
          setOptions([...map.values()]);
        }
      })
      .catch(() => { if (!cancelled) setOptions([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const selected = options.find((o) => o.codveiculo === value) ?? null;

  return (
    <Autocomplete
      value={selected}
      onChange={(_, opt) => onChange(opt?.codveiculo ?? null, opt)}
      options={options}
      loading={loading}
      disabled={disabled}
      fullWidth
      size={size}
      getOptionLabel={(opt) =>
        [opt.placa, opt.adTag].filter(Boolean).join(' - ')
      }
      getOptionKey={(opt) => opt.codveiculo}
      isOptionEqualToValue={(opt, val) => opt.codveiculo === val.codveiculo}
      noOptionsText="Nenhum veiculo encontrado"
      loadingText="Carregando veiculos..."
      renderOption={({ key, ...props }, option) => (
        <li key={key} {...props}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', width: '100%' }}>
            <DirectionsCarRounded sx={{ fontSize: 20, color: 'text.secondary', flexShrink: 0 }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {option.placa} {option.adTag ? `(${option.adTag})` : ''}
              </Typography>
            </Box>
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField {...params} label={label} required={required} error={error} helperText={helperText} />
      )}
    />
  );
}
