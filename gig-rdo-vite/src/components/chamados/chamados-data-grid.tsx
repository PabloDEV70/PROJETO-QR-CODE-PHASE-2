import { useMemo } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Stack, Typography, Tooltip } from '@mui/material';
import { AttachFileRounded } from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { StatusBadge, PrioBadge } from '@/components/chamados/chamado-badges';
import type { Chamado } from '@/types/chamados-types';

interface ChamadosDataGridProps {
  chamados: Chamado[];
  isLoading: boolean;
  onRowClick: (nuchamado: number) => void;
}

function fmtDate(val: string | null): string {
  if (!val) return '-';
  return new Date(val).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
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
  if (!nome) return <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>-</Typography>;
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

export function ChamadosDataGrid({ chamados, isLoading, onRowClick }: ChamadosDataGridProps) {
  const columns: GridColDef<Chamado>[] = useMemo(() => [
    { field: 'NUCHAMADO', headerName: '#', width: 80 },
    {
      field: 'TEM_ANEXO',
      headerName: '',
      width: 40,
      sortable: false,
      renderCell: ({ row }) => row.TEM_ANEXO > 0 ? (
        <Tooltip title={`${row.TEM_ANEXO} anexo(s)`} placement="top">
          <AttachFileRounded sx={{ fontSize: 16, color: '#64748b' }} />
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
    { field: 'SETOR', headerName: 'Setor', width: 140 },
    {
      field: 'DHCHAMADO',
      headerName: 'Abertura',
      width: 135,
      valueFormatter: (value: string | null) => fmtDate(value),
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

  return (
    <DataGrid
      rows={chamados}
      columns={columns}
      getRowId={(row) => row.NUCHAMADO}
      loading={isLoading}
      density="compact"
      disableRowSelectionOnClick
      onRowClick={({ row }) => onRowClick(row.NUCHAMADO)}
      pageSizeOptions={[25, 50, 100]}
      initialState={{
        pagination: { paginationModel: { pageSize: 50 } },
        sorting: { sortModel: [{ field: 'DHCHAMADO', sort: 'desc' }] },
      }}
      sx={{
        border: 0,
        cursor: 'pointer',
        '& .MuiDataGrid-cell': { fontSize: 12.5 },
        '& .MuiDataGrid-columnHeaderTitle': {
          fontWeight: 700, fontSize: 12, letterSpacing: '-0.01em',
        },
      }}
      autoHeight
    />
  );
}
