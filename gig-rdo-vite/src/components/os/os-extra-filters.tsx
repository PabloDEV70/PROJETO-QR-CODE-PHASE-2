import { useMemo } from 'react';
import {
  Paper, Stack, TextField, MenuItem, Typography, Autocomplete, Avatar, Box,
} from '@mui/material';
import { useFuncionariosLista } from '@/hooks/use-funcionarios-lista';
import { getFuncionarioFotoUrl } from '@/api/funcionarios';
import type { FuncionarioListaItem } from '@/types/funcionario-types';

interface OsExtraFiltersProps {
  status: string | null;
  tipo: string | null;
  manutencao: string | null;
  codparc: string | null;
  coddep: string | null;
  onUpdate: (updates: Record<string, string | null>) => void;
}

const STATUS_OPTS = [
  { value: '', label: 'Todos' },
  { value: 'A', label: 'Aberta' },
  { value: 'E', label: 'Em Execucao' },
  { value: 'F', label: 'Finalizada' },
  { value: 'C', label: 'Cancelada' },
];

const TIPO_OPTS = [
  { value: '', label: 'Todos' },
  { value: 'I', label: 'Interna' },
  { value: 'E', label: 'Externa' },
];

const MANUT_OPTS = [
  { value: '', label: 'Todos' },
  { value: 'C', label: 'Corretiva' },
  { value: 'P', label: 'Preventiva' },
  { value: 'O', label: 'Outros' },
  { value: 'S', label: 'Socorro' },
  { value: 'R', label: 'Reforma' },
  { value: 'T', label: 'Retorno' },
];

export function OsExtraFilters({
  status, tipo, manutencao, codparc, coddep, onUpdate,
}: OsExtraFiltersProps) {
  const { data: funcData, isLoading: funcLoading } = useFuncionariosLista(coddep);
  const funcionarios = useMemo(() => funcData?.data ?? [], [funcData]);

  const selectedFunc = useMemo(() => {
    if (!codparc) return null;
    const id = Number(codparc);
    return funcionarios.find((f) => f.codparc === id) ?? null;
  }, [codparc, funcionarios]);

  return (
    <Paper sx={{ px: 1.5, py: 1, borderRadius: 3 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          Filtros OS:
        </Typography>

        <Autocomplete<FuncionarioListaItem>
          size="small"
          options={funcionarios}
          loading={funcLoading}
          value={selectedFunc}
          onChange={(_e, val) => onUpdate({ codparc: val ? String(val.codparc) : null })}
          getOptionLabel={(o) => o.nomeparc}
          isOptionEqualToValue={(o, v) => o.codparc === v.codparc}
          renderOption={(props, opt) => (
            <Box component="li" {...props} key={opt.codparc}
              sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Avatar src={opt.temFoto ? getFuncionarioFotoUrl(opt.codparc) : undefined}
                sx={{ width: 24, height: 24, fontSize: 11 }}>
                {opt.nomeparc.charAt(0)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" noWrap sx={{ fontSize: 13 }}>
                  {opt.nomeparc}
                </Typography>
                {opt.cargo && (
                  <Typography variant="caption" color="text.secondary" noWrap display="block"
                    sx={{ fontSize: '0.65rem' }}>
                    {opt.cargo}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
          renderInput={(params) => (
            <TextField {...params} placeholder="Executor..." />
          )}
          sx={{ width: 220 }}
          noOptionsText="Nenhum encontrado"
          loadingText="Carregando..."
        />

        <TextField size="small" select label="Status"
          value={status || ''} sx={{ width: 140 }}
          onChange={(e) => onUpdate({ status: e.target.value || null })}>
          {STATUS_OPTS.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
        <TextField size="small" select label="Tipo"
          value={tipo || ''} sx={{ width: 130 }}
          onChange={(e) => onUpdate({ tipo: e.target.value || null })}>
          {TIPO_OPTS.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
        <TextField size="small" select label="Manutencao"
          value={manutencao || ''} sx={{ width: 150 }}
          onChange={(e) => onUpdate({ manutencao: e.target.value || null })}>
          {MANUT_OPTS.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
      </Stack>
    </Paper>
  );
}
