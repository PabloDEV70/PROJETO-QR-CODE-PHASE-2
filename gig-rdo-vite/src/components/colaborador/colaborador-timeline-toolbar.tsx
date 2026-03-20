import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import { format, subDays } from 'date-fns';
import { FuncionarioSearchLive } from '@/components/shared/funcionario-search-live';

interface ColaboradorTimelineToolbarProps {
  codparc: number;
  nomeparc?: string;
  dataInicio: string;
  dataFim: string;
  onDateChange: (updates: Record<string, string>) => void;
}

type QuickPeriod = '7' | '15' | '30' | '60';

export function ColaboradorTimelineToolbar({
  codparc,
  nomeparc,
  dataInicio,
  dataFim,
  onDateChange,
}: ColaboradorTimelineToolbarProps) {
  const navigate = useNavigate();

  const handleQuickPeriod = useCallback(
    (_: React.MouseEvent<HTMLElement>, val: QuickPeriod | null) => {
      if (!val) return;
      const days = Number(val);
      onDateChange({
        dataInicio: format(subDays(new Date(), days), 'yyyy-MM-dd'),
        dataFim: format(new Date(), 'yyyy-MM-dd'),
      });
    },
    [onDateChange],
  );

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <FuncionarioSearchLive
            value={nomeparc ? { codparc, nomeparc } : null}
            onChange={(func) => {
              if (func) navigate(`/rdo/colaborador/${func.codparc}`);
            }}
            label="Colaborador"
            size="small"
          />
          <ToggleButtonGroup
            size="small"
            exclusive
            onChange={handleQuickPeriod}
            sx={{ flexShrink: 0 }}
          >
            {(['7', '15', '30', '60'] as const).map((d) => (
              <ToggleButton key={d} value={d} sx={{ px: 1.5 }}>
                <Typography variant="caption" fontWeight={600}>{d}d</Typography>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>

        <Stack direction="row" spacing={2}>
          <TextField
            type="date"
            label="Inicio"
            value={dataInicio}
            onChange={(e) => onDateChange({ dataInicio: e.target.value })}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ maxWidth: 180 }}
          />
          <TextField
            type="date"
            label="Fim"
            value={dataFim}
            onChange={(e) => onDateChange({ dataFim: e.target.value })}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ maxWidth: 180 }}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}
