import { useMemo, useState } from 'react';
import {
  Drawer, Typography, Box, IconButton, Tooltip,
  Table, TableBody, Collapse, Button,
} from '@mui/material';
import { ContentCopy, ExpandMore, ExpandLess } from '@mui/icons-material';
import { copyToClipboard } from '@/utils/clipboard';
import { RecordFieldRow } from '@/components/database/record-field-row';
import type { CampoDicionario } from '@/types/database-types';
import type { FkDetail } from '@/hooks/use-database';

interface RecordPreviewDrawerProps {
  row: Record<string, unknown> | null;
  tableName: string;
  dictMap: Map<string, CampoDicionario>;
  pkCols: string[];
  fkDetailMap: Map<string, FkDetail>;
  onClose: () => void;
}

function buildPkLabel(row: Record<string, unknown>, pkCols: string[]): string {
  if (pkCols.length === 0) return '';
  return pkCols.map((c) => `${c}=${row[c] ?? '?'}`).join(', ');
}

function buildCopyText(
  row: Record<string, unknown>,
  dictMap: Map<string, CampoDicionario>,
): string {
  return Object.entries(row)
    .filter(([k]) => k !== '__rowId')
    .map(([k, v]) => {
      const label = dictMap.get(k)?.descricao ?? k;
      return `${label} (${k}): ${v ?? '—'}`;
    })
    .join('\n');
}

type FieldEntry = { key: string; dict: CampoDicionario | null; ordem: number };

function sortFields(
  row: Record<string, unknown>,
  dictMap: Map<string, CampoDicionario>,
): { regular: FieldEntry[]; system: FieldEntry[] } {
  const regular: FieldEntry[] = [];
  const system: FieldEntry[] = [];

  for (const key of Object.keys(row)) {
    if (key === '__rowId') continue;
    const dict = dictMap.get(key) ?? null;
    const ordem = dict?.ordem ?? 99999;
    const entry: FieldEntry = { key, dict, ordem };
    if (dict?.sistema) system.push(entry);
    else regular.push(entry);
  }
  regular.sort((a, b) => a.ordem - b.ordem);
  system.sort((a, b) => a.ordem - b.ordem);
  return { regular, system };
}

export function RecordPreviewDrawer({
  row, tableName, dictMap, pkCols, fkDetailMap, onClose,
}: RecordPreviewDrawerProps) {
  const [sysOpen, setSysOpen] = useState(false);

  const { regular, system } = useMemo(
    () => row ? sortFields(row, dictMap) : { regular: [], system: [] },
    [row, dictMap],
  );

  const pkLabel = row ? buildPkLabel(row, pkCols) : '';

  const handleCopy = () => {
    if (row) copyToClipboard(buildCopyText(row, dictMap));
  };

  return (
    <Drawer anchor="right" open={!!row} onClose={onClose}
      slotProps={{ paper: { sx: { width: 420, display: 'flex', flexDirection: 'column' } } }}>
      <Box sx={{ px: 2, pt: 2, pb: 1, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16 }}>
            {tableName}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Tooltip title="Copiar campos" arrow>
            <IconButton size="small" onClick={handleCopy}>
              <ContentCopy sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>
        {pkLabel && (
          <Typography sx={{ fontSize: 11, color: 'text.secondary', fontFamily: 'monospace' }}>
            {pkLabel}
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', px: 2, pb: 2 }}>
        <Table size="small">
          <TableBody>
            {regular.map(({ key, dict }) => (
              <RecordFieldRow
                key={key} fieldName={key} value={row?.[key]}
                dict={dict} isPk={pkCols.includes(key)} fkDetail={fkDetailMap.get(key) ?? null}
              />
            ))}
          </TableBody>
        </Table>

        {system.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Button size="small" onClick={() => setSysOpen((p) => !p)}
              startIcon={sysOpen ? <ExpandLess /> : <ExpandMore />}
              sx={{ fontSize: 11, textTransform: 'none', color: 'text.secondary' }}>
              Campos sistema ({system.length})
            </Button>
            <Collapse in={sysOpen}>
              <Table size="small">
                <TableBody>
                  {system.map(({ key, dict }) => (
                    <RecordFieldRow
                      key={key} fieldName={key} value={row?.[key]}
                      dict={dict} isPk={pkCols.includes(key)} fkDetail={fkDetailMap.get(key) ?? null}
                    />
                  ))}
                </TableBody>
              </Table>
            </Collapse>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
