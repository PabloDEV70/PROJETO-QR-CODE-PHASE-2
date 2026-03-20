import {
  Drawer, Box, Typography, Stack, Chip, Divider,
  IconButton, Paper, Skeleton, List, ListItem, ListItemText,
} from '@mui/material';
import { Close, Build, DirectionsCar, CalendarMonth, Handyman } from '@mui/icons-material';
import { useOsDetalhes, useOsServicos } from '@/hooks/use-os';
import {
  getOsStatusLabel, getOsStatusColor, getOsManutencaoLabel,
  getOsStatusGigLabel, isOsBlocking, formatDateBR,
} from '@/utils/os-utils';
import type { OsServico } from '@/types/os-types';

export interface OsDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  nuos: number | null;
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight="medium">{value || '-'}</Typography>
    </Stack>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
      {icon}
      <Typography variant="subtitle2">{title}</Typography>
    </Stack>
  );
}

const SRV_STATUS_COLOR: Record<string, string> = {
  F: '#757575', E: '#2e7d32', A: '#ed6c02',
};

function ServicoItem({ srv }: { srv: OsServico }) {
  return (
    <ListItem disablePadding sx={{ py: 0.25 }}>
      <ListItemText
        primary={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" noWrap sx={{ flex: 1 }}>
              {srv.nomeProduto || `Servico #${srv.SEQUENCIA}`}
            </Typography>
            <Chip
              label={srv.statusLabel || srv.STATUS || '-'}
              size="small"
              sx={{
                height: 20, fontSize: '0.7rem',
                bgcolor: SRV_STATUS_COLOR[srv.STATUS ?? ''] ?? '#ed6c02',
                color: '#fff',
              }}
            />
          </Stack>
        }
        secondary={srv.TEMPO ? `${srv.TEMPO} min` : srv.OBSERVACAO ?? undefined}
      />
    </ListItem>
  );
}

export function OsDetailDrawer({ open, onClose, nuos }: OsDetailDrawerProps) {
  const { data: os, isLoading } = useOsDetalhes(open ? nuos : null);
  const { data: servicos } = useOsServicos(open ? nuos : null);

  const statusColor = getOsStatusColor(os?.STATUS ?? null);
  const statusGigLabel = getOsStatusGigLabel(os?.AD_STATUSGIG ?? null);
  const blocking = isOsBlocking(os?.AD_STATUSGIG ?? null);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: 380, p: 0 } }}
    >
      {/* Header */}
      <Box sx={{
        p: 2, bgcolor: statusColor, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Build />
          <Typography variant="h6" fontWeight="bold">OS {nuos}</Typography>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: '#fff' }} size="small">
          <Close />
        </IconButton>
      </Box>

      <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
        {isLoading ? (
          <Stack spacing={2}>
            <Skeleton variant="rounded" height={80} />
            <Skeleton variant="rounded" height={100} />
            <Skeleton variant="rounded" height={80} />
          </Stack>
        ) : os ? (
          <>
            {/* Status */}
            <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Status</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={os.statusLabel || getOsStatusLabel(os.STATUS)}
                  size="small" sx={{ bgcolor: statusColor, color: '#fff' }} />
                <Chip label={os.manutencaoLabel || getOsManutencaoLabel(os.MANUTENCAO)}
                  size="small" variant="outlined" color="primary" />
                {os.TIPO && (
                  <Chip label={os.TIPO === 'I' ? 'Interna' : 'Externa'}
                    size="small" variant="outlined" />
                )}
                {statusGigLabel && (
                  <Chip label={statusGigLabel} size="small"
                    color={blocking ? 'error' : 'info'} variant="filled" />
                )}
                {os.AD_BLOQUEIOS === 'S' && (
                  <Chip label="Bloqueio Comercial" size="small" color="error" />
                )}
              </Stack>
            </Paper>

            {/* Vehicle */}
            {os.placa && (
              <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
                <SectionHeader icon={<DirectionsCar fontSize="small" color="action" />}
                  title="Veiculo" />
                <InfoRow label="Placa" value={os.placa?.trim() ?? null} />
                {os.tagVeiculo && <InfoRow label="Tag" value={os.tagVeiculo} />}
                {os.marcaModelo && (
                  <InfoRow label="Modelo" value={os.marcaModelo?.trim() ?? null} />
                )}
                {os.KM != null && os.KM > 0 && (
                  <InfoRow label="KM" value={`${os.KM.toLocaleString('pt-BR')} km`} />
                )}
                {os.HORIMETRO != null && os.HORIMETRO > 0 && (
                  <InfoRow label="Horimetro"
                    value={`${os.HORIMETRO.toLocaleString('pt-BR')} h`} />
                )}
              </Paper>
            )}

            {/* Dates */}
            <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
              <SectionHeader icon={<CalendarMonth fontSize="small" color="action" />}
                title="Datas" />
              <InfoRow label="Abertura" value={formatDateBR(os.DTABERTURA)} />
              <InfoRow label="Inicio" value={formatDateBR(os.DATAINI)} />
              <InfoRow label="Previsao" value={formatDateBR(os.PREVISAO)} />
              {os.DATAFIN && (
                <InfoRow label="Finalizada" value={formatDateBR(os.DATAFIN)} />
              )}
              {os.DATAINI && !os.DATAFIN && (() => {
                const dias = Math.floor(
                  (new Date().getTime() - new Date(os.DATAINI).getTime()) / 86400000,
                );
                return <InfoRow label="Dias aberta" value={String(dias)} />;
              })()}
            </Paper>

            {/* Services */}
            {servicos && servicos.length > 0 && (
              <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
                <SectionHeader icon={<Handyman fontSize="small" color="action" />}
                  title={`Servicos (${servicos.length})`} />
                <List dense disablePadding>
                  {servicos.map((srv) => (
                    <ServicoItem key={srv.SEQUENCIA} srv={srv} />
                  ))}
                </List>
              </Paper>
            )}

            {/* Partner */}
            {os.nomeParc && (
              <>
                <Divider sx={{ my: 1 }} />
                <InfoRow label="Parceiro" value={os.nomeParc} />
              </>
            )}
          </>
        ) : (
          <Typography color="text.secondary">OS nao encontrada</Typography>
        )}
      </Box>
    </Drawer>
  );
}
