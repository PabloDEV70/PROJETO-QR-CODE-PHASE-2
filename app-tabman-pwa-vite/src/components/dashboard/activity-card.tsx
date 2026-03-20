import { useState, useCallback, useMemo, useEffect } from 'react';
import { Box, Avatar, Typography, Paper } from '@mui/material';
import { FiberManualRecord, Build, Schedule } from '@mui/icons-material';
import { getFotoUrl } from '@/api/funcionarios';
import { PlacaVeiculo } from '@/components/shared/placa-veiculo';
import { getOsStatusColor, getSrvStatusColor } from '@/utils/os-status-colors';
import { getCategoryMeta } from '@/utils/wrench-time-categories';
import { getMotivoIcon } from '@/utils/motivo-icons';
import { formatElapsedTimer } from '@/utils/hora-utils';
import { isOngoing, type QuemFazRow } from '@/types/quem-faz-types';

interface Props { row: QuemFazRow; onClick?: () => void }

function getAccent(r: QuemFazRow): string {
  if (r.ultMotivoProdutivo === 'S') return '#16a34a';
  if (r.ultMotivoCategoria) return getCategoryMeta(r.ultMotivoCategoria).color;
  return '#64748B';
}
const hhmm = (v: number | null) => v == null ? '' : `${String(Math.floor(v / 100)).padStart(2, '0')}:${String(v % 100).padStart(2, '0')}`;
const fmtMin = (m: number | null) => { if (m == null || m <= 0) return ''; const h = Math.floor(m / 60); return h > 0 ? `${h}h${String(m % 60).padStart(2, '0')}` : `${m}m`; };

function Pill({ bg, fg, children }: { bg: string; fg: string; children: string }) {
  return <Box component="span" sx={{ px: 0.6, py: 0.15, borderRadius: 1, bgcolor: bg, color: fg, fontSize: '0.6rem', fontWeight: 700, lineHeight: 1, display: 'inline-block', flexShrink: 0 }}>{children}</Box>;
}

export function ActivityCard({ row, onClick }: Props) {
  const [imgErr, setImgErr] = useState(false);
  const onImgErr = useCallback(() => setImgErr(true), []);
  const foto = useMemo(() => row.CODPARC > 0 ? getFotoUrl(row.CODPARC) : '', [row.CODPARC]);
  const on = isOngoing(row);
  const color = row.ultMotivoSigla ? getAccent(row) : '#78909c';
  const Icon = getMotivoIcon(row.ultMotivoSigla);
  const osC = row.ultOsStatus ? getOsStatusColor(row.ultOsStatus) : null;
  const srvC = row.ultSrvStatus ? getSrvStatusColor(row.ultSrvStatus) : null;
  const ini = useMemo(() => {
    const p = (row.nomeparc ?? '').trim().split(/\s+/);
    return ((p[0]?.charAt(0) ?? '') + (p.length > 1 ? p[p.length - 1]!.charAt(0) : '')).toUpperCase();
  }, [row.nomeparc]);

  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    if (!on || row.ultHrini == null) return;
    const tick = () => {
      const h = Math.floor(row.ultHrini! / 100), m = row.ultHrini! % 100, now = new Date();
      setElapsed(formatElapsedTimer(Math.max(0, now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() - (h * 3600 + m * 60))));
    };
    tick(); const id = setInterval(tick, 1_000); return () => clearInterval(id);
  }, [on, row.ultHrini]);


  return (
    <Paper
      onClick={onClick} elevation={on ? 3 : 1}
      sx={{
        overflow: 'hidden', borderRadius: 2, bgcolor: '#fff',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 4 } : {},
        '&:active': onClick ? { transform: 'scale(0.99)' } : {},
        transition: 'box-shadow 0.15s, transform 0.1s',
      }}
    >
      {/* ── TOP: Colaborador (accent bg) ── */}
      <Box sx={{ display: 'flex', gap: 1.25, p: 1.5, bgcolor: color }}>
        <Avatar
          src={foto && !imgErr ? foto : undefined}
          slotProps={{ img: { onError: onImgErr, referrerPolicy: 'no-referrer' } }}
          sx={{ width: 52, height: 52, bgcolor: 'rgba(255,255,255,0.2)', fontSize: '1.2rem', fontWeight: 800, flexShrink: 0, border: '2px solid rgba(255,255,255,0.4)' }}
        >
          {ini}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }} noWrap>
            {row.nomeparc}
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', lineHeight: 1.25 }}>
            {row.nomeusu ? `@${row.nomeusu}` : `#${row.CODPARC}`}
          </Typography>
          <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.25 }} noWrap>
            {row.departamento}
          </Typography>
          <Typography sx={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.25 }} noWrap>
            {row.cargo}
          </Typography>
        </Box>
      </Box>

      {/* ── Motivo + Timer row (only when has activity) ── */}
      {row.ultMotivoSigla ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, px: 1.5, py: 0.75 }}>
          {on && <FiberManualRecord sx={{ fontSize: 8, color, animation: 'pd 2s infinite', '@keyframes pd': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.2 } } }} />}
          <Box sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon sx={{ fontSize: 14 }} />
          </Box>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color }}>{row.ultMotivoSigla}</Typography>
          <Typography sx={{ fontSize: '0.68rem', color: '#777', flex: 1, minWidth: 0 }} noWrap>{row.ultMotivoDesc}</Typography>
          {on && elapsed ? (
            <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '1.1rem', fontWeight: 800, color, flexShrink: 0 }}>
              {elapsed}
            </Typography>
          ) : hhmm(row.ultHrini) ? (
            <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.68rem', color: '#bbb', flexShrink: 0 }}>
              {hhmm(row.ultHrini)}
            </Typography>
          ) : null}
        </Box>
      ) : (
        <Box sx={{ px: 1.5, py: 0.75 }}>
          <Typography sx={{ fontSize: '0.7rem', color: '#bbb', fontStyle: 'italic' }}>Sem atividade registrada</Typography>
        </Box>
      )}

      {/* ── OS / Veiculo / Servico ── */}
      {(row.ultOsPlaca || row.ultNuos) && (
        <Box sx={{ px: 1.5, pb: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75, borderTop: '1px solid #f0f0f0', pt: 1 }}>
          {/* Veiculo */}
          {row.ultOsPlaca && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PlacaVeiculo placa={row.ultOsPlaca} label={row.ultOsTag || row.ultOsTipoEqpto || 'VEI'} scale={0.65} />
              <Box sx={{ minWidth: 0 }}>
                {row.ultOsModelo && <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#444' }} noWrap>{row.ultOsModelo}</Typography>}
                {row.ultOsTipoEqpto && <Typography sx={{ fontSize: '0.62rem', color: '#999', fontWeight: 600 }}>{row.ultOsTipoEqpto}</Typography>}
              </Box>
            </Box>
          )}

          {/* OS */}
          {row.ultNuos && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Build sx={{ fontSize: 16, color: osC?.bg ?? '#999' }} />
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>OS {row.ultNuos}</Typography>
              {osC && <Pill bg={osC.bg} fg={osC.text}>{osC.label}</Pill>}
            </Box>
          )}

          {/* Servico */}
          {row.ultSrvNome && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pl: 2.5 }}>
              <Schedule sx={{ fontSize: 14, color: srvC?.bg ?? '#999' }} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: on ? color : '#424242', flex: 1, minWidth: 0 }} noWrap>
                {row.ultSrvNome}
              </Typography>
              {srvC && <Pill bg={srvC.bg} fg={srvC.text}>{srvC.label}</Pill>}
              {fmtMin(row.ultSrvTempo) && (
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#666', fontFamily: 'monospace', flexShrink: 0 }}>
                  {fmtMin(row.ultSrvTempo)}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
}
