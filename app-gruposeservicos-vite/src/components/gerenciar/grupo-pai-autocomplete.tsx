import { Autocomplete, TextField, Box, Typography } from '@mui/material';
import { Folder, FolderOpen } from '@mui/icons-material';
import { useMemo } from 'react';
import type { ArvoreGrupo } from '@/types/grupo-types';

interface GrupoOption {
  codGrupoProd: number;
  descrGrupoProd: string;
  grau: number;
  depth: number;
  index: string;
  path: string;
  hasChildren: boolean;
}

function flatten(nodes: ArvoreGrupo[], depth = 0, path = '', parentIndex = ''): GrupoOption[] {
  const result: GrupoOption[] = [];
  nodes.forEach((node, i) => {
    if (node.ativo === 'N') return;
    const pad = depth === 0 ? 2 : 3;
    const idx = parentIndex
      ? `${parentIndex}.${String(i + 1).padStart(pad, '0')}`
      : String(i + 1).padStart(2, '0');
    const p = path ? `${path} > ${node.descrGrupoProd}` : node.descrGrupoProd;
    result.push({
      codGrupoProd: node.codGrupoProd,
      descrGrupoProd: node.descrGrupoProd,
      grau: node.grau,
      depth,
      index: idx,
      path: p,
      hasChildren: node.children.length > 0,
    });
    if (node.children.length > 0) {
      result.push(...flatten(node.children, depth + 1, p, idx));
    }
  });
  return result;
}

interface Props {
  arvore: ArvoreGrupo[];
  value: number | null;
  onChange: (codGrupo: number | null) => void;
  excludeCodGrupo?: number;
  label?: string;
  helperText?: string;
  disabled?: boolean;
}

export function GrupoPaiAutocomplete({ arvore, value, onChange, excludeCodGrupo, label = 'Grupo Pai', helperText, disabled }: Props) {
  const options = useMemo(() => {
    const flat = flatten(arvore);
    return excludeCodGrupo ? flat.filter((o) => o.codGrupoProd !== excludeCodGrupo) : flat;
  }, [arvore, excludeCodGrupo]);

  const selected = options.find((o) => o.codGrupoProd === value) ?? null;

  return (
    <Autocomplete
      options={options}
      value={selected}
      onChange={(_, opt) => onChange(opt?.codGrupoProd ?? null)}
      getOptionLabel={(o) => `${o.index}  ${o.descrGrupoProd}`}
      isOptionEqualToValue={(a, b) => a.codGrupoProd === b.codGrupoProd}
      filterOptions={(opts, { inputValue }) => {
        const q = inputValue.toLowerCase();
        return opts.filter((o) =>
          o.descrGrupoProd.toLowerCase().includes(q) ||
          String(o.codGrupoProd).includes(q) ||
          o.index.includes(q)
        );
      }}
      renderOption={(props, option) => {
        const { key, ...rest } = props;
        const Icon = option.hasChildren ? FolderOpen : Folder;
        const iconColor = option.hasChildren ? '#f9a825' : '#1976d2';
        return (
          <Box component="li" key={key} {...rest}
            sx={{ '&.MuiAutocomplete-option': { py: 0.3, px: 1, pl: 1 + option.depth * 2, minHeight: 30, gap: 0.6 } }}
          >
            <Icon sx={{ fontSize: 16, color: iconColor, flexShrink: 0 }} />
            <Typography component="span" sx={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: 'text.secondary', flexShrink: 0, minWidth: option.depth === 0 ? 20 : option.depth === 1 ? 38 : 54 }}>
              {option.index}
            </Typography>
            <Typography component="span" sx={{ fontSize: 12, fontWeight: option.depth === 0 ? 700 : 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {option.descrGrupoProd}
            </Typography>
            <Typography component="span" sx={{ fontSize: 9, color: 'text.disabled', fontFamily: 'monospace', flexShrink: 0 }}>
              {option.codGrupoProd}
            </Typography>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} helperText={helperText} size="small" placeholder="Buscar grupo..." />
      )}
      disabled={disabled}
      size="small"
      noOptionsText="Nenhum grupo encontrado"
      clearText="Limpar (raiz)"
      slotProps={{ listbox: { sx: { maxHeight: 360 } } }}
    />
  );
}
