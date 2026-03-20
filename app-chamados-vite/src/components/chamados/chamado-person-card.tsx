import { Stack, Box, Typography } from '@mui/material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';

interface ChamadoPersonCardProps {
  label: string;
  nome: string | null;
  codparc: number | null;
  icon: React.ReactNode;
}

export function ChamadoPersonCard({ label, nome, codparc, icon }: ChamadoPersonCardProps) {
  if (!nome) return null;
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 1 }}>
      <FuncionarioAvatar codparc={codparc} nome={nome} size="small" />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body2" fontWeight={600} noWrap>{nome}</Typography>
      </Box>
      {icon}
    </Stack>
  );
}
