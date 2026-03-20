import { useMemo } from 'react';
import { Autocomplete, TextField, CircularProgress, Box, Typography } from '@mui/material';
import { useSituacoes } from '@/hooks/use-hstvei';
import { getDepartamentoInfo } from '@/utils/departamento-constants';

interface SituacaoSelectProps {
  value: number | '';
  onChange: (value: number) => void;
  required?: boolean;
  disabled?: boolean;
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
      groupBy={(s) => s.departamentoNome ?? 'Outros'}
      getOptionLabel={(s) => s.DESCRICAO}
      isOptionEqualToValue={(a, b) => a.ID === b.ID}
      disabled={disabled || isLoading}
      size="small"
      renderGroup={(params) => {
        const dep = getDepartamentoInfo(params.group);
        return (
          <li key={params.key}>
            <Box sx={{ px: 2, py: 0.5, bgcolor: dep.bgLight, fontWeight: 700, fontSize: 11, color: dep.color, position: 'sticky', top: -8, zIndex: 1 }}>
              {dep.label}
            </Box>
            <ul style={{ padding: 0 }}>{params.children}</ul>
          </li>
        );
      }}
      renderOption={({ key, ...props }, option) => {
        const dep = getDepartamentoInfo(option.departamentoNome);
        return (
          <li key={key} {...props}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: dep.color, flexShrink: 0 }} />
              <Typography sx={{ fontSize: 13 }}>{option.DESCRICAO}</Typography>
              {option.OBS && <Typography sx={{ fontSize: 10, color: 'text.disabled', ml: 'auto' }}>{option.OBS}</Typography>}
            </Box>
          </li>
        );
      }}
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
