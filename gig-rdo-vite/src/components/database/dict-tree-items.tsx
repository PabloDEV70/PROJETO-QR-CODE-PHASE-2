import { memo } from 'react';
import { Typography, Chip, List, ListItemButton } from '@mui/material';
import type { CampoDicionario, TableTrigger } from '@/types/database-types';

export const FieldItems = memo(function FieldItems({ fields, selectedField, onSelect }: {
  fields: CampoDicionario[];
  selectedField: string | null;
  onSelect: (name: string) => void;
}) {
  return (
    <List dense disablePadding>
      {fields.map((f) => (
        <ListItemButton
          key={f.nucampo}
          selected={selectedField === f.nomeCampo}
          onClick={() => onSelect(f.nomeCampo)}
          sx={{ py: 0.05, pl: 2.5, borderRadius: 0.5, gap: 0.3 }}
        >
          <Typography sx={{
            fontSize: 10, fontFamily: 'monospace',
            fontWeight: f.isPk ? 700 : 400,
            flex: 1, overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {f.nomeCampo}
          </Typography>
          <Typography sx={{ fontSize: 8, color: 'text.disabled', flexShrink: 0 }}>
            {f.tipo}
          </Typography>
          {f.isPk && <Chip label="PK" size="small" color="primary"
            sx={{ height: 12, fontSize: 7, ml: 0.2 }} />}
          {f.fkTable && <Chip label="FK" size="small" variant="outlined"
            sx={{ height: 12, fontSize: 7, ml: 0.2 }} />}
          {f.qtdOpcoes > 0 && <Chip label={String(f.qtdOpcoes)} size="small"
            color="info" variant="outlined"
            sx={{ height: 12, fontSize: 7, ml: 0.2, minWidth: 0 }} />}
        </ListItemButton>
      ))}
    </List>
  );
});

export const TriggerItems = memo(function TriggerItems({ triggers, selectedTrigger, onSelect }: {
  triggers: TableTrigger[];
  selectedTrigger: string | null;
  onSelect: (name: string) => void;
}) {
  if (triggers.length === 0) {
    return (
      <Typography sx={{ fontSize: 9, color: 'text.disabled', pl: 2.5, py: 0.3 }}>
        Nenhuma trigger
      </Typography>
    );
  }
  return (
    <List dense disablePadding>
      {triggers.map((tr) => (
        <ListItemButton
          key={tr.nome}
          selected={selectedTrigger === tr.nome}
          onClick={() => onSelect(tr.nome)}
          sx={{ py: 0.05, pl: 2.5, borderRadius: 0.5, gap: 0.3 }}
        >
          <Typography sx={{
            fontSize: 10, fontFamily: 'monospace', flex: 1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {tr.nome}
          </Typography>
          <Chip
            label={tr.ativo ? 'ON' : 'OFF'} size="small"
            color={tr.ativo ? 'success' : 'error'}
            variant={tr.ativo ? 'filled' : 'outlined'}
            sx={{ height: 14, fontSize: 7 }}
          />
        </ListItemButton>
      ))}
    </List>
  );
});
