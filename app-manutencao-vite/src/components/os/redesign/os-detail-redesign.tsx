import { Box, useTheme } from '@mui/material';
import type { OsDetailEnriched } from '@/types/os-types';
import { OsHero } from './os-hero';
import { OsBentoGrid } from './os-bento-grid';
import { OsTablesRedesign } from './os-tables-redesign';

interface OsDetailRedesignProps {
  os: OsDetailEnriched;
}

export function OsDetailRedesign({ os }: OsDetailRedesignProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box 
      sx={{ 
        height: '100%', 
        overflowY: 'auto',
        bgcolor: isDark ? 'background.default' : '#f8fafc',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <OsHero os={os} />
      <OsBentoGrid os={os} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <OsTablesRedesign os={os} />
      </Box>
    </Box>
  );
}
