import {
  Box, Chip, CircularProgress, Typography, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { Person, Group } from '@mui/icons-material';
import { useScreenPermissions } from '@/hooks/use-screen-rbac';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = Record<string, any>;

const CELL_SX = { fontSize: 11, py: 0.3, px: 1 } as const;
const HEAD_SX = { ...CELL_SX, fontWeight: 700 } as const;

export function PermissoesPanel({ resourceId }: { resourceId: string | null }) {
  const { data, isLoading, error } = useScreenPermissions(resourceId);
  const rows: R[] = Array.isArray(data) ? data : [];

  if (!resourceId) {
    return <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
      Nenhum resourceID encontrado em TDDPIN
    </Typography>;
  }
  if (isLoading) return <CircularProgress size={16} />;
  if (error) {
    return <Alert severity="warning" sx={{ fontSize: 11, py: 0.5 }}>
      Nao foi possivel consultar permissoes (TDDPER)
    </Alert>;
  }
  if (rows.length === 0) {
    return <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
      Sem permissoes configuradas para {resourceId}
    </Typography>;
  }

  const userPerms = rows.filter((r) => Number(r.CODUSU) > 0);
  const groupPerms = rows.filter((r) => Number(r.CODGRUPO) > 0);

  return (
    <Box sx={{ p: 0.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography sx={{ fontSize: 11, color: 'text.secondary', fontFamily: 'monospace' }}>
        TDDPER.IDACESSO = {resourceId}
      </Typography>

      {groupPerms.length > 0 && (
        <PermSection
          icon={<Group sx={{ fontSize: 14 }} />} title="Grupos" rows={groupPerms}
          codeKey="CODGRUPO" nameKey="NOMEGRUPO" typeLabel="Grupo"
        />
      )}
      {userPerms.length > 0 && (
        <PermSection
          icon={<Person sx={{ fontSize: 14 }} />} title="Usuarios (override)" rows={userPerms}
          codeKey="CODUSU" nameKey="NOMEUSU" typeLabel="Usuario"
        />
      )}
    </Box>
  );
}

function PermSection({ icon, title, rows, codeKey, nameKey, typeLabel }: {
  icon: React.ReactNode; title: string; rows: R[];
  codeKey: string; nameKey: string; typeLabel: string;
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        {icon}
        <Typography sx={{ fontSize: 11, fontWeight: 700 }}>{title}</Typography>
        <Chip label={rows.length} size="small" sx={{ height: 18, fontSize: 10 }} />
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={HEAD_SX}>Cod</TableCell>
              <TableCell sx={HEAD_SX}>{typeLabel}</TableCell>
              <TableCell sx={HEAD_SX}>Acesso</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, i) => {
              const allowed = String(r.ACESSO ?? '0') !== '0';
              return (
                <TableRow key={i} hover>
                  <TableCell sx={{ ...CELL_SX, fontFamily: 'monospace' }}>{r[codeKey]}</TableCell>
                  <TableCell sx={CELL_SX}>{r[nameKey]}</TableCell>
                  <TableCell sx={CELL_SX}>
                    <Chip
                      label={allowed ? `Sim (${r.ACESSO})` : 'Nao'}
                      size="small" color={allowed ? 'success' : 'error'} variant="outlined"
                      sx={{ height: 18, fontSize: 10 }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
