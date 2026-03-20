import {
  Drawer, Box, IconButton, Typography, Stack, Divider, CircularProgress,
} from '@mui/material';
import { Close, DirectionsCarRounded, BuildRounded, EngineeringRounded } from '@mui/icons-material';
import { OsStatusBadge, TipoManutBadge, StatusGigBadge } from '@/components/os/os-badges';
import { DisplayDate } from '@/components/shared/display-date';
import { useOsById } from '@/hooks/use-ordens-servico';
import type { OsDetailServico } from '@/types/os-types';

interface OsDrawerProps {
  open: boolean;
  onClose: () => void;
  nuos: number | null;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 0.3 }}>
      <Typography sx={{ fontSize: 12, color: 'text.disabled', width: 100, flexShrink: 0 }}>{label}</Typography>
      <Box sx={{ fontSize: 13, color: 'text.primary' }}>{value ?? '-'}</Box>
    </Stack>
  );
}

function ServicoItem({ s }: { s: OsDetailServico }) {
  return (
    <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: '4px', mb: 1 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.primary', mb: 0.25 }}>
        {s.nomeProduto ?? `Produto #${s.CODPROD}`}
      </Typography>
      <Stack direction="row" spacing={2}>
        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Qtd: {s.QTD ?? '-'}</Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
          R$ {s.VLRTOT?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) ?? '0'}
        </Typography>
        {s.TEMPO && <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{s.TEMPO}min</Typography>}
      </Stack>
      {s.OBSERVACAO && (
        <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: 0.5, fontStyle: 'italic' }}>
          {s.OBSERVACAO}
        </Typography>
      )}
    </Box>
  );
}

const sectionTitle = {
  fontSize: 11, fontWeight: 700, color: 'text.disabled', mb: 1,
  textTransform: 'uppercase', letterSpacing: '0.05em',
} as const;

export function OsDrawer({ open, onClose, nuos }: OsDrawerProps) {
  const { data: os, isLoading } = useOsById(nuos);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 420 } } } }}
    >
      <Box sx={{
        bgcolor: 'action.hover', px: 2, py: 1.5,
        display: 'flex', alignItems: 'center', gap: 1,
        borderBottom: '1px solid', borderColor: 'divider',
      }}>
        <IconButton size="small" onClick={onClose}><Close /></IconButton>
        <Typography sx={{ fontSize: 15, fontWeight: 700, flex: 1 }}>OS #{nuos}</Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={32} />
        </Box>
      ) : os ? (
        <Box sx={{ px: 2, py: 2, overflowY: 'auto', flex: 1 }}>
          <Typography sx={sectionTitle}>
            <DirectionsCarRounded sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
            Veiculo
          </Typography>
          <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: '4px', mb: 2 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
              {os.veiculo.placa ?? '-'} {os.veiculo.tag ? `(${os.veiculo.tag})` : ''}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{os.veiculo.marca ?? '-'}</Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>KM: {os.KM?.toLocaleString() ?? '-'}</Typography>
              {os.HORIMETRO && (
                <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>Horimetro: {os.HORIMETRO}</Typography>
              )}
            </Stack>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Typography sx={sectionTitle}>
            <BuildRounded sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
            Informacoes
          </Typography>
          <Stack spacing={0.25} sx={{ mb: 2 }}>
            <InfoRow label="Status" value={<OsStatusBadge status={os.STATUS} size="sm" />} />
            <InfoRow label="Tipo" value={<TipoManutBadge tipo={os.MANUTENCAO} size="sm" />} />
            <InfoRow label="Status GIG" value={<StatusGigBadge statusGig={os.AD_STATUSGIG} />} />
            {os.localLabel && <InfoRow label="Local" value={os.localLabel} />}
            {os.AD_BLOQUEIOS && os.AD_BLOQUEIOS !== 'N' && <InfoRow label="Bloqueios" value={os.AD_BLOQUEIOS} />}
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Typography sx={sectionTitle}>Datas</Typography>
          <Stack spacing={0.25} sx={{ mb: 2 }}>
            <InfoRow label="Abertura" value={<DisplayDate value={os.DTABERTURA} />} />
            <InfoRow label="Inicio" value={<DisplayDate value={os.DATAINI} />} />
            <InfoRow label="Fim" value={<DisplayDate value={os.DATAFIN} />} />
            <InfoRow label="Previsao" value={<DisplayDate value={os.PREVISAO} />} />
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Typography sx={sectionTitle}>Custo</Typography>
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: 'primary.main', mb: 2 }}>
            R$ {os.custoTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) ?? '0,00'}
          </Typography>

          {os.servicos && os.servicos.length > 0 && (
            <>
              <Divider sx={{ mb: 2 }} />
              <Typography sx={sectionTitle}>
                <EngineeringRounded sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                Servicos ({os.servicos.length})
              </Typography>
              {os.servicos.map((s: OsDetailServico) => (
                <ServicoItem key={`${s.NUOS}-${s.SEQUENCIA}`} s={s} />
              ))}
            </>
          )}
        </Box>
      ) : (
        <Box sx={{ p: 3 }}><Typography>OS nao encontrada</Typography></Box>
      )}
    </Drawer>
  );
}
