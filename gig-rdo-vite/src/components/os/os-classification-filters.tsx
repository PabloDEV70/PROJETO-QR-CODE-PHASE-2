import { useMemo } from 'react';
import { Stack, FormControl, Select, MenuItem, InputLabel, Chip } from '@mui/material';
import type { OsColabServico } from '@/types/os-list-types';

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface OsClassificationFiltersProps {
  servicos: OsColabServico[];
  tipo: string;
  manutencao: string;
  local: string;
  onTipoChange: (v: string) => void;
  onManutencaoChange: (v: string) => void;
  onLocalChange: (v: string) => void;
}

function buildOptions(
  servicos: OsColabServico[],
  rawKey: keyof OsColabServico,
  labelKey: keyof OsColabServico,
): FilterOption[] {
  const map = new Map<string, { label: string; count: number }>();
  for (const s of servicos) {
    const raw = s[rawKey] as string | null;
    if (!raw) continue;
    const existing = map.get(raw);
    if (existing) {
      existing.count++;
    } else {
      map.set(raw, { label: (s[labelKey] as string) ?? raw, count: 1 });
    }
  }
  return Array.from(map.entries())
    .map(([value, { label, count }]) => ({ value, label, count }))
    .sort((a, b) => b.count - a.count);
}

const selectSx = { fontWeight: 600, fontSize: 12, height: 30, borderRadius: 2 };

export function OsClassificationFilters({
  servicos, tipo, manutencao, local,
  onTipoChange, onManutencaoChange, onLocalChange,
}: OsClassificationFiltersProps) {
  const tipoOpts = useMemo(() => buildOptions(servicos, 'TIPO', 'tipoLabel'), [servicos]);
  const manuOpts = useMemo(
    () => buildOptions(servicos, 'MANUTENCAO', 'manutencaoLabel'), [servicos],
  );
  const localOpts = useMemo(
    () => buildOptions(servicos, 'localManutencao', 'localManutencaoLabel'), [servicos],
  );

  const activeCount = [tipo, manutencao, local].filter(Boolean).length;

  if (servicos.length === 0) return null;

  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
      <FormControl size="small" sx={{ minWidth: 110 }}>
        <InputLabel sx={{ fontSize: 12 }}>Tipo</InputLabel>
        <Select value={tipo} label="Tipo" onChange={(e) => onTipoChange(e.target.value)} sx={selectSx}>
          <MenuItem value="">Todos</MenuItem>
          {tipoOpts.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label} ({o.count})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel sx={{ fontSize: 12 }}>Manutencao</InputLabel>
        <Select value={manutencao} label="Manutencao"
          onChange={(e) => onManutencaoChange(e.target.value)} sx={selectSx}>
          <MenuItem value="">Todos</MenuItem>
          {manuOpts.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label} ({o.count})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel sx={{ fontSize: 12 }}>Local</InputLabel>
        <Select value={local} label="Local"
          onChange={(e) => onLocalChange(e.target.value)} sx={selectSx}>
          <MenuItem value="">Todos</MenuItem>
          {localOpts.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label} ({o.count})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {activeCount > 0 && (
        <Chip
          size="small" variant="outlined" color="primary"
          label={`${activeCount} filtro${activeCount > 1 ? 's' : ''}`}
          onDelete={() => { onTipoChange(''); onManutencaoChange(''); onLocalChange(''); }}
          sx={{ fontSize: 11 }}
        />
      )}
    </Stack>
  );
}
