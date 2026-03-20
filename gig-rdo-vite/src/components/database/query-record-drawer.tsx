import {
  Drawer, Typography, Box, IconButton, Tooltip,
  Table, TableBody, TableRow, TableCell,
} from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { copyToClipboard } from '@/utils/clipboard';
import { FkValuePreview } from '@/components/database/fk-value-preview';
import { useTableRelations, useTableKeys } from '@/hooks/use-database-schema';
import type { FkDetail } from '@/hooks/use-database';
import { useDictionaryTableFields } from '@/hooks/use-dictionary-fields';
import { useMemo } from 'react';

interface QueryRecordDrawerProps {
  row: Record<string, unknown> | null;
  tableName: string;
  onClose: () => void;
}

const cellSx = { fontSize: 12, py: 0.4, verticalAlign: 'top' } as const;
const labelSx = { ...cellSx, width: 180, fontWeight: 600, color: 'text.secondary' } as const;

function buildCopyText(row: Record<string, unknown>): string {
  return Object.entries(row).map(([k, v]) => `${k}: ${v ?? '—'}`).join('\n');
}

export function QueryRecordDrawer({ row, tableName, onClose }: QueryRecordDrawerProps) {
  const isRealTable = tableName !== 'Resultado';
  const { data: relations } = useTableRelations(isRealTable ? tableName : null);
  const { data: keys } = useTableKeys(isRealTable ? tableName : null);
  const { data: dictFields } = useDictionaryTableFields(isRealTable ? tableName : null);

  const fkDetailMap = useMemo(() => {
    const m = new Map<string, FkDetail>();
    if (relations) {
      for (const rel of relations) {
        const parent = String(rel.ParentColumn ?? '');
        const refTable = String(rel.ReferencedTable ?? '');
        const refCol = String(rel.ReferencedColumn ?? '');
        if (parent && refTable && refCol) m.set(parent, { table: refTable, column: refCol });
      }
    }
    if (dictFields) {
      for (const f of dictFields) {
        if (f.fkTable && !m.has(f.nomeCampo)) {
          m.set(f.nomeCampo, { table: f.fkTable, column: f.nomeCampo });
        }
      }
    }
    return m;
  }, [relations, dictFields]);

  const dictMap = useMemo(() => {
    const m = new Map<string, string>();
    if (dictFields) dictFields.forEach((f) => m.set(f.nomeCampo, f.descricao));
    return m;
  }, [dictFields]);

  const pkCols = useMemo(
    () => Array.isArray(keys) ? keys.map((k) => k.COLUMN_NAME) : [],
    [keys],
  );

  const entries = row ? Object.entries(row) : [];

  const handleCopy = () => { if (row) copyToClipboard(buildCopyText(row)); };

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
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', px: 2, pb: 2 }}>
        <Table size="small">
          <TableBody>
            {entries.map(([key, value]) => {
              const fk = fkDetailMap.get(key);
              const label = dictMap.get(key);
              const isPk = pkCols.includes(key);
              return (
                <TableRow key={key} hover>
                  <TableCell sx={labelSx}>
                    {label ? (
                      <>
                        {label}
                        <Typography component="span"
                          sx={{ fontSize: 10, color: 'text.disabled', ml: 0.5 }}>
                          ({key})
                        </Typography>
                      </>
                    ) : key}
                    {isPk && (
                      <Typography component="span"
                        sx={{ fontSize: 9, ml: 0.5, color: 'primary.main', fontWeight: 700 }}>
                        PK
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={cellSx}>
                    {value == null ? (
                      <Typography component="span"
                        sx={{ fontSize: 12, color: 'text.disabled' }}>—</Typography>
                    ) : String(value)}
                    {fk && value != null && (
                      <FkValuePreview
                        refTable={fk.table} refColumn={fk.column} value={value}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Drawer>
  );
}
