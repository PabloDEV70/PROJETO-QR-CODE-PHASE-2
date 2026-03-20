import { useMemo } from 'react';
import { Box, Typography, TextField, InputAdornment, Tabs, Tab, Skeleton, alpha } from '@mui/material';
import { Search, Build } from '@mui/icons-material';
import { PlacaVeiculo } from '@/components/shared/placa-veiculo';
import { getOsStatusColor } from '@/utils/os-status-colors';
import { OsCard } from './os-card';
import { useSearchParams } from 'react-router-dom';
import { useMinhasOs } from '@/hooks/use-minhas-os';
import { useTodasOs } from '@/hooks/use-todas-os';
import { useVeiculos } from '@/hooks/use-veiculos';
import type { VeiculoItem } from '@/hooks/use-veiculos';
import type { OsGeral } from '@/hooks/use-todas-os';
import type { OsListItem } from '@/types/os-types';

interface OsPanelProps {
  codparc: number;
  activeNuos?: number | null;
  activeSequencia?: number | null;
}

export function OsPanel({ codparc, activeNuos, activeSequencia }: OsPanelProps) {
  const { data: minhasOs } = useMinhasOs(codparc);
  const { data: todasOs, isLoading: todasLoading } = useTodasOs();
  const { data: veiculos, isLoading: veiLoading } = useVeiculos();
  const [sp, setSp] = useSearchParams();

  const tab = Number(sp.get('osTab') ?? '0');
  const searches = { so: sp.get('so') ?? '', sv: sp.get('sv') ?? '' };
  const searchKeys: ('so' | 'sv')[] = ['so', 'sv'];

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(sp);
    if (value) next.set(key, value); else next.delete(key);
    setSp(next, { replace: true });
  };

  // Set de NUOS do colaborador pra destacar na lista geral
  const minhasNuosSet = useMemo(() => new Set((minhasOs ?? []).map((os) => os.NUOS)), [minhasOs]);

  // OS do colaborador por veiculo
  const minhasOsMap = useMemo(() => {
    const map = new Map<number, OsListItem[]>();
    for (const os of minhasOs ?? []) {
      if (os.CODVEICULO) {
        if (!map.has(os.CODVEICULO)) map.set(os.CODVEICULO, []);
        map.get(os.CODVEICULO)!.push(os);
      }
    }
    return map;
  }, [minhasOs]);

  // Filtered data
  const filteredVeiculos = useMemo(() => {
    if (!veiculos) return [];
    const q = searches.sv.toLowerCase();
    const list = q
      ? veiculos.filter((v) => v.placa.toLowerCase().includes(q) || v.tag?.toLowerCase().includes(q) || v.marcamodelo?.toLowerCase().includes(q))
      : veiculos;
    return [...list].sort((a, b) => (minhasOsMap.has(b.codveiculo) ? 1 : 0) - (minhasOsMap.has(a.codveiculo) ? 1 : 0));
  }, [veiculos, searches.sv, minhasOsMap]);

  const filteredTodasOs = useMemo(() => {
    if (!todasOs) return [];
    const q = searches.so.toLowerCase();
    return q ? todasOs.filter((os) => String(os.NUOS).includes(q) || os.PLACA?.toLowerCase().includes(q) || os.AD_TAG?.toLowerCase().includes(q)) : todasOs;
  }, [todasOs, searches.so]);


  const placeholders = ['Numero OS ou placa...', 'Placa, tag ou modelo...'];
  const loading = [todasLoading, veiLoading][tab];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
      <Tabs
        value={tab}
        onChange={(_, v) => setParam('osTab', String(v))}
        variant="fullWidth"
        sx={{
          minHeight: 30, mb: 0.5,
          '& .MuiTab-root': { minHeight: 30, py: 0, px: 0.5, fontSize: '0.58rem', fontWeight: 600, textTransform: 'none', minWidth: 0 },
          '& .MuiTabs-indicator': { height: 2 },
        }}
      >
        <Tab label={`Ordens de Servico (${todasOs?.length ?? 0})`} />
        <Tab label={`Veiculos`} />
      </Tabs>

      <TextField
        value={searches[searchKeys[tab] ?? 'sv']}
        onChange={(e) => setParam(searchKeys[tab] ?? 'sv', e.target.value)}
        placeholder={placeholders[tab]}
        size="small"
        slotProps={{ input: {
          startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 14, color: 'text.disabled' }} /></InputAdornment>,
        }}}
        sx={{ mb: 0.5, '& .MuiOutlinedInput-root': { height: 28, fontSize: '0.65rem' } }}
      />

      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rounded" height={48} />)}
          </Box>
        ) : tab === 0 ? (
          <OsListView osList={filteredTodasOs} minhasNuos={minhasNuosSet} activeNuos={activeNuos} activeSequencia={activeSequencia} />
        ) : (
          <VeiculoList veiculos={filteredVeiculos} osMap={minhasOsMap} />
        )}
      </Box>
    </Box>
  );
}

/* ── Veiculos ── */
function VeiculoList({ veiculos, osMap }: { veiculos: VeiculoItem[]; osMap: Map<number, OsListItem[]> }) {
  if (veiculos.length === 0) return <Empty text="Nenhum veiculo" />;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {veiculos.map((v) => {
        const osList = osMap.get(v.codveiculo);
        const hasOs = !!osList && osList.length > 0;
        return (
          <Box key={v.codveiculo} sx={{
            p: 0.75, borderRadius: 1, border: '1px solid',
            borderColor: hasOs ? 'primary.main' : 'divider',
            bgcolor: hasOs ? (t) => alpha(t.palette.primary.main, 0.03) : 'transparent',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <PlacaVeiculo placa={v.placa} label={v.tag || v.categoria || 'VEI'} scale={0.35} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                  {v.tag && <Typography sx={{ fontSize: '0.58rem', color: 'primary.main', fontWeight: 600 }}>{v.tag}</Typography>}
                  {v.categoria && <Typography sx={{ fontSize: '0.5rem', color: 'text.disabled', fontWeight: 600 }}>{v.categoria}</Typography>}
                </Box>
                <Typography sx={{ fontSize: '0.54rem', color: 'text.secondary' }} noWrap>{v.marcamodelo}</Typography>
              </Box>
              {hasOs && (
                <Typography sx={{ fontSize: '0.56rem', fontWeight: 700, color: 'primary.main', flexShrink: 0 }}>
                  {osList.length} OS
                </Typography>
              )}
            </Box>
            {hasOs && osList.map((os) => {
              const osc = getOsStatusColor(os.STATUS);
              return (
                <Box key={os.NUOS} sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5,
                  mt: 0.4, ml: 3.5, p: 0.5, borderRadius: 0.5, bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
                }}>
                  <Build sx={{ fontSize: 12, color: osc.bg }} />
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.62rem', fontWeight: 700 }}>{os.NUOS}</Typography>
                  <Box sx={{ px: 0.35, py: 0.05, borderRadius: 0.4, bgcolor: osc.bg, color: osc.text }}>
                    <Typography sx={{ fontSize: '0.46rem', fontWeight: 700 }}>{os.statusLabel}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.5rem', color: 'text.disabled', ml: 'auto' }}>{os.qtdServicos} serv.</Typography>
                </Box>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
}

/* ── Todas OS (com OsCard completo) ── */
function OsListView({ osList, minhasNuos, activeNuos, activeSequencia }: {
  osList: OsGeral[]; minhasNuos: Set<number>; activeNuos?: number | null; activeSequencia?: number | null;
}) {
  if (osList.length === 0) return <Empty text="Nenhuma OS aberta" />;
  // Active first, then minhas, then rest
  const sorted = [...osList].sort((a, b) => {
    const aW = a.NUOS === activeNuos ? 2 : minhasNuos.has(a.NUOS) ? 1 : 0;
    const bW = b.NUOS === activeNuos ? 2 : minhasNuos.has(b.NUOS) ? 1 : 0;
    return bW - aW;
  });
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {sorted.map((os) => (
        <OsCard
          key={os.NUOS}
          os={os}
          isMinha={minhasNuos.has(os.NUOS)}
          activeNuos={activeNuos}
          activeSequencia={activeSequencia}
        />
      ))}
    </Box>
  );
}


function Empty({ text }: { text: string }) {
  return <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', py: 3, textAlign: 'center' }}>{text}</Typography>;
}
