import {
  Box, Typography, Chip, Skeleton, Paper, Stack,
  Table, TableHead, TableBody, TableRow, TableCell,
  Divider,
} from '@mui/material';
import { usePermissoesTelaDetalhes } from '@/hooks/use-permissoes';
import { AcessoBadge } from '@/components/permissoes/acesso-badge';

interface Props {
  idAcesso: string | null;
}

export function PermissoesTelaPanel({ idAcesso }: Props) {
  const { data, isLoading } = usePermissoesTelaDetalhes(idAcesso);

  if (!idAcesso) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography color="text.secondary">Selecione uma tela na lista</Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="text" width={300} height={32} />
        <Skeleton variant="rounded" height={200} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (!data) return null;

  const grupos = data.permissoes.filter((p) => p.tipo === 'grupo');
  const usuarios = data.permissoes.filter((p) => p.tipo === 'usuario');

  return (
    <Box sx={{ p: 2, overflow: 'auto', height: '100%' }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {data.nomeAmigavel}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
        {data.idAcesso}
      </Typography>

      {data.acoes.length > 0 && (
        <Paper variant="outlined" sx={{ mt: 2, p: 1.5 }}>
          <Typography variant="subtitle2" gutterBottom>
            Acoes ({data.acoes.length})
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {data.acoes.map((a) => (
              <Chip
                key={a.sequencia}
                label={`${a.sigla} - ${a.descricao}`}
                size="small"
                sx={{ mb: 0.5 }}
              />
            ))}
          </Stack>
        </Paper>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" gutterBottom>
        Permissoes por Grupo ({grupos.length})
      </Typography>
      {grupos.length > 0 ? (
        <Table size="small" sx={{ mb: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Grupo</TableCell>
              <TableCell>Acesso</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {grupos.map((p, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Chip
                    label={p.nomeGrupo}
                    size="small"
                    sx={{ bgcolor: 'rgba(237,108,2,0.1)', fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell>
                  <AcessoBadge acesso={p.acesso} acoes={data.acoes} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Nenhum grupo com acesso direto
        </Typography>
      )}

      <Typography variant="subtitle2" gutterBottom>
        Permissoes por Usuario ({usuarios.length})
      </Typography>
      {usuarios.length > 0 ? (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Cod</TableCell>
              <TableCell>Acesso</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((p, i) => (
              <TableRow key={i}>
                <TableCell>{p.nomeUsu}</TableCell>
                <TableCell>{p.codUsu}</TableCell>
                <TableCell>
                  <AcessoBadge acesso={p.acesso} acoes={data.acoes} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Nenhum usuario com acesso direto
        </Typography>
      )}
    </Box>
  );
}
