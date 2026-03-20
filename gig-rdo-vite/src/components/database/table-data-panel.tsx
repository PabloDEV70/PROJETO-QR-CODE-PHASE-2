import { useMemo, useState } from 'react';
import { Box, Alert } from '@mui/material';
import {
  DataGrid, GridToolbar,
  type GridColDef, type GridPaginationModel,
} from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { executeQuery } from '@/api/database';
import { useTableSchema, useTableKeys } from '@/hooks/use-database-schema';
import { dataGridPtBR } from '@/utils/datagrid-locale';
import { RecordPreviewDrawer } from '@/components/database/record-preview-drawer';
import type { ColunaSchema, CampoDicionario } from '@/types/database-types';
import type { FkDetail } from '@/hooks/use-database';

const NUMERIC = new Set([
  'int', 'bigint', 'decimal', 'numeric', 'float', 'money',
  'smallint', 'tinyint', 'real', 'smallmoney',
]);
const DATETIME = new Set([
  'datetime', 'datetime2', 'date', 'smalldatetime', 'datetimeoffset', 'time',
]);

function sqlType(dt: string): GridColDef['type'] {
  const t = dt.toLowerCase();
  if (NUMERIC.has(t)) return 'number';
  if (DATETIME.has(t)) return 'dateTime';
  if (t === 'bit') return 'boolean';
  return 'string';
}

function parseDateValue(value: unknown): Date | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) return value;
  const d = new Date(value as string);
  return Number.isNaN(d.getTime()) ? null : d;
}

function buildColumns(schema: ColunaSchema[]): GridColDef[] {
  return schema.map((col) => {
    const type = sqlType(col.DATA_TYPE);
    const base: GridColDef = {
      field: col.COLUMN_NAME,
      headerName: col.COLUMN_NAME,
      type,
      flex: 1,
      minWidth: 100,
      maxWidth: 300,
    };
    if (type === 'dateTime') {
      base.valueGetter = (value: unknown) => parseDateValue(value);
    }
    return base;
  });
}

function buildSql(tableName: string, pkCols: string[]): string {
  const orderBy = pkCols.length > 0
    ? `ORDER BY ${pkCols.map((c) => `[${c}] DESC`).join(', ')}`
    : '';
  return `SELECT TOP 200 * FROM [${tableName}] ${orderBy}`;
}

interface TableDataPanelProps {
  tableName: string;
  dictMap?: Map<string, CampoDicionario>;
  pkCols?: string[];
  fkDetailMap?: Map<string, FkDetail>;
}

export function TableDataPanel({ tableName, dictMap, pkCols: extPkCols, fkDetailMap }: TableDataPanelProps) {
  const { data: schema } = useTableSchema(tableName);
  const { data: keys } = useTableKeys(tableName);

  const derivedPkCols = useMemo(
    () => Array.isArray(keys) ? keys.map((k) => k.COLUMN_NAME) : [],
    [keys],
  );
  const pkCols = extPkCols ?? derivedPkCols;

  const sql = useMemo(() => buildSql(tableName, pkCols), [tableName, pkCols]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['db', 'table-data', tableName, sql],
    queryFn: () => executeQuery(sql),
    enabled: !!tableName,
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
  });

  const columns = useMemo(
    () => Array.isArray(schema) ? buildColumns(schema as ColunaSchema[]) : [],
    [schema],
  );

  const rows = useMemo(() => {
    if (!data?.linhas) return [];
    return data.linhas.map((row, i) => ({ __rowId: i, ...row }));
  }, [data]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0, pageSize: 50,
  });
  const [selectedRow, setSelectedRow] = useState<Record<string, unknown> | null>(null);

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 1 }}>
        {error instanceof Error ? error.message : 'Erro ao carregar dados'}
      </Alert>
    );
  }

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={isLoading}
        getRowId={(row) => row.__rowId}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[25, 50, 100, 200]}
        density="compact"
        disableRowSelectionOnClick
        onRowClick={(params) => setSelectedRow(params.row as Record<string, unknown>)}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: { showQuickFilter: true },
          loadingOverlay: { variant: 'linear-progress' as const },
        }}
        localeText={dataGridPtBR}
        sx={{
          flex: 1,
          border: 'none',
          fontSize: 12,
          '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 11 },
          '& .MuiDataGrid-cell': { py: 0.25 },
          '& .MuiDataGrid-row': { cursor: 'pointer' },
        }}
      />
      {dictMap && (
        <RecordPreviewDrawer
          row={selectedRow} tableName={tableName}
          dictMap={dictMap} pkCols={pkCols} fkDetailMap={fkDetailMap ?? new Map()}
          onClose={() => setSelectedRow(null)}
        />
      )}
    </Box>
  );
}
