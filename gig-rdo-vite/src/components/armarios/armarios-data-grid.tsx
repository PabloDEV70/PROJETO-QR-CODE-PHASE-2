import { useMemo } from 'react';
import {
  DataGrid,
  type GridColDef,
  type GridSortModel,
  type GridPaginationModel,
  type GridRowSelectionModel,
} from '@mui/x-data-grid';
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { Visibility, OpenInNew } from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import type { ArmarioListItem } from '@/types/armario-types';

interface ArmariosDataGridProps {
  rows: ArmarioListItem[];
  rowCount: number;
  isLoading: boolean;
  page: number;
  pageSize: number;
  orderBy: string;
  orderDir: 'ASC' | 'DESC';
  selectionModel: GridRowSelectionModel;
  onSelectionChange: (model: GridRowSelectionModel) => void;
  onPaginationChange: (page: number, pageSize: number) => void;
  onSortChange: (field: string, dir: 'ASC' | 'DESC') => void;
  onPreview: (row: ArmarioListItem) => void;
}

function FuncionarioCell({ row }: { row: ArmarioListItem }) {
  if (!row.ocupado) {
    return <Typography sx={{ fontSize: 12.5, color: '#94a3b8' }}>-</Typography>;
  }

  const subLine = [row.departamento, row.funcao].filter(Boolean).join(' · ');

  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.5 }}>
      <FuncionarioAvatar
        codparc={row.codparc || undefined}
        codemp={row.codemp}
        codfunc={row.codfunc}
        nome={row.nomeFuncionario}
        size="small"
      />
      <Box sx={{ overflow: 'hidden', minWidth: 0 }}>
        <Typography sx={{
          fontSize: 12.5, fontWeight: 600, lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {row.nomeFuncionario || '-'}
        </Typography>
        {subLine && (
          <Tooltip title={subLine} arrow placement="bottom-start">
            <Typography sx={{
              fontSize: 11, color: '#94a3b8', lineHeight: 1.2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {subLine}
            </Typography>
          </Tooltip>
        )}
      </Box>
    </Stack>
  );
}

export function ArmariosDataGrid({
  rows, rowCount, isLoading, page, pageSize,
  orderBy, orderDir, selectionModel,
  onSelectionChange, onPaginationChange, onSortChange, onPreview,
}: ArmariosDataGridProps) {
  const columns: GridColDef<ArmarioListItem>[] = useMemo(() => [
    {
      field: 'codarmario',
      headerName: 'Cod',
      width: 70,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'tagArmario',
      headerName: 'TAG',
      width: 120,
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>{value}</Typography>
      ),
    },
    { field: 'localDescricao', headerName: 'Local', width: 140 },
    {
      field: 'nuarmario',
      headerName: 'N',
      width: 70,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'ocupado',
      headerName: 'Status',
      width: 110,
      renderCell: ({ value }) => (
        <Chip
          label={value ? 'Ocupado' : 'Livre'}
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: 11,
            bgcolor: value ? 'rgba(46,125,50,0.12)' : 'rgba(148,163,184,0.15)',
            color: value ? '#2e7d32' : '#64748b',
          }}
        />
      ),
    },
    {
      field: 'nomeFuncionario',
      headerName: 'Funcionario',
      flex: 1,
      minWidth: 240,
      renderCell: ({ row }) => <FuncionarioCell row={row} />,
    },
    { field: 'empresa', headerName: 'Empresa', width: 150 },
    { field: 'nucadeado', headerName: 'Cadeado', width: 100 },
    {
      field: 'actions',
      headerName: '',
      width: 80,
      sortable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.25}>
          <IconButton size="small" onClick={() => onPreview(row)}>
            <Visibility sx={{ fontSize: 18, color: '#94a3b8' }} />
          </IconButton>
          <IconButton
            size="small" component="a"
            href={`/p/armario/${row.codarmario}`} target="_blank"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <OpenInNew sx={{ fontSize: 16, color: '#94a3b8' }} />
          </IconButton>
        </Stack>
      ),
    },
  ], [onPreview]);

  const sortModel: GridSortModel = orderBy
    ? [{ field: orderBy, sort: orderDir === 'ASC' ? 'asc' : 'desc' }]
    : [];

  const paginationModel: GridPaginationModel = {
    page: page - 1,
    pageSize,
  };

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) => row.codarmario}
      loading={isLoading}
      rowCount={rowCount}
      paginationMode="server"
      sortingMode="server"
      paginationModel={paginationModel}
      onPaginationModelChange={(m) => onPaginationChange(m.page + 1, m.pageSize)}
      sortModel={sortModel}
      onSortModelChange={(m) => {
        if (m.length > 0 && m[0] && m[0].sort) {
          onSortChange(m[0].field, m[0].sort === 'asc' ? 'ASC' : 'DESC');
        }
      }}
      checkboxSelection
      keepNonExistentRowsSelected
      rowSelectionModel={selectionModel}
      onRowSelectionModelChange={onSelectionChange}
      pageSizeOptions={[10, 25, 50, 100]}
      rowHeight={52}
      density="compact"
      disableColumnFilter
      sx={{
        border: 0,
        '& .MuiDataGrid-cell': { fontSize: 12.5 },
        '& .MuiDataGrid-columnHeaderTitle': {
          fontWeight: 700, fontSize: 12, letterSpacing: '-0.01em',
        },
      }}
      autoHeight
    />
  );
}
