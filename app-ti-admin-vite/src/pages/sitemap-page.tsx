import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Collapse } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useState } from 'react';
import { pagesConfig } from '@/components/layout/pages-config';

export default function SitemapPage() {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const groupedPages = pagesConfig.reduce((acc, page) => {
    if (!acc[page.group]) acc[page.group] = [];
    acc[page.group].push(page);
    return acc;
  }, {} as Record<string, typeof pagesConfig>);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mapa do App
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Todas as telas disponiveis no sistema
      </Typography>

      {Object.entries(groupedPages).map(([group, pages]) => {
        const isOpen = openGroups[group] ?? true;
        const visiblePages = pages.filter((p) => !p.hidden);

        return (
          <Paper key={group} sx={{ mb: 2 }}>
            <List disablePadding>
              <ListItemButton onClick={() => toggleGroup(group)}>
                {isOpen ? <ExpandLess /> : <ExpandMore />}
                <ListItemText
                  primary={group}
                  secondary={`${visiblePages.length} pagina(s)`}
                  primaryTypographyProps={{ fontWeight: 'bold' }}
                />
              </ListItemButton>
              <Collapse in={isOpen}>
                <List disablePadding>
                  {visiblePages.map((page) => (
                    <ListItem key={page.path} disablePadding>
                      <ListItemIcon>
                        <page.icon />
                      </ListItemIcon>
                      <ListItemText
                        primary={page.label}
                        secondary={page.description}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </List>
          </Paper>
        );
      })}
    </Box>
  );
}
