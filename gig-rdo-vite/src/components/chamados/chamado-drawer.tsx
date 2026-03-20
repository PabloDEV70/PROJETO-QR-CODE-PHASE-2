import { useState } from 'react';
import {
  Drawer, Box, Typography, Stack, IconButton, Chip,
  Skeleton, Divider, Button, Menu, MenuItem, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select as MuiSelect, CircularProgress,
  Card, CardContent,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Close, OpenInNew, Edit, SwapHoriz, Send,
  Schedule, CalendarMonth, Business, Category,
  PersonOutline, SupportAgent, CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { StatusBadge, PrioBadge } from '@/components/chamados/chamado-badges';
import { ChamadoTimeline } from '@/components/chamados/chamado-timeline';
import { AnexosList } from '@/components/shared/anexos-list';
import { useChamadoById, useChamadoOcorrencias, useChamadoAnexos } from '@/hooks/use-chamados';
import {
  useUpdateChamado,
  useUpdateChamadoStatus,
  useAddOcorrencia,
} from '@/hooks/use-chamado-mutations';
import type { ChamadoStatusCode, ChamadoPrioridadeCode } from '@/types/chamados-types';

export interface ChamadoDrawerProps {
  open: boolean;
  onClose: () => void;
  nuchamado: number | null;
  onEdit?: (nuchamado: number) => void;
}

const STATUS_BG: Record<string, string> = {
  P: '#f59e0b', E: '#0ea5e9', S: '#94a3b8',
  A: '#8b5cf6', F: '#22c55e', C: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  P: 'Pendente', E: 'Em andamento', S: 'Suspenso',
  A: 'Aguardando', F: 'Finalizado', C: 'Cancelado',
};

const PRIO_LABELS: Record<string, string> = {
  A: 'Alta', M: 'Media', B: 'Baixa',
};

const TIPO_MAP: Record<string, string> = {
  '01': 'Incidente', '02': 'Requisicao', '03': 'Melhoria',
  '04': 'Duvida', '05': 'Problema', '06': 'Tarefa',
  '07': 'Projeto', '08': 'Mudanca', '09': 'Liberacao', '99': 'Outros',
};

const ALL_STATUSES: ChamadoStatusCode[] = ['P', 'E', 'S', 'A', 'F', 'C'];
const ALL_PRIOS: ChamadoPrioridadeCode[] = ['A', 'M', 'B'];

function formatDate(value: string | null | object): string {
  if (!value || typeof value !== 'string') return '-';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString('pt-BR');
}

function elapsedText(dateStr: string | null | object): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const ms = Date.now() - new Date(dateStr).getTime();
  if (isNaN(ms) || ms < 0) return null;
  const h = Math.floor(ms / 3_600_000);
  if (h < 1) return 'Agora mesmo';
  if (h < 24) return `${h}h atras`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} dia${d > 1 ? 's' : ''} atras`;
  const m = Math.floor(d / 30);
  return `${m} mes${m > 1 ? 'es' : ''} atras`;
}

function PersonCard({ label, nome, codparc, icon }: {
  label: string; nome: string | null; codparc: number | null; icon: React.ReactNode;
}) {
  if (!nome) return null;
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 1 }}>
      <FuncionarioAvatar codparc={codparc} nome={nome} size="small" />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body2" fontWeight={600} noWrap>{nome}</Typography>
      </Box>
      {icon}
    </Stack>
  );
}

function DetailChip({ icon, label, value }: {
  icon: React.ReactNode; label: string; value: string | null;
}) {
  if (!value || value === '-') return null;
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 0.5 }}>
      <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 70 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>{value}</Typography>
    </Stack>
  );
}

function EditDialog({ open, onClose, chamado, onSave, isPending }: {
  open: boolean;
  onClose: () => void;
  chamado: {
    DESCRCHAMADO: string | null;
    STATUS: ChamadoStatusCode;
    PRIORIDADE: ChamadoPrioridadeCode | null;
  };
  onSave: (data: {
    DESCRCHAMADO?: string;
    STATUS?: ChamadoStatusCode;
    PRIORIDADE?: ChamadoPrioridadeCode;
  }) => void;
  isPending: boolean;
}) {
  const [descr, setDescr] = useState(chamado.DESCRCHAMADO ?? '');
  const [sts, setSts] = useState<ChamadoStatusCode>(chamado.STATUS);
  const [prio, setPrio] = useState<ChamadoPrioridadeCode>(chamado.PRIORIDADE ?? 'M');

  const handleSubmit = () => {
    const payload: Record<string, string> = {};
    if (descr !== (chamado.DESCRCHAMADO ?? '')) payload.DESCRCHAMADO = descr;
    if (sts !== chamado.STATUS) payload.STATUS = sts;
    if (prio !== (chamado.PRIORIDADE ?? 'M')) payload.PRIORIDADE = prio;
    if (Object.keys(payload).length === 0) { onClose(); return; }
    onSave(payload as {
      DESCRCHAMADO?: string;
      STATUS?: ChamadoStatusCode;
      PRIORIDADE?: ChamadoPrioridadeCode;
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Chamado</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Descricao" multiline rows={3}
            value={descr} onChange={(e) => setDescr(e.target.value)}
            fullWidth size="small"
          />
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <MuiSelect value={sts} label="Status"
              onChange={(e: SelectChangeEvent) =>
                setSts(e.target.value as ChamadoStatusCode)
              }>
              {ALL_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>
              ))}
            </MuiSelect>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Prioridade</InputLabel>
            <MuiSelect value={prio} label="Prioridade"
              onChange={(e: SelectChangeEvent) =>
                setPrio(e.target.value as ChamadoPrioridadeCode)
              }>
              {ALL_PRIOS.map((p) => (
                <MenuItem key={p} value={p}>{PRIO_LABELS[p]}</MenuItem>
              ))}
            </MuiSelect>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isPending}
          startIcon={isPending ? <CircularProgress size={16} /> : undefined}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
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

  const headerBg = chamado ? (STATUS_BG[chamado.STATUS] ?? '#94a3b8') : '#94a3b8';
  const elapsed = chamado ? elapsedText(chamado.DHCHAMADO) : null;
  const tipoLabel = chamado?.TIPOCHAMADO
    ? (TIPO_MAP[chamado.TIPOCHAMADO] ?? chamado.TIPOCHAMADO) : null;

  const submitTratativa = () => {
    if (!nuchamado || !novaTratativa.trim()) return;
    addOcorrenciaMutation.mutate(
      { nuchamado, payload: { DESCROCORRENCIA: novaTratativa.trim() } },
      { onSuccess: () => setNovaTratativa('') },
    );
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 440 }, p: 0 } }}
    >
      {/* Header */}
      <Box sx={{
        p: 2, pb: 1.5, bgcolor: headerBg, color: '#fff',
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={800} letterSpacing="-0.02em">
            #{nuchamado}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            {chamado && (
              <IconButton onClick={() => {
                if (onEdit) onEdit(chamado.NUCHAMADO);
                else setEditOpen(true);
              }} sx={{ color: '#fff' }} size="small">
                <Edit fontSize="small" />
              </IconButton>
            )}
            <IconButton onClick={onClose} sx={{ color: '#fff' }} size="small">
              <Close />
            </IconButton>
          </Stack>
        </Stack>
        {chamado && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <StatusBadge status={chamado.STATUS} />
            <PrioBadge prioridade={chamado.PRIORIDADE} />
            {tipoLabel && (
              <Chip label={tipoLabel} size="small" sx={{
                bgcolor: 'rgba(255,255,255,0.2)', color: '#fff',
                fontWeight: 600, fontSize: 11, height: 22,
              }} />
            )}
            {elapsed && (
              <Typography variant="caption" sx={{
                ml: 'auto', color: 'rgba(255,255,255,0.8)',
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
          <Stack spacing={2} sx={{ p: 2 }}>
            <Skeleton variant="rounded" height={60} />
            <Skeleton variant="rounded" height={100} />
            <Skeleton variant="rounded" height={80} />
          </Stack>
        ) : chamado ? (
          <Stack spacing={0}>
            {/* Description */}
            <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
              <Typography variant="body2" sx={{
                lineHeight: 1.7, color: 'text.primary',
              }}>
                {chamado.DESCRCHAMADO ?? 'Sem descricao'}
              </Typography>
            </Box>

            <Divider />

            {/* Details */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <DetailChip
                icon={<Business sx={{ fontSize: 18 }} />}
                label="Setor"
                value={chamado.SETOR}
              />
              <DetailChip
                icon={<Category sx={{ fontSize: 18 }} />}
                label="Tipo"
                value={tipoLabel}
              />
              <DetailChip
                icon={<CalendarMonth sx={{ fontSize: 18 }} />}
                label="Abertura"
                value={formatDate(chamado.DHCHAMADO)}
              />
              <DetailChip
                icon={<Schedule sx={{ fontSize: 18 }} />}
                label="Previsao"
                value={formatDate(chamado.DHPREVENTREGA)}
              />
              {chamado.DHFINCHAM && typeof chamado.DHFINCHAM === 'string' && (
                <DetailChip
                  icon={<CheckCircle sx={{ fontSize: 18 }} />}
                  label="Finalizado"
                  value={formatDate(chamado.DHFINCHAM)}
                />
              )}
              {chamado.NOMEPARC && (
                <DetailChip
                  icon={<Business sx={{ fontSize: 18 }} />}
                  label="Parceiro"
                  value={chamado.NOMEPARC}
                />
              )}
            </Box>

            <Divider />

            {/* People */}
            <Box sx={{ px: 2, py: 1 }}>
              <PersonCard
                label="Solicitante" nome={chamado.NOMESOLICITANTE}
                codparc={chamado.CODPARCSOLICITANTE}
                icon={<PersonOutline sx={{ fontSize: 18, color: 'text.disabled' }} />}
              />
              <PersonCard
                label="Atribuido" nome={chamado.NOMEATRIBUIDO}
                codparc={chamado.CODPARCATRIBUIDO}
                icon={<SupportAgent sx={{ fontSize: 18, color: 'text.disabled' }} />}
              />
              <PersonCard
                label="Finalizado por" nome={chamado.NOMEFINALIZADOR}
                codparc={chamado.CODPARCFINALIZADOR}
                icon={<CheckCircle sx={{ fontSize: 18, color: 'text.disabled' }} />}
              />
              {!chamado.NOMESOLICITANTE && !chamado.NOMEATRIBUIDO
                && !chamado.NOMEFINALIZADOR && (
                <Typography variant="caption" color="text.secondary">
                  Nenhuma pessoa atribuida
                </Typography>
              )}
            </Box>

            {/* Anexos */}
            {(anexos?.length || anxLoading) ? (<>
              <Divider />
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary"
                  sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Anexos ({anexos?.length ?? 0})
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <AnexosList anexos={anexos ?? []} isLoading={anxLoading} />
                </Box>
              </Box>
            </>) : null}

            <Divider />

            {/* Nova tratativa */}
            <Card variant="outlined" sx={{ mx: 2, mt: 1.5, borderRadius: 2 }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary"
                  sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, display: 'block' }}>
                  Nova tratativa
                </Typography>
                <Stack direction="row" spacing={1} alignItems="flex-end">
                  <TextField
                    placeholder="Descreva a tratativa..."
                    value={novaTratativa}
                    onChange={(e) => setNovaTratativa(e.target.value)}
                    size="small" fullWidth multiline maxRows={3}
                    variant="outlined"
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
                    size="small"
                  >
                    {addOcorrenciaMutation.isPending
                      ? <CircularProgress size={18} />
                      : <Send fontSize="small" />
                    }
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <ChamadoTimeline
                ocorrencias={ocorrencias ?? []}
                isLoading={ocLoading}
              />
            </Box>

            {/* Actions */}
            <Box sx={{ px: 2, pb: 2 }}>
              <Stack direction="row" spacing={1}>
                <Button fullWidth variant="contained" size="small"
                  startIcon={<SwapHoriz />}
                  onClick={(e) => setStatusAnchor(e.currentTarget)}
                  sx={{ borderRadius: 2, textTransform: 'none' }}>
                  Alterar status
                </Button>
                <Button fullWidth variant="outlined" size="small"
                  startIcon={<OpenInNew />}
                  onClick={() => {
                    onClose();
                    navigate(`/ti/chamados/${nuchamado}`);
                  }}
                  sx={{ borderRadius: 2, textTransform: 'none' }}>
                  Completo
                </Button>
              </Stack>
            </Box>

            {/* Status menu */}
            <Menu anchorEl={statusAnchor} open={!!statusAnchor}
              onClose={() => setStatusAnchor(null)}>
              {ALL_STATUSES.filter((s) => s !== chamado.STATUS).map((s) => (
                <MenuItem key={s} onClick={() => {
                  setStatusAnchor(null);
                  statusMutation.mutate({
                    nuchamado: chamado.NUCHAMADO, status: s,
                  });
                }}>
                  <ListItemIcon>
                    <Box sx={{
                      width: 10, height: 10, borderRadius: '50%',
                      bgcolor: STATUS_BG[s],
                    }} />
                  </ListItemIcon>
                  <ListItemText>{STATUS_LABELS[s]}</ListItemText>
                </MenuItem>
              ))}
            </Menu>
          </Stack>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary" variant="body2">
              Chamado nao encontrado.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Edit dialog */}
      {chamado && editOpen && (
        <EditDialog
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
