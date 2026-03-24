import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Typography, Chip } from '@mui/material';
import { OsStatusBadge, TipoManutBadge, StatusGigBadge } from '@/components/os/os-badges';
import { DisplayDate } from '@/components/shared/display-date';
import type { OrdemServico } from '@/types/os-types';

interface Props {
  ordens: OrdemServico[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const LOCAL_MAP: Record<string, string> = {
  '1': 'Oficina',
  '2': 'Campo',
  '3': 'Terceiro',
};

const FIN_MAP: Record<string, string> = {
  LF: 'Lib. Func.',
  LT: 'Lib. Restrito',
  LD: 'Lib. c/ Defeito',
};

export function OsDataGrid({ ordens, isLoading, page, limit, total, onPageChange, onPageSizeChange }: Props) {
  const navigate = useNavigate();

  const columns: GridColDef<OrdemServico>[] = useMemo(() => [
    {
      field: 'NUOS', headerName: 'OS', width: 80,
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 12, fontWeight: 700 }}>#{value}</Typography>
      ),
    },
    {
      field: 'STATUS', headerName: 'Status', width: 120,
      renderCell: ({ row }) => <OsStatusBadge status={row.STATUS} size="sm" />,
    },
    {
      field: 'PLACA', headerName: 'Veiculo', width: 180,
      renderCell: ({ row }) => (
        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>
            {row.PLACA ?? '-'}{row.AD_TAG ? ` (${row.AD_TAG})` : ''}
          </Typography>
          {row.MARCAMODELO && (
            <Typography sx={{ fontSize: 10, color: 'text.disabled', lineHeight: 1.2 }}>
              {row.MARCAMODELO}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'MANUTENCAO', headerName: 'Tipo Manut.', width: 130,
      renderCell: ({ row }) => <TipoManutBadge tipo={row.MANUTENCAO} size="sm" />,
    },
    {
      field: 'TIPO', headerName: 'I/E', width: 75,
      renderCell: ({ row }) => (
        <Chip
          label={row.tipoLabel ?? row.TIPO ?? '-'}
          size="small"
          sx={{
            height: 20, fontSize: 11, fontWeight: 600,
            bgcolor: row.TIPO === 'I' ? 'info.main' : row.TIPO === 'E' ? 'warning.main' : 'action.hover',
            color: row.TIPO ? '#fff' : 'text.secondary',
            borderRadius: '4px',
          }}
        />
      ),
    },
    {
      field: 'AD_STATUSGIG', headerName: 'Status GIG', width: 130,
      renderCell: ({ row }) => <StatusGigBadge statusGig={row.AD_STATUSGIG} />,
    },
    {
      field: 'AD_LOCALMANUTENCAO', headerName: 'Local', width: 85,
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
          {value ? LOCAL_MAP[value] ?? value : '-'}
        </Typography>
      ),
    },
    {
      field: 'TOTAL_SERVICOS', headerName: 'Serv.', width: 60, align: 'center', headerAlign: 'center',
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
          {value ?? 0}
        </Typography>
      ),
    },
    {
      field: 'CUSTO_TOTAL', headerName: 'Custo', width: 100, align: 'right', headerAlign: 'right',
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
          {value ? `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
        </Typography>
      ),
    },
    {
      field: 'DTABERTURA', headerName: 'Abertura', width: 120,
      renderCell: ({ value }) => <DisplayDate value={value} />,
    },
    {
      field: 'DATAINI', headerName: 'Inicio', width: 120,
      renderCell: ({ value }) => <DisplayDate value={value} />,
    },
    {
      field: 'DATAFIN', headerName: 'Fim', width: 120,
      renderCell: ({ value }) => <DisplayDate value={value} />,
    },
    {
      field: 'KM', headerName: 'KM', width: 90, align: 'right', headerAlign: 'right',
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          {value && value > 1 ? Number(value).toLocaleString('pt-BR') : '-'}
        </Typography>
      ),
    },
    {
      field: 'AD_FINALIZACAO', headerName: 'Finaliz.', width: 90,
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
          {value ? FIN_MAP[value] ?? value : '-'}
        </Typography>
      ),
    },
  ], []);

  return (
    <Box sx={{ 
      flex: 1, 
      minHeight: 0, 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden',
      // Força o container a respeitar os limites do flexbox
      height: '100%',
      width: '100%'
    }}>
      <DataGrid
        rows={ordens}
        columns={columns}
        getRowId={(row) => row.NUOS}
        loading={isLoading}
        rowHeight={48}
        density="compact"
        disableRowSelectionOnClick
        onRowClick={({ row }) => navigate(`/ordens-de-servico/${row.NUOS}`)}
        paginationMode="server"
        rowCount={total}
        paginationModel={{ page: Math.max(0, page - 1), pageSize: limit }}
        onPaginationModelChange={(model) => {
          // Evita loops infinitos verificando se houve mudança real
          if (model.pageSize !== limit) {
            onPageSizeChange(model.pageSize);
          }
          if (model.page + 1 !== page) {
            onPageChange(model.page + 1);
          }
        }}
        pageSizeOptions={[25, 50, 100]}
        sx={{
          flex: 1,
          border: 'none',
          borderTop: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
          // CSS para eliminar scroll no footer e garantir scroll no corpo
          '& .MuiDataGrid-main': { 
            overflow: 'auto',
            flex: 1
          },
          '& .MuiDataGrid-footerContainer': {
            minHeight: '48px !important',
            maxHeight: '48px !important',
            overflow: 'hidden',
            borderTop: '1px solid',
            borderColor: 'divider',
            boxSizing: 'border-box'
          },
          '& .MuiDataGrid-virtualScroller': {
            overflowX: 'auto',
            overflowY: 'auto'
          },
          '& .MuiDataGrid-cell': {
            fontSize: 12.5, borderColor: 'divider',
            display: 'flex', alignItems: 'center',
            '&:focus, &:focus-within': { outline: 'none' },
          },
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(46,125,50,0.15)' : 'rgba(46,125,50,0.06)',
            borderColor: 'divider',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 700, fontSize: 11,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            color: 'text.secondary',
          },
          '& .MuiDataGrid-row:nth-of-type(even)': {
            bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
          },
          '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
          '& .MuiDataGrid-columnSeparator': { color: 'divider' },
          '& .MuiDataGrid-row:focus, & .MuiDataGrid-row:focus-within': { outline: 'none' },
        }}
      />
    </Box>
  );
}
