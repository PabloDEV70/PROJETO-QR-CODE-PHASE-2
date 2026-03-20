import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Paper, TextField, InputAdornment, IconButton, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Skeleton,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import { Search, ArrowBack, ViewModule, TableChart } from '@mui/icons-material';
import { useColaboradores } from '@/hooks/use-colaboradores';
import { getFotoUrl } from '@/api/funcionarios';

type View = 'cards' | 'table';

export function ParceirosPage() {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const search = sp.get('q') ?? '';
  const view = (sp.get('view') as View) || 'cards';
  const setSearch = (v: string) => { const n = new URLSearchParams(sp); if (v) n.set('q', v); else n.delete('q'); setSp(n, { replace: true }); };
  const setView = (v: View) => { const n = new URLSearchParams(sp); n.set('view', v); setSp(n, { replace: true }); };

  const { allColaboradores, isLoading } = useColaboradores();

  const filtered = useMemo(() => {
    if (!allColaboradores) return [];
    if (!search.trim()) return allColaboradores;
    const q = search.trim().toLowerCase();
    const isNum = /^\d+$/.test(q);
    return allColaboradores.filter((c) =>
      isNum ? String(c.codparc).includes(q) : c.nomeparc.toLowerCase().includes(q),
    );
  }, [allColaboradores, search]);

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <IconButton onClick={() => navigate(-1)} size="small"><ArrowBack sx={{ fontSize: 18 }} /></IconButton>
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 700 }}>Colaboradores</Typography>
        <Box sx={{ flex: 1 }} />
        <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && setView(v)} size="small" sx={{ '& .MuiToggleButton-root': { px: 0.75, py: 0.25 } }}>
          <ToggleButton value="cards"><ViewModule sx={{ fontSize: 16 }} /></ToggleButton>
          <ToggleButton value="table"><TableChart sx={{ fontSize: 16 }} /></ToggleButton>
        </ToggleButtonGroup>
        <TextField
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Nome, codparc..." size="small"
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16 }} /></InputAdornment> } }}
          sx={{ width: 240, '& .MuiOutlinedInput-root': { height: 32, fontSize: '0.75rem' } }}
        />
        {!isLoading && <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>{filtered.length}</Typography>}
      </Box>

      {/* Loading */}
      {isLoading && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1 }}>
          {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 2 }} />)}
        </Box>
      )}

      {/* Cards */}
      {!isLoading && view === 'cards' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 1.25 }}>
          {filtered.map((c) => (
            <ColabCard key={c.codparc} c={c} />
          ))}
        </Box>
      )}

      {/* Table */}
      {!isLoading && view === 'table' && (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table size="small" sx={{ '& td, & th': { fontSize: '0.75rem', py: 0.75, px: 1 } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell />
                <TableCell sx={{ fontWeight: 700 }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>CODPARC</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Cargo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Departamento</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Empresa</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Situacao</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.codparc} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                  <TableCell sx={{ width: 40 }}>
                    <Avatar src={c.temFoto ? getFotoUrl(c.codparc) : undefined} sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem', fontWeight: 700 }}>
                      {c.nomeparc.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{c.nomeparc}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', color: 'text.disabled' }}>#{c.codparc}</TableCell>
                  <TableCell>{c.cargo}</TableCell>
                  <TableCell sx={{ color: 'primary.main', fontWeight: 600 }}>{c.departamento}</TableCell>
                  <TableCell>{c.empresa}</TableCell>
                  <TableCell>
                    <Typography sx={{
                      fontSize: '0.65rem', fontWeight: 700,
                      color: c.emFerias ? '#1565c0' : (!c.situacao || c.situacao === '1') ? '#2e7d32' : '#e65100',
                    }}>
                      {c.emFerias ? 'Ferias' : (!c.situacao || c.situacao === '1') ? 'Ativo' : c.situacaoLabel ?? 'Afastado'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ fontSize: '0.85rem', color: 'text.disabled' }}>
            {search ? `Nenhum resultado para "${search}"` : 'Nenhum colaborador'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

/* ── Card ── */
function ColabCard({ c }: { c: any }) {
  const isActive = !c.situacao || c.situacao === '1';
  return (
    <Paper elevation={1} sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      p: 1.5, borderRadius: 2, bgcolor: '#fff',
      opacity: isActive ? 1 : 0.6,
      '&:hover': { boxShadow: 4 },
      transition: 'box-shadow 0.15s',
    }}>
      <Avatar
        src={c.temFoto ? getFotoUrl(c.codparc) : undefined}
        sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.3rem', fontWeight: 800, mb: 1 }}
      >
        {c.nomeparc.charAt(0)}
      </Avatar>
      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>
        {c.nomeparc}
      </Typography>
      <Typography sx={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'text.disabled', mt: 0.25 }}>
        #{c.codparc}
      </Typography>
      {c.cargo && (
        <Typography sx={{ fontSize: '0.65rem', color: '#666', textAlign: 'center', lineHeight: 1.2, mt: 0.25 }}>
          {c.cargo}
        </Typography>
      )}
      {c.departamento && (
        <Typography sx={{ fontSize: '0.62rem', color: '#2e7d32', fontWeight: 600, textAlign: 'center', mt: 0.15 }}>
          {c.departamento}
        </Typography>
      )}
      {c.emFerias && (
        <Typography sx={{ fontSize: '0.6rem', color: '#1565c0', fontWeight: 700, mt: 0.25 }}>EM FERIAS</Typography>
      )}
    </Paper>
  );
}

export default ParceirosPage;
