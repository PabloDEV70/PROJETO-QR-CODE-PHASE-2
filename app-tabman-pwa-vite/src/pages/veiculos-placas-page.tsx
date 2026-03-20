import { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, TextField, InputAdornment, Paper, Chip,
  CircularProgress, IconButton, Fab, Dialog, DialogTitle, DialogContent, alpha,
} from '@mui/material';
import { Search, FilterList, ArrowBack, Close } from '@mui/icons-material';
import { PlacaVeiculo } from '@/components/shared/placa-veiculo';
import { listarVeiculos, type Veiculo } from '@/api/veiculos';
import { useNavigate } from 'react-router-dom';

/* ── Color map by categoria ── */
const CAT_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  ALUGUEL:     { bg: '#e3f2fd', border: '#1565c0', label: 'Aluguel' },
  PARTICULAR:  { bg: '#fff3e0', border: '#e65100', label: 'Particular' },
  _default:    { bg: '#f5f5f5', border: '#9e9e9e', label: 'Sem categoria' },
};

function getCatColor(cat: string | null): { bg: string; border: string; label: string } {
  if (!cat) return CAT_COLORS._default!;
  return CAT_COLORS[cat.toUpperCase()] ?? CAT_COLORS._default!;
}

/* ── Brand color by marca (first chars of marcamodelo) ── */
const BRAND_COLORS: Record<string, string> = {
  VW: '#003399', 'M.BENZ': '#1a1a1a', 'M. BENZ': '#1a1a1a', SCANIA: '#1a237e',
  IVECO: '#003399', FIAT: '#8b0000', HYSTER: '#d84315', HANGCHA: '#2e7d32',
  HELI: '#1565c0', YALE: '#f9a825', LIUGONG: '#e65100', CHEVROLET: '#b8860b',
  I: '#333', SR: '#546e7a',
};

function getBrandColor(modelo: string | null): string {
  if (!modelo) return '#003399';
  const marca = modelo.split('/')[0]?.trim().toUpperCase() ?? '';
  for (const [key, color] of Object.entries(BRAND_COLORS)) {
    if (marca.startsWith(key.toUpperCase())) return color;
  }
  return '#003399';
}

export function VeiculosPlacasPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [filterCat, setFilterCat] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const result = await listarVeiculos({
          page: 1, limit: 100, ativo: 'S',
          categoria: filterCat || undefined,
          searchTerm: search || undefined,
          orderBy: 'placa', orderDir: 'ASC',
        });
        if (!cancelled) setVeiculos(result ?? []);
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [search, filterCat]);

  /* Unique categories for filter */
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const v of veiculos) { if (v.categoria) set.add(v.categoria); }
    return [...set].sort();
  }, [veiculos]);

  const filtered = veiculos;
  const activeFilters = filterCat ? 1 : 0;

  return (
    <Box sx={{ pb: 8 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <IconButton onClick={() => navigate(-1)} size="small"><ArrowBack sx={{ fontSize: 18 }} /></IconButton>
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>Veiculos</Typography>
        {filterCat && (
          <Chip
            label={filterCat} size="small" onDelete={() => setFilterCat(null)}
            sx={{ height: 20, fontSize: '0.6rem', fontWeight: 600, bgcolor: getCatColor(filterCat).bg, borderColor: getCatColor(filterCat)!.border, border: '1px solid' }}
          />
        )}
        <Box sx={{ flex: 1 }} />
        <TextField
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar placa, modelo..." size="small"
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16 }} /></InputAdornment> } }}
          sx={{ width: 240, '& .MuiOutlinedInput-root': { height: 32, fontSize: '0.75rem' } }}
        />
        {!loading && (
          <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>{filtered.length} veiculos</Typography>
        )}
      </Box>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' },
          gap: 1,
        }}>
          {filtered.map((v) => {
            const catColor = getCatColor(v.categoria);
            const brandColor = getBrandColor(v.marcamodelo);
            return (
              <Paper key={v.codveiculo} elevation={0} sx={{
                p: 1.25, borderRadius: 1, overflow: 'hidden',
                border: '1.5px solid', borderColor: catColor.border,
                bgcolor: catColor.bg,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75,
                '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
                transition: 'box-shadow 0.15s',
              }}>
                <PlacaVeiculo placa={v.placa} label={(v.categoria || 'VEICULO').trim()} scale={0.85} sx={{ borderColor: brandColor }} />

                <Box sx={{ width: '100%', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, lineHeight: 1.2 }} noWrap>
                    {v.marcamodelo || 'N/I'}
                  </Typography>

                  {v.tag && (
                    <Typography sx={{ fontSize: '0.62rem', color: brandColor, fontWeight: 700, mt: 0.15 }}>
                      {v.tag}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.25 }}>
                    {v.categoria && (
                      <Chip
                        label={v.categoria} size="small"
                        sx={{ height: 16, fontSize: '0.48rem', fontWeight: 700, bgcolor: alpha(catColor.border, 0.12), color: catColor.border }}
                      />
                    )}
                    {v.anofabric && (
                      <Typography sx={{ fontSize: '0.52rem', color: 'text.disabled' }}>
                        {v.anofabric}{v.anomod && v.anomod !== v.anofabric ? `/${v.anomod}` : ''}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ fontSize: '0.85rem', color: 'text.disabled' }}>Nenhum veiculo encontrado</Typography>
        </Box>
      )}

      {/* ── Floating filter FAB ── */}
      <Fab
        size="medium"
        onClick={() => setShowFilter(true)}
        sx={{
          position: 'fixed', bottom: 16, right: 16,
          bgcolor: activeFilters > 0 ? 'primary.main' : 'background.paper',
          color: activeFilters > 0 ? '#fff' : 'text.secondary',
          border: '1px solid', borderColor: 'divider',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          '&:hover': { bgcolor: activeFilters > 0 ? 'primary.dark' : 'action.hover' },
        }}
      >
        <FilterList />
      </Fab>

      {/* ── Filter Dialog ── */}
      <Dialog open={showFilter} onClose={() => setShowFilter(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700 }}>
          Filtros
          <IconButton size="small" onClick={() => setShowFilter(false)}><Close sx={{ fontSize: 18 }} /></IconButton>
        </DialogTitle>
        <DialogContent>
          {/* Category filter */}
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, mb: 1 }}>Categoria</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
            <Chip
              label="Todas" size="small"
              variant={!filterCat ? 'filled' : 'outlined'}
              onClick={() => { setFilterCat(null); setShowFilter(false); }}
              sx={{ fontWeight: 600, fontSize: '0.68rem' }}
            />
            {['ALUGUEL', 'PARTICULAR'].map((cat) => {
              const cc = getCatColor(cat);
              const active = filterCat === cat;
              return (
                <Chip
                  key={cat} label={cc.label} size="small"
                  variant={active ? 'filled' : 'outlined'}
                  onClick={() => { setFilterCat(active ? null : cat); setShowFilter(false); }}
                  sx={{
                    fontWeight: 600, fontSize: '0.68rem',
                    bgcolor: active ? cc.border : 'transparent',
                    color: active ? '#fff' : cc.border,
                    borderColor: cc.border,
                  }}
                />
              );
            })}
            <Chip
              label="Sem categoria" size="small"
              variant={filterCat === '_NULL' ? 'filled' : 'outlined'}
              onClick={() => { setFilterCat(filterCat === '_NULL' ? null : '_NULL'); setShowFilter(false); }}
              sx={{ fontWeight: 600, fontSize: '0.68rem' }}
            />
          </Box>

          {/* Dynamic categories from data */}
          {categories.filter((c) => !['ALUGUEL', 'PARTICULAR'].includes(c)).length > 0 && (
            <>
              <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', mb: 0.5 }}>Outras categorias</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {categories.filter((c) => !['ALUGUEL', 'PARTICULAR'].includes(c)).map((cat) => (
                  <Chip
                    key={cat} label={cat} size="small" variant={filterCat === cat ? 'filled' : 'outlined'}
                    onClick={() => { setFilterCat(filterCat === cat ? null : cat); setShowFilter(false); }}
                    sx={{ fontSize: '0.6rem' }}
                  />
                ))}
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default VeiculosPlacasPage;
