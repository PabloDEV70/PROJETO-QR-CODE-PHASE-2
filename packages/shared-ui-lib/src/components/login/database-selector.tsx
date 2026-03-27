import { ToggleButton, ToggleButtonGroup, Typography, Stack } from '@mui/material';
import { Storage } from '@mui/icons-material';
import type { DatabaseEnv } from '../../types/auth-types';

const DB_OPTIONS: { value: DatabaseEnv; label: string; color: string }[] = [
  { value: 'PROD', label: 'Producao', color: '#2e7d32' },
  { value: 'TESTE', label: 'Teste', color: '#ed6c02' },
  { value: 'TREINA', label: 'Treina', color: '#0288d1' },
];

interface DatabaseSelectorProps {
  database: DatabaseEnv;
  onDatabaseChange: (db: DatabaseEnv) => void;
}

export function DatabaseSelector({ database, onDatabaseChange }: DatabaseSelectorProps) {
  return (
    <Stack spacing={1} alignItems="center">
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Storage sx={{ fontSize: 16, color: 'text.disabled' }} />
        <Typography variant="caption" color="text.secondary">Ambiente</Typography>
      </Stack>
      <ToggleButtonGroup
        value={database}
        exclusive
        onChange={(_, val: DatabaseEnv | null) => { if (val) onDatabaseChange(val); }}
        size="small"
        sx={{ width: '100%' }}
      >
        {DB_OPTIONS.map((opt) => (
          <ToggleButton
            key={opt.value}
            value={opt.value}
            sx={{
              flex: 1,
              fontSize: '0.75rem',
              py: 0.5,
              '&.Mui-selected': {
                bgcolor: `${opt.color}14`,
                color: opt.color,
                borderColor: `${opt.color}40`,
                '&:hover': { bgcolor: `${opt.color}20` },
              },
            }}
          >
            {opt.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
}
