import { useState } from 'react';
import {
  Box, TextField, List, ListItemButton, ListItemText,
  Typography, Chip, Skeleton, Pagination, Stack,
} from '@mui/material';
import { usePermissoesUsuarios } from '@/hooks/use-permissoes';

interface Props {
  selectedId: number | null;
  onSelect: (codusu: number) => void;
}

export function PermissoesUsuarioSidebar({ selectedId, onSelect }: Props) {
  const [termo, setTermo] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePermissoesUsuarios({
    page, limit: 50, termo: termo || undefined,
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TextField
        size="small"
        placeholder="Buscar usuario..."
        value={termo}
        onChange={(e) => { setTermo(e.target.value); setPage(1); }}
        sx={{ mx: 1, mt: 1, mb: 0.5 }}
      />
      {isLoading ? (
        <Box sx={{ p: 1 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={40} sx={{ mb: 0.5 }} />
          ))}
        </Box>
      ) : (
        <>
          <List dense sx={{ flex: 1, overflow: 'auto' }}>
            {data?.data.map((u) => (
              <ListItemButton
                key={u.codUsu}
                selected={selectedId === u.codUsu}
                onClick={() => onSelect(u.codUsu)}
                sx={{ borderRadius: 1, mx: 0.5 }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={500} noWrap>
                      {u.nomeUsu}
                    </Typography>
                  }
                  secondary={
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.25 }}>
                      {u.nomeGrupo && (
                        <Chip label={u.nomeGrupo} size="small"
                          sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(237,108,2,0.1)' }} />
                      )}
                      <Chip label={`${u.qtdDiretas} diretas`} size="small"
                        sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(25,118,210,0.1)' }} />
                    </Stack>
                  }
                />
              </ListItemButton>
            ))}
          </List>
          {data && data.meta.totalPages > 1 && (
            <Pagination
              count={data.meta.totalPages}
              page={page}
              onChange={(_, p) => setPage(p)}
              size="small"
              sx={{ display: 'flex', justifyContent: 'center', py: 1 }}
            />
          )}
        </>
      )}
    </Box>
  );
}
