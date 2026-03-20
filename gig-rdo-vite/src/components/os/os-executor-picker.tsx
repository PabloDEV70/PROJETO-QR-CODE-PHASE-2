import { Autocomplete, TextField, Avatar, Box, Typography } from '@mui/material';
import { getFuncionarioFotoUrl } from '@/api/funcionarios';
import type { FuncionarioListaItem } from '@/types/funcionario-types';

interface OsExecutorPickerProps {
  funcionarios: FuncionarioListaItem[];
  loading: boolean;
  value: FuncionarioListaItem | null;
  onChange: (val: FuncionarioListaItem | null) => void;
  hasDepartamento: boolean;
}

export function OsExecutorPicker({
  funcionarios, loading, value, onChange, hasDepartamento,
}: OsExecutorPickerProps) {
  return (
    <Autocomplete<FuncionarioListaItem>
      size="small" options={funcionarios} loading={loading}
      value={value}
      onChange={(_e, val) => onChange(val)}
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
              <Typography variant="caption" color="text.secondary" noWrap
                display="block" sx={{ fontSize: '0.65rem' }}>
                {opt.cargo}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField {...params} placeholder="Colaborador..." />
      )}
      sx={{ minWidth: 250, flex: 1, maxWidth: 350 }}
      noOptionsText={hasDepartamento ? 'Nenhum no depto.' : 'Selecione um departamento'}
      loadingText="Carregando..."
    />
  );
}
