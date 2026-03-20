import {
  Box, Typography, Chip, Skeleton, Paper, Stack,
  Table, TableHead, TableBody, TableRow, TableCell,
  Divider,
} from '@mui/material';
import { usePermissoesGrupoDetalhes } from '@/hooks/use-permissoes';
import { AcessoBadge } from '@/components/permissoes/acesso-badge';

interface Props {
  codGrupo: number | null;
}

export function PermissoesGrupoPanel({ codGrupo }: Props) {
  const { data, isLoading } = usePermissoesGrupoDetalhes(codGrupo);

  if (!codGrupo) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography color="text.secondary">Selecione um grupo na lista</Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="text" width={200} height={32} />
        <Skeleton variant="rounded" height={200} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (!data) return null;

  return (
    <Box sx={{ p: 2, overflow: 'auto', height: '100%' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          {data.nomeGrupo}
        </Typography>
        <Chip label={`cod: ${data.codGrupo}`} size="small" variant="outlined" />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Chip label={`${data.membros.length} membros`} size="small"
          sx={{ bgcolor: 'rgba(46,125,50,0.1)', fontWeight: 500 }} />
        <Chip label={`${data.telas.length} telas`} size="small"
          sx={{ bgcolor: 'rgba(25,118,210,0.1)', fontWeight: 500 }} />
      </Stack>

      <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Membros ({data.membros.length})
        </Typography>
        {data.membros.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Cod</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.membros.map((m) => (
                <TableRow key={m.codUsu}>
                  <TableCell>{m.nomeUsu}</TableCell>
                  <TableCell>{m.codUsu}</TableCell>
                  <TableCell>
                    <Chip
                      label={m.ativo ? 'Ativo' : 'Inativo'}
                      size="small"
                      sx={{
                        height: 20, fontSize: 11,
                        bgcolor: m.ativo ? 'rgba(46,125,50,0.1)' : 'rgba(211,47,47,0.1)',
                        color: m.ativo ? '#2e7d32' : '#d32f2f',
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Nenhum membro
          </Typography>
        )}
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" gutterBottom>
        Telas com Acesso ({data.telas.length})
      </Typography>
      {data.telas.length > 0 ? (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tela</TableCell>
              <TableCell>Acesso</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.telas.slice(0, 100).map((t) => (
              <TableRow key={t.idAcesso}>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                    {t.nomeAmigavel}
                  </Typography>
                </TableCell>
                <TableCell>
                  <AcessoBadge acesso={t.acesso} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Nenhuma tela atribuida
        </Typography>
      )}
      {data.telas.length > 100 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Mostrando 100 de {data.telas.length} telas
        </Typography>
      )}
    </Box>
  );
}
