import { useState } from 'react';
import {
  Box, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import { useTableRelations } from '@/hooks/use-database-schema';
import { ColumnDetailDrawer } from '@/components/database/column-detail-drawer';
import type { ColunaSchema, CampoDicionario, FieldTypesMap } from '@/types/database-types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = Record<string, any>;

function FkRelations({ tableName }: { tableName: string }) {
  const { data: relations } = useTableRelations(tableName);
  const fkList = Array.isArray(relations) ? relations as R[] : [];
  if (fkList.length === 0) return null;

  return (
    <Box sx={{ mt: 1, flexShrink: 0 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>
        Foreign Keys ({fkList.length})
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.25 }}>Coluna</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.25 }}>Referencia</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.25 }}>Coluna Ref</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fkList.map((fk, i) => (
            <TableRow key={`${String(fk.ForeignKeyName)}-${i}`} hover>
              <TableCell sx={{ fontSize: 11, py: 0.15, fontFamily: 'monospace' }}>
                {String(fk.ParentColumn)}
              </TableCell>
              <TableCell sx={{ fontSize: 11, py: 0.15, fontFamily: 'monospace', fontWeight: 700 }}>
                {String(fk.ReferencedTable)}
              </TableCell>
              <TableCell sx={{ fontSize: 11, py: 0.15, fontFamily: 'monospace' }}>
                {String(fk.ReferencedColumn)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export interface TableSchemaPanelProps {
  tableName: string;
  columns: ColunaSchema[];
  pkCols: string[];
  dictMap: Map<string, CampoDicionario>;
  fkMap: Map<string, string>;
  dictLoading: boolean;
  typeLabels: FieldTypesMap;
  presLabels: FieldTypesMap;
}

export function TableSchemaPanel({
  tableName, columns, pkCols, dictMap, fkMap, dictLoading, typeLabels, presLabels,
}: TableSchemaPanelProps) {
  const [selectedCol, setSelectedCol] = useState<ColunaSchema | null>(null);

  return (
    <>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>Coluna</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>Descricao</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>Null</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>Default</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {columns.map((col) => {
              const dict = dictMap.get(col.COLUMN_NAME);
              return (
                <TableRow
                  key={col.COLUMN_NAME} hover
                  onClick={() => setSelectedCol(col)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell sx={{ fontSize: 11, py: 0.25 }}>
                    {col.ORDINAL_POSITION}
                  </TableCell>
                  <TableCell sx={{
                    fontSize: 11, py: 0.25, fontFamily: 'monospace',
                    fontWeight: pkCols.includes(col.COLUMN_NAME) ? 700 : 400,
                  }}>
                    {col.COLUMN_NAME}
                    {pkCols.includes(col.COLUMN_NAME) && (
                      <Chip label="PK" size="small" color="primary"
                        sx={{ ml: 0.5, height: 16, fontSize: 9 }} />
                    )}
                    {dict?.fkTable && (
                      <Chip label="FK" size="small" variant="outlined"
                        sx={{ ml: 0.5, height: 16, fontSize: 9 }} />
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: 11, py: 0.25 }}>{col.DATA_TYPE}</TableCell>
                  <TableCell sx={{
                    fontSize: 11, py: 0.25, maxWidth: 180, color: 'text.secondary',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {dict?.descricao ?? '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: 11, py: 0.25 }}>{col.IS_NULLABLE}</TableCell>
                  <TableCell sx={{
                    fontSize: 11, py: 0.25, maxWidth: 120,
                    overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {col.COLUMN_DEFAULT ?? '-'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <FkRelations tableName={tableName} />
      </Box>

      <ColumnDetailDrawer
        column={selectedCol}
        dict={selectedCol ? (dictMap.get(selectedCol.COLUMN_NAME) ?? null) : null}
        dictLoading={dictLoading}
        tableName={tableName}
        pkCols={pkCols}
        fkMap={fkMap}
        typeLabels={typeLabels}
        presLabels={presLabels}
        onClose={() => setSelectedCol(null)}
      />
    </>
  );
}
