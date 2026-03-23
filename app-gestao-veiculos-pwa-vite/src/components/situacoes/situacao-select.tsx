import { useMemo } from 'react';
import { Autocomplete, TextField, CircularProgress, Box, Typography, alpha, Chip } from '@mui/material';
import { useSituacoes } from '@/hooks/use-hstvei-lookups';
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
    const filtered = filterByDep?.length
      ? situacoes.filter((s) => {
          const depName = (s.departamentoNome ?? '').toUpperCase();
          return filterByDep.some((kw) => depName.includes(kw.toUpperCase()));
        })
      : situacoes;

    // Sort by department then description
    return [...filtered].sort((a, b) => {
      const da = a.departamentoNome ?? '';
      const db = b.departamentoNome ?? '';
      if (da !== db) return da.localeCompare(db);
      return a.DESCRICAO.localeCompare(b.DESCRICAO);
    });
  }, [situacoes, filterByDep]);

  const selected = options.find((s) => s.ID === value) ?? null;

  // Group by department
  const groupByDep = !filterByDep || filterByDep.length > 1;

  return (
    <Autocomplete
      options={options}
      value={selected}
      onChange={(_, opt) => { if (opt) onChange(opt.ID); }}
      getOptionLabel={(s) => s.DESCRICAO}
      isOptionEqualToValue={(a, b) => a.ID === b.ID}
      disabled={disabled || isLoading}
      groupBy={groupByDep ? (opt) => opt.departamentoNome ?? 'Sem departamento' : undefined}
      noOptionsText="Nenhuma situacao encontrada"
      openText="Abrir opcoes"
      clearText="Limpar"
      renderOption={(props, option) => {
        const depInfo = getDepartamentoInfo(option.departamentoNome ?? '');
        return (
          <Box
            component="li"
            {...props}
            key={option.ID}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              py: 1.5,
              px: 2,
              '&:hover': {
                bgcolor: `${alpha(depInfo.color, 0.08)} !important`,
              },
            }}
          >
            <Box sx={{
              width: 32, height: 32, borderRadius: 1,
              bgcolor: alpha(depInfo.color, 0.1),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: depInfo.color, flexShrink: 0,
            }}>
              <depInfo.Icon sx={{ fontSize: 18 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>
                {option.DESCRICAO}
              </Typography>
              {!groupByDep && option.departamentoNome && (
                <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                  {option.departamentoNome}
                </Typography>
              )}
            </Box>
          </Box>
        );
      }}
      renderGroup={(params) => {
        const depInfo = getDepartamentoInfo(params.group);
        return (
          <Box key={params.key}>
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              px: 2, py: 1,
              bgcolor: (t) => alpha(depInfo.color, t.palette.mode === 'dark' ? 0.08 : 0.04),
              borderBottom: `1px solid ${alpha(depInfo.color, 0.15)}`,
              position: 'sticky', top: 0, zIndex: 1,
            }}>
              <depInfo.Icon sx={{ fontSize: 16, color: depInfo.color }} />
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: depInfo.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {depInfo.label}
              </Typography>
            </Box>
            {params.children}
          </Box>
        );
      }}
      renderInput={(params) => {
        const depInfo = selected ? getDepartamentoInfo(selected.departamentoNome ?? '') : null;
        return (
          <TextField
            {...params}
            label="Situacao"
            required={required}
            placeholder="Selecione o tipo de situacao..."
            slotProps={{
              input: {
                ...params.InputProps,
                startAdornment: depInfo ? (
                  <>
                    <Chip
                      icon={<depInfo.Icon sx={{ fontSize: '14px !important', color: `${depInfo.color} !important` }} />}
                      label={depInfo.label}
                      size="small"
                      sx={{
                        height: 22, fontSize: 10, fontWeight: 700, mr: 0.5,
                        bgcolor: alpha(depInfo.color, 0.1),
                        color: depInfo.color,
                        border: `1px solid ${alpha(depInfo.color, 0.2)}`,
                        '& .MuiChip-label': { px: 0.5 },
                      }}
                    />
                    {params.InputProps.startAdornment}
                  </>
                ) : params.InputProps.startAdornment,
                endAdornment: (
                  <>
                    {isLoading && <CircularProgress size={18} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              },
            }}
          />
        );
      }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            border: '1px solid',
            borderColor: 'divider',
            mt: 0.5,
          },
        },
        listbox: {
          sx: { maxHeight: 350, p: 0 },
        },
      }}
    />
  );
}
