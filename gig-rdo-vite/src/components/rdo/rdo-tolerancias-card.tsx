import {
  Box, Chip, Paper, Stack, Typography,
} from '@mui/material';
import {
  CheckCircleOutline, LocalDining, SmokingRooms, Wc,
} from '@mui/icons-material';
import type { RdoListItem } from '@/types/rdo-types';

interface Props { metricas: RdoListItem }

function fmtMin(min: number): string {
  if (min === 0) return '0min';
  const h = Math.floor(Math.abs(min) / 60);
  const m = Math.abs(min) % 60;
  const sign = min < 0 ? '-' : '';
  return h > 0 ? `${sign}${h}h${m > 0 ? `${String(m).padStart(2, '0')}min` : ''}` : `${sign}${m}min`;
}

function RuleRow({ icon, title, items, hasImpact }: {
  icon: React.ReactNode;
  title: string;
  items: Array<{ label: string; value: string; color?: string }>;
  hasImpact: boolean;
}) {
  return (
    <Box sx={{
      p: 1.5, borderRadius: 1,
      bgcolor: hasImpact ? '#F9731606' : '#16A34A06',
      border: `1px solid ${hasImpact ? '#F9731620' : '#16A34A20'}`,
    }}>
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
        {icon}
        <Typography variant="body2" fontWeight={700}>{title}</Typography>
        <Box sx={{ flex: 1 }} />
        {hasImpact ? (
          <Chip label="Impacta" size="small" color="warning" variant="outlined"
            sx={{ height: 20, fontSize: '0.65rem' }} />
        ) : (
          <Chip icon={<CheckCircleOutline sx={{ fontSize: '14px !important' }} />}
            label="Sem impacto" size="small" color="success" variant="outlined"
            sx={{ height: 20, fontSize: '0.65rem' }} />
        )}
      </Stack>
      <Stack
        direction="row" flexWrap="wrap" gap={2}
        sx={{ pl: 3 }}
      >
        {items.map((it) => (
          <Stack key={it.label} spacing={0}>
            <Typography variant="caption" color="text.secondary">{it.label}</Typography>
            <Typography variant="caption" fontWeight={600} color={it.color}>
              {it.value}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

export function RdoToleranciasCard({ metricas: m }: Props) {
  const hasAlmoco = m.almocoMin > 0;
  const hasBanheiro = m.banheiroMin > 0;
  const hasFumar = m.fumarQtd > 0;
  if (!hasAlmoco && !hasBanheiro && !hasFumar) return null;

  const almocoExcesso = Math.max(m.almocoMin - m.almocoDescontadoMin, 0);
  const banheiroExcesso = Math.max(m.banheiroMin - m.banheiroDescontadoMin, 0);

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
        Regras de Tolerancia Aplicadas
      </Typography>
      <Stack spacing={1}>
        {hasAlmoco && (
          <RuleRow
            icon={<LocalDining sx={{ fontSize: 16, color: '#F97316' }} />}
            title="Almoco"
            hasImpact={almocoExcesso > 0}
            items={[
              { label: 'Registrado', value: fmtMin(m.almocoMin) },
              { label: 'Intervalo jornada', value: fmtMin(m.intervaloAlmocoMin) },
              { label: 'Descontado', value: fmtMin(m.almocoDescontadoMin) },
              ...(almocoExcesso > 0
                ? [{ label: 'Excedente', value: `+${fmtMin(almocoExcesso)}`, color: '#F97316' }]
                : []),
            ]}
          />
        )}
        {hasBanheiro && (
          <RuleRow
            icon={<Wc sx={{ fontSize: 16, color: '#8B5CF6' }} />}
            title="Banheiro"
            hasImpact={banheiroExcesso > 0}
            items={[
              { label: 'Registrado', value: fmtMin(m.banheiroMin) },
              { label: 'Tolerancia', value: fmtMin(m.banheiroDescontadoMin) },
              ...(banheiroExcesso > 0
                ? [{ label: 'Excedente (improdutivo)', value: `+${fmtMin(banheiroExcesso)}`, color: '#EF4444' }]
                : []),
            ]}
          />
        )}
        {hasFumar && (
          <RuleRow
            icon={<SmokingRooms sx={{ fontSize: 16, color: '#78716C' }} />}
            title="Fumar"
            hasImpact
            items={[
              { label: 'Registros', value: `${m.fumarQtd}x` },
              { label: 'Penalidade', value: '5min/cada' },
              { label: 'Total deduzido', value: `-${fmtMin(m.minutosFumarPenalidade)}`, color: '#EF4444' },
            ]}
          />
        )}
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Regras configuradas em AD_RDOMOTIVOS. Almoco so impacta se exceder o intervalo da jornada.
        Banheiro: direito de 10min, so impacta o excedente.
      </Typography>
    </Paper>
  );
}
