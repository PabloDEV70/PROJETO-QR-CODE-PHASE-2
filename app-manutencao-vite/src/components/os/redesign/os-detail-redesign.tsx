import { useState } from 'react';
import { Box, Tabs, Tab, useTheme } from '@mui/material';
import { Wrench, UserCog, ShoppingCart, History, Code } from 'lucide-react';
import type { OsDetailEnriched } from '@/types/os-types';
import { OsHero } from './os-hero';
import { OsBentoGrid } from './os-bento-grid';
import { OsTablesRedesign } from './os-tables-redesign';

function OsJsonTab({ os }: { os: OsDetailEnriched }) {
  return (
    <Box sx={{ p: { xs: 1, md: 2 }, flex: 1, overflow: 'auto' }}>
      <Box
        component="pre"
        sx={{
          bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)',
          border: '1px solid', borderColor: 'divider',
          borderRadius: 1, p: 2, m: 0,
          fontSize: 11, fontFamily: 'monospace',
          whiteSpace: 'pre-wrap', wordBreak: 'break-all',
          overflow: 'auto', maxHeight: '100%',
          lineHeight: 1.5,
        }}
      >
        {JSON.stringify(os, null, 2)}
      </Box>
    </Box>
  );
}

interface OsDetailRedesignProps {
  os: OsDetailEnriched;
}

export function OsDetailRedesign({ os }: OsDetailRedesignProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [mainTab, setMainTab] = useState(0);

  return (
    <Box sx={{
      height: '100%', overflowY: 'auto',
      bgcolor: isDark ? 'background.default' : '#f8fafc',
      display: 'flex', flexDirection: 'column',
    }}>
      <OsHero os={os} />

      {/* Main tabs */}
      <Box sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid', borderColor: 'divider',
        px: { xs: 2, md: 3 },
      }}>
        <Tabs
          value={mainTab}
          onChange={(_, v) => setMainTab(v)}
          sx={{
            minHeight: 42,
            '& .MuiTab-root': {
              minHeight: 42, textTransform: 'none',
              fontWeight: 700, fontSize: 13, py: 0,
            },
          }}
        >
          <Tab label="Dados da OS" />
          <Tab icon={<Wrench size={14} />} iconPosition="start" label={`Servicos (${os.servicos.length})`} />
          <Tab icon={<UserCog size={14} />} iconPosition="start" label={`Executores (${os.executores.length})`} />
          <Tab icon={<ShoppingCart size={14} />} iconPosition="start" label="Compras" />
          <Tab icon={<History size={14} />} iconPosition="start" label="Timeline" />
          <Tab icon={<Code size={14} />} iconPosition="start" label="JSON" />
        </Tabs>
      </Box>

      {/* Tab content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {mainTab === 0 && <OsBentoGrid os={os} />}
        {mainTab >= 1 && mainTab <= 4 && <OsTablesRedesign os={os} initialTab={mainTab - 1} />}
        {mainTab === 5 && <OsJsonTab os={os} />}
      </Box>
    </Box>
  );
}
