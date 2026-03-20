import { Chip } from '@mui/material';
import { BugReportRounded } from '@mui/icons-material';

const isDev = import.meta.env.DEV;

export function DevIndicator() {
  if (!isDev) return null;

  return (
    <Chip
      icon={<BugReportRounded sx={{ fontSize: '14px !important' }} />}
      label="DEV"
      size="small"
      sx={{
        height: 22,
        fontWeight: 800,
        fontSize: 10,
        letterSpacing: '0.06em',
        bgcolor: '#ff5722',
        color: '#fff',
        borderRadius: '6px',
        '& .MuiChip-icon': { color: '#fff' },
        animation: 'devPulse 3s ease-in-out infinite',
        '@keyframes devPulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
      }}
    />
  );
}
