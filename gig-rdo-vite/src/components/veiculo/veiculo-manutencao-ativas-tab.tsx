import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Skeleton,
  Typography,
} from '@mui/material';
import { format, parseISO, isValid } from 'date-fns';
import type { OsManutencaoEnriched } from '@/types/os-detalhada-types';

interface Props {
  items?: OsManutencaoEnriched[];
  isLoading: boolean;
}

function safeFmt(v: string | Date | null, fmt = 'dd/MM/yyyy'): string {
  if (!v) return '-';
  const d = typeof v === 'string' ? parseISO(v) : new Date(v);
  return isValid(d) ? format(d, fmt) : '-';
}

function statusColor(s: string): 'info' | 'warning' | 'success' | 'error' | 'default' {
  if (s === 'A') return 'info';
  if (s === 'E') return 'warning';
  return 'default';
}

function OsAtivaCard({ os }: { os: OsManutencaoEnriched }) {
  const navigate = useNavigate();
  const progress = os.QTD_SERVICOS > 0
    ? Math.round((os.SERVICOS_FINALIZADOS / os.QTD_SERVICOS) * 100)
    : 0;

  return (
    <Card
      variant="outlined"
      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
      onClick={() => navigate(`/manutencao/os/${os.NUOS}`)}
    >
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            OS {os.NUOS}
          </Typography>
          <Chip
            label={os.STATUS_DESCRICAO}
            size="small"
            color={statusColor(os.STATUS)}
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={os.MANUTENCAO_DESCRICAO}
            size="small"
            variant="outlined"
          />
          {os.AD_BLOQUEIOS === 'S' && (
            <Chip label="Bloqueio Comercial" size="small" color="error" />
          )}
          {os.AD_STATUSGIG && os.AD_STATUSGIG.trim() && (
            <Chip
              label={os.AD_STATUSGIG_DESCRICAO || os.AD_STATUSGIG}
              size="small"
              variant="outlined"
              color={os.AD_STATUSGIG === 'AN' || os.AD_STATUSGIG === 'SN' ? 'success' : 'warning'}
            />
          )}
        </Box>

        {os.SERVICO_PRINCIPAL && (
          <Typography variant="body2" sx={{ mt: 0.75, fontWeight: 500 }}>
            {os.SERVICO_PRINCIPAL}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 0.75, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">
            Inicio: {safeFmt(os.DATAINI)}
          </Typography>
          {os.PREVISAO && (
            <Typography variant="caption" color="text.secondary">
              Previsao: {safeFmt(os.PREVISAO)}
            </Typography>
          )}
          {os.KM != null && os.KM > 0 && (
            <Typography variant="caption" color="text.secondary">
              KM: {os.KM.toLocaleString('pt-BR')}
            </Typography>
          )}
          {os.HORIMETRO != null && os.HORIMETRO > 0 && (
            <Typography variant="caption" color="text.secondary">
              Horimetro: {os.HORIMETRO}
            </Typography>
          )}
        </Box>

        {os.QTD_SERVICOS > 0 && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
              <Typography variant="caption" color="text.secondary">
                Servicos: {os.SERVICOS_FINALIZADOS}/{os.QTD_SERVICOS}
                {os.SERVICOS_EM_EXEC > 0 && ` (${os.SERVICOS_EM_EXEC} em exec)`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export function VeiculoManutencaoAtivasTab({ items, isLoading }: Props) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Skeleton height={100} />
        <Skeleton height={100} />
      </Box>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Nenhuma OS de manutencao ativa
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        OS de Manutencao Ativas ({items.length})
      </Typography>
      {items.map((os) => (
        <OsAtivaCard key={os.NUOS} os={os} />
      ))}
    </Box>
  );
}
