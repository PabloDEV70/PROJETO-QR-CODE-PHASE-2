import { useMemo } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { useSituacoes } from '@/hooks/use-hstvei-lookups';

interface SituacaoSelectProps {
  value: number | '';
  onChange: (value: number) => void;
  required?: boolean;
  disabled?: boolean;
  /** Filter options to only show situacoes whose departamentoNome contains one of these keywords */
  filterByDep?: string[];
}

export function SituacaoSelect({ value, onChange, required, disabled, filterByDep }: SituacaoSelectProps) {
  const { data: situacoes, isLoading } = useSituacoes();

  const options = useMemo(() => {
    if (!situacoes) return [];
    if (!filterByDep || filterByDep.length === 0) return situacoes;
    return situacoes.filter((s) => {
      const depName = (s.departamentoNome ?? '').toUpperCase();
      return filterByDep.some((kw) => depName.includes(kw.toUpperCase()));
    });
  }, [situacoes, filterByDep]);

  const selected = options.find((s) => s.ID === value) ?? null;

  return (
    <Autocomplete
      options={options}
      value={selected}
      onChange={(_, opt) => { if (opt) onChange(opt.ID); }}
      getOptionLabel={(s) => `${s.DESCRICAO}${s.departamentoNome ? ` (${s.departamentoNome})` : ''}`}
      isOptionEqualToValue={(a, b) => a.ID === b.ID}
      disabled={disabled || isLoading}
      size="small"
      renderInput={(params) => (
        <TextField
          {...params}
          label="Situacao"
          required={required}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading && <CircularProgress size={16} />}
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
