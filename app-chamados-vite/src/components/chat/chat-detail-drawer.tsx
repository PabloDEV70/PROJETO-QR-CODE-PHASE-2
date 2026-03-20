import { useState, useMemo, useEffect } from 'react';
import {
  Drawer, Box, IconButton, Typography, Stack, Divider,
  TextField, MenuItem, Autocomplete, Button, CircularProgress,
} from '@mui/material';
import { Close, Edit, Save, Cancel, AdminPanelSettingsRounded } from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { StatusBadge, PrioBadge } from '@/components/chamados/chamado-badges';
import {
  STATUS_MAP, PRIO_MAP, TIPO_MAP, ALL_STATUSES, ALL_PRIOS, TIPO_ENTRIES,
} from '@/utils/chamados-constants';
import { formatDate } from '@/utils/date-helpers';
import { useChatColors } from './use-chat-colors';
import { useChamadosUsuarios } from '@/hooks/use-chamados';
import { useUpdateChamado } from '@/hooks/use-chamado-mutations';
import { useAuthStore } from '@/stores/auth-store';
import type {
  Chamado, ChamadoStatusCode, ChamadoPrioridadeCode,
  UpdateChamadoPayload, ChamadoUsuario,
} from '@/types/chamados-types';

const TI_GROUP = 13;

interface ChatDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  chamado: Chamado;
}

interface PersonRowProps {
  label: string;
  nome: string | null;
  codparc: number | null;
  color: string;
  mutedColor: string;
}

function PersonRow({ label, nome, codparc, color, mutedColor }: PersonRowProps) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 0.5 }}>
      <FuncionarioAvatar
        codparc={codparc}
        nome={nome ?? undefined}
        size="small"
        sx={{ width: 28, height: 28, fontSize: 11 }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 12, color: mutedColor, lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color, lineHeight: 1.3 }}>
          {nome || '-'}
        </Typography>
      </Box>
    </Stack>
  );
}

function UserAutocomplete({
  label, options, value, onChange,
}: {
  label: string;
  options: ChamadoUsuario[];
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <Autocomplete
      size="small"
      options={options}
      getOptionLabel={(o) => o.NOMEUSU}
      value={options.find((u) => u.CODUSU === value) ?? null}
      onChange={(_, v) => onChange(v?.CODUSU ?? null)}
      renderInput={(params) => (
        <TextField {...params} label={label}
          slotProps={{ inputLabel: { sx: { fontSize: 13 } } }}
          sx={{ '& .MuiInputBase-input': { fontSize: 13 } }} />
      )}
      renderOption={(props, opt) => (
        <Box component="li" {...props} key={opt.CODUSU}
          sx={{ fontSize: 13, gap: 1, display: 'flex', alignItems: 'center' }}>
          <FuncionarioAvatar codparc={opt.CODPARC} nome={opt.NOMEUSU} size="small"
            sx={{ width: 22, height: 22, fontSize: 10 }} />
          {opt.NOMEUSU}
        </Box>
      )}
    />
  );
}

const VIA_SUFFIX = '\n\n— via chamados.gigantao.net';

export function ChatDetailDrawer({ open, onClose, chamado }: ChatDetailDrawerProps) {
  const c = useChatColors();
  const user = useAuthStore((s) => s.user);
  const isTI = user?.codgrupo === TI_GROUP;
  const [editing, setEditing] = useState(false);
  const updateMutation = useUpdateChamado();
  const { data: allUsuarios } = useChamadosUsuarios();

  const tiUsuarios = useMemo(
    () => allUsuarios?.filter((u) => u.CODGRUPO === TI_GROUP) ?? [],
    [allUsuarios],
  );

  // Strip "via" suffix from description for editing
  const rawDescr = chamado.DESCRCHAMADO ?? '';
  const cleanDescr = rawDescr.includes('— via chamados.gigantao.net')
    ? rawDescr.slice(0, rawDescr.lastIndexOf('— via chamados.gigantao.net')).trimEnd()
    : rawDescr;

  // Edit form state
  const [editDescr, setEditDescr] = useState(cleanDescr);
  const [editStatus, setEditStatus] = useState<ChamadoStatusCode>(chamado.STATUS);
  const [editPrio, setEditPrio] = useState<ChamadoPrioridadeCode | ''>(chamado.PRIORIDADE ?? '');
  const [editTipo, setEditTipo] = useState(chamado.TIPOCHAMADO ?? '');
  const [editSolicitante, setEditSolicitante] = useState<number | null>(chamado.SOLICITANTE);
  const [editSolicitado, setEditSolicitado] = useState<number | null>(chamado.SOLICITADO);
  const [editFinalizador, setEditFinalizador] = useState<number | null>(chamado.FINALIZADOPOR);

  // Reset form when chamado changes
  useEffect(() => {
    setEditDescr(cleanDescr);
    setEditStatus(chamado.STATUS);
    setEditPrio(chamado.PRIORIDADE ?? '');
    setEditTipo(chamado.TIPOCHAMADO ?? '');
    setEditSolicitante(chamado.SOLICITANTE);
    setEditSolicitado(chamado.SOLICITADO);
    setEditFinalizador(chamado.FINALIZADOPOR);
    setEditing(false);
  }, [chamado.NUCHAMADO]); // eslint-disable-line react-hooks/exhaustive-deps

  const startEdit = () => {
    setEditDescr(cleanDescr);
    setEditStatus(chamado.STATUS);
    setEditPrio(chamado.PRIORIDADE ?? '');
    setEditTipo(chamado.TIPOCHAMADO ?? '');
    setEditSolicitante(chamado.SOLICITANTE);
    setEditSolicitado(chamado.SOLICITADO);
    setEditFinalizador(chamado.FINALIZADOPOR);
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveEdit = () => {
    const payload: UpdateChamadoPayload = {};
    const newDescr = editDescr.trim();
    if (newDescr && newDescr !== cleanDescr) payload.DESCRCHAMADO = newDescr + VIA_SUFFIX;
    if (editStatus !== chamado.STATUS) payload.STATUS = editStatus;
    if (editPrio !== (chamado.PRIORIDADE ?? '')) payload.PRIORIDADE = editPrio as ChamadoPrioridadeCode;
    if (editTipo !== (chamado.TIPOCHAMADO ?? '')) payload.TIPOCHAMADO = editTipo;
    if (editSolicitante !== chamado.SOLICITANTE) payload.SOLICITANTE = editSolicitante ?? undefined;
    if (editSolicitado !== chamado.SOLICITADO) payload.SOLICITADO = editSolicitado ?? undefined;
    if (editFinalizador !== chamado.FINALIZADOPOR) payload.FINALIZADOPOR = editFinalizador ?? undefined;

    if (Object.keys(payload).length > 0) {
      updateMutation.mutate(
        { nuchamado: chamado.NUCHAMADO, payload },
        { onSuccess: () => setEditing(false) },
      );
    } else {
      setEditing(false);
    }
  };

  const tipoLabel = chamado.TIPOCHAMADO ? TIPO_MAP[chamado.TIPOCHAMADO] ?? chamado.TIPOCHAMADO : '-';
  const sectionTitle = { fontSize: 11, fontWeight: 600, color: c.textMuted, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 } as const;
  const selectSx = { '& .MuiInputBase-input': { fontSize: 13 } };
  const labelSx = { inputLabel: { sx: { fontSize: 13 } } };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 380 }, bgcolor: c.sidebarBg } } }}
    >
      {/* Header */}
      <Box sx={{
        bgcolor: c.headerBg, px: 2, py: 1.5,
        display: 'flex', alignItems: 'center', gap: 1,
      }}>
        <IconButton size="small" onClick={onClose} sx={{ color: c.textSecondary }}>
          <Close />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: c.textPrimary }}>
            Chamado #{chamado.NUCHAMADO}
          </Typography>
          {isTI && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <AdminPanelSettingsRounded sx={{ fontSize: 12, color: '#f59e0b' }} />
              <Typography sx={{ fontSize: 10, color: '#f59e0b', fontWeight: 700, letterSpacing: 0.3 }}>
                SUPER ADMIN
              </Typography>
            </Stack>
          )}
        </Box>
        {isTI && !editing && (
          <Button
            size="small"
            startIcon={<Edit sx={{ fontSize: 16 }} />}
            onClick={startEdit}
            sx={{
              fontSize: 12, textTransform: 'none', fontWeight: 600,
              color: '#f59e0b', borderColor: '#f59e0b',
              '&:hover': { borderColor: '#d97706', bgcolor: 'rgba(245,158,11,0.08)' },
            }}
            variant="outlined"
          >
            Editar
          </Button>
        )}
        {editing && (
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={cancelEdit} sx={{ color: c.textSecondary }}>
              <Cancel sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={saveEdit}
              disabled={updateMutation.isPending}
              sx={{ color: c.accent }}
            >
              {updateMutation.isPending
                ? <CircularProgress size={18} sx={{ color: c.accent }} />
                : <Save sx={{ fontSize: 18 }} />}
            </IconButton>
          </Stack>
        )}
      </Box>

      <Box sx={{ px: 2, py: 2, overflowY: 'auto', flex: 1 }}>
        {/* Description */}
        <Typography sx={sectionTitle}>Descricao</Typography>
        {editing ? (
          <TextField
            value={editDescr}
            onChange={(e) => setEditDescr(e.target.value)}
            multiline minRows={3} maxRows={10} fullWidth size="small"
            sx={{ mb: 2, ...selectSx }}
          />
        ) : (
          <Typography sx={{
            fontSize: 13, color: c.textPrimary, lineHeight: 1.7,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word', mb: 2,
          }}>
            {cleanDescr}
          </Typography>
        )}

        <Divider sx={{ borderColor: c.listDivider, mb: 2 }} />

        {/* Status + Priority + Type */}
        <Typography sx={sectionTitle}>Informacoes</Typography>

        {editing ? (
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <TextField
              select label="Status" size="small" fullWidth
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as ChamadoStatusCode)}
              slotProps={labelSx} sx={selectSx}
            >
              {ALL_STATUSES.map((s) => (
                <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>{STATUS_MAP[s].label}</MenuItem>
              ))}
            </TextField>
            <TextField
              select label="Prioridade" size="small" fullWidth
              value={editPrio}
              onChange={(e) => setEditPrio(e.target.value as ChamadoPrioridadeCode)}
              slotProps={labelSx} sx={selectSx}
            >
              {ALL_PRIOS.map((p) => (
                <MenuItem key={p} value={p} sx={{ fontSize: 13 }}>{PRIO_MAP[p].label}</MenuItem>
              ))}
            </TextField>
            <TextField
              select label="Tipo" size="small" fullWidth
              value={editTipo}
              onChange={(e) => setEditTipo(e.target.value)}
              slotProps={labelSx} sx={selectSx}
            >
              {TIPO_ENTRIES.map(([k, v]) => (
                <MenuItem key={k} value={k} sx={{ fontSize: 13 }}>{v}</MenuItem>
              ))}
            </TextField>
          </Stack>
        ) : (
          <Stack spacing={0.75} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ fontSize: 12, color: c.textMuted, width: 70 }}>Status</Typography>
              <StatusBadge status={chamado.STATUS} size="sm" />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ fontSize: 12, color: c.textMuted, width: 70 }}>Prioridade</Typography>
              <PrioBadge prioridade={chamado.PRIORIDADE} size="sm" />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ fontSize: 12, color: c.textMuted, width: 70 }}>Tipo</Typography>
              <Typography sx={{ fontSize: 13, color: c.textPrimary }}>{tipoLabel}</Typography>
            </Stack>
            {chamado.SETOR && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontSize: 12, color: c.textMuted, width: 70 }}>Setor</Typography>
                <Typography sx={{ fontSize: 13, color: c.textPrimary }}>{chamado.SETOR}</Typography>
              </Stack>
            )}
          </Stack>
        )}

        <Divider sx={{ borderColor: c.listDivider, mb: 2 }} />

        {/* People */}
        <Typography sx={sectionTitle}>Pessoas</Typography>

        {editing ? (
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <UserAutocomplete label="Solicitante" options={allUsuarios ?? []}
              value={editSolicitante} onChange={setEditSolicitante} />
            <UserAutocomplete label="Atribuido a" options={tiUsuarios}
              value={editSolicitado} onChange={setEditSolicitado} />
            <UserAutocomplete label="Finalizado por" options={tiUsuarios}
              value={editFinalizador} onChange={setEditFinalizador} />
          </Stack>
        ) : (
          <Stack spacing={0.5} sx={{ mb: 2 }}>
            <PersonRow label="Solicitante" nome={chamado.NOMESOLICITANTE} codparc={chamado.CODPARCSOLICITANTE}
              color={c.textPrimary} mutedColor={c.textMuted} />
            <PersonRow label="Atribuido a" nome={chamado.NOMEATRIBUIDO} codparc={chamado.CODPARCATRIBUIDO}
              color={c.textPrimary} mutedColor={c.textMuted} />
            <PersonRow label="Finalizado por" nome={chamado.NOMEFINALIZADOR} codparc={chamado.CODPARCFINALIZADOR}
              color={c.textPrimary} mutedColor={c.textMuted} />
          </Stack>
        )}

        <Divider sx={{ borderColor: c.listDivider, mb: 2 }} />

        {/* Dates */}
        <Typography sx={sectionTitle}>Datas</Typography>

        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1}>
            <Typography sx={{ fontSize: 12, color: c.textMuted, width: 90 }}>Abertura</Typography>
            <Typography sx={{ fontSize: 12, color: c.textPrimary }}>{formatDate(chamado.DHCHAMADO)}</Typography>
          </Stack>
          {chamado.DHFINCHAM && (
            <Stack direction="row" spacing={1}>
              <Typography sx={{ fontSize: 12, color: c.textMuted, width: 90 }}>Finalizado</Typography>
              <Typography sx={{ fontSize: 12, color: c.textPrimary }}>{formatDate(chamado.DHFINCHAM)}</Typography>
            </Stack>
          )}
          {chamado.DHALTER && (
            <Stack direction="row" spacing={1}>
              <Typography sx={{ fontSize: 12, color: c.textMuted, width: 90 }}>Ult. alteracao</Typography>
              <Typography sx={{ fontSize: 12, color: c.textPrimary }}>{formatDate(chamado.DHALTER)}</Typography>
            </Stack>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
