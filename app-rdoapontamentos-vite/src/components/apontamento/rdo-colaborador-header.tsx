import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import type { RdoMetricas } from '@/types/rdo-types';

interface Props {
  m: RdoMetricas;
}

function fmtDate(val: string | null): string {
  if (!val) return '--/--/----';
  try { return format(parseISO(val), "EEEE, dd 'de' MMMM", { locale: ptBR }); }
  catch { return val; }
}

export function RdoColaboradorHeader({ m }: Props) {
  const sub = [m.departamento, m.cargo].filter(Boolean).join(' · ');
  const periodo = [m.primeiraHora, m.ultimaHora].filter(Boolean).join(' – ');

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
        <FuncionarioAvatar codparc={m.CODPARC ?? 0} nome={m.nomeparc ?? ''} size="large" />
        <Box sx={{ flex: 1, minWidth: 160 }}>
          <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
            {m.nomeparc || 'Funcionario'}
          </Typography>
          {sub && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {sub}
            </Typography>
          )}
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
            <Chip
              icon={<CalendarTodayIcon sx={{ fontSize: 13 }} />}
              label={fmtDate(m.DTREF)}
              size="small"
              variant="outlined"
              sx={{ textTransform: 'capitalize', fontSize: 12 }}
            />
            {periodo && (
              <Chip
                icon={<AccessTimeIcon sx={{ fontSize: 13 }} />}
                label={periodo}
                size="small"
                variant="outlined"
                sx={{ fontSize: 12 }}
              />
            )}
            {m.diagnosticoFaixa && (
              <Chip
                label={m.diagnosticoFaixa.texto}
                size="small"
                sx={{
                  bgcolor: m.diagnosticoFaixa.faixa.color,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 11,
                }}
              />
            )}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
