import {
  Box, Chip, CircularProgress, Typography, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { AccountTree, History } from '@mui/icons-material';
import { useScreenMenu, useScreenAccessHistory } from '@/hooks/use-screen-rbac-extra';
export { PermissoesPanel } from '@/components/database/screen-permissions-panel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = Record<string, any>;

const CELL_SX = { fontSize: 11, py: 0.3, px: 1 } as const;
const HEAD_SX = { ...CELL_SX, fontWeight: 700 } as const;

export function MenuPanel({ resourceId }: { resourceId: string | null }) {
  const { data, isLoading, error } = useScreenMenu(resourceId);

  if (!resourceId) {
    return <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
      Nenhum resourceID encontrado em TDDPIN para esta instancia
    </Typography>;
  }
  if (isLoading) return <CircularProgress size={16} />;
  if (error) {
    return <Alert severity="warning" sx={{ fontSize: 11, py: 0.5 }}>
      Nao foi possivel consultar menu (TRDCON/TRDPCO)
    </Alert>;
  }

  const { menu, hierarchy, props } = data ?? {};

  return (
    <Box sx={{ p: 0.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary' }}>
          ResourceID:
        </Typography>
        <Typography sx={{ fontSize: 11, fontFamily: 'monospace' }}>{resourceId}</Typography>
      </Box>

      {!menu && (
        <Alert severity="info" sx={{ fontSize: 11, py: 0.5 }}>
          ResourceID encontrado mas sem item de menu associado em TRDCON
        </Alert>
      )}
      {menu && (
        <Box sx={{
          p: 1, borderRadius: 1, border: 1,
          borderColor: 'divider', bgcolor: 'action.hover',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <AccountTree sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
              {(hierarchy ?? []).map((h: R) => String(h.DESCR ?? h.NOME ?? '').trim()).join(' > ')}
              {(hierarchy ?? []).length > 0 ? ' > ' : ''}
              {String(menu.DESCRCONTROLE ?? menu.NOME_MENU ?? '')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={`NUCONTROLE: ${menu.NUCONTROLE}`} size="small"
              sx={{ height: 20, fontSize: 10 }} />
          </Box>
        </Box>
      )}

      {(props ?? []).length > 0 && (
        <>
          <Typography sx={{ fontSize: 11, fontWeight: 700, mt: 0.5 }}>
            Propriedades do Menu (TRDPCO)
          </Typography>
          <SmallKvTable rows={props!} keyCol="NOME" valCol="VALOR" />
        </>
      )}
    </Box>
  );
}

export function AcessoPanel({ resourceId }: { resourceId: string | null }) {
  const { data, isLoading, error } = useScreenAccessHistory(resourceId);
  const rows: R[] = Array.isArray(data) ? data : [];

  if (!resourceId) {
    return <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
      Nenhum resourceID encontrado em TDDPIN
    </Typography>;
  }
  if (isLoading) return <CircularProgress size={16} />;
  if (error) {
    return <Alert severity="warning" sx={{ fontSize: 11, py: 0.5 }}>
      Nao foi possivel consultar historico de acesso (TRDEAC)
    </Alert>;
  }
  if (rows.length === 0) {
    return <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
      Sem historico de acesso para {resourceId}
    </Typography>;
  }

  return (
    <Box sx={{ p: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <History sx={{ fontSize: 14, color: 'text.secondary' }} />
        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
          Ultimos acessos (TRDEAC)
        </Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={HEAD_SX}>Usuario</TableCell>
              <TableCell sx={HEAD_SX}>Cod</TableCell>
              <TableCell sx={HEAD_SX} align="right">Acessos</TableCell>
              <TableCell sx={HEAD_SX}>Periodo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i} hover>
                <TableCell sx={CELL_SX}>{r.NOMEUSU}</TableCell>
                <TableCell sx={{ ...CELL_SX, fontFamily: 'monospace' }}>{r.CODUSU}</TableCell>
                <TableCell sx={CELL_SX} align="right">{r.QTDPERIODO}</TableCell>
                <TableCell sx={CELL_SX}>{r.DTINIPERIODO}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function SmallKvTable({ rows, keyCol, valCol }: { rows: R[]; keyCol: string; valCol: string }) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={HEAD_SX}>Propriedade</TableCell>
            <TableCell sx={HEAD_SX}>Valor</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i} hover>
              <TableCell sx={{ ...CELL_SX, fontFamily: 'monospace', fontWeight: 600 }}>
                {r[keyCol]}
              </TableCell>
              <TableCell sx={{ ...CELL_SX, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {r[valCol]}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
