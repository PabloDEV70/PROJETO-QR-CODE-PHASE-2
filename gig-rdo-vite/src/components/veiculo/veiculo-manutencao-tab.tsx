import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
} from '@mui/material';
import { format, parseISO, isValid } from 'date-fns';
import type { OsManutencao } from '@/types/veiculo-perfil-types';

interface Props {
  items: OsManutencao[];
}

function safeFmt(v: string | Date | null, fmt = 'dd/MM/yyyy'): string {
  if (!v) return '-';
  const d = typeof v === 'string' ? parseISO(v) : new Date(v);
  return isValid(d) ? format(d, fmt) : '-';
}

function statusChipColor(s: string): 'info' | 'warning' | 'success' | 'error' | 'default' {
  if (s === 'A') return 'info';
  if (s === 'E') return 'warning';
  if (s === 'F') return 'success';
  if (s === 'C') return 'error';
  return 'default';
}

function OsManutencaoRow({ os }: { os: OsManutencao }) {
  const navigate = useNavigate();

  return (
    <Card
      variant="outlined"
      sx={{
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
      }}
      onClick={() => navigate(`/manutencao/os/${os.nuos}`)}
    >
      <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 70 }}>
            OS {os.nuos}
          </Typography>
          <Chip
            label={os.statusDescricao || os.status}
            size="small"
            color={statusChipColor(os.status)}
            sx={{ height: 20, fontSize: '0.65rem' }}
          />
          <Chip
            label={os.manutencaoDescricao || os.manutencao}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.65rem' }}
          />
          {os.bloqueios === 'S' && (
            <Chip
              label="Bloqueio"
              size="small"
              color="error"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.65rem' }}
            />
          )}
          {os.statusGig && (
            <Chip
              label={os.statusGigDescricao || os.statusGig}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.6rem' }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">
            Inicio: {safeFmt(os.dataini)}
          </Typography>
          {os.previsao && (
            <Typography variant="caption" color="text.secondary">
              Previsao: {safeFmt(os.previsao)}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            Fim: {safeFmt(os.datafin)}
          </Typography>
          {os.parceiroNome && (
            <Typography variant="caption" color="text.secondary">
              Executor: {os.parceiroNome}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export function VeiculoManutencaoTab({ items }: Props) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">Nenhuma OS de manutencao encontrada</Typography>
        </CardContent>
      </Card>
    );
  }

  const ativas = items.filter((o) => o.status !== 'F' && o.status !== 'C');
  const finalizadas = items.filter((o) => o.status === 'F' || o.status === 'C');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {ativas.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Ativas ({ativas.length})
          </Typography>
          {ativas.map((os) => (
            <OsManutencaoRow key={os.nuos} os={os} />
          ))}
        </>
      )}
      {finalizadas.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: ativas.length > 0 ? 1 : 0 }}>
            Finalizadas / Canceladas ({finalizadas.length})
          </Typography>
          {finalizadas.map((os) => (
            <OsManutencaoRow key={os.nuos} os={os} />
          ))}
        </>
      )}
    </Box>
  );
}
