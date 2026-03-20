import { useState } from 'react';
import {
  Box, IconButton, Typography, Tooltip,
  useMediaQuery, useTheme, Menu, MenuItem, ListItemIcon,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
} from '@mui/material';
import { ArrowBack, ExpandMore, Share, MoreVert } from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { StatusBadge } from '@/components/chamados/chamado-badges';
import { STATUS_MAP, ALL_STATUSES, TIPO_MAP } from '@/utils/chamados-constants';
import { useUpdateChamadoStatus, useAddOcorrencia } from '@/hooks/use-chamado-mutations';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';
import { useChatColors } from './use-chat-colors';
import type { Chamado, ChamadoStatusCode } from '@/types/chamados-types';

interface ChatConvHeaderProps {
  chamado: Chamado;
  onBack?: () => void;
  onOpenDetails: () => void;
  isOnline?: (codusu: number | null | undefined) => boolean;
}

export function ChatConvHeader({ chamado, onBack, onOpenDetails, isOnline }: ChatConvHeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const c = useChatColors();
  const statusMutation = useUpdateChamadoStatus();
  const addOcorrencia = useAddOcorrencia();
  const codUsu = useAuthStore((s) => s.user?.codusu);
  const addToast = useNotificationStore((s) => s.addToast);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tratativaOpen, setTratativaOpen] = useState(false);
  const [tratativaText, setTratativaText] = useState('');
  const [pendingStatus, setPendingStatus] = useState<ChamadoStatusCode | null>(null);

  const tipoLabel = chamado.TIPOCHAMADO
    ? TIPO_MAP[chamado.TIPOCHAMADO] ?? chamado.TIPOCHAMADO
    : null;

  // Build subtitle: names of people involved (WhatsApp group style)
  const members = [
    chamado.NOMESOLICITANTE,
    chamado.NOMEATRIBUIDO,
    chamado.NOMEFINALIZADOR,
  ].filter(Boolean);
  const subtitle = members.join(', ') || chamado.SETOR || 'Sem participantes';

  const solicitanteOnline = isOnline?.(chamado.SOLICITANTE) ?? false;

  const handleStatusSelect = (status: ChamadoStatusCode) => {
    setAnchorEl(null);
    if (status === chamado.STATUS) return;
    setPendingStatus(status);
    setTratativaText('');
    setTratativaOpen(true);
  };

  const handleTratativaConfirm = () => {
    if (!pendingStatus) return;
    statusMutation.mutate({ nuchamado: chamado.NUCHAMADO, status: pendingStatus });
    if (tratativaText.trim()) {
      addOcorrencia.mutate({
        nuchamado: chamado.NUCHAMADO,
        payload: {
          DESCROCORRENCIA: `${tratativaText.trim()}\n\n— via chamados.gigantao.net`,
          CODUSU: codUsu,
        },
      });
    }
    setTratativaOpen(false);
    setPendingStatus(null);
    setTratativaText('');
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/chamados/chat/${chamado.NUCHAMADO}`;
    const text = `Chamado #${chamado.NUCHAMADO} — ${chamado.NOMESOLICITANTE ?? 'Sem solicitante'}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      addToast('success', 'Link copiado!');
    }
  };

  const pendingLabel = pendingStatus ? STATUS_MAP[pendingStatus]?.label : '';

  return (
    <>
      <Box
        sx={{
          minHeight: isMobile ? 56 : 64,
          bgcolor: c.headerBg,
          px: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexShrink: 0,
        }}
      >
        {onBack && (
          <IconButton
            onClick={onBack}
            size="small"
            sx={{ color: c.textSecondary }}
          >
            <ArrowBack />
          </IconButton>
        )}

        {/* Avatar with online indicator */}
        <Tooltip title={solicitanteOnline ? 'Online' : ''}>
          <Box sx={{ position: 'relative', display: 'inline-flex', cursor: 'pointer' }}
            onClick={onOpenDetails}>
            <FuncionarioAvatar
              codparc={chamado.CODPARCSOLICITANTE}
              nome={chamado.NOMESOLICITANTE ?? undefined}
              size="medium"
              sx={{ width: 40, height: 40, fontSize: 15 }}
            />
            {solicitanteOnline && (
              <Box sx={{
                position: 'absolute', bottom: 0, right: 0,
                width: 10, height: 10, borderRadius: '50%',
                bgcolor: '#22c55e',
                border: `2px solid ${c.headerBg}`,
              }} />
            )}
          </Box>
        </Tooltip>

        {/* Name + members (WhatsApp group style) */}
        <Box sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={onOpenDetails}>
          <Typography
            sx={{
              fontSize: 15, fontWeight: 500, color: c.textPrimary, lineHeight: 1.3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            #{chamado.NUCHAMADO} {chamado.NOMESOLICITANTE}
            {tipoLabel && (
              <Box component="span" sx={{ color: c.textMuted, fontWeight: 400, fontSize: 12, ml: 0.5 }}>
                ({tipoLabel})
              </Box>
            )}
          </Typography>
          <Typography
            sx={{
              fontSize: 12, color: c.textSecondary, lineHeight: 1.3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
          </Typography>
        </Box>

        {/* Status badge — clickable */}
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 0.25,
            borderRadius: '8px',
            px: 0.5,
            py: 0.25,
            transition: 'background-color 0.15s',
            '&:hover': { bgcolor: c.listItemHover },
          }}
        >
          <StatusBadge status={chamado.STATUS} size="sm" />
          <ExpandMore sx={{ fontSize: 14, color: c.textMuted }} />
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{ paper: { sx: { mt: 0.5, minWidth: 200 } } }}
        >
          {ALL_STATUSES.map((s) => {
            const def = STATUS_MAP[s];
            const isActive = chamado.STATUS === s;
            return (
              <MenuItem
                key={s}
                onClick={() => handleStatusSelect(s)}
                selected={isActive}
                sx={{ py: 1, gap: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 'auto !important' }}>
                  <Box sx={{
                    width: 8, height: 8, borderRadius: '50%',
                    bgcolor: def.color,
                  }} />
                </ListItemIcon>
                <Typography sx={{ fontSize: 13, fontWeight: isActive ? 700 : 400 }}>
                  {def.label}
                </Typography>
                {isActive && (
                  <Typography sx={{ fontSize: 10, color: 'text.secondary', ml: 'auto' }}>
                    atual
                  </Typography>
                )}
              </MenuItem>
            );
          })}
        </Menu>

        <IconButton size="small" sx={{ color: c.textSecondary }} onClick={handleShare}>
          <Share sx={{ fontSize: 20 }} />
        </IconButton>

        <IconButton size="small" sx={{ color: c.textSecondary }} onClick={onOpenDetails}>
          <MoreVert sx={{ fontSize: 22 }} />
        </IconButton>
      </Box>

      {/* Tratativa dialog on status change */}
      <Dialog
        open={tratativaOpen}
        onClose={() => { setTratativaOpen(false); setPendingStatus(null); }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, pb: 1 }}>
          Alterar para {pendingLabel}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1.5 }}>
            Adicione uma observacao sobre a mudanca de status (opcional):
          </Typography>
          <TextField
            value={tratativaText}
            onChange={(e) => setTratativaText(e.target.value)}
            placeholder="Ex: Problema resolvido, aguardando retorno do usuario..."
            multiline
            minRows={2}
            maxRows={5}
            fullWidth
            autoFocus
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => { setTratativaOpen(false); setPendingStatus(null); }}
            size="small"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleTratativaConfirm}
            variant="contained"
            size="small"
            disabled={statusMutation.isPending}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
