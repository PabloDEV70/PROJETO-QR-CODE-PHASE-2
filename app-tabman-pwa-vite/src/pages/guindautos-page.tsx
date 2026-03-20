import { useState, useMemo } from 'react';
import { Box, Typography, Paper, TextField, InputAdornment, IconButton, Chip, Fab, Dialog, DialogTitle, DialogContent, alpha } from '@mui/material';
import { Search, ArrowBack, FilterList, Close, LocationOn } from '@mui/icons-material';
import { PlacaVeiculo } from '@/components/shared/placa-veiculo';
import { useNavigate } from 'react-router-dom';

interface Guindauto {
  modelo: string;
  tag: string;
  placa: string;
  specs: string;
  operador: string;
  contratante: string;
  local: string;
  previsao: string;
}

const PREVISAO_COLORS: Record<string, { bg: string; color: string }> = {
  FIXO:   { bg: '#2e7d32', color: '#fff' },
  PARADA: { bg: '#d32f2f', color: '#fff' },
};
const dateColor = { bg: '#1565c0', color: '#fff' };

function getPrevisaoStyle(p: string) {
  const upper = p.toUpperCase().trim();
  if (PREVISAO_COLORS[upper]) return PREVISAO_COLORS[upper]!;
  if (upper.includes('DISPOSIÇÃO') || upper.includes('DISPOSICAO')) return { bg: '#f9a825', color: '#1a1a1a' };
  return dateColor;
}

const DATA: Guindauto[] = [
  { modelo: 'MUNCK 40.000 (2008)', tag: 'GGO-4001', placa: 'HEH-8605', specs: 'PALFINGER · EXT. 4 PATOLAS · MSO PARCIAL', operador: 'RONALDO M', contratante: 'MOSAIC', local: 'D.I III', previsao: 'PARADA' },
  { modelo: 'MUNCK 40.000 (2010)', tag: 'GGO-4003', placa: 'HKE-4478', specs: 'PALFINGER · EXT. 4 PATOLAS · MSO PARCIAL', operador: 'BELCHIOR MAURICIO', contratante: 'MOSAIC SPOT', local: 'DI. III', previsao: 'PARADA' },
  { modelo: 'MUNCK 40.000 (2007)', tag: 'GGO-4005', placa: 'DPE-7347', specs: 'PALFINGER · EXT. 4 PATOLAS · MSO PARCIAL', operador: 'SINESIO', contratante: 'SEGURA. TRANSPORTE', local: 'UBERABA', previsao: '15/03/2026 - domingo' },
  { modelo: 'MUNCK 43.000 (2010)', tag: 'GGO-4303', placa: 'HKE-4426', specs: 'ARGOS · MALHAL · EXT. 4 PATOLAS · MSO PARCIAL', operador: 'RENATO BATISTA', contratante: 'MOSAIC CAPEX', local: 'DI. III', previsao: 'FIXO' },
  { modelo: 'MUNCK 43.000 (2011)', tag: 'GGO-4304', placa: 'NYE-2444', specs: 'HINCOL · GUINCHO CABO · EXT. 4 PATOLAS · MSO PARCIAL', operador: 'HAMILTON', contratante: 'RAIZEN', local: 'JUNQUEIRA', previsao: '08/04/2026 - quarta-feira' },
  { modelo: 'MUNCK 43.000 (2010)', tag: 'GGO-4304', placa: 'EFW-7749', specs: 'ARGOS · GUINCHO CABO · EXT. 4 PATOLA · MSO PARCIAL', operador: 'JOSE RICARDO', contratante: 'MOSAIC', local: 'D.I III', previsao: 'FIXO' },
  { modelo: 'MUNCK 43.000 (2014)', tag: 'GGO-4306', placa: 'PUW-9122', specs: 'ARGOS · GUINCHO CABO · EXT. 4 PATOLAS · RADIO CONTROLE · MSO PARCIAL', operador: 'SEM OPERADOR', contratante: 'RAIZEN', local: 'IGARAPAVA', previsao: '17/05/2026 - domingo' },
  { modelo: 'MUNCK 43.000 (2012)', tag: 'GGO-4307', placa: 'OLT-9063', specs: 'TKA · EXT 4 PATOLAS · MSO PARCIAL', operador: 'VERF. OPERADOR', contratante: 'MOSAIC', local: 'D.I III', previsao: 'PARADA' },
  { modelo: 'MUNCK 43.000 (2017)', tag: 'GGO-4308', placa: 'GVQ-7G93', specs: 'PALFINGER · MALHAL · EXT 4 PATOLAS · MSO PARCIAL', operador: 'CLAUDIONOR', contratante: 'MOSAIC', local: 'D.I III', previsao: '17/03/2026 - terca-feira' },
  { modelo: 'MUNCK 43.000 (2004)', tag: 'GGO-4309', placa: 'GKM-0457', specs: 'PALFINGER · EXT 4 PATOLAS · MSO PARCIAL', operador: 'GILVANI', contratante: 'MOSAIC', local: 'D.I III', previsao: 'FIXO' },
  { modelo: 'MUNCK 43.000 (2018)', tag: 'GGO-4311', placa: 'LMX-8B35', specs: 'ARGOS · EXT. 4 PATOLAS · RADIO CONTROLE · MSO PARCIAL', operador: 'RENE', contratante: 'USINA DELTA', local: 'DELTA', previsao: '30/03/2026 - segunda-feira' },
  { modelo: 'MUNCK 43.000 (2018)', tag: 'GGO-4312', placa: 'LMT-8C83', specs: 'ARGOS · EXT. 4 PATOLAS · RADIO CONTROLE · MSO PARCIAL', operador: 'JOAO VITOR', contratante: 'USINA DELTA', local: 'VOLTA GRANDE', previsao: 'mar/26' },
  { modelo: 'MUNCK 43.000 (2007)', tag: 'GGO-4313', placa: 'HEH-8385', specs: 'ARGOS · EXT. 4 PATOLAS · MSO PARCIAL', operador: 'REGIANO', contratante: 'RAIZEN', local: 'IPAUSSU', previsao: '23/03/2026 - segunda-feira' },
  { modelo: 'MUNCK 45.000 (2012)', tag: 'GGO-4501', placa: 'EFW-4961', specs: 'PALFINGER · EXT. 8 PATOLAS · RADIO CONTROLE · MSO', operador: 'EM', contratante: 'MANUTENCAO', local: 'REG. VALVULAS / TURBINA / INTERCOOLER', previsao: '16/03/2026 - segunda-feira' },
  { modelo: 'MUNCK 45.000 (2012)', tag: 'GGO-4502', placa: 'EPC-5557', specs: 'PALFINGER · EXT. 4 PATOLAS · RADIO CONTROLE · MSO', operador: 'EM', contratante: 'MANUTENCAO', local: 'VERIF. REDCAN / MONTAGEM BICOS INJETORES', previsao: '16/03/2026 - segunda-feira' },
  { modelo: 'MUNCK 45.000 (2013)', tag: 'GGO-4503', placa: 'OWI-9620', specs: 'PALFINGER · EXT. 4 PATOLAS · RADIO CONTROLE · MSO', operador: 'DENILSON', contratante: 'BP BUNGE', local: 'TROPICAL', previsao: 'FIXO' },
  { modelo: 'MUNCK 45.000 (2013)', tag: 'GGO-4504', placa: 'OWI-9630', specs: 'PALFINGER · EXT. 4 PATOLAS · RADIO CONTROLE · MSO', operador: 'LEANDRO B.', contratante: 'MOSAIC', local: 'D.I III', previsao: 'FIXO' },
  { modelo: 'MUNCK 45.000 (2014)', tag: 'GGO-4505', placa: 'PVJ-5285', specs: 'PALFINGER · EXT. 4 PATOLAS · RADIO CONTROLE · MSO', operador: 'ANDERSON', contratante: 'EUROCHEM', local: 'CMISS', previsao: 'FIXO' },
  { modelo: 'MUNCK 45.000 (2015)', tag: 'GGO-4506', placa: 'PWK-9743', specs: 'PALFINGER · MALHAL · EXT. 4 PATOLAS · RADIO CONTROLE · MSO', operador: 'EDMARIO', contratante: 'RCJ CONSTRUCAO', local: 'UBERABA', previsao: '16/03/2026 - segunda-feira' },
  { modelo: 'MUNCK 45.000 (2011)', tag: 'GGO-4507', placa: 'ISS-7994', specs: 'PALFINGER · MALHAL · EXT. 4 PATOLAS · MSO PARCIAL', operador: 'RODRIGO M.', contratante: 'CBMM', local: 'ARAXA', previsao: 'A DISPOSICAO' },
  { modelo: 'MUNCK 45.000 (2021)', tag: 'GGO-4508', placa: 'RNI-4I39', specs: 'ING TRASEIRO · MALHAL G. CABO · EXT. 4 PATOLAS · RADIO CONTROLE · CESTO NR 12 · MSO', operador: 'JOSIMAR', contratante: 'EUROCHEM', local: 'SERRA DO SALITRE', previsao: 'FIXO' },
  { modelo: 'MUNCK 45.000 (2021)', tag: 'GGO-4509', placa: 'RNR-4G99', specs: 'ING MALHAL · G. CABO · EXT. 4 PATOLAS · RADIO CONTROLE · CESTO NR 12 · MSO', operador: 'JOSE MARIO', contratante: 'EUROCHEM', local: 'CMISS', previsao: 'FIXO' },
  { modelo: 'MUNCK 45.000 (2021)', tag: 'GGO-4510', placa: 'RNR-4H02', specs: 'ING MALHAL · G. CABO · EXT. 4 PATOLAS · RADIO CONTROLE · CESTO NR 12 · MSO', operador: 'ANDERSON V.', contratante: 'EUROCHEM', local: 'SERRA DO SALITRE', previsao: 'FIXO' },
  { modelo: 'MUNCK 45.000 (2021)', tag: 'GGO-4511', placa: 'RNT-8D40', specs: 'ING TRASEIRO · G. CABO · EXT. 4 PATOLAS ANTT · RADIO CONTROLE · CESTO NR 12 · MSO', operador: 'RONALDO M', contratante: 'MOSAIC', local: 'D.I III', previsao: 'FIXO' },
  { modelo: 'MUNCK 45.000 (2016)', tag: 'GGO-4512', placa: 'PZP-7J88', specs: 'PALFINGER · EXT. 4 PATOLAS · RADIO CONTROLE · TRACAO · MSO PARCIAL', operador: 'LEO JAIME', contratante: 'USINA DELTA', local: 'VOLTA GRANDE', previsao: '31/03/2026 - terca-feira' },
  { modelo: 'MUNCK 45.000 (2011)', tag: 'GGO-4513', placa: 'EXI-8H60', specs: 'PALFINGER · EXT. 4 PATOLAS · RADIO CONTROLE · MSO PARCIAL', operador: 'DOUGLAS A.', contratante: 'COMPLASTEC', local: 'D.I III', previsao: '30/03/2026 - segunda-feira' },
  { modelo: 'MUNCK 45.000 (2013)', tag: 'GGO-4514', placa: 'MQM-9G31', specs: 'PALFINGER · MALHAL · EXT. 4 PATOLAS · RADIO CONTROLE', operador: 'ADILSON', contratante: 'MOSAIC', local: 'FOSOFGESSO', previsao: 'FIXO' },
  { modelo: 'MUNCK 45.000 (2013)', tag: 'GGO-4515', placa: 'MQM-9G30', specs: 'PALFINGER · MALHAL · EXT. 4 PATOLAS · RADIO CONTROLE · MSO', operador: 'DIEGO', contratante: 'EUROCHEM', local: 'CMISS', previsao: 'FIXO' },
  { modelo: 'MUNCK 45.000 (2014)', tag: 'GGO-4516', placa: 'PVL-8G02', specs: 'PALFINGER · EXT. 4 PATOLAS · MSO PARCIAL · RADIO CONTROLE', operador: 'LUAN M.', contratante: 'USINA DELTA', local: 'VOLTA GRANDE', previsao: '30/03/2026 - segunda-feira' },
  { modelo: 'MUNCK 45.500 (2021)', tag: 'GGO-4517', placa: 'TXJ-4E89', specs: 'ING / MSO · RADIO CONTROLE · EXT. 4 PATOLAS · 4 EIXOS · GUINCHO CABO', operador: 'L. ANDRE', contratante: 'USINA DELTA', local: 'VOLTA GRANDE', previsao: '31/03/2026 - terca-feira' },
  { modelo: 'MUNCK 45.500 (2025)', tag: 'GGO-4518', placa: 'TXN-2G05', specs: 'ING / MSO · RADIO CONTROLE · EXT. 4 PATOLAS · 4 EIXOS · GUINCHO CABO', operador: 'O.P SERRA', contratante: 'EUROCHEM', local: 'SERRA DO SALITRE', previsao: 'FIXO' },
  { modelo: 'MUNCK 45.500 (2024)', tag: 'GGO-4519', placa: 'TXI-8I96', specs: 'ING / MSO · RADIO CONTROLE · EXT. 4 PATOLAS · 4o EIXO · GUINCHO CABO', operador: 'A. VAZ', contratante: 'EUROCHEM', local: 'SERRA DO SALITRE', previsao: 'FIXO' },
  { modelo: 'MUNCK 45.500 (2024)', tag: 'GGO-4520', placa: 'TXQ-5G87', specs: 'ING / MSO · RADIO CONTROLE · EXT. 4 PATOLAS · 4o EIXO · GUINCHO CABO', operador: 'ALEXANDRE', contratante: 'MOSAIC', local: 'D.I III', previsao: '21/03/2026 - sabado' },
  { modelo: 'MUNCK 45.500 (2021)', tag: 'GGO-4521', placa: 'RNU-6B95', specs: 'RADIO CONTROLE', operador: 'ROSINALDO', contratante: 'USINA DELTA', local: 'VOLTA GRANDE', previsao: '31/03/2026 - terca-feira' },
  { modelo: 'MUNCK 47.000 (2008)', tag: 'GGO-4701', placa: 'GVQ-8E20', specs: 'LUNA · MALHAL · EXT. 4 PATOLAS · MSO PARCIAL · RADIO CONTROLE', operador: 'O.P MOSIC', contratante: 'MOSAIC', local: 'D.I III', previsao: 'PARADA' },
  { modelo: 'MUNCK 48.000 (2016)', tag: 'GGO-4800', placa: 'GIT-3I64', specs: '3o EIXO · RADIO CONTROLE', operador: 'WESLEY', contratante: 'USINA DELTA', local: 'VOLTA GRANDE', previsao: '31/03/2026 - terca-feira' },
  { modelo: 'MUNCK 51.500 (2017)', tag: 'GGO-5101', placa: 'QNT-8558', specs: 'LUNA MALHAL · GUINCHO CABO · EXT. 4 PATOLAS · RADIO CONTROLE · MSO', operador: 'GABRIEL', contratante: 'EUROCHEM', local: 'SERRA DO SALITRE', previsao: 'FIXO' },
  { modelo: 'MUNCK 51.500 (2017)', tag: 'GGO-5102', placa: 'QNT-8557', specs: 'LUNA · GUINCHO CABO · EXT. 4 PATOLAS · RADIO CONTROLE · MSO', operador: 'DANIEL', contratante: 'EUROCHEM', local: 'SERRA DO SALITRE', previsao: 'FIXO' },
  { modelo: 'MUNCK 52.500 (2024)', tag: 'GGO-5201', placa: 'TCD-9F89', specs: 'ING · GUINCHO CABO · EXT. PATOLA · RADIO CONTROLE · MSO COM CESTO NR12', operador: 'PAULO ROCHA', contratante: 'BP BIOENERGY', local: 'ITUMBIARA', previsao: '31/03/2026 - terca-feira' },
  { modelo: 'MUNCK 55.000 (2013)', tag: 'GGO-5501', placa: 'IVB-9J18', specs: 'GVTEC · GUINCHO CABO · EXT. 4 PATOLAS · MSO PARCIAL · RADIO CONTROLE', operador: 'MARCIO R.', contratante: 'BP BUNGE', local: 'PORTEIRAO', previsao: '31/03/2026 - terca-feira' },
  { modelo: 'MUNCK C/ FLY JIB 60.500 (2021)', tag: 'GGO-6001', placa: 'RND-8E08', specs: 'ING DIANTEIRO · GUINCHO CABO · EXT. 4 PATOLAS · RADIO CONTROLE · MSO CESTO NR 12', operador: 'WELLINGTON', contratante: 'EUROCHEM', local: 'SERRA DO SALITRE', previsao: 'FIXO' },
  { modelo: 'MUNCK C/ FLY JIB 70.500 (2020)', tag: 'GGO-7001', placa: 'RFB-1D42', specs: 'ING TRASEIRO · GUINCHO CABO · EXT. PATOLA · RADIO CONTROLE · MSO COM CESTO NR12', operador: 'WELLINGTON P.', contratante: 'EUROCHEM', local: 'SERRA DO SALITRE', previsao: 'FIXO' },
  { modelo: 'MUNCK C/ FLY JIB 70.500 (2020)', tag: 'GGO-7002', placa: 'RFB-6J48', specs: 'ING TRASEIRO · GUINCHO CABO · EXT. PATOLA · RADIO CONTROLE · MSO COM CESTO NR12', operador: 'JOSE HUMBERTO', contratante: 'EUROCHEM', local: 'SERRA DO SALITRE', previsao: 'FIXO' },
  { modelo: 'MUNCK C/ FLY JIB 70.500 (2025)', tag: 'GGO-7003', placa: 'SYY-3E52', specs: 'ING DIANTEIRO · GUINCHO CABO · EXT. PATOLA · RADIO CONTROLE · MSO COM CESTO NR12', operador: 'EM', contratante: 'MANUTENCAO', local: 'REGENERACAO DO SISTEMA', previsao: '17/03/2026 - terca-feira' },
  { modelo: 'MUNCK C/ FLY JIB 80.500 (2024)', tag: 'GGO-8001', placa: 'SJF-8H41', specs: 'ING TRASEIRO · GUINCHO CABO · EXT. PATOLA · RADIO CONTROLE · MSO COM CESTO NR12', operador: 'RAFAEL H.', contratante: 'PRECISMEC', local: 'ARAXA', previsao: '27/03/2026 - sexta-feira' },
];

export function GuindautosPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterPrevisao, setFilterPrevisao] = useState<string | null>(null);
  const [filterContratante, setFilterContratante] = useState<string | null>(null);

  const contratantes = useMemo(() => [...new Set(DATA.map((d) => d.contratante))].sort(), []);

  const filtered = useMemo(() => {
    let list = DATA;
    if (filterPrevisao === 'FIXO') list = list.filter((d) => d.previsao.toUpperCase() === 'FIXO');
    else if (filterPrevisao === 'PARADA') list = list.filter((d) => d.previsao.toUpperCase() === 'PARADA');
    else if (filterPrevisao === 'DATA') list = list.filter((d) => !['FIXO', 'PARADA'].includes(d.previsao.toUpperCase().trim()) && !d.previsao.toUpperCase().includes('DISPOSICAO'));
    if (filterContratante) list = list.filter((d) => d.contratante === filterContratante);
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((d) =>
      d.operador.toLowerCase().includes(q) || d.placa.toLowerCase().includes(q) ||
      d.tag.toLowerCase().includes(q) || d.contratante.toLowerCase().includes(q) ||
      d.local.toLowerCase().includes(q) || d.modelo.toLowerCase().includes(q),
    );
  }, [search, filterPrevisao, filterContratante]);

  const activeFilters = (filterPrevisao ? 1 : 0) + (filterContratante ? 1 : 0);

  return (
    <Box sx={{ pb: 8 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <IconButton onClick={() => navigate(-1)} size="small"><ArrowBack sx={{ fontSize: 18 }} /></IconButton>
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#2e7d32' }}>GUINDAUTOS</Typography>
        <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>16/03/2026</Typography>
        {filterPrevisao && <Chip label={filterPrevisao} size="small" onDelete={() => setFilterPrevisao(null)} sx={{ height: 20, fontSize: '0.58rem' }} />}
        {filterContratante && <Chip label={filterContratante} size="small" onDelete={() => setFilterContratante(null)} sx={{ height: 20, fontSize: '0.58rem' }} />}
        <Box sx={{ flex: 1 }} />
        <TextField
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Operador, placa, local..." size="small"
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16 }} /></InputAdornment> } }}
          sx={{ width: 260, '& .MuiOutlinedInput-root': { height: 32, fontSize: '0.75rem' } }}
        />
        <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>{filtered.length} guindautos</Typography>
      </Box>

      {/* Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: 1,
      }}>
        {filtered.map((g, i) => {
          const ps = getPrevisaoStyle(g.previsao);
          const isMaint = g.operador === 'EM';
          return (
            <Paper key={i} elevation={0} sx={{
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              borderRadius: 1, border: '1.5px solid',
              borderColor: isMaint ? '#d32f2f' : g.previsao.toUpperCase() === 'PARADA' ? '#9e9e9e' : 'divider',
              opacity: g.previsao.toUpperCase() === 'PARADA' ? 0.6 : 1,
            }}>
              {/* Top: placa + tag + modelo */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: (t) => alpha(t.palette.action.hover, 0.02) }}>
                <PlacaVeiculo placa={g.placa} label={g.tag} scale={0.5} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700 }} noWrap>{g.modelo}</Typography>
                  <Typography sx={{ fontSize: '0.5rem', color: 'text.disabled' }} noWrap>{g.specs}</Typography>
                </Box>
              </Box>

              {/* Body */}
              <Box sx={{ p: 1, pt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.3, flex: 1 }}>
                {/* Operador */}
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: isMaint ? '#d32f2f' : 'text.primary' }}>
                  {g.operador}
                </Typography>

                {/* Contratante + Local */}
                <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: 'primary.main' }} noWrap>
                  {g.contratante}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <LocationOn sx={{ fontSize: 10, color: 'text.disabled' }} />
                  <Typography sx={{ fontSize: '0.58rem', color: 'text.secondary' }} noWrap>
                    {g.local}
                  </Typography>
                </Box>
              </Box>

              {/* Footer: previsao */}
              <Box sx={{ px: 1, py: 0.5, bgcolor: ps.bg, display: 'flex', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: '0.56rem', fontWeight: 700, color: ps.color, textTransform: 'uppercase' }}>
                  {g.previsao}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* Filter FAB */}
      <Fab size="medium" onClick={() => setShowFilter(true)} sx={{
        position: 'fixed', bottom: 16, right: 16,
        bgcolor: activeFilters > 0 ? 'primary.main' : 'background.paper',
        color: activeFilters > 0 ? '#fff' : 'text.secondary',
        border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      }}>
        <FilterList />
      </Fab>

      {/* Filter Dialog */}
      <Dialog open={showFilter} onClose={() => setShowFilter(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700 }}>
          Filtros
          <IconButton size="small" onClick={() => setShowFilter(false)}><Close sx={{ fontSize: 18 }} /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, mb: 0.75 }}>Previsao</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
            {[null, 'FIXO', 'PARADA', 'DATA'].map((v) => (
              <Chip key={v ?? 'all'} label={v ?? 'Todos'} size="small"
                variant={filterPrevisao === v ? 'filled' : 'outlined'}
                onClick={() => { setFilterPrevisao(v); setShowFilter(false); }}
                sx={{ fontWeight: 600, fontSize: '0.68rem', bgcolor: filterPrevisao === v ? getPrevisaoStyle(v ?? '').bg : undefined, color: filterPrevisao === v ? getPrevisaoStyle(v ?? '').color : undefined }}
              />
            ))}
          </Box>

          <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, mb: 0.75 }}>Contratante</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <Chip label="Todos" size="small" variant={!filterContratante ? 'filled' : 'outlined'}
              onClick={() => { setFilterContratante(null); setShowFilter(false); }}
              sx={{ fontSize: '0.62rem' }}
            />
            {contratantes.map((c) => (
              <Chip key={c} label={c} size="small"
                variant={filterContratante === c ? 'filled' : 'outlined'}
                onClick={() => { setFilterContratante(filterContratante === c ? null : c); setShowFilter(false); }}
                sx={{ fontSize: '0.62rem' }}
              />
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
