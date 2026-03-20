import { ToggleButton, ToggleButtonGroup, Box } from '@mui/material';
import { usePainelStore } from '@/stores/painel-store';
import { DEPARTAMENTO_MAP } from '@/utils/departamento-constants';

export function FiltroDepartamento() {
  const filter = usePainelStore((s) => s.departmentFilter);
  const setFilter = usePainelStore((s) => s.setDepartmentFilter);

  return (
    <Box sx={{ position: 'fixed', bottom: 16, left: 16, zIndex: 10 }}>
      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={(_, val: number | string | null) => setFilter(typeof val === 'number' ? val : null)}
        size="small"
        sx={{ bgcolor: 'background.paper', flexWrap: 'wrap' }}
      >
        <ToggleButton value="" sx={{ fontSize: '0.65rem', py: 0.5, px: 1 }}>
          Todos
        </ToggleButton>
        {Object.entries(DEPARTAMENTO_MAP).map(([key, info]) => (
          <ToggleButton key={key} value={Number(key)} sx={{ fontSize: '0.65rem', py: 0.5, px: 1 }}>
            {info.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
