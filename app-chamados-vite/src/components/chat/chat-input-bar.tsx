import { useState, useCallback, type KeyboardEvent } from 'react';
import { Box, IconButton, TextField, CircularProgress } from '@mui/material';
import { AddRounded, EmojiEmotionsOutlined, Send } from '@mui/icons-material';
import { useAddOcorrencia } from '@/hooks/use-chamado-mutations';
import { useAuthStore } from '@/stores/auth-store';
import { useChatColors } from './use-chat-colors';

interface ChatInputBarProps {
  nuchamado: number;
  onSent: () => void;
}

export function ChatInputBar({ nuchamado, onSent }: ChatInputBarProps) {
  const [text, setText] = useState('');
  const codusu = useAuthStore((s) => s.user?.codusu);
  const mutation = useAddOcorrencia();
  const c = useChatColors();

  const canSend = text.trim().length > 0 && !mutation.isPending;

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    mutation.mutate(
      {
        nuchamado,
        payload: {
          DESCROCORRENCIA: `${trimmed}\n\n— via chamados.gigantao.net`,
          CODUSU: codusu,
        },
      },
      {
        onSuccess: () => {
          setText('');
          onSent();
        },
      },
    );
  }, [text, nuchamado, codusu, mutation, onSent]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (canSend) handleSend();
      }
    },
    [canSend, handleSend],
  );

  return (
    <Box
      sx={{
        bgcolor: c.inputBarBg,
        px: 1.5,
        py: 0.75,
        pb: 'max(8px, env(safe-area-inset-bottom))',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 0.75,
        flexShrink: 0,
      }}
    >
      {/* Left icons — WhatsApp style */}
      <IconButton
        disabled
        size="small"
        sx={{ color: c.textMuted, mb: 0.25 }}
      >
        <AddRounded />
      </IconButton>

      {/* Input field with emoji icon inside */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <TextField
          multiline
          maxRows={4}
          placeholder="Digite uma tratativa"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={mutation.isPending}
          sx={{
            width: '100%',
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              fontSize: 14,
              py: 0.75,
              pl: 5,
              pr: 1.5,
              color: c.textPrimary,
              bgcolor: c.inputFieldBg,
              minHeight: 42,
              '& fieldset': { border: 'none' },
            },
            '& .MuiInputBase-input::placeholder': { color: c.textMuted, opacity: 1 },
          }}
        />
        <Box sx={{
          position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
          display: 'flex', alignItems: 'center',
        }}>
          <EmojiEmotionsOutlined sx={{ fontSize: 24, color: c.textMuted }} />
        </Box>
      </Box>

      {/* Send button — circular green like WhatsApp */}
      <IconButton
        onClick={handleSend}
        disabled={!canSend}
        size="small"
        sx={{
          width: 42,
          height: 42,
          mb: 0.25,
          bgcolor: canSend ? c.accent : 'transparent',
          color: canSend ? '#fff' : c.textMuted,
          '&:hover': { bgcolor: canSend ? c.accentHover : 'transparent' },
          '&.Mui-disabled': { color: c.btnDisabledColor },
          borderRadius: '50%',
        }}
      >
        {mutation.isPending ? (
          <CircularProgress size={20} sx={{ color: '#fff' }} />
        ) : (
          <Send sx={{ fontSize: 20 }} />
        )}
      </IconButton>
    </Box>
  );
}
