import { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Snackbar } from '@mui/material';
import {
  ContentCopy, Code, DataObject, TableChart, GridOn,
} from '@mui/icons-material';
import { copyToClipboard } from '@/utils/clipboard';
import type { CampoDicionario } from '@/types/database-types';
import {
  toSqlCreate, toTypeScript, toJson, toMarkdown, toTsv,
} from '@/utils/table-structure-formatters';

interface DictCopyButtonsProps {
  tableName: string;
  fields: CampoDicionario[];
  pkCols: string[];
  fkMap: Map<string, string>;
}

const formats = [
  { label: 'SQL CREATE TABLE', icon: <Code sx={{ fontSize: 16 }} />, fn: toSqlCreate },
  { label: 'TypeScript Interface', icon: <DataObject sx={{ fontSize: 16 }} />, fn: toTypeScript },
  { label: 'JSON', icon: <ContentCopy sx={{ fontSize: 16 }} />, fn: toJson },
  { label: 'Markdown', icon: <TableChart sx={{ fontSize: 16 }} />, fn: toMarkdown },
  { label: 'Tab (Excel)', icon: <GridOn sx={{ fontSize: 16 }} />, fn: toTsv },
] as const;

export function DictCopyButtons({ tableName, fields, pkCols, fkMap }: DictCopyButtonsProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [toast, setToast] = useState(false);

  const handleCopy = async (fn: typeof formats[number]['fn']) => {
    const text = fn({ tableName, fields, pkCols, fkMap });
    copyToClipboard(text);
    setAnchorEl(null);
    setToast(true);
  };

  return (
    <>
      <IconButton
        size="small" disabled={fields.length === 0}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        title="Copiar estrutura"
        sx={{ width: 20, height: 20 }}
      >
        <ContentCopy sx={{ fontSize: 14 }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl} open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { minWidth: 200 } } }}
      >
        {formats.map((f) => (
          <MenuItem key={f.label} onClick={() => handleCopy(f.fn)} dense>
            <ListItemIcon sx={{ minWidth: 28 }}>{f.icon}</ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 13 }}>{f.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
      <Snackbar
        open={toast} autoHideDuration={2000} onClose={() => setToast(false)}
        message="Copiado!" anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}
