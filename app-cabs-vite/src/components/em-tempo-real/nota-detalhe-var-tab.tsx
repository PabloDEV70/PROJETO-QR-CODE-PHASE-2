import { Paper, Typography, Stack, Chip } from '@mui/material';
import { History } from '@mui/icons-material';
import type { NotaDetalheVar } from '@/types/em-tempo-real-types';

interface NotaDetalheVarTabProps {
  variacoes: NotaDetalheVar[];
}

export function NotaDetalheVarTab({ variacoes }: NotaDetalheVarTabProps) {
  if (variacoes.length === 0) {
    return (
      <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
        <History sx={{ fontSize: 40, color: 'text.disabled' }} />
        <Typography color="text.secondary">Nenhuma variacao encontrada</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.5}>
      <Chip
        label={`${variacoes.length} ${variacoes.length === 1 ? 'variacao' : 'variacoes'}`}
        size="small"
        color="primary"
        variant="outlined"
      />

      {variacoes.map((v) => (
        <Paper key={v.SEQUENCIA} variant="outlined" sx={{ p: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={`#${v.SEQUENCIA}`}
              size="small"
              sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
            />
            {v.NUNOTA_ORIGEM && (
              <Typography variant="caption" color="text.secondary">
                Origem: {v.NUNOTA_ORIGEM} seq {v.SEQUENCIA_ORIGEM}
              </Typography>
            )}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
