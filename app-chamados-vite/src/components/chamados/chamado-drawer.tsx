import { useState } from 'react';
import {
  Drawer, Box, Typography, Stack, IconButton, Chip,
  Skeleton, Divider, Button, Menu, MenuItem, ListItemIcon, ListItemText,
  TextField, CircularProgress, Card, CardContent,
} from '@mui/material';
import {
  Close, OpenInNew, Edit, SwapHoriz, Send,
  Schedule, CalendarMonth, Business, Category,
  PersonOutline, SupportAgent, CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { StatusBadge, PrioBadge } from '@/components/chamados/chamado-badges';
import { ChamadoTimeline } from '@/components/chamados/chamado-timeline';
import { ChamadoPersonCard } from '@/components/chamados/chamado-person-card';
import { ChamadoDetailChip } from '@/components/chamados/chamado-detail-chip';
import { ChamadoEditDialog } from '@/components/chamados/chamado-edit-dialog';
import { AnexosList } from '@/components/shared/anexos-list';
import { useChamadoById, useChamadoOcorrencias, useChamadoAnexos } from '@/hooks/use-chamados';
import {
  useUpdateChamado,
  useUpdateChamadoStatus,
  useAddOcorrencia,
} from '@/hooks/use-chamado-mutations';
import { useAuthStore } from '@/stores/auth-store';
import { STATUS_MAP, TIPO_MAP, ALL_STATUSES } from '@/utils/chamados-constants';
import { formatDate, elapsedText } from '@/utils/date-helpers';

export interface ChamadoDrawerProps {
  open: boolean;
  onClose: () => void;
  nuchamado: number | null;
  onEdit?: (nuchamado: number) => void;
}

export function ChamadoDrawer({
  open, onClose, nuchamado, onEdit,
}: ChamadoDrawerProps) {
  const navigate = useNavigate();
  const { data: chamado, isLoading } = useChamadoById(open ? nuchamado : null);
  const { data: ocorrencias, isLoading: ocLoading } = useChamadoOcorrencias(
    open ? nuchamado : null,
  );
  const { data: anexos, isLoading: anxLoading } = useChamadoAnexos(
    open ? nuchamado : null,
  );
  const updateMutation = useUpdateChamado();
  const statusMutation = useUpdateChamadoStatus();
  const addOcorrenciaMutation = useAddOcorrencia();

  const [editOpen, setEditOpen] = useState(false);
  const [statusAnchor, setStatusAnchor] = useState<HTMLElement | null>(null);
  const [novaTratativa, setNovaTratativa] = useState('');
  const codUsu = useAuthStore((s) => s.user?.codusu);

  const statusDef = chamado ? STATUS_MAP[chamado.STATUS] : null;
  const headerBg = statusDef?.color ?? '#94a3b8';
  const elapsed = chamado ? elapsedText(chamado.DHCHAMADO) : null;
  const tipoLabel = chamado?.TIPOCHAMADO
    ? (TIPO_MAP[chamado.TIPOCHAMADO] ?? chamado.TIPOCHAMADO) : null;

  const submitTratativa = () => {
    if (!nuchamado || !novaTratativa.trim()) return;
    addOcorrenciaMutation.mutate(
      { nuchamado, payload: { DESCROCORRENCIA: novaTratativa.trim(), CODUSU: codUsu } },
      { onSuccess: () => setNovaTratativa('') },
    );
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 460 },
          p: 0,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Gradient Header */}
      <Box sx={{
        p: 2.5, pb: 2,
        background: `linear-gradient(135deg, ${headerBg}, ${headerBg}cc)`,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Decorative circle */}
        <Box sx={{
          position: 'absolute', top: -30, right: -30,
          width: 120, height: 120, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.08)',
        }} />

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography sx={{
            fontSize: 22, fontWeight: 800,
            letterSpacing: '-0.03em',
          }}>
            #{nuchamado}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            {chamado && (
              <IconButton onClick={() => {
                if (onEdit) onEdit(chamado.NUCHAMADO);
                else setEditOpen(true);
              }} sx={{
                color: '#fff', bgcolor: 'rgba(255,255,255,0.15)',
                minWidth: 44, minHeight: 44,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
              }} size="small">
                <Edit fontSize="small" />
              </IconButton>
            )}
            <IconButton onClick={onClose} sx={{
              color: '#fff', bgcolor: 'rgba(255,255,255,0.15)',
              minWidth: 44, minHeight: 44,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
            }} size="small">
              <Close />
            </IconButton>
          </Stack>
        </Stack>
        {chamado && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}
            flexWrap="wrap" useFlexGap>
            <StatusBadge status={chamado.STATUS} />
            <PrioBadge prioridade={chamado.PRIORIDADE} />
            {tipoLabel && (
              <Chip label={tipoLabel} size="small" sx={{
                bgcolor: 'rgba(255,255,255,0.2)', color: '#fff',
                fontWeight: 600, fontSize: 11, height: 24,
                backdropFilter: 'blur(4px)',
              }} />
            )}
            {elapsed && (
              <Typography sx={{
                ml: 'auto', color: 'rgba(255,255,255,0.8)',
                fontSize: 12, fontWeight: 500,
              }}>
                {elapsed}
              </Typography>
            )}
          </Stack>
        )}
      </Box>

      {/* Body */}
      <Box sx={{ overflow: 'auto', flex: 1 }}>
        {isLoading ? (
          <Stack spacing={2} sx={{ p: 2.5 }}>
            <Skeleton variant="rounded" height={60} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2 }} />
          </Stack>
        ) : chamado ? (
          <Stack spacing={0}>
            {/* Description */}
            <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
              <Typography sx={{
                fontSize: 13.5, lineHeight: 1.7, color: '#334155',
              }}>
                {chamado.DESCRCHAMADO ?? 'Sem descricao'}
              </Typography>
            </Box>

            <Divider />

            {/* Details */}
            <Box sx={{ px: 2.5, py: 2 }}>
              <Typography sx={{
                fontSize: 10, fontWeight: 800, color: '#94a3b8',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                mb: 1, display: 'block',
              }}>
                Informacoes
              </Typography>
              <ChamadoDetailChip
                icon={<Business sx={{ fontSize: 18 }} />}
                label="Setor"
                value={chamado.SETOR}
              />
              <ChamadoDetailChip
                icon={<Category sx={{ fontSize: 18 }} />}
                label="Tipo"
                value={tipoLabel}
              />
              <ChamadoDetailChip
                icon={<CalendarMonth sx={{ fontSize: 18 }} />}
                label="Abertura"
                value={formatDate(chamado.DHCHAMADO)}
              />
              <ChamadoDetailChip
                icon={<Schedule sx={{ fontSize: 18 }} />}
                label="Previsao"
                value={formatDate(chamado.DHPREVENTREGA)}
              />
              {chamado.DHFINCHAM && typeof chamado.DHFINCHAM === 'string' && (
                <ChamadoDetailChip
                  icon={<CheckCircle sx={{ fontSize: 18 }} />}
                  label="Finalizado"
                  value={formatDate(chamado.DHFINCHAM)}
                />
              )}
              {chamado.NOMEPARC && (
                <ChamadoDetailChip
                  icon={<Business sx={{ fontSize: 18 }} />}
                  label="Parceiro"
                  value={chamado.NOMEPARC}
                />
              )}
            </Box>

            <Divider />

            {/* People */}
            <Box sx={{ px: 2.5, py: 2 }}>
              <Typography sx={{
                fontSize: 10, fontWeight: 800, color: '#94a3b8',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                mb: 1, display: 'block',
              }}>
                Pessoas
              </Typography>
              <ChamadoPersonCard
                label="Solicitante" nome={chamado.NOMESOLICITANTE}
                codparc={chamado.CODPARCSOLICITANTE}
                icon={<PersonOutline sx={{ fontSize: 18, color: '#94a3b8' }} />}
              />
              <ChamadoPersonCard
                label="Atribuido" nome={chamado.NOMEATRIBUIDO}
                codparc={chamado.CODPARCATRIBUIDO}
                icon={<SupportAgent sx={{ fontSize: 18, color: '#94a3b8' }} />}
              />
              <ChamadoPersonCard
                label="Finalizado por" nome={chamado.NOMEFINALIZADOR}
                codparc={chamado.CODPARCFINALIZADOR}
                icon={<CheckCircle sx={{ fontSize: 18, color: '#94a3b8' }} />}
              />
              {!chamado.NOMESOLICITANTE && !chamado.NOMEATRIBUIDO
                && !chamado.NOMEFINALIZADOR && (
                <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>
                  Nenhuma pessoa atribuida
                </Typography>
              )}
            </Box>

            {/* Anexos */}
            {(anexos?.length || anxLoading) ? (<>
              <Divider />
              <Box sx={{ px: 2.5, py: 2 }}>
                <Typography sx={{
                  fontSize: 10, fontWeight: 800, color: '#94a3b8',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                  Anexos ({anexos?.length ?? 0})
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <AnexosList anexos={anexos ?? []} isLoading={anxLoading} />
                </Box>
              </Box>
            </>) : null}

            <Divider />

            {/* Nova tratativa */}
            <Card elevation={0} sx={{
              mx: 2.5, mt: 2, borderRadius: 3,
              border: '1px solid #e2e8f0',
              bgcolor: '#f8fafc',
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography sx={{
                  fontSize: 10, fontWeight: 800, color: '#94a3b8',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  mb: 1.5, display: 'block',
                }}>
                  Nova tratativa
                </Typography>
                <Stack direction="row" spacing={1} alignItems="flex-end">
                  <TextField
                    placeholder="Descreva a tratativa..."
                    value={novaTratativa}
                    onChange={(e) => setNovaTratativa(e.target.value)}
                    size="small" fullWidth multiline maxRows={3}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#fff',
                        borderRadius: 2,
                        fontSize: 13,
                      },
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && novaTratativa.trim()) {
                        e.preventDefault();
                        submitTratativa();
                      }
                    }}
                  />
                  <IconButton
                    color="primary"
                    disabled={!novaTratativa.trim() || addOcorrenciaMutation.isPending}
                    onClick={submitTratativa}
                    sx={{
                      minWidth: 44, minHeight: 44,
                      bgcolor: 'primary.main',
                      color: '#fff',
                      borderRadius: 2,
                      '&:hover': { bgcolor: 'primary.dark' },
                      '&.Mui-disabled': {
                        bgcolor: '#e2e8f0', color: '#94a3b8',
                      },
                    }}
                    size="small"
                  >
                    {addOcorrenciaMutation.isPending
                      ? <CircularProgress size={18} sx={{ color: '#fff' }} />
                      : <Send fontSize="small" />
                    }
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Box sx={{ px: 2.5, py: 2 }}>
              <ChamadoTimeline
                ocorrencias={ocorrencias ?? []}
                isLoading={ocLoading}
              />
            </Box>
          </Stack>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#64748b', fontSize: 14 }}>
              Chamado nao encontrado.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Sticky footer actions */}
      {chamado && !isLoading && (
        <Box sx={{
          p: 2, borderTop: '1px solid #e2e8f0',
          bgcolor: '#fafbfc',
          flexShrink: 0,
        }}>
          <Stack direction="row" spacing={1}>
            <Button fullWidth variant="contained" size="medium"
              startIcon={<SwapHoriz />}
              onClick={(e) => setStatusAnchor(e.currentTarget)}
              sx={{
                borderRadius: 2.5, textTransform: 'none',
                fontWeight: 700, fontSize: 13,
                minHeight: 44,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d97706, #b45309)',
                },
              }}>
              Alterar status
            </Button>
            <Button fullWidth variant="outlined" size="medium"
              startIcon={<OpenInNew />}
              onClick={() => {
                onClose();
                navigate(`/chamados/${nuchamado}`);
              }}
              sx={{
                borderRadius: 2.5, textTransform: 'none',
                fontWeight: 700, fontSize: 13,
                minHeight: 44,
                borderColor: '#e2e8f0', color: '#475569',
                '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' },
              }}>
              Completo
            </Button>
          </Stack>
        </Box>
      )}

      {/* Status menu */}
      {chamado && (
        <Menu anchorEl={statusAnchor} open={!!statusAnchor}
          onClose={() => setStatusAnchor(null)}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 2.5, border: '1px solid #e2e8f0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                minWidth: 200,
              },
            },
          }}
        >
          {ALL_STATUSES.filter((s) => s !== chamado.STATUS).map((s) => (
            <MenuItem key={s} onClick={() => {
              setStatusAnchor(null);
              statusMutation.mutate({
                nuchamado: chamado.NUCHAMADO, status: s,
              });
            }} sx={{ py: 1.25, minHeight: 44 }}>
              <ListItemIcon>
                <Box sx={{
                  width: 12, height: 12, borderRadius: '50%',
                  bgcolor: STATUS_MAP[s].color,
                  boxShadow: `0 0 0 3px ${STATUS_MAP[s].color}22`,
                }} />
              </ListItemIcon>
              <ListItemText>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                  {STATUS_MAP[s].label}
                </Typography>
              </ListItemText>
            </MenuItem>
          ))}
        </Menu>
      )}

      {/* Edit dialog */}
      {chamado && editOpen && (
        <ChamadoEditDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          chamado={chamado}
          isPending={updateMutation.isPending}
          onSave={(data) => {
            updateMutation.mutate(
              { nuchamado: chamado.NUCHAMADO, payload: data },
              { onSuccess: () => setEditOpen(false) },
            );
          }}
        />
      )}
    </Drawer>
  );
}
