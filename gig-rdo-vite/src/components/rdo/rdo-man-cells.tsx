import { Typography, Tooltip, Stack, Avatar } from '@mui/material';
import { DirectionsCar } from '@mui/icons-material';
import type { RdoListItem } from '@/types/rdo-types';
import { getFuncionarioFotoUrl } from '@/api/funcionarios';

export function AvatarCell({ row }: { row: RdoListItem }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
      <Avatar src={row.CODPARC ? getFuncionarioFotoUrl(row.CODPARC) : undefined}
        sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.main' }}>
        {row.nomeparc?.charAt(0) || '?'}
      </Avatar>
      <Typography variant="body2" noWrap sx={{
        fontWeight: 500, minWidth: 0,
        cursor: row.CODPARC ? 'pointer' : 'default',
        '&:hover': row.CODPARC ? { textDecoration: 'underline', color: 'primary.main' } : {},
      }}>
        {row.CODPARC && (
          <Typography component="span" variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
            {row.CODPARC}
          </Typography>
        )}
        {row.nomeparc || '-'}
      </Typography>
    </Stack>
  );
}

export function VeiculoCell(
  { placa, modelo }: { placa?: string | null; modelo?: string | null },
) {
  const p = placa?.trim();
  if (!p) return <Typography variant="body2" color="text.disabled">-</Typography>;
  const m = modelo?.trim();
  const tip = [p, m].filter(Boolean).join(' — ');
  return (
    <Tooltip title={tip} arrow>
      <Stack direction="row" spacing={0.5} alignItems="center"
        sx={{ overflow: 'hidden', width: '100%' }}>
        <DirectionsCar sx={{ fontSize: 14, color: 'text.secondary', flexShrink: 0 }} />
        <Typography variant="body2" fontSize={12} noWrap>
          <Typography component="span" fontFamily="monospace" fontWeight={600}
            fontSize={12}>{p}</Typography>
          {m && (
            <Typography component="span" color="text.secondary"
              fontSize={11} sx={{ ml: 0.5 }}>{m}</Typography>
          )}
        </Typography>
      </Stack>
    </Tooltip>
  );
}
