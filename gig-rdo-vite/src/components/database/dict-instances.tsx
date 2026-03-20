import { Box, Typography, Chip } from '@mui/material';
import { useTableInstances } from '@/hooks/use-dictionary-fields';

interface Props {
  tableName: string | null;
}

export function DictInstances({ tableName }: Props) {
  const { data: instances } = useTableInstances(tableName);
  const list = instances ?? [];
  if (list.length === 0) return null;

  return (
    <Box sx={{ mt: 1, flexShrink: 0 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>
        Instancias/Telas ({list.length})
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {list.map((inst) => (
          <Chip
            key={inst.nuinstancia}
            label={`${inst.nomeInstancia} — ${inst.descricao}`}
            size="small"
            variant={inst.ativo ? 'filled' : 'outlined'}
            color={inst.ativo ? 'default' : 'default'}
            sx={{
              height: 22, fontSize: 10,
              opacity: inst.ativo ? 1 : 0.5,
              maxWidth: 280, '& .MuiChip-label': {
                overflow: 'hidden', textOverflow: 'ellipsis',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
