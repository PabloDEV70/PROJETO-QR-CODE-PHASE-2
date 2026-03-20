import { useMemo } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Stack, Typography, Tooltip, Skeleton } from '@mui/material';
import { AttachFileRounded, InboxRounded } from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { StatusBadge, PrioBadge } from '@/components/chamados/chamado-badges';
import { DisplayDate } from '@/components/shared/display-date';
import type { Chamado } from '@/types/chamados-types';

interface ChamadosDataGridProps {
  chamados: Chamado[];
  isLoading: boolean;
  onRowClick: (nuchamado: number) => void;
}

function resolucaoLabel(abertura: string | null, fim: string | null): string {
  if (!abertura || !fim) return '-';
  const ms = new Date(fim).getTime() - new Date(abertura).getTime();
  if (ms < 0) return '-';
  const totalMin = Math.floor(ms / 60_000);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function UserCell({ nome, codparc }: { nome: string | null; codparc: number | null }) {
  if (!nome) return <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>-</Typography>;
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ height: '100%' }}>
      <FuncionarioAvatar codparc={codparc} nome={nome} size="small"
        sx={{ width: 24, height: 24, fontSize: 10 }} />
      <Typography sx={{
        fontSize: 12, overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {nome}
      </Typography>
    </Stack>
  );
}

function EmptyState() {
  return (
    <Stack alignItems="center" justifyContent="center" sx={{
      py: 8,
      border: '1px dashed',
      borderColor: 'divider',
      borderRadius: 2,
      bgcolor: 'action.hover',
    }}>
      <Box sx={{
        width: 56, height: 56, borderRadius: '50%',
        bgcolor: 'action.selected', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        mb: 2,
      }}>
        <InboxRounded sx={{ fontSize: 28, color: 'text.disabled' }} />
      </Box>
      <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 14 }}>
        Nenhum chamado encontrado
      </Typography>
      <Typography sx={{ color: 'text.disabled', fontSize: 12, mt: 0.5 }}>
        Tente ajustar os filtros ou periodo
      </Typography>
    </Stack>
  );
}

function LoadingState() {
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{
        display: 'flex', gap: 2, px: 2, py: 1.5,
        bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider',
      }}>
        {[50, 120, 200, 80, 80, 130, 100].map((w, i) => (
          <Skeleton key={i} variant="text" width={w} height={18} />
        ))}
      </Box>
      {Array.from({ length: 8 }).map((_, i) => (
        <Box key={i} sx={{
          display: 'flex', gap: 2, px: 2, py: 1.25,
          borderBottom: '1px solid', borderColor: 'divider',
        }}>
          <Skeleton variant="text" width={50} height={16} />
          <Skeleton variant="text" width={120} height={16} />
          <Skeleton variant="text" width={200} height={16} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" width={80} height={20} />
          <Skeleton variant="rounded" width={60} height={20} />
          <Skeleton variant="text" width={130} height={16} />
          <Skeleton variant="text" width={100} height={16} />
        </Box>
      ))}
    </Box>
  );
}

export function ChamadosDataGrid({ chamados, isLoading, onRowClick }: ChamadosDataGridProps) {
  const columns: GridColDef<Chamado>[] = useMemo(() => [
    {
      field: 'NUCHAMADO', headerName: '#', width: 80,
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.primary' }}>
          #{value}
        </Typography>
      ),
    },
    {
      field: 'TEM_ANEXO',
      headerName: '',
      width: 40,
      sortable: false,
      renderCell: ({ row }) => row.TEM_ANEXO > 0 ? (
        <Tooltip title={`${row.TEM_ANEXO} anexo(s)`} placement="top">
          <AttachFileRounded sx={{ fontSize: 16, color: 'text.disabled' }} />
        </Tooltip>
      ) : null,
    },
    {
      field: 'NOMESOLICITANTE',
      headerName: 'Solicitante',
      width: 180,
      renderCell: ({ row }) => (
        <UserCell nome={row.NOMESOLICITANTE} codparc={row.CODPARCSOLICITANTE} />
      ),
    },
    {
      field: 'DESCRCHAMADO',
      headerName: 'Descricao',
      flex: 1,
      minWidth: 200,
      renderCell: ({ value }) => (
        <Typography sx={{
          fontSize: 12, overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          color: 'text.secondary',
        }}>
          {value ?? '-'}
        </Typography>
      ),
    },
    {
      field: 'STATUS',
      headerName: 'Status',
      width: 140,
      renderCell: ({ row }) => <StatusBadge status={row.STATUS} size="sm" />,
    },
    {
      field: 'PRIORIDADE',
      headerName: 'Prioridade',
      width: 100,
      renderCell: ({ row }) => (
        <PrioBadge prioridade={row.PRIORIDADE} size="sm" />
      ),
    },
    {
      field: 'NOMEATRIBUIDO',
      headerName: 'Atribuido',
      width: 170,
      renderCell: ({ row }) => (
        <UserCell nome={row.NOMEATRIBUIDO} codparc={row.CODPARCATRIBUIDO} />
      ),
    },
    {
      field: 'SETOR', headerName: 'Setor', width: 140,
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          {value ?? '-'}
        </Typography>
      ),
    },
    {
      field: 'DHCHAMADO',
      headerName: 'Abertura',
      width: 145,
      renderCell: ({ value }) => <DisplayDate value={value} />,
    },
    {
      field: 'resolucao',
      headerName: 'Resolucao',
      width: 100,
      sortable: false,
      valueGetter: (_value: unknown, row: Chamado) =>
        resolucaoLabel(row.DHCHAMADO, row.DHFINCHAM),
    },
    {
      field: 'NOMEFINALIZADOR',
      headerName: 'Finalizado por',
      width: 170,
      renderCell: ({ row }) => (
        <UserCell nome={row.NOMEFINALIZADOR} codparc={row.CODPARCFINALIZADOR} />
      ),
    },
  ], []);

  if (isLoading) {
    return <LoadingState />;
  }

  if (chamados.length === 0) {
    return <EmptyState />;
  }

  return (
    <DataGrid
      rows={chamados}
      columns={columns}
      getRowId={(row) => row.NUCHAMADO}
      loading={false}
      rowHeight={48}
      disableRowSelectionOnClick
      onRowClick={({ row }) => onRowClick(row.NUCHAMADO)}
      pageSizeOptions={[25, 50, 100]}
      initialState={{
        pagination: { paginationModel: { pageSize: 50 } },
        sorting: { sortModel: [{ field: 'DHCHAMADO', sort: 'desc' }] },
      }}
      sx={{
        flex: 1,
        minHeight: 0,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        cursor: 'pointer',
        '& .MuiDataGrid-cell': {
          fontSize: 12.5,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
        },
        '& .MuiDataGrid-columnHeaders': {
          bgcolor: 'action.hover',
          borderColor: 'divider',
        },
        '& .MuiDataGrid-columnHeaderTitle': {
          fontWeight: 700, fontSize: 11,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'text.disabled',
        },
        '& .MuiDataGrid-row': {
          '&:hover': {
            bgcolor: 'action.hover',
          },
        },
        '& .MuiDataGrid-footerContainer': {
          borderColor: 'divider',
        },
        '& .MuiDataGrid-columnSeparator': {
          color: 'divider',
        },
      }}
    />
  );
}
