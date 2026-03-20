import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Typography, Checkbox, FormControlLabel, Switch, Stack,
  LinearProgress, Chip, Avatar, IconButton, Tooltip,
} from '@mui/material';
import { SelectAll, Deselect } from '@mui/icons-material';
import { useFuncionariosLista } from '@/hooks/use-funcionarios-lista';
import { getFuncionarioFotoUrl } from '@/api/funcionarios';

interface ColaboradorDepartamentoFilterProps {
  coddep: string | null;
  codparc: string | null;
  onUpdateCodparc: (v: string | null) => void;
}

type Mode = 'include' | 'exclude';

function parseUrlValue(codparc: string | null): { mode: Mode; ids: Set<number> } {
  if (!codparc) return { mode: 'include', ids: new Set() };
  const isExclude = codparc.startsWith('!');
  const raw = isExclude ? codparc.slice(1) : codparc;
  const ids = new Set(raw.split(',').map(Number).filter((n) => !isNaN(n) && n > 0));
  return { mode: isExclude ? 'exclude' : 'include', ids };
}

function buildUrlValue(mode: Mode, selected: Set<number>, allIds: number[]): string | null {
  if (selected.size === 0) return null;
  if (mode === 'include' && selected.size === allIds.length) return null;
  const prefix = mode === 'exclude' ? '!' : '';
  return prefix + Array.from(selected).join(',');
}

export function ColaboradorDepartamentoFilter({
  coddep, codparc, onUpdateCodparc,
}: ColaboradorDepartamentoFilterProps) {
  const { data, isLoading } = useFuncionariosLista(coddep);
  const items = useMemo(() => data?.data ?? [], [data]);
  const allIds = useMemo(() => items.map((i) => i.codparc), [items]);

  const [mode, setMode] = useState<Mode>('include');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Sync from URL → local state
  useEffect(() => {
    const parsed = parseUrlValue(codparc);
    setMode(parsed.mode);
    setSelected(parsed.ids);
  }, [codparc]);

  const emitChange = useCallback(
    (m: Mode, sel: Set<number>) => {
      onUpdateCodparc(buildUrlValue(m, sel, allIds));
    },
    [onUpdateCodparc, allIds],
  );

  const handleToggleMode = useCallback(() => {
    const nextMode: Mode = mode === 'include' ? 'exclude' : 'include';
    const inverted = new Set(allIds.filter((id) => !selected.has(id)));
    setMode(nextMode);
    setSelected(inverted);
    emitChange(nextMode, inverted);
  }, [mode, selected, allIds, emitChange]);

  const handleToggleItem = useCallback(
    (id: number) => {
      const next = new Set(selected);
      if (next.has(id)) next.delete(id); else next.add(id);
      setSelected(next);
      emitChange(mode, next);
    },
    [selected, mode, emitChange],
  );

  const handleSelectAll = useCallback(() => {
    const all = new Set(allIds);
    setSelected(all);
    emitChange(mode, all);
  }, [allIds, mode, emitChange]);

  const handleSelectNone = useCallback(() => {
    const empty = new Set<number>();
    setSelected(empty);
    emitChange(mode, empty);
  }, [mode, emitChange]);

  const summaryLabel = useMemo(() => {
    if (selected.size === 0) return null;
    if (mode === 'include') {
      if (selected.size === allIds.length) return null;
      return `Incluindo ${selected.size} colab.`;
    }
    return `Excluindo ${selected.size} colab.`;
  }, [mode, selected, allIds]);

  return (
    <Box>
      <FilterHeader
        coddep={coddep} mode={mode} summaryLabel={summaryLabel}
        onToggleMode={handleToggleMode}
        onSelectAll={handleSelectAll} onSelectNone={handleSelectNone}
      />
      {isLoading && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
      {!isLoading && (
        <CheckList
          items={items} selected={selected} onToggle={handleToggleItem}
        />
      )}
    </Box>
  );
}

function FilterHeader({ coddep, mode, summaryLabel, onToggleMode, onSelectAll, onSelectNone }: {
  coddep: string | null;
  mode: Mode;
  summaryLabel: string | null;
  onToggleMode: () => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
}) {
  return (
    <Stack spacing={0.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="caption" color="text.secondary">
          {coddep ? 'Colaboradores do Departamento' : 'Colaboradores'}
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title="Selecionar todos"><IconButton size="small" onClick={onSelectAll}>
            <SelectAll sx={{ fontSize: 16 }} />
          </IconButton></Tooltip>
          <Tooltip title="Limpar selecao"><IconButton size="small" onClick={onSelectNone}>
            <Deselect sx={{ fontSize: 16 }} />
          </IconButton></Tooltip>
        </Stack>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        <FormControlLabel
          control={<Switch size="small" checked={mode === 'exclude'} onChange={onToggleMode} />}
          label={
            <Typography variant="caption">
              {mode === 'include' ? 'Incluir selecionados' : 'Excluir selecionados'}
            </Typography>
          }
          sx={{ m: 0 }}
        />
        {summaryLabel && (
          <Chip label={summaryLabel} size="small" variant="outlined"
            color={mode === 'exclude' ? 'warning' : 'primary'} sx={{ height: 20, fontSize: 11 }}
          />
        )}
      </Stack>
    </Stack>
  );
}

function CheckList({ items, selected, onToggle }: {
  items: { codparc: number; nomeparc: string; temFoto: boolean;
    departamento: string | null; cargo: string | null }[];
  selected: Set<number>;
  onToggle: (id: number) => void;
}) {
  return (
    <Box sx={{ maxHeight: 280, overflowY: 'auto', mt: 1 }}>
      {items.map((item) => (
        <Stack key={item.codparc} direction="row" alignItems="center" spacing={1}
          sx={{ py: 0.4, px: 0.5, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
        >
          <Checkbox size="small" checked={selected.has(item.codparc)}
            onChange={() => onToggle(item.codparc)} sx={{ p: 0.25 }}
          />
          <Avatar src={item.temFoto ? getFuncionarioFotoUrl(item.codparc) : undefined}
            sx={{ width: 28, height: 28, fontSize: 12 }}>
            {item.nomeparc.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontSize: 13, lineHeight: 1.3 }}>
              {item.nomeparc}
            </Typography>
            {(item.departamento || item.cargo) && (
              <Typography variant="caption" color="text.secondary" noWrap display="block"
                sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
                {[item.departamento, item.cargo].filter(Boolean).join(' · ')}
              </Typography>
            )}
          </Box>
        </Stack>
      ))}
      {items.length === 0 && (
        <Typography variant="caption" color="text.secondary"
          sx={{ py: 2, textAlign: 'center', display: 'block' }}>
          Nenhum colaborador encontrado
        </Typography>
      )}
    </Box>
  );
}
