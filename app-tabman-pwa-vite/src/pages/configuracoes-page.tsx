import { useState, useMemo } from 'react';
import {
  Box, Typography, Paper, TextField, Switch, Slider, Divider,
  Autocomplete, Avatar, IconButton, alpha, Button, InputAdornment,
} from '@mui/material';
import {
  ArrowBack, Tablet, Visibility, VisibilityOff,
  GridView, Search,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDeviceStore } from '@/stores/device-store';
import { useColaboradores } from '@/hooks/use-colaboradores';
import { getFotoUrl } from '@/api/funcionarios';

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, gap: 2 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.88rem', fontWeight: 600 }}>{label}</Typography>
        {description && <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.15 }}>{description}</Typography>}
      </Box>
      <Box sx={{ flexShrink: 0 }}>{children}</Box>
    </Box>
  );
}

interface ColabItemProps {
  c: { codparc: number; nomeparc: string; departamento: string | null; cargo: string | null; temFoto: boolean };
  action: 'hide' | 'show';
  onToggle: () => void;
}

function ColabItem({ c, action, onToggle }: ColabItemProps) {
  return (
    <Box
      onClick={onToggle}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75,
        cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' },
        borderBottom: '1px solid', borderColor: 'divider',
      }}
    >
      <Avatar
        src={c.temFoto ? getFotoUrl(c.codparc) : undefined}
        sx={{ width: 34, height: 34, fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}
      >
        {c.nomeparc.charAt(0)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.2 }} noWrap>{c.nomeparc}</Typography>
        <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }} noWrap>
          {[c.departamento, c.cargo].filter(Boolean).join(' · ')}
        </Typography>
      </Box>
      <IconButton size="small" tabIndex={-1} sx={{ flexShrink: 0, color: action === 'hide' ? 'warning.main' : 'success.main' }}>
        {action === 'hide' ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}
      </IconButton>
    </Box>
  );
}

export function ConfiguracoesPage() {
  const navigate = useNavigate();
  const store = useDeviceStore();
  const { allColaboradores, departamentos } = useColaboradores();
  const [searchColab, setSearchColab] = useState('');
  const [filterDep, setFilterDep] = useState<string | null>(null);

  const allColabs = useMemo(() => allColaboradores ?? [], [allColaboradores]);

  const displayedColabs = useMemo(() => {
    let list = allColabs;
    if (filterDep) list = list.filter((c) => c.departamento === filterDep);
    const q = searchColab.toLowerCase().trim();
    if (q) list = list.filter((c) => c.nomeparc.toLowerCase().includes(q) || String(c.codparc).includes(q));
    return list;
  }, [allColabs, searchColab, filterDep]);

  const visibleColabs = useMemo(() =>
    displayedColabs.filter((c) => !store.hiddenCodparcs.includes(c.codparc)),
  [displayedColabs, store.hiddenCodparcs]);

  const hiddenColabs = useMemo(() =>
    displayedColabs.filter((c) => store.hiddenCodparcs.includes(c.codparc)),
  [displayedColabs, store.hiddenCodparcs]);

  const hiddenCount = store.hiddenCodparcs.length;

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', px: { xs: 1.5, sm: 2 }, py: 2 }}>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <IconButton onClick={() => navigate('/')} size="small"><ArrowBack /></IconButton>
        <Box>
          <Typography sx={{ fontSize: '1.2rem', fontWeight: 800 }}>Configuracoes</Typography>
          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
            {store.tabletName || 'Tablet sem nome'} · Salvo no dispositivo
          </Typography>
        </Box>
      </Box>

      {/* ═══ DISPOSITIVO ═══ */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Tablet sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700 }}>Dispositivo</Typography>
        </Box>
        <SettingRow label="Nome do tablet">
          <TextField size="small" value={store.tabletName} onChange={(e) => store.setTabletName(e.target.value)} placeholder="Ex: Tablet Oficina" sx={{ width: 200 }} />
        </SettingRow>
        <Divider />
        <SettingRow label="Departamento padrao">
          <Autocomplete size="small" sx={{ width: 200 }} options={departamentos} value={store.preferredDepartamento} onChange={(_, v) => store.setPreferredDepartamento(v)} renderInput={(p) => <TextField {...p} placeholder="Todos" />} clearOnEscape />
        </SettingRow>
        <Divider />
        <SettingRow label="Supervisor">
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{store.supervisorNome}</Typography>
        </SettingRow>
      </Paper>

      {/* ═══ EXIBICAO ═══ */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <GridView sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700 }}>Exibicao</Typography>
        </Box>
        <SettingRow label="Escala" description={`${store.preferredScale}%`}>
          <Slider value={store.preferredScale} onChange={(_, v) => { store.setPreferredScale(v as number); document.documentElement.style.fontSize = `${v}%`; }} min={70} max={150} step={5} size="small" sx={{ width: 180 }} marks={[{ value: 70, label: '70' }, { value: 100, label: '100' }, { value: 150, label: '150' }]} />
        </SettingRow>
        <Divider />
        <SettingRow label="Colunas do grid" description={store.gridColumns === 0 ? 'Automatico' : `${store.gridColumns} colunas`}>
          <Slider value={store.gridColumns} onChange={(_, v) => store.setGridColumns(v as number)} min={0} max={6} step={1} size="small" sx={{ width: 180 }} marks={[{ value: 0, label: 'Auto' }, { value: 3, label: '3' }, { value: 6, label: '6' }]} />
        </SettingRow>
        <Divider />
        <SettingRow label="Exibir afastados" description="Mostrar afastados e ferias">
          <Switch checked={store.showAfastados} onChange={(_, c) => store.setShowAfastados(c)} size="small" />
        </SettingRow>
        <Divider />
        <SettingRow label="Atualizar a cada" description={store.autoRefreshSeconds >= 60 ? `${Math.floor(store.autoRefreshSeconds / 60)} min` : `${store.autoRefreshSeconds}s`}>
          <Slider value={store.autoRefreshSeconds} onChange={(_, v) => store.setAutoRefreshSeconds(v as number)} min={30} max={600} step={30} size="small" sx={{ width: 180 }} marks={[{ value: 30, label: '30s' }, { value: 300, label: '5m' }]} />
        </SettingRow>
      </Paper>

      {/* ═══ COLABORADORES VISIVEIS ═══ */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Visibility sx={{ color: 'success.main', fontSize: 20 }} />
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700 }}>Visiveis ({visibleColabs.length})</Typography>
          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', ml: 'auto' }}>
            Clique no olho para ocultar
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Autocomplete size="small" sx={{ width: 180, flexShrink: 0 }} options={departamentos} value={filterDep} onChange={(_, v) => setFilterDep(v)} renderInput={(p) => <TextField {...p} placeholder="Departamento" />} clearOnEscape />
          <TextField size="small" fullWidth placeholder="Buscar..." value={searchColab} onChange={(e) => setSearchColab(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16, color: 'text.disabled' }} /></InputAdornment> } }}
          />
        </Box>
        <Paper variant="outlined" sx={{ maxHeight: 350, overflow: 'auto', borderRadius: 1.5 }}>
          {visibleColabs.map((c) => (
            <ColabItem key={c.codparc} c={c} action="hide" onToggle={() => store.toggleHiddenCodparc(c.codparc)} />
          ))}
          {visibleColabs.length === 0 && (
            <Typography sx={{ p: 2, textAlign: 'center', color: 'text.disabled', fontSize: '0.8rem' }}>Nenhum visivel</Typography>
          )}
        </Paper>
      </Paper>

      {/* ═══ COLABORADORES OCULTOS ═══ */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'warning.light', bgcolor: (t) => alpha(t.palette.warning.main, 0.02) }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <VisibilityOff sx={{ color: 'warning.main', fontSize: 20 }} />
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'warning.dark' }}>Ocultos ({hiddenColabs.length})</Typography>
          {hiddenCount > 0 && (
            <Button size="small" onClick={() => store.setHiddenCodparcs([])} sx={{ fontSize: '0.7rem', textTransform: 'none', ml: 'auto' }}>
              Exibir todos
            </Button>
          )}
        </Box>
        {hiddenColabs.length > 0 ? (
          <Paper variant="outlined" sx={{ maxHeight: 250, overflow: 'auto', borderRadius: 1.5 }}>
            {hiddenColabs.map((c) => (
              <ColabItem key={c.codparc} c={c} action="show" onToggle={() => store.toggleHiddenCodparc(c.codparc)} />
            ))}
          </Paper>
        ) : (
          <Typography sx={{ py: 1.5, textAlign: 'center', color: 'text.disabled', fontSize: '0.8rem', fontStyle: 'italic' }}>
            Nenhum colaborador oculto neste tablet
          </Typography>
        )}
      </Paper>

      {/* Footer */}
      <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled', textAlign: 'center', py: 1 }}>
        TabMan v1.0.0 · Gigantao
      </Typography>
    </Box>
  );
}
