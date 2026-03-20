import {
  Box, List, ListItemButton, ListItemText,
  Typography, Chip, Skeleton, Stack,
} from '@mui/material';
import { usePermissoesGrupos } from '@/hooks/use-permissoes';

interface Props {
  selectedId: number | null;
  onSelect: (codgrupo: number) => void;
}

export function PermissoesGrupoSidebar({ selectedId, onSelect }: Props) {
  const { data: grupos, isLoading } = usePermissoesGrupos();

  if (isLoading) {
    return (
      <Box sx={{ p: 1 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={40} sx={{ mb: 0.5 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="overline" sx={{ px: 1.5, pt: 1, color: 'text.secondary' }}>
        {grupos?.length ?? 0} grupos
      </Typography>
      <List dense sx={{ flex: 1, overflow: 'auto' }}>
        {grupos?.map((g) => (
          <ListItemButton
            key={g.codGrupo}
            selected={selectedId === g.codGrupo}
            onClick={() => onSelect(g.codGrupo)}
            sx={{ borderRadius: 1, mx: 0.5 }}
          >
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight={500} noWrap>
                  {g.nomeGrupo}
                </Typography>
              }
              secondary={
                <Stack direction="row" spacing={0.5} sx={{ mt: 0.25 }}>
                  <Chip label={`${g.qtdMembros} membros`} size="small"
                    sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(46,125,50,0.1)' }} />
                  <Chip label={`${g.qtdTelas} telas`} size="small"
                    sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(25,118,210,0.1)' }} />
                </Stack>
              }
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
