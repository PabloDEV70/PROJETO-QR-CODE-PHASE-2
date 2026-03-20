import {
  Box, Typography, IconButton, Stack, Chip, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  Close, AccountTree, Build, FolderOpen, Tag,
} from '@mui/icons-material';
import type { ArvoreGrupo } from '@/types/grupo-types';

interface GrupoDetailPanelProps {
  grupo: ArvoreGrupo;
  onClose: () => void;
}

export function GrupoDetailPanel({ grupo, onClose }: GrupoDetailPanelProps) {
  const servicoCount = grupo.servicos?.length ?? 0;
  const childCount = grupo.children.length;
  const isRoot = grupo.codGrupoPai === null || grupo.codGrupoPai === -999999999;

  return (
    <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="flex-start" spacing={1}>
          <FolderOpen sx={{ color: 'primary.main', mt: 0.3 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {grupo.descrGrupoProd}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap">
              <Chip
                icon={<Tag sx={{ fontSize: '14px !important' }} />}
                label={`Cod: ${grupo.codGrupoProd}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: 11 }}
              />
              <Chip
                label={`Grau: ${grupo.grau}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: 11 }}
              />
              {isRoot && (
                <Chip label="Raiz" size="small" color="primary" sx={{ fontSize: 11 }} />
              )}
              {grupo.codGrupoPai && !isRoot && (
                <Chip
                  label={`Pai: ${grupo.codGrupoPai}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: 11 }}
                />
              )}
            </Stack>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <Close fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Stats */}
      <Box sx={{ px: 2, py: 1.5, display: 'flex', gap: 2 }}>
        <StatBox
          icon={<AccountTree sx={{ fontSize: 20, color: 'primary.main' }} />}
          label="Subgrupos"
          value={childCount}
        />
        <StatBox
          icon={<Build sx={{ fontSize: 20, color: 'warning.main' }} />}
          label="Servicos diretos"
          value={servicoCount}
        />
      </Box>

      <Divider />

      {/* Children list */}
      {childCount > 0 && (
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="overline" color="text.secondary">
            Subgrupos ({childCount})
          </Typography>
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            {grupo.children.map((child) => (
              <Stack
                key={child.codGrupoProd}
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  py: 0.5,
                  px: 1,
                  borderRadius: '6px',
                  bgcolor: 'action.hover',
                }}
              >
                <FolderOpen sx={{ fontSize: 16, color: '#fbc02d' }} />
                <Typography variant="body2" sx={{ flex: 1, fontSize: 13 }}>
                  {child.descrGrupoProd}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {child.codGrupoProd}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      )}

      {childCount > 0 && servicoCount > 0 && <Divider />}

      {/* Services table */}
      {servicoCount > 0 && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
            <Typography variant="overline" color="text.secondary">
              Servicos ({servicoCount})
            </Typography>
          </Box>
          <TableContainer sx={{ flex: 1 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Cod</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Descricao</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }} align="right">Utilizacoes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {grupo.servicos!.map((s) => (
                  <TableRow key={s.codProd} hover>
                    <TableCell sx={{ fontSize: 12, fontFamily: 'monospace', color: 'text.secondary' }}>
                      {s.codProd}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{s.descrProd}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={s.utilizacoes}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          bgcolor: s.utilizacoes > 0 ? 'success.light' : 'action.hover',
                          color: s.utilizacoes > 0 ? 'success.dark' : 'text.disabled',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {servicoCount === 0 && childCount === 0 && (
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="body2" color="text.disabled">
            Este grupo nao possui servicos nem subgrupos
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ flex: 1, p: 1.5, borderRadius: '6px', bgcolor: 'action.hover' }}
    >
      {icon}
      <Box>
        <Typography variant="body2" fontWeight={700}>{value}</Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
      </Box>
    </Stack>
  );
}
