import { useMemo } from 'react';
import { Autocomplete, TextField, Box, Typography, Chip, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { getDepartamentoInfo } from '@/utils/departamento-constants';
import { PRIORIDADE_MAP } from '@/utils/prioridade-constants';
import type { SituacaoOption } from '@/api/hstvei-crud';

interface Props {
  idsit: number | '';
  idpri: number | '';
  onSitChange: (v: number) => void;
  onPriChange: (v: number | '') => void;
  situacoes: SituacaoOption[];
}

export function ClassificacaoSection({ idsit, idpri, onSitChange, onPriChange, situacoes }: Props) {
  const selected = useMemo(
    () => situacoes.find((s) => s.ID === idsit) ?? null,
    [situacoes, idsit],
  );

  const depInfo = selected ? getDepartamentoInfo(selected.CODDEP) : null;

  return (
    <>
      {/* Situacao — Autocomplete compact */}
      <Autocomplete
        value={selected}
        onChange={(_, opt) => { if (opt) onSitChange(opt.ID); }}
        options={situacoes}
        size="small"
        fullWidth
        getOptionLabel={(o) => o.DESCRICAO}
        getOptionKey={(o) => o.ID}
        isOptionEqualToValue={(a, b) => a.ID === b.ID}
        renderOption={({ key, ...props }, o) => {
          const dep = getDepartamentoInfo(o.CODDEP);
          return (
            <li key={key} {...props} style={{ padding: '4px 12px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: dep.color, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.8rem', flex: 1 }} noWrap>{o.DESCRICAO}</Typography>
                <Chip label={dep.label} size="small"
                  sx={{ height: 18, fontSize: '0.58rem', bgcolor: dep.color, color: '#fff' }} />
              </Box>
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField {...params} label="Situacao *"
            slotProps={{
              input: {
                ...params.InputProps,
                startAdornment: depInfo ? (
                  <>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: depInfo.color, ml: 0.5, flexShrink: 0 }} />
                    {params.InputProps.startAdornment}
                  </>
                ) : params.InputProps.startAdornment,
              },
            }}
          />
        )}
        slotProps={{ listbox: { sx: { maxHeight: 240 } } }}
      />

      {/* Depto chip feedback */}
      {depInfo && (
        <Chip label={depInfo.label} size="small" icon={<depInfo.Icon sx={{ fontSize: 14 }} />}
          sx={{ alignSelf: 'flex-start', height: 22, bgcolor: depInfo.color, color: '#fff', fontWeight: 600, fontSize: '0.68rem',
            '& .MuiChip-icon': { color: '#fff' } }} />
      )}

      {/* Prioridade — ToggleButtons inline (much better than dropdown) */}
      <Box>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Prioridade
        </Typography>
        <ToggleButtonGroup
          value={idpri}
          exclusive
          onChange={(_, val) => onPriChange(val ?? '')}
          size="small"
          fullWidth
          sx={{ height: 32 }}
        >
          <ToggleButton value="" sx={{ fontSize: '0.7rem', textTransform: 'none', flex: 1 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#9e9e9e33', color: '#9e9e9e',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, mr: 0.5 }}>
              -
            </Box>
            Nenhuma
          </ToggleButton>
          {Object.entries(PRIORIDADE_MAP).map(([key, pri]) => (
            <ToggleButton key={key} value={Number(key)}
              sx={{
                fontSize: '0.7rem', textTransform: 'none', flex: 1,
                '&.Mui-selected': { bgcolor: pri.color + '22', color: pri.color, borderColor: pri.color + '66' },
                '&.Mui-selected:hover': { bgcolor: pri.color + '33' },
              }}>
              <Box sx={{
                width: 16, height: 16, borderRadius: '50%', bgcolor: pri.color + '33', color: pri.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem', fontWeight: 700, mr: 0.5,
              }}>
                {pri.sigla}
              </Box>
              {pri.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    </>
  );
}
