import { useState, useEffect } from 'react';
import { Box, TextField, Chip, Typography, InputAdornment, alpha } from '@mui/material';
import {
  Search,
  SignalWifi4Bar,
  SignalWifiOff,
} from '@mui/icons-material';

interface SelectorHeaderProps {
  search: string;
  onSearch: (value: string) => void;
  isOnline: boolean;
}

function useClock() {
  const [time, setTime] = useState(() => formatTime());
  useEffect(() => {
    const id = setInterval(() => setTime(formatTime()), 10_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function formatTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SelectorHeader({
  search,
  onSearch,
  isOnline,
}: SelectorHeaderProps) {
  const clock = useClock();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        py: 1,
        px: 1,
        mb: 3,
        flexWrap: { xs: 'wrap', md: 'nowrap' },
      }}
    >
      <TextField
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Buscar colaborador..."
        variant="standard"
        InputProps={{
          disableUnderline: true,
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: 'primary.main', ml: 1.5, mr: 1 }} />
            </InputAdornment>
          ),
        }}
        sx={{
          flex: 1,
          maxWidth: 600,
          bgcolor: 'background.paper',
          borderRadius: 4,
          height: 60,
          display: 'flex',
          justifyContent: 'center',
          border: '2px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'all 0.2s',
          '&:focus-within': {
            borderColor: 'primary.main',
            boxShadow: (t) => `0 4px 12px ${alpha(t.palette.primary.main, 0.1)}`,
          },
        }}
      />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          ml: 'auto',
        }}
      >
        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
          <Typography
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'text.primary',
              lineHeight: 1,
            }}
          >
            {clock}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              mt: 0.5,
              letterSpacing: '0.02em',
            }}
          >
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
          </Typography>
        </Box>

        <Chip
          icon={
            isOnline ? (
              <SignalWifi4Bar sx={{ fontSize: 18 }} />
            ) : (
              <SignalWifiOff sx={{ fontSize: 18 }} />
            )
          }
          label={isOnline ? 'ONLINE' : 'OFFLINE'}
          sx={{
            fontWeight: 800,
            borderRadius: 2,
            height: 40,
            px: 1,
            bgcolor: (t) => isOnline ? alpha(t.palette.success.main, 0.1) : alpha(t.palette.error.main, 0.1),
            color: isOnline ? 'success.main' : 'error.main',
            border: '2px solid',
            borderColor: 'currentColor',
            '& .MuiChip-icon': { color: 'inherit' },
          }}
        />
      </Box>
    </Box>
  );
}
