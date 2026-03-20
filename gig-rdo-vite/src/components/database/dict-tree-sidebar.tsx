import { useState, useEffect } from 'react';
import {
  Paper, TextField, Typography, CircularProgress, Alert,
  List, ListItemButton, Collapse, Box, IconButton, Tooltip,
} from '@mui/material';
import { ExpandMore, ChevronRight, Search as SearchIcon } from '@mui/icons-material';
import { usePrefetchTable } from '@/hooks/use-dictionary-fields';
import { FieldItems, TriggerItems } from '@/components/database/dict-tree-items';
import type { TabelaDicionario, CampoDicionario, TableTrigger } from '@/types/database-types';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  filtered: TabelaDicionario[];
  isLoading: boolean;
  error: unknown;
  selected: string | null;
  onSelectTable: (name: string) => void;
  fields: CampoDicionario[];
  fieldsLoading: boolean;
  triggers: TableTrigger[];
  selectedField: string | null;
  selectedTrigger: string | null;
  onSelectField: (name: string) => void;
  onSelectTrigger: (name: string) => void;
  onGlobalSearch: () => void;
  isSearchMode: boolean;
}


type Group = 'campos' | 'triggers';
const arrow = { fontSize: 14, color: 'text.secondary' } as const;
const grpArrow = { fontSize: 12, mr: 0.3, color: 'text.secondary' } as const;

export function DictTreeSidebar({
  search, onSearchChange, filtered, isLoading, error,
  selected, onSelectTable, fields, fieldsLoading, triggers,
  selectedField, selectedTrigger,
  onSelectField, onSelectTrigger, onGlobalSearch, isSearchMode,
}: Props) {
  const [expanded, setExpanded] = useState<Set<Group>>(new Set(['campos']));
  const prefetch = usePrefetchTable();

  useEffect(() => {
    setExpanded(new Set(['campos']));
  }, [selected]);

  const toggleGroup = (g: Group) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(g) ? next.delete(g) : next.add(g);
      return next;
    });
  };

  return (
    <Paper sx={{
      width: 300, flexShrink: 0, p: 1,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5, flexShrink: 0 }}>
        <TextField
          size="small" fullWidth placeholder="Buscar tabelas..."
          value={search} onChange={(e) => onSearchChange(e.target.value)}
          slotProps={{ input: { sx: { fontSize: 12 } } }}
        />
        <Tooltip title="Busca Global" arrow>
          <IconButton size="small" onClick={onGlobalSearch}
            color={isSearchMode ? 'primary' : 'default'}
            sx={{ flexShrink: 0 }}>
            <SearchIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>
      {isLoading && <CircularProgress size={16} sx={{ mx: 'auto', my: 1 }} />}
      {!!error && <Alert severity="warning" sx={{ mb: 0.5, py: 0 }}>Indisponivel</Alert>}
      <Typography variant="caption" color="text.secondary"
        sx={{ px: 0.5, fontSize: 10, flexShrink: 0 }}>
        {filtered.length} tabelas
      </Typography>

      <List dense disablePadding sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {filtered.slice(0, 300).map((t) => {
          const isSel = selected === t.nomeTabela;
          return (
            <Box key={t.nomeTabela}>
              <ListItemButton
                selected={isSel && !selectedField && !selectedTrigger}
                onClick={() => onSelectTable(t.nomeTabela)}
                onMouseEnter={() => prefetch(t.nomeTabela)}
                sx={{ borderRadius: 0.5, py: 0.15, pl: 0.5, gap: 0.3 }}
              >
                {isSel
                  ? <ExpandMore sx={arrow} />
                  : <ChevronRight sx={arrow} />}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{
                    fontSize: 11, fontFamily: 'monospace',
                    fontWeight: isSel ? 700 : 400,
                  }}>
                    {t.nomeTabela}
                  </Typography>
                  <Typography sx={{
                    fontSize: 9, color: 'text.secondary',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {t.descricao}
                  </Typography>
                </Box>
              </ListItemButton>

              {isSel && (
                <Box sx={{ pl: 1.5 }}>
                  <ListItemButton
                    onClick={() => toggleGroup('campos')}
                    sx={{ py: 0.1, borderRadius: 0.5 }}
                  >
                    {expanded.has('campos')
                      ? <ExpandMore sx={grpArrow} />
                      : <ChevronRight sx={grpArrow} />}
                    <Typography sx={{ fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>
                      Campos {fieldsLoading ? '...' : `(${fields.length})`}
                    </Typography>
                  </ListItemButton>
                  <Collapse in={expanded.has('campos')} unmountOnExit>
                    {fieldsLoading
                      ? <CircularProgress size={12} sx={{ ml: 3, my: 0.5 }} />
                      : <FieldItems
                          fields={fields}
                          selectedField={selectedField} onSelect={onSelectField}
                        />}
                  </Collapse>

                  <ListItemButton
                    onClick={() => toggleGroup('triggers')}
                    sx={{ py: 0.1, borderRadius: 0.5 }}
                  >
                    {expanded.has('triggers')
                      ? <ExpandMore sx={grpArrow} />
                      : <ChevronRight sx={grpArrow} />}
                    <Typography sx={{ fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>
                      Triggers ({triggers.length})
                    </Typography>
                  </ListItemButton>
                  <Collapse in={expanded.has('triggers')} unmountOnExit>
                    <TriggerItems
                      triggers={triggers}
                      selectedTrigger={selectedTrigger}
                      onSelect={onSelectTrigger}
                    />
                  </Collapse>
                </Box>
              )}
            </Box>
          );
        })}
      </List>
    </Paper>
  );
}

