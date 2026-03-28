import {
  Drawer, Box, Typography, Chip, IconButton,
  Button, Stack, CircularProgress,
} from '@mui/material';
import {
  Close, CheckCircle, Cancel,
  Phone, Email, Place, DirectionsCar, Schedule, WhatsApp,
} from '@mui/icons-material';
import { format, parseISO, differenceInMinutes, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCorridaById, useUpdateCorridaStatus } from '@/hooks/use-corridas';
import { useAuthStore } from '@/stores/auth-store';
import { STATUS_LABELS, STATUS_COLORS, BUSCAR_LEVAR_LABELS } from '@/types/corrida';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';

interface CorridaDrawerProps {
  corridaId: number | null;
  open: boolean;
  onClose: () => void;
  onEdit: (id: number) => void;
}

function fmtFull(val: string | null) {
  if (!val) return null;
  try { return format(parseISO(val), "dd/MM/yyyy 'as' HH:mm"); } catch { return val; }
}

function tempoMinutos(c: string | null, f: string | null): number | null {
  if (!c || !f) return null;
  try {
    const m = differenceInMinutes(parseISO(f), parseISO(c));
    return m >= 0 ? m : null;
  } catch { return null; }
}

function tempoLabel(min: number): string {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function tempoDesde(val: string | null): string | null {
  if (!val) return null;
  try { return formatDistanceToNow(parseISO(val), { addSuffix: true, locale: ptBR }); } catch { return null; }
}

function buildMapsEmbedUrl(c: { RUA_PARCEIRO?: string | null; NUMEND_PARCEIRO?: string | null; BAIRRO_PARCEIRO?: string | null; CIDADE_PARCEIRO?: string | null; UF_PARCEIRO?: string | null; LATITUDE_PARCEIRO?: number | null; LONGITUDE_PARCEIRO?: number | null; NOMEPARC?: string | null }): string | null {
  const key = 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8';
  if (c.LATITUDE_PARCEIRO && c.LONGITUDE_PARCEIRO) {
    return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${c.LATITUDE_PARCEIRO},${c.LONGITUDE_PARCEIRO}&zoom=15`;
  }
  const parts = [c.RUA_PARCEIRO, c.NUMEND_PARCEIRO, c.BAIRRO_PARCEIRO, c.CIDADE_PARCEIRO, c.UF_PARCEIRO].filter(Boolean);
  if (parts.length >= 2) return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(parts.join(', '))}&zoom=15`;
  if (c.NOMEPARC) return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(c.NOMEPARC)}&zoom=14`;
  return null;
}

function buildRouteUrl(c: { RUA_PARCEIRO?: string | null; NUMEND_PARCEIRO?: string | null; CIDADE_PARCEIRO?: string | null; UF_PARCEIRO?: string | null; LATITUDE_PARCEIRO?: number | null; LONGITUDE_PARCEIRO?: number | null }): string | null {
  if (c.LATITUDE_PARCEIRO && c.LONGITUDE_PARCEIRO) return `https://www.google.com/maps/dir/?api=1&destination=${c.LATITUDE_PARCEIRO},${c.LONGITUDE_PARCEIRO}`;
  const parts = [c.RUA_PARCEIRO, c.NUMEND_PARCEIRO, c.CIDADE_PARCEIRO, c.UF_PARCEIRO].filter(Boolean);
  if (parts.length >= 2) return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(parts.join(', '))}`;
  return null;
}

export function CorridaDrawer({ corridaId, open, onClose, onEdit }: CorridaDrawerProps) {
  const user = useAuthStore((s) => s.user);
  const { data: corrida, isLoading } = useCorridaById(corridaId);
  const updateStatus = useUpdateCorridaStatus();

  if (!open) return null;

  const canAct = corrida?.STATUS === '0' || corrida?.STATUS === '1';
  const minutos = corrida ? tempoMinutos(corrida.DT_CREATED, corrida.DT_FINISHED) : null;
  const mapsUrl = corrida ? buildMapsEmbedUrl(corrida) : null;
  const routeUrl = corrida ? buildRouteUrl(corrida) : null;
  const aguardando = corrida?.STATUS === '0' ? tempoDesde(corrida.DT_CREATED) : null;

  const endParts = corrida ? [corrida.RUA_PARCEIRO, corrida.NUMEND_PARCEIRO, corrida.COMPLEMENTO_PARCEIRO].filter(Boolean).join(', ') : '';
  const cidUf = corrida ? [corrida.BAIRRO_PARCEIRO, corrida.CIDADE_PARCEIRO, corrida.UF_PARCEIRO].filter(Boolean).join(' - ') : '';

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      slotProps={{ paper: { sx: { width: 480, maxWidth: '100vw' } } }}>
      {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>}

      {corrida && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* === HEADER === */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={800}>#{corrida.ID}</Typography>
            <Typography variant="caption" fontWeight={700} sx={{ color: STATUS_COLORS[corrida.STATUS] }}>
              {STATUS_LABELS[corrida.STATUS]}
            </Typography>
            <Typography variant="caption" color="text.secondary">{BUSCAR_LEVAR_LABELS[corrida.BUSCARLEVAR]}</Typography>
            {corrida.ENVIAWPP === 'S' && <WhatsApp sx={{ fontSize: 14, color: '#25D366' }} />}
            {minutos != null && (
              <Chip label={tempoLabel(minutos)} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#2e7d3214', color: '#2e7d32' }} />
            )}
            {aguardando && (
              <Typography variant="caption" color="warning.main" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
                {aguardando}
              </Typography>
            )}
            <Box sx={{ flex: 1 }} />
            <IconButton size="small" onClick={onClose}><Close sx={{ fontSize: 16 }} /></IconButton>
          </Stack>

          <Box sx={{ flex: 1, overflow: 'auto' }}>

            {/* === PESSOAS === */}
            <Stack direction="row" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
              <PersonCell
                label="Solicitante"
                codparc={corrida.CODPARC_SOLICITANTE}
                nome={corrida.NOMECOMPLETO_SOLICITANTE ?? corrida.NOMESOLICITANTE}
                subtitle={[corrida.CARGO_SOLICITANTE, corrida.SETOR].filter(Boolean).join(' · ')}
                sx={{ borderRight: '1px solid', borderColor: 'divider' }}
              />
              <PersonCell
                label="Motorista"
                codparc={corrida.CODPARC_MOTORISTA}
                nome={corrida.NOMECOMPLETO_MOTORISTA ?? corrida.NOMEMOTORISTA}
                subtitle={corrida.CARGO_MOTORISTA}
                empty="Nao atribuido"
              />
            </Stack>

            {/* === DESTINO === */}
            <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" spacing={0.75} alignItems="flex-start">
                <Place sx={{ fontSize: 16, color: 'primary.main', mt: 0.125 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" fontWeight={700} display="block" sx={{ lineHeight: 1.3 }}>
                    {corrida.NOMEPARC ?? corrida.DESTINO ?? 'Sem destino'}
                  </Typography>
                  {endParts && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.68rem', lineHeight: 1.3 }}>
                      {endParts}
                    </Typography>
                  )}
                  {cidUf && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.68rem', lineHeight: 1.3 }}>
                      {cidUf}{corrida.CEP_PARCEIRO ? ` · CEP ${corrida.CEP_PARCEIRO}` : ''}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={1.5} sx={{ mt: 0.5 }}>
                    {corrida.TELEFONE_PARCEIRO && (
                      <Inline icon={<Phone sx={{ fontSize: 11 }} />} text={corrida.TELEFONE_PARCEIRO} />
                    )}
                    {corrida.EMAIL_PARCEIRO && (
                      <Inline icon={<Email sx={{ fontSize: 11 }} />} text={corrida.EMAIL_PARCEIRO} />
                    )}
                    {routeUrl && (
                      <Stack direction="row" spacing={0.3} alignItems="center"
                        component="a" href={routeUrl} target="_blank" rel="noopener"
                        sx={{ textDecoration: 'none', color: 'primary.main' }}>
                        <DirectionsCar sx={{ fontSize: 12 }} />
                        <Typography variant="caption" sx={{ fontSize: '0.68rem', fontWeight: 600 }}>Rota</Typography>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Box>

            {/* === MAPA === */}
            {mapsUrl && (
              <Box sx={{ height: 200, borderBottom: '1px solid', borderColor: 'divider' }}>
                <iframe src={mapsUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </Box>
            )}

            {/* === MERCADORIA / OBS === */}
            {(corrida.PASSAGEIROSMERCADORIA || corrida.OBS) && (
              <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                {corrida.PASSAGEIROSMERCADORIA && (
                  <>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Mercadoria / Passageiros
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>{corrida.PASSAGEIROSMERCADORIA}</Typography>
                  </>
                )}
                {corrida.OBS && (
                  <Box sx={{ mt: corrida.PASSAGEIROSMERCADORIA ? 0.75 : 0 }}>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Observacao
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{corrida.OBS}</Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* === TIMELINE DE DATAS === */}
            <Box sx={{ px: 2, py: 1.25 }}>
              <Stack spacing={0.75}>
                <TimelineItem
                  label="Acionamento"
                  date={fmtFull(corrida.DT_ACIONAMENTO)}
                  icon={<Schedule sx={{ fontSize: 12 }} />}
                  color="primary.main"
                />
                <TimelineItem
                  label="Solicitado"
                  date={fmtFull(corrida.DT_CREATED)}
                  icon={<Schedule sx={{ fontSize: 12 }} />}
                  color="text.secondary"
                />
                {corrida.DT_UPDATED && corrida.DT_UPDATED !== corrida.DT_CREATED && (
                  <TimelineItem
                    label="Ultima atualizacao"
                    date={fmtFull(corrida.DT_UPDATED)}
                    icon={<Schedule sx={{ fontSize: 12 }} />}
                    color="text.secondary"
                  />
                )}
                {corrida.DT_FINISHED && (
                  <TimelineItem
                    label="Concluida"
                    date={fmtFull(corrida.DT_FINISHED)}
                    icon={<CheckCircle sx={{ fontSize: 12 }} />}
                    color="success.main"
                    extra={minutos != null ? `Durou ${tempoLabel(minutos)}` : undefined}
                  />
                )}
                {!corrida.DT_FINISHED && corrida.STATUS !== '3' && (
                  <TimelineItem
                    label="Em aberto"
                    date={tempoDesde(corrida.DT_CREATED) ?? '-'}
                    icon={<Schedule sx={{ fontSize: 12 }} />}
                    color="warning.main"
                  />
                )}
                {corrida.STATUS === '3' && (
                  <TimelineItem
                    label="Cancelada"
                    date={fmtFull(corrida.DT_FINISHED) ?? fmtFull(corrida.DT_UPDATED) ?? '-'}
                    icon={<Cancel sx={{ fontSize: 12 }} />}
                    color="error.main"
                  />
                )}
              </Stack>
            </Box>

          </Box>

          {/* === FOOTER ACOES === */}
          {canAct && (
            <Stack direction="row" spacing={1} alignItems="center"
              sx={{ px: 2, py: 1.25, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Button size="small" variant="contained" color="success" startIcon={<CheckCircle sx={{ fontSize: 16 }} />}
                disabled={updateStatus.isPending}
                onClick={() => updateStatus.mutate({ id: corrida.ID, status: '2', codUsu: user?.codusu })}
                sx={{ textTransform: 'none', fontWeight: 600 }}>
                Concluir Corrida
              </Button>
              <Button size="small" variant="outlined" color="error" startIcon={<Cancel sx={{ fontSize: 16 }} />}
                disabled={updateStatus.isPending}
                onClick={() => updateStatus.mutate({ id: corrida.ID, status: '3', codUsu: user?.codusu })}
                sx={{ textTransform: 'none' }}>
                Cancelar
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button size="small" variant="text" onClick={() => onEdit(corrida.ID)}
                sx={{ textTransform: 'none', fontSize: 12 }}>
                Editar
              </Button>
            </Stack>
          )}
        </Box>
      )}
    </Drawer>
  );
}

function PersonCell({ label, codparc, nome, subtitle, empty, sx }: {
  label: string; codparc?: number | null; nome?: string | null; subtitle?: string | null; empty?: string;
  sx?: Record<string, unknown>;
}) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1, px: 2, py: 1, ...sx }}>
      <FuncionarioAvatar codparc={codparc} nome={nome ?? undefined} size="small" />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1 }}>
          {label}
        </Typography>
        <Typography variant="caption" fontWeight={600} noWrap display="block"
          sx={{ color: nome ? 'text.primary' : 'text.disabled' }}>
          {nome ?? empty ?? '-'}
        </Typography>
        {subtitle && <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.6rem' }}>{subtitle}</Typography>}
      </Box>
    </Stack>
  );
}

function Inline({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Stack direction="row" spacing={0.3} alignItems="center">
      <Box sx={{ color: 'text.disabled', display: 'flex' }}>{icon}</Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>{text}</Typography>
    </Stack>
  );
}

function TimelineItem({ label, date, icon, color, extra }: {
  label: string; date: string | null; icon: React.ReactNode; color: string; extra?: string;
}) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ color, display: 'flex', alignItems: 'center' }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.72rem', color }}>{label}</Typography>
          <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>{date ?? '-'}</Typography>
        </Stack>
        {extra && (
          <Typography variant="caption" color="success.main" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>{extra}</Typography>
        )}
      </Box>
    </Stack>
  );
}
