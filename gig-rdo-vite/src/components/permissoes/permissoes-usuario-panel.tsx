import {
  Box, Typography, Chip, Skeleton, Paper, Stack,
  Table, TableHead, TableBody, TableRow, TableCell,
  Divider, Alert,
} from '@mui/material';
import { usePermissoesUsuarioDetalhes } from '@/hooks/use-permissoes';
import { AcessoBadge } from '@/components/permissoes/acesso-badge';

interface Props {
  codUsu: number | null;
}

export function PermissoesUsuarioPanel({ codUsu }: Props) {
  const { data, isLoading } = usePermissoesUsuarioDetalhes(codUsu);

  if (!codUsu) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography color="text.secondary">Selecione um usuario na lista</Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="text" width={250} height={32} />
        <Skeleton variant="rounded" height={200} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (!data) return null;

  return (
    <Box sx={{ p: 2, overflow: 'auto', height: '100%' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          {data.nomeUsu}
        </Typography>
        <Chip label={`cod: ${data.codUsu}`} size="small" variant="outlined" />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {data.nomeGrupo && (
          <Chip label={`Grupo: ${data.nomeGrupo}`} size="small"
            sx={{ bgcolor: 'rgba(237,108,2,0.1)', fontWeight: 500 }} />
        )}
        <Chip label={`${data.diretas.length} diretas`} size="small"
          sx={{ bgcolor: 'rgba(25,118,210,0.1)', fontWeight: 500 }} />
        <Chip label={`${data.herdadas.length} herdadas`} size="small"
          sx={{ bgcolor: 'rgba(46,125,50,0.1)', fontWeight: 500 }} />
        {data.conflitos.length > 0 && (
          <Chip label={`${data.conflitos.length} conflitos`} size="small"
            sx={{ bgcolor: 'rgba(211,47,47,0.1)', color: '#d32f2f', fontWeight: 600 }} />
        )}
      </Stack>

      {data.conflitos.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {data.conflitos.length} conflito(s) de override detectado(s): permissao do usuario
          difere da permissao herdada do grupo.
        </Alert>
      )}

      {data.conflitos.length > 0 && (
        <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderColor: 'warning.main' }}>
          <Typography variant="subtitle2" gutterBottom color="warning.main">
            Conflitos de Override ({data.conflitos.length})
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tela</TableCell>
                <TableCell>Acesso Usuario</TableCell>
                <TableCell>Acesso Grupo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.conflitos.map((c, i) => (
                <TableRow key={i}>
                  <TableCell>{c.nomeAmigavel}</TableCell>
                  <TableCell>
                    <AcessoBadge acesso={c.acessoUsuario} />
                  </TableCell>
                  <TableCell>
                    <AcessoBadge acesso={c.acessoGrupo} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" gutterBottom>
        Permissoes Diretas ({data.diretas.length})
      </Typography>
      {data.diretas.length > 0 ? (
        <Table size="small" sx={{ mb: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Tela</TableCell>
              <TableCell>Acesso</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.diretas.slice(0, 100).map((d) => (
              <TableRow key={d.idAcesso}>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                    {d.nomeAmigavel}
                  </Typography>
                </TableCell>
                <TableCell>
                  <AcessoBadge acesso={d.acesso} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Nenhuma permissao direta
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" gutterBottom>
        Permissoes Herdadas do Grupo ({data.herdadas.length})
      </Typography>
      {data.herdadas.length > 0 ? (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tela</TableCell>
              <TableCell>Grupo</TableCell>
              <TableCell>Acesso</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.herdadas.slice(0, 100).map((h) => (
              <TableRow key={h.idAcesso}>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                    {h.nomeAmigavel}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={h.nomeGrupo} size="small"
                    sx={{ height: 20, fontSize: 11, bgcolor: 'rgba(237,108,2,0.1)' }} />
                </TableCell>
                <TableCell>
                  <AcessoBadge acesso={h.acesso} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Nenhuma permissao herdada
        </Typography>
      )}
    </Box>
  );
}
