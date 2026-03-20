import { useState, useRef, useEffect } from 'react';
import { Box, ButtonBase, Typography, IconButton, Snackbar, Alert, Fade } from '@mui/material';
import { EventNote, SwapVert, ContentCopy } from '@mui/icons-material';
import type { RdoDetalheItem } from '@/types/rdo-types';
import { AtividadeCard } from '@/components/apontamento/atividade-card';

interface AtividadeTimelineProps {
  items: RdoDetalheItem[];
  onEdit?: (item: RdoDetalheItem) => void;
}

function formatItemToText(item: RdoDetalheItem): string {
  const lines: string[] = [];
  lines.push(`Atividade ${item.ITEM}`);
  if (item.motivoSigla) lines.push(`Sigla: ${item.motivoSigla}`);
  if (item.motivoDescricao) lines.push(`Descrição: ${item.motivoDescricao}`);
  if (item.hriniFormatada && item.hrfimFormatada) {
    lines.push(`Horário: ${item.hriniFormatada} - ${item.hrfimFormatada}`);
  }
  if (item.duracaoMinutos) lines.push(`Duração: ${item.duracaoMinutos} min`);
  if (item.NUOS) lines.push(`OS: ${item.NUOS}`);
  if (item.veiculoPlaca) lines.push(`Veículo: ${item.veiculoPlaca}`);
  if (item.servicoNome) lines.push(`Serviço: ${item.servicoNome}`);
  if (item.apontamentoDesc) lines.push(`Apontamento: ${item.apontamentoDesc}`);
  if (item.OBS) lines.push(`Obs: ${item.OBS}`);
  return lines.join('\n');
}

export function AtividadeTimeline({ items, onEdit }: AtividadeTimelineProps) {
  const [reverseOrder, setReverseOrder] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const prevCountRef = useRef(items.length);
  const [newItemKeys, setNewItemKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (items.length > prevCountRef.current) {
      const keys = new Set<string>();
      items.slice(prevCountRef.current).forEach((it) => keys.add(`${it.CODRDO}-${it.ITEM}`));
      setNewItemKeys(keys);
      const timer = setTimeout(() => setNewItemKeys(new Set()), 600);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = items.length;
  }, [items.length]);

  const handleCopyAll = async () => {
    const text = items.map(formatItemToText).join('\n\n---\n\n');
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setSnackbar({ open: true, message: `${items.length} atividades copiadas!` });
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setSnackbar({ open: true, message: `${items.length} atividades copiadas!` });
      }
    } catch {
      setSnackbar({ open: true, message: 'Erro ao copiar' });
    }
  };

  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <EventNote sx={{ fontSize: 36, color: 'text.disabled', mb: 0.5 }} />
        <Typography sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>
          Nenhuma atividade registrada
        </Typography>
      </Box>
    );
  }

  const sorted = [...items].sort((a, b) =>
    reverseOrder
      ? (b.HRINI ?? 0) - (a.HRINI ?? 0)
      : (a.HRINI ?? 0) - (b.HRINI ?? 0),
  );

  return (
    <Box>
      {/* Sort toggle bar */}
      <Box sx={{
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
        px: 0, py: 0.5, gap: 0.5,
      }}>
        <IconButton size="small" onClick={handleCopyAll} sx={{ p: 0.5 }}>
          <ContentCopy sx={{ fontSize: 16, color: 'text.disabled' }} />
        </IconButton>
        <ButtonBase
          onClick={() => setReverseOrder((v) => !v)}
          sx={{
            display: 'flex', alignItems: 'center', gap: 0.5,
            px: 0.75, py: 0.25, borderRadius: 1,
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <SwapVert sx={{ fontSize: 14, color: 'text.disabled' }} />
          <Typography sx={{
            fontSize: '0.65rem', fontWeight: 600, color: 'text.disabled',
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            {reverseOrder ? 'Recente primeiro' : 'Cronologico'}
          </Typography>
        </ButtonBase>
      </Box>

      {/* Items */}
      {sorted.map((item) => {
        const key = `${item.CODRDO}-${item.ITEM}`;
        const isNew = newItemKeys.has(key);
        return (
          <Fade key={key} in timeout={isNew ? 400 : 0}>
            <Box sx={isNew ? {
              '@keyframes slideIn': {
                from: { opacity: 0, transform: 'translateY(-8px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
              animation: 'slideIn 400ms ease-out',
            } : undefined}>
              <AtividadeCard
                item={item}
                onClick={onEdit ? () => onEdit(item) : undefined}
              />
            </Box>
          </Fade>
        );
      })}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
