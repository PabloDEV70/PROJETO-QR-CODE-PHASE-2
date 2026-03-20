import { useState, useMemo } from 'react';
import { 
  Box, Popover, Stack, Typography, 
  Divider, MenuItem, TextField, InputAdornment
} from '@mui/material';
import { 
  CalendarMonthRounded, 
  KeyboardArrowDownRounded
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { parseISO, format, isValid } from 'date-fns';
import { getPeriodPresets, getActivePresetKey } from '@/utils/date-helpers';
import { filterInputRootSx } from '@/components/shared/input-styles';

interface PeriodSelectorProps {
  dataInicio: string;
  dataFim: string;
  onChange: (ini: string, fim: string) => void;
  onClear: () => void;
}

export function PeriodSelector({ dataInicio, dataFim, onChange, onClear }: PeriodSelectorProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const presets = useMemo(() => getPeriodPresets(), []);
  const activePresetKey = useMemo(() => getActivePresetKey(dataInicio, dataFim), [dataInicio, dataFim]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const label = useMemo(() => {
    if (!dataInicio && !dataFim) return 'Todo período';
    const preset = presets.find(p => p.key === activePresetKey);
    if (preset) return preset.label;
    
    const fmt = (iso: string) => {
      const d = parseISO(iso);
      return isValid(d) ? format(d, 'dd/MM/yy') : '?';
    };
    return `${fmt(dataInicio)} - ${fmt(dataFim)}`;
  }, [dataInicio, dataFim, activePresetKey, presets]);

  const handlePresetClick = (presetKey: string) => {
    const preset = presets.find(p => p.key === presetKey);
    if (preset) {
      onChange(preset.ini, preset.fim);
      handleClose();
    }
  };

  return (
    <>
      <TextField
        value={label}
        onClick={handleClick}
        size="small"
        autoComplete="off"
        slotProps={{
          input: {
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <CalendarMonthRounded sx={{ fontSize: 18, color: (dataInicio || dataFim) ? 'primary.main' : 'text.disabled' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <KeyboardArrowDownRounded sx={{ 
                  fontSize: 20, 
                  color: 'text.disabled',
                  transform: open ? 'rotate(180deg)' : 'none',
                  transition: '0.2s'
                }} />
              </InputAdornment>
            ),
            sx: { 
              ...filterInputRootSx, 
              cursor: 'pointer',
              pr: 1,
              '& input': { cursor: 'pointer' },
              ...( (dataInicio || dataFim) ? { color: 'primary.main', fontWeight: 700 } : {} )
            }
          }
        }}
        sx={{ width: 200 }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: { mt: 0.5, borderRadius: '6px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid', borderColor: 'divider' }
          }
        }}
      >
        <Stack direction="row" divider={<Divider orientation="vertical" flexItem />}>
          <Box sx={{ py: 1, minWidth: 160 }}>
            <Typography variant="overline" sx={{ px: 2, py: 0.5, display: 'block', color: 'text.disabled', fontWeight: 800, fontSize: 10 }}>
              ATALHOS
            </Typography>
            {presets.map((p) => (
              <MenuItem 
                key={p.key} 
                onClick={() => handlePresetClick(p.key)}
                selected={activePresetKey === p.key}
                sx={{ fontSize: 13, py: 0.75, px: 2, fontWeight: activePresetKey === p.key ? 700 : 500 }}
              >
                {p.label}
              </MenuItem>
            ))}
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={() => { onClear(); handleClose(); }} sx={{ fontSize: 13, color: 'text.secondary' }}>
              Todo período
            </MenuItem>
          </Box>

          <Box sx={{ p: 2, minWidth: 240 }}>
            <Typography variant="overline" sx={{ mb: 1.5, display: 'block', color: 'text.disabled', fontWeight: 800, fontSize: 10 }}>
              PERSONALIZADO
            </Typography>
            <Stack spacing={2}>
              <DatePicker
                label="De"
                value={dataInicio ? parseISO(dataInicio) : null}
                onChange={(d) => onChange(d && isValid(d) ? format(d, 'yyyy-MM-dd') : '', dataFim)}
                format="dd/MM/yyyy"
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              <DatePicker
                label="Até"
                value={dataFim ? parseISO(dataFim) : null}
                onChange={(d) => onChange(dataInicio, d && isValid(d) ? format(d, 'yyyy-MM-dd') : '')}
                format="dd/MM/yyyy"
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Stack>
          </Box>
        </Stack>
      </Popover>
    </>
  );
}
