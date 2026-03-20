import { useEffect, useRef } from 'react';
import { Box, Chip, CircularProgress, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { Build, Schedule, FiberManualRecord } from '@mui/icons-material';
import { getSrvStatusColor } from '@/utils/os-status-colors';
import { useOsServicos } from '@/hooks/use-os-servicos';
import type { OsServiceItem } from '@/types/os-types';

interface ServicePickerProps {
  nuos: number;
  selectedSequencia: number | null;
  onSelect: (s: OsServiceItem | null) => void;
  autoSelectSequencia?: number | null;
}

export function ServicePicker({ nuos, selectedSequencia, onSelect, autoSelectSequencia }: ServicePickerProps) {
  const { data: servicos = [], isLoading } = useOsServicos(nuos);
  const didAutoSelect = useRef(false);

  // Auto-select service for quick-resume
  useEffect(() => {
    if (didAutoSelect.current || !autoSelectSequencia || servicos.length === 0) return;
    const match = servicos.find((s) => s.SEQUENCIA === autoSelectSequencia);
    if (match) { onSelect(match); didAutoSelect.current = true; }
  }, [servicos, autoSelectSequencia, onSelect]);

  if (isLoading) return <CircularProgress size={20} />;
  if (servicos.length === 0) {
    return <Typography variant="body2" color="text.disabled">Nenhum servico vinculado</Typography>;
  }

  return (
    <List dense sx={{ maxHeight: 220, overflow: 'auto' }}>
      {servicos.map((s) => {
        const sel = s.SEQUENCIA === selectedSequencia;
        const srvColor = getSrvStatusColor(s.STATUS);
        const isExec = s.STATUS === 'E';
        const tempo = s.TEMPO != null && s.TEMPO > 0
          ? `${Math.floor(s.TEMPO / 60)}h${String(s.TEMPO % 60).padStart(2, '0')}m`
          : null;
        return (
          <ListItemButton
            key={`${s.NUOS}-${s.SEQUENCIA}`}
            selected={sel}
            onClick={() => onSelect(sel ? null : s)}
            sx={{ borderRadius: 1, mb: 0.5, py: 0.75 }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              {isExec ? (
                <FiberManualRecord sx={{ fontSize: 10, color: srvColor.bg }} />
              ) : (
                <Build sx={{ fontSize: 16, color: srvColor.bg, opacity: s.STATUS === 'F' ? 0.5 : 0.8 }} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    {s.nomeProduto ?? `Servico #${s.SEQUENCIA}`}
                  </Typography>
                  <Chip
                    label={s.statusLabel ?? srvColor.label}
                    size="small"
                    sx={{ height: 16, fontSize: '0.55rem', fontWeight: 700, bgcolor: srvColor.bg, color: srvColor.text }}
                  />
                </Box>
              }
              secondary={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.15 }}>
                  <Typography component="span" sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>
                    #{s.CODPROD}
                  </Typography>
                  {tempo && (
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
                      <Schedule sx={{ fontSize: 10, color: 'text.disabled' }} />
                      <Typography component="span" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                        {tempo}
                      </Typography>
                    </Box>
                  )}
                  {s.OBSERVACAO && (
                    <Typography component="span" sx={{ fontSize: '0.68rem', color: 'text.disabled', fontStyle: 'italic' }} noWrap>
                      {s.OBSERVACAO}
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItemButton>
        );
      })}
    </List>
  );
}
