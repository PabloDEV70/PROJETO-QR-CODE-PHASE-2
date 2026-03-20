import type { ReactNode } from 'react';
import { Box, Paper, Typography, Chip, Stack, Skeleton } from '@mui/material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import type { FuncionarioPerfilSuper } from '@/types/funcionario-types';

interface RdoColaboradorHeaderProps {
  perfil: FuncionarioPerfilSuper | null | undefined;
  isLoading: boolean;
  children?: ReactNode;
}

function formatMinutos(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h${m}m` : `${h}h`;
}

function JornadaChips({ perfil }: { perfil: FuncionarioPerfilSuper }) {
  const carga = perfil.cargaHoraria;
  if (!carga) {
    return (
      <Typography variant="body2" color="text.secondary">
        Sem carga horaria
      </Typography>
    );
  }

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap alignItems="center">
      {carga.dias.map((dia) => (
        <Chip
          key={dia.diasem}
          label={
            dia.folga
              ? `${dia.diasemLabel.slice(0, 3)} -`
              : `${dia.diasemLabel.slice(0, 3)} ${formatMinutos(dia.minutosPrevistos)}`
          }
          size="small"
          variant={dia.folga ? 'outlined' : 'filled'}
          color={dia.folga ? 'default' : 'primary'}
          sx={{
            fontSize: '0.75rem',
            height: 24,
            opacity: dia.folga ? 0.5 : 1,
          }}
        />
      ))}
      <Chip
        label={`Total: ${carga.totalHorasSemanaFmt}`}
        size="small"
        color="info"
        sx={{ fontSize: '0.75rem', height: 24, fontWeight: 600 }}
      />
    </Stack>
  );
}

export function RdoColaboradorHeader({ perfil, isLoading, children }: RdoColaboradorHeaderProps) {
  if (isLoading) {
    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Skeleton variant="circular" width={48} height={48} />
          <Box>
            <Skeleton width={200} height={24} />
            <Skeleton width={300} height={20} />
          </Box>
        </Stack>
      </Paper>
    );
  }

  if (!perfil) return null;
  const v = perfil.vinculoAtual;

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
        <FuncionarioAvatar
          codparc={perfil.codparc}
          nome={perfil.nomeparc}
          size="large"
        />
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
            {perfil.nomeparc}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
            {v?.cargo && (
              <Typography variant="body2" color="text.secondary">
                {v.cargo}
              </Typography>
            )}
            {v?.departamento && (
              <Typography variant="body2" color="text.secondary">
                {v?.cargo ? '·' : ''} {v.departamento}
              </Typography>
            )}
            {v?.empresa && (
              <Typography variant="body2" color="text.secondary">
                · {v.empresa}
              </Typography>
            )}
          </Stack>
          <Box sx={{ mt: 1 }}>
            <JornadaChips perfil={perfil} />
          </Box>
        </Box>
      </Stack>
      {children}
    </Paper>
  );
}
