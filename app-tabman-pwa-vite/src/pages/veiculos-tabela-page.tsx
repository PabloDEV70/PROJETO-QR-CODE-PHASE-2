import { useState, useMemo } from 'react';
import {
  Box, Typography, Paper, TextField, InputAdornment, IconButton, Fab,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, alpha,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  ToggleButtonGroup, ToggleButton, Avatar, AvatarGroup,
} from '@mui/material';
import { Search, ArrowBack, Add, Edit, Delete, FiberManualRecord, LocationOn, Close, ViewModule, TableChart, ViewList } from '@mui/icons-material';
import { PlacaVeiculo } from '@/components/shared/placa-veiculo';
import { ColaboradorCombobox } from '@/components/shared/colaborador-combobox';
import { ParceiroCombobox } from '@/components/shared/parceiro-combobox';
import { VeiculoCombobox } from '@/components/shared/veiculo-combobox';
import { getFotoUrl } from '@/api/funcionarios';
import { usePainelSaidas, type PainelEntry, type Operador } from '@/hooks/use-painel-saidas';
import { useNavigate, useSearchParams } from 'react-router-dom';

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  FIXO: { bg: '#2e7d32', color: '#fff', label: 'Fixo' },
  PARADA: { bg: '#9e9e9e', color: '#fff', label: 'Parada' },
  MANUTENCAO: { bg: '#d32f2f', color: '#fff', label: 'Manutencao' },
  PROGRAMADO: { bg: '#1565c0', color: '#fff', label: 'Programado' },
  DISPONIVEL: { bg: '#f9a825', color: '#1a1a1a', label: 'Disponivel' },
};
function getStatus(s: string) { return STATUS_COLORS[s] ?? STATUS_COLORS.FIXO!; }
function StatusPill({ status }: { status: string }) {
  const st = getStatus(status);
  return <Box sx={{ px: 0.6, py: 0.15, borderRadius: 0.5, bgcolor: st.bg, color: st.color, display: 'inline-flex' }}><Typography sx={{ fontSize: '0.5rem', fontWeight: 700 }}>{st.label}</Typography></Box>;
}

/** Avatar row for operators */
function OperadoresDisplay({ ops, size = 30 }: { ops: Operador[]; size?: number }) {
  if (ops.length === 0) return <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>Sem operador</Typography>;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: size, height: size, fontSize: `${size * 0.35}px`, fontWeight: 700, border: '2px solid #fff' } }}>
        {ops.map((o, i) => (
          <Avatar key={o.codparc || i} src={o.codparc > 0 ? getFotoUrl(o.codparc) : undefined} alt={o.nome} sx={{ bgcolor: 'primary.main' }}>
            {o.nome.charAt(0)}
          </Avatar>
        ))}
      </AvatarGroup>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        {ops.map((o, i) => (
          <Box key={o.codparc || i} sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4 }}>
            {o.nomeusu && (
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: 'primary.main', lineHeight: 1.3 }}>
                {o.nomeusu}
              </Typography>
            )}
            <Typography sx={{ fontSize: o.nomeusu ? '0.52rem' : '0.66rem', fontWeight: o.nomeusu ? 500 : 700, lineHeight: 1.3, color: o.nomeusu ? 'text.secondary' : 'text.primary' }} noWrap>
              {o.nome}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

type FormData = Omit<PainelEntry, 'id' | 'updatedAt' | 'updatedBy'>;
const EMPTY_FORM: FormData = { modelo: '', tag: '', placa: '', specs: '', operadores: [], contratante: '', local: '', previsao: '', status: 'FIXO' };
type ViewMode = 'cards' | 'table' | 'compact';

export function VeiculosTabelaPage() {
  const navigate = useNavigate();
  const { entries, connected, addEntry, updateEntry, removeEntry } = usePainelSaidas();
  const [sp, setSp] = useSearchParams();
  const search = sp.get('q') ?? '';
  const view = (sp.get('view') as ViewMode) || 'cards';
  const setSearch = (v: string) => { const n = new URLSearchParams(sp); if (v) n.set('q', v); else n.delete('q'); setSp(n, { replace: true }); };
  const setView = (v: ViewMode) => { const n = new URLSearchParams(sp); n.set('view', v); setSp(n, { replace: true }); };
  const [editEntry, setEditEntry] = useState<PainelEntry | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);

  const filtered = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter((e) =>
      e.placa.toLowerCase().includes(q) || e.operadores.some((o) => o.nome.toLowerCase().includes(q)) ||
      e.contratante.toLowerCase().includes(q) || e.tag.toLowerCase().includes(q) ||
      e.local.toLowerCase().includes(q) || e.modelo.toLowerCase().includes(q),
    );
  }, [entries, search]);

  const handleSaveAdd = async () => { if (!form.placa.trim()) return; await addEntry(form); setForm(EMPTY_FORM); setShowAdd(false); };
  const handleSaveEdit = async () => { if (!editEntry) return; await updateEntry(editEntry.id, form); setEditEntry(null); };
  const handleDelete = async (id: string) => { await removeEntry(id); };
  const openEdit = (e: PainelEntry) => {
    const ops = Array.isArray(e.operadores) ? e.operadores : [];
    setForm({ modelo: e.modelo, tag: e.tag, placa: e.placa, specs: e.specs, operadores: ops, contratante: e.contratante, local: e.local, previsao: e.previsao, status: e.status });
    setEditEntry(e);
  };

  return (
    <Box sx={{ pb: 8 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <IconButton onClick={() => navigate(-1)} size="small"><ArrowBack sx={{ fontSize: 18 }} /></IconButton>
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#2e7d32' }}>PAINEL DE SAIDAS</Typography>
        <FiberManualRecord sx={{ fontSize: 8, color: connected ? '#2e7d32' : '#d32f2f' }} />
        <Typography sx={{ fontSize: '0.5rem', color: connected ? 'success.main' : 'error.main' }}>{connected ? 'LIVE' : 'OFF'}</Typography>
        <Box sx={{ flex: 1 }} />
        <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && setView(v)} size="small" sx={{ '& .MuiToggleButton-root': { px: 0.75, py: 0.25 } }}>
          <ToggleButton value="cards"><ViewModule sx={{ fontSize: 16 }} /></ToggleButton>
          <ToggleButton value="table"><TableChart sx={{ fontSize: 16 }} /></ToggleButton>
          <ToggleButton value="compact"><ViewList sx={{ fontSize: 16 }} /></ToggleButton>
        </ToggleButtonGroup>
        <TextField value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." size="small"
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16 }} /></InputAdornment> } }}
          sx={{ width: 200, '& .MuiOutlinedInput-root': { height: 30, fontSize: '0.72rem' } }}
        />
        <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled' }}>{filtered.length}</Typography>
      </Box>

      {/* CARDS */}
      {view === 'cards' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 1 }}>
          {filtered.map((e) => {
            const st = getStatus(e.status);
            return (
              <Paper key={e.id} elevation={0} sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 1, border: '1.5px solid', borderColor: st.bg, opacity: e.status === 'PARADA' ? 0.55 : 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: alpha(st.bg, 0.04) }}>
                  <PlacaVeiculo placa={e.placa} label={e.tag || 'VEI'} scale={0.5} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700 }} noWrap>{e.modelo}</Typography>
                    <Typography sx={{ fontSize: '0.48rem', color: 'text.disabled' }} noWrap>{e.specs}</Typography>
                  </Box>
                  <IconButton size="small" onClick={() => openEdit(e)} sx={{ width: 24, height: 24 }}><Edit sx={{ fontSize: 14 }} /></IconButton>
                </Box>
                <Box sx={{ p: 1, pt: 0.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                  <OperadoresDisplay ops={(e.operadores ?? [])} />
                  <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: 'primary.main' }} noWrap>{e.contratante}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <LocationOn sx={{ fontSize: 10, color: 'text.disabled' }} />
                    <Typography sx={{ fontSize: '0.58rem', color: 'text.secondary' }} noWrap>{e.local}</Typography>
                  </Box>
                  {e.previsao && <Typography sx={{ fontSize: '0.52rem', color: 'text.disabled' }}>{e.previsao}</Typography>}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, py: 0.4, bgcolor: st.bg }}>
                  <Typography sx={{ fontSize: '0.54rem', fontWeight: 700, color: st.color }}>{st.label}</Typography>
                  {e.updatedBy && <Typography sx={{ fontSize: '0.42rem', color: alpha(st.color, 0.7) }}>{e.updatedBy} · {new Date(e.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Typography>}
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* TABLE */}
      {view === 'table' && (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Table size="small" sx={{ '& td, & th': { fontSize: '0.68rem', py: 0.5, px: 1 } }}>
            <TableHead><TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 700 }}>Placa</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Operadores</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Contratante</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Local</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Previsao</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell />
            </TableRow></TableHead>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id} sx={{ opacity: e.status === 'PARADA' ? 0.5 : 1, '&:hover': { bgcolor: alpha(getStatus(e.status).bg, 0.04) } }}>
                  <TableCell>
                    <PlacaVeiculo placa={e.placa} label={e.tag || 'VEI'} scale={0.35} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 22, height: 22, fontSize: '0.55rem', fontWeight: 700 } }}>
                        {((e.operadores ?? [])).map((o) => <Avatar key={o.codparc} src={o.codparc > 0 ? getFotoUrl(o.codparc) : undefined} sx={{ bgcolor: 'primary.main' }}>{o.nome.charAt(0)}</Avatar>)}
                      </AvatarGroup>
                      <Typography sx={{ fontSize: '0.62rem' }} noWrap>{((e.operadores ?? [])).map((o) => o.nome.split(' ')[0]).join(', ')}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'primary.main' }}>{e.contratante}</TableCell>
                  <TableCell>{e.local}</TableCell>
                  <TableCell>{e.previsao}</TableCell>
                  <TableCell><StatusPill status={e.status} /></TableCell>
                  <TableCell><IconButton size="small" onClick={() => openEdit(e)} sx={{ width: 22, height: 22 }}><Edit sx={{ fontSize: 12 }} /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* COMPACT */}
      {view === 'compact' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {filtered.map((e) => (
            <Paper key={e.id} elevation={0} onClick={() => openEdit(e)} sx={{
              display: 'flex', alignItems: 'center', gap: 1, px: 1.25, py: 0.75,
              borderRadius: 1, border: '1px solid', borderColor: 'divider',
              opacity: e.status === 'PARADA' ? 0.5 : 1, cursor: 'pointer', '&:hover': { bgcolor: alpha(getStatus(e.status).bg, 0.04) },
            }}>
              <PlacaVeiculo placa={e.placa} label={e.tag || 'VEI'} scale={0.38} />
              <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.55rem', fontWeight: 700 } }}>
                {((e.operadores ?? [])).map((o) => <Avatar key={o.codparc} src={o.codparc > 0 ? getFotoUrl(o.codparc) : undefined} sx={{ bgcolor: 'primary.main' }}>{o.nome.charAt(0)}</Avatar>)}
              </AvatarGroup>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, width: 120 }} noWrap>{((e.operadores ?? [])).map((o) => o.nome.split(' ')[0]).join(', ') || '—'}</Typography>
              <Typography sx={{ fontSize: '0.62rem', color: 'primary.main', fontWeight: 600, width: 100 }} noWrap>{e.contratante}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, flex: 1, minWidth: 0 }}>
                <LocationOn sx={{ fontSize: 10, color: 'text.disabled' }} />
                <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary' }} noWrap>{e.local}</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.55rem', color: 'text.disabled', width: 90, textAlign: 'right' }} noWrap>{e.previsao}</Typography>
              <StatusPill status={e.status} />
            </Paper>
          ))}
        </Box>
      )}

      {entries.length === 0 && <Box sx={{ textAlign: 'center', py: 8 }}><Typography sx={{ fontSize: '0.85rem', color: 'text.disabled', mb: 1 }}>Nenhum veiculo no painel</Typography><Button variant="outlined" size="small" onClick={() => setShowAdd(true)}>Adicionar primeiro</Button></Box>}

      <Fab color="primary" size="medium" onClick={() => { setForm(EMPTY_FORM); setShowAdd(true); }} sx={{ position: 'fixed', bottom: 16, right: 16 }}><Add /></Fab>

      <EntryDialog
        open={showAdd || !!editEntry} title={editEntry ? 'Editar' : 'Adicionar'}
        form={form} onChange={setForm}
        onSave={editEntry ? handleSaveEdit : handleSaveAdd}
        onDelete={editEntry ? () => { handleDelete(editEntry.id); setEditEntry(null); } : undefined}
        onClose={() => { setShowAdd(false); setEditEntry(null); }}
      />
    </Box>
  );
}

/* ── Form Dialog ── */
function EntryDialog({ open, title, form, onChange, onSave, onDelete, onClose }: {
  open: boolean; title: string; form: FormData;
  onChange: (f: FormData) => void; onSave: () => void; onDelete?: () => void; onClose: () => void;
}) {
  const set = (key: string, val: unknown) => onChange({ ...form, [key]: val });

  const ops = form.operadores ?? [];

  const addOperador = (codparc: number | null, nome?: string, nomeusu?: string) => {
    if (!codparc || !nome) return;
    if (ops.some((o) => o.codparc === codparc)) return;
    set('operadores', [...ops, { codparc, nome, nomeusu: nomeusu ?? '' }]);
  };

  const removeOperador = (codparc: number) => {
    set('operadores', ops.filter((o) => o.codparc !== codparc));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700 }}>
        {title} veiculo
        <IconButton size="small" onClick={onClose}><Close sx={{ fontSize: 18 }} /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: '16px !important' }}>
        {/* Veiculo */}
        <VeiculoCombobox
          value={form.placa || null}
          onChange={(placa, veiculo) => {
            if (veiculo) onChange({ ...form, placa: veiculo.placa, tag: veiculo.tag ?? '', modelo: veiculo.marcamodelo ?? '' });
            else set('placa', placa ?? '');
          }}
          label="Veiculo (placa)"
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField label="Tag" value={form.tag} onChange={(e) => set('tag', e.target.value)} size="small" sx={{ flex: 1 }} />
          <TextField label="Modelo" value={form.modelo} onChange={(e) => set('modelo', e.target.value)} size="small" sx={{ flex: 2 }} />
        </Box>
        <TextField label="Specs / Equipamentos" value={form.specs} onChange={(e) => set('specs', e.target.value)} size="small" fullWidth />

        {/* Operadores — multi-add with chips */}
        <Box>
          <ColaboradorCombobox value={null} onChange={addOperador} label="Adicionar operador" placeholder="Buscar colaborador..." />
          {ops.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
              {ops.map((o) => (
                <Chip
                  key={o.codparc}
                  avatar={<Avatar src={o.codparc > 0 ? getFotoUrl(o.codparc) : undefined} sx={{ width: 24, height: 24 }}>{o.nome.charAt(0)}</Avatar>}
                  label={o.nomeusu ? `${o.nomeusu} — ${o.nome}` : o.nome}
                  onDelete={() => removeOperador(o.codparc)}
                  size="small"
                  sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Contratante */}
        <ParceiroCombobox value={null} onChange={(_cp, nome) => { if (nome) set('contratante', nome); }} label="Contratante (cliente)" />
        {form.contratante && (
          <Chip label={form.contratante} size="small" onDelete={() => set('contratante', '')} sx={{ fontWeight: 600, fontSize: '0.68rem', mt: -1, alignSelf: 'flex-start' }} />
        )}

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField label="Local do Servico" value={form.local} onChange={(e) => set('local', e.target.value)} size="small" sx={{ flex: 1 }} />
          <TextField label="Previsao" value={form.previsao} onChange={(e) => set('previsao', e.target.value)} size="small" sx={{ flex: 1 }} />
        </Box>

        <Box>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, mb: 0.5 }}>Status</Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {Object.entries(STATUS_COLORS).map(([key, val]) => (
              <Chip key={key} label={val.label} size="small"
                variant={form.status === key ? 'filled' : 'outlined'}
                onClick={() => set('status', key)}
                sx={{ fontWeight: 600, fontSize: '0.68rem', bgcolor: form.status === key ? val.bg : 'transparent', color: form.status === key ? val.color : val.bg, borderColor: val.bg }}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        {onDelete && <Button onClick={onDelete} color="error" size="small" startIcon={<Delete sx={{ fontSize: 16 }} />} sx={{ mr: 'auto' }}>Remover</Button>}
        <Button onClick={onClose} variant="outlined" size="small">Cancelar</Button>
        <Button onClick={onSave} variant="contained" size="small" color="success">Salvar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default VeiculosTabelaPage;
