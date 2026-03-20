import { Box, Typography, alpha } from '@mui/material';
import { Build, FiberManualRecord, Schedule, AccessTime } from '@mui/icons-material';
import { PlacaVeiculo } from '@/components/shared/placa-veiculo';
import { getOsStatusColor, getSrvStatusColor } from '@/utils/os-status-colors';
import { useOsServicos } from '@/hooks/use-os-servicos';
import type { OsGeral } from '@/hooks/use-todas-os';
import type { OsServiceItem } from '@/types/os-types';

interface OsCardProps {
  os: OsGeral;
  isMinha: boolean;
  activeNuos?: number | null;
  activeSequencia?: number | null;
}

function formatTempo(min: number | null): string {
  if (min == null || min <= 0) return '';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h${m > 0 ? `${String(m).padStart(2, '0')}m` : ''}` : `${m}m`;
}

function formatDate(dt: string | null): string {
  if (!dt) return '';
  const d = new Date(dt);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function OsCard({ os, isMinha, activeNuos, activeSequencia }: OsCardProps) {
  const isActive = os.NUOS === activeNuos;
  const { data: servicos } = useOsServicos(os.NUOS);
  const osColor = getOsStatusColor(os.STATUS);

  const borderColor = isActive ? '#2e7d32' : isMinha ? 'primary.main' : 'divider';
  const bgColor = isActive
    ? (t: any) => alpha(t.palette.success.main, 0.05)
    : isMinha ? (t: any) => alpha(t.palette.primary.main, 0.03) : 'transparent';

  return (
    <Box sx={{ p: 1, borderRadius: 1, border: '1.5px solid', borderColor, bgcolor: bgColor }}>
      {/* ── Header: Placa hero + OS number ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
        {os.PLACA ? (
          <PlacaVeiculo placa={os.PLACA} label={os.AD_TAG || 'VEI'} scale={0.4} />
        ) : null}
        {/* OS number + tag */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <Typography sx={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700, color: 'text.primary' }}>
              {os.NUOS}
            </Typography>
            {os.AD_TAG && (
              <Typography sx={{ fontSize: '0.58rem', color: 'primary.main', fontWeight: 600 }}>{os.AD_TAG}</Typography>
            )}
          </Box>
          {os.MARCAMODELO && (
            <Typography sx={{ fontSize: '0.54rem', color: 'text.secondary', lineHeight: 1.2 }} noWrap>{os.MARCAMODELO}</Typography>
          )}
        </Box>
        {/* Status + badge */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.3, flexShrink: 0 }}>
          <Box sx={{ px: 0.5, py: 0.15, borderRadius: 0.5, bgcolor: osColor.bg, color: osColor.text, display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.5rem', fontWeight: 700 }}>{os.statusLabel}</Typography>
          </Box>
          {isActive ? (
            <Box sx={{
              px: 0.5, py: 0.1, borderRadius: 0.5, bgcolor: '#2e7d32', color: '#fff',
              animation: 'os-pulse 2s infinite',
              '@keyframes os-pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
            }}>
              <Typography sx={{ fontSize: '0.46rem', fontWeight: 700 }}>TRABALHANDO</Typography>
            </Box>
          ) : isMinha ? (
            <Box sx={{ px: 0.5, py: 0.1, borderRadius: 0.5, bgcolor: 'primary.main', color: '#fff' }}>
              <Typography sx={{ fontSize: '0.46rem', fontWeight: 700 }}>MINHA</Typography>
            </Box>
          ) : null}
        </Box>
      </Box>

      {/* ── Type + Manutencao row ── */}
      <Box sx={{ display: 'flex', gap: 0.75, mb: 0.5, ml: 0.25 }}>
        <Typography sx={{ fontSize: '0.52rem', color: 'text.disabled' }}>{os.tipoLabel}</Typography>
        {os.manutencaoLabel && (
          <Typography sx={{ fontSize: '0.52rem', color: 'text.disabled' }}>{os.manutencaoLabel}</Typography>
        )}
      </Box>

      {/* ── Services list ── */}
      {servicos && servicos.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {servicos.map((s) => (
            <ServiceRow key={s.SEQUENCIA} service={s} isActive={isActive && s.SEQUENCIA === activeSequencia} />
          ))}
        </Box>
      ) : (
        <Typography sx={{ fontSize: '0.54rem', color: 'text.disabled', ml: 0.25 }}>
          {os.TOTAL_SERVICOS} servico{os.TOTAL_SERVICOS !== 1 ? 's' : ''}
        </Typography>
      )}
    </Box>
  );
}

/* ── Service row ── */
function ServiceRow({ service: s, isActive }: { service: OsServiceItem; isActive: boolean }) {
  const srvColor = getSrvStatusColor(s.STATUS);
  const tempo = formatTempo(s.TEMPO);

  return (
    <Box sx={{
      p: 0.6, borderRadius: 0.5,
      bgcolor: isActive ? (t: any) => alpha(t.palette.success.main, 0.08) : (t: any) => alpha(t.palette.action.hover, 0.04),
      border: isActive ? '1px solid' : '1px solid transparent',
      borderColor: isActive ? '#2e7d3280' : 'transparent',
    }}>
      {/* Service name + status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
        {isActive ? (
          <FiberManualRecord sx={{
            fontSize: 7, color: '#2e7d32',
            animation: 'srv-p 2s infinite',
            '@keyframes srv-p': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
          }} />
        ) : (
          <Build sx={{ fontSize: 11, color: srvColor.bg, opacity: 0.8 }} />
        )}
        <Typography sx={{
          fontSize: '0.6rem', fontWeight: isActive ? 700 : 600,
          color: isActive ? '#2e7d32' : 'text.primary', flex: 1, minWidth: 0,
        }} noWrap>
          {s.nomeProduto ?? `Servico #${s.CODPROD}`}
        </Typography>
        <Box sx={{ px: 0.4, py: 0.1, borderRadius: 0.4, bgcolor: srvColor.bg, color: srvColor.text, flexShrink: 0 }}>
          <Typography sx={{ fontSize: '0.42rem', fontWeight: 700 }}>{s.statusLabel ?? s.STATUS}</Typography>
        </Box>
      </Box>

      {/* Details row: code + tempo + dates */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.25, ml: 1.75 }}>
        <Typography sx={{ fontSize: '0.48rem', color: 'text.disabled', fontFamily: 'monospace' }}>
          #{s.CODPROD}
        </Typography>
        {tempo && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
            <Schedule sx={{ fontSize: 9, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: '0.5rem', fontWeight: 600, color: isActive ? '#2e7d32' : 'text.secondary' }}>
              {tempo}
            </Typography>
          </Box>
        )}
        {s.DATAINI && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
            <AccessTime sx={{ fontSize: 8, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: '0.46rem', color: 'text.disabled' }}>
              {formatDate(s.DATAINI)}
              {s.DATAFIN && ` → ${formatDate(s.DATAFIN)}`}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Observation */}
      {s.OBSERVACAO && (
        <Typography sx={{ fontSize: '0.48rem', color: 'text.disabled', fontStyle: 'italic', mt: 0.2, ml: 1.75 }} noWrap>
          {s.OBSERVACAO}
        </Typography>
      )}
    </Box>
  );
}
