import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Avatar, Box, Button, IconButton, Paper, TextField, Typography,
  InputAdornment, List, ListItemButton, ListItemAvatar, ListItemText, alpha,
} from '@mui/material';
import { ArrowBack, Search, CheckCircle } from '@mui/icons-material';
import { format } from 'date-fns';
import { PlacaVeiculo } from '@/components/shared/placa-veiculo';
import { VeiculoCombobox } from '@/components/shared/veiculo-combobox';
import { useColaboradores } from '@/hooks/use-colaboradores';
import { useMinhasOs } from '@/hooks/use-minhas-os';
import { ServicePicker } from '@/components/apontamento/service-picker';
import { getOsStatusColor } from '@/utils/os-status-colors';
import { getFotoUrl } from '@/api/funcionarios';
import { fetchRdoDia, createRdo } from '@/api/rdo';
import { useSessionStore } from '@/stores/session-store';
import { useNotificationStore } from '@/stores/notification-store';
import type { OsListItem, OsServiceItem } from '@/types/os-types';

export function NovoRdoPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const hoje = format(new Date(), 'yyyy-MM-dd');
  const addToast = useNotificationStore((s) => s.addToast);
  const startSession = useSessionStore((s) => s.startSession);

  // Step 1: Data
  const [dtref, setDtref] = useState(sp.get('data') || hoje);

  // Step 2: Colaborador
  const [searchColab, setSearchColab] = useState('');
  const [selectedColab, setSelectedColab] = useState<{ codparc: number; nome: string } | null>(null);
  const { allColaboradores, isLoading: colabLoading } = useColaboradores();

  const filteredColabs = useMemo(() => {
    if (!allColaboradores || !searchColab.trim()) return allColaboradores?.slice(0, 20) ?? [];
    const q = searchColab.trim().toLowerCase();
    const isNum = /^\d+$/.test(q);
    return allColaboradores.filter((c) =>
      isNum ? String(c.codparc).startsWith(q) : c.nomeparc.toLowerCase().includes(q),
    ).slice(0, 20);
  }, [allColaboradores, searchColab]);

  // Step 3: OS (optional)
  const { data: osList } = useMinhasOs(selectedColab?.codparc ?? 0);
  const [selectedOs, setSelectedOs] = useState<OsListItem | null>(null);
  const [selectedServico, setSelectedServico] = useState<OsServiceItem | null>(null);
  const [manualOs, setManualOs] = useState('');

  // Step 3b: Veiculo direto (optional, sem OS)
  const [selectedVeiculo, setSelectedVeiculo] = useState<{ codveiculo: number; placa: string } | null>(null);

  // Submit
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedColab) return;
    setSubmitting(true);
    try {
      // Check if RDO exists
      const existing = await fetchRdoDia(selectedColab.codparc, dtref);
      let codrdo: number;
      if (existing.data?.length > 0) {
        codrdo = existing.data[0].CODRDO;
        addToast('success', `RDO ${codrdo} ja existe — abrindo`);
      } else {
        const result = await createRdo(selectedColab.codparc, dtref);
        codrdo = result.dadosInseridos?.CODRDO ?? result.codrdo;
        addToast('success', `RDO ${codrdo} criado`);
      }

      startSession(selectedColab.codparc, selectedColab.nome);
      const dateParam = dtref === hoje ? '' : `?data=${dtref}`;
      navigate(`/apontar/${selectedColab.codparc}${dateParam}`, { replace: true });
    } catch (err) {
      addToast('error', 'Erro ao criar RDO');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !!selectedColab && !!dtref && !submitting;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} size="small"><ArrowBack sx={{ fontSize: 18 }} /></IconButton>
        <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>Novo Apontamento</Typography>
      </Box>

      {/* ═══ STEP 1: Data ═══ */}
      <Paper sx={{ p: 2, mb: 1.5, borderRadius: 2 }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#2e7d32', mb: 1 }}>
          1. Data de referencia
        </Typography>
        <TextField
          type="date" value={dtref} fullWidth size="small"
          onChange={(e) => setDtref(e.target.value)}
          inputProps={{ max: hoje }}
          sx={{ '& .MuiOutlinedInput-root': { fontSize: '1rem', fontFamily: '"JetBrains Mono", monospace' } }}
        />
        {dtref !== hoje && (
          <Typography sx={{ fontSize: '0.7rem', color: '#e65100', mt: 0.5 }}>
            {new Date(dtref + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </Typography>
        )}
      </Paper>

      {/* ═══ STEP 2: Colaborador ═══ */}
      <Paper sx={{ p: 2, mb: 1.5, borderRadius: 2 }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#2e7d32', mb: 1 }}>
          2. Colaborador
        </Typography>

        {selectedColab ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, bgcolor: '#e8f5e9', borderRadius: 2 }}>
            <Avatar src={getFotoUrl(selectedColab.codparc)} sx={{ width: 48, height: 48, bgcolor: '#2e7d32' }}>
              {selectedColab.nome.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>{selectedColab.nome}</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', fontFamily: 'monospace' }}>#{selectedColab.codparc}</Typography>
            </Box>
            <CheckCircle sx={{ color: '#2e7d32' }} />
            <Button size="small" onClick={() => { setSelectedColab(null); setSelectedOs(null); setSelectedServico(null); }}>
              Trocar
            </Button>
          </Box>
        ) : (
          <>
            <TextField
              value={searchColab} onChange={(e) => setSearchColab(e.target.value)}
              placeholder="Nome, codparc ou CPF..." fullWidth size="small" autoFocus
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18 }} /></InputAdornment> } }}
              sx={{ mb: 1 }}
            />
            <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
              {filteredColabs.map((c) => (
                <ListItemButton
                  key={c.codparc}
                  onClick={() => { setSelectedColab({ codparc: c.codparc, nome: c.nomeparc }); setSearchColab(''); }}
                  sx={{ borderRadius: 1, mb: 0.5, '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.04) } }}
                >
                  <ListItemAvatar sx={{ minWidth: 48 }}>
                    <Avatar src={c.temFoto ? getFotoUrl(c.codparc) : undefined} sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontSize: '0.9rem' }}>
                      {c.nomeparc.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.nomeparc}</Typography>}
                    secondary={
                      <Typography component="span" sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
                        #{c.codparc} · {[c.cargo, c.departamento].filter(Boolean).join(' · ')}
                      </Typography>
                    }
                  />
                </ListItemButton>
              ))}
              {!colabLoading && filteredColabs.length === 0 && searchColab.trim() && (
                <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled', textAlign: 'center', py: 2 }}>Nenhum encontrado</Typography>
              )}
            </List>
          </>
        )}
      </Paper>

      {/* ═══ STEP 3: OS + Servico (optional) ═══ */}
      {selectedColab && (
        <Paper sx={{ p: 2, mb: 1.5, borderRadius: 2 }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1565c0', mb: 1 }}>
            3. Ordem de Servico <Typography component="span" sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>(opcional)</Typography>
          </Typography>

          {/* OS list from colaborador */}
          {osList && osList.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', mb: 0.5 }}>OS atribuidas:</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {osList.map((os) => {
                  const osc = getOsStatusColor(os.STATUS);
                  const sel = selectedOs?.NUOS === os.NUOS;
                  return (
                    <Box key={os.NUOS} onClick={() => { setSelectedOs(sel ? null : os); setSelectedServico(null); }}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 1.5, cursor: 'pointer',
                        border: '1.5px solid', borderColor: sel ? '#1565c0' : 'divider',
                        bgcolor: sel ? alpha('#1565c0', 0.04) : 'transparent',
                        '&:hover': { bgcolor: alpha('#1565c0', 0.02) },
                      }}
                    >
                      {os.placa && <PlacaVeiculo placa={os.placa} label={os.tagVeiculo || 'VEI'} scale={0.4} />}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>OS {os.NUOS}</Typography>
                        {os.marcaModelo && <Typography sx={{ fontSize: '0.62rem', color: 'text.secondary' }} noWrap>{os.marcaModelo}</Typography>}
                      </Box>
                      <Box sx={{ px: 0.5, py: 0.15, borderRadius: 0.5, bgcolor: osc.bg, color: osc.text }}>
                        <Typography sx={{ fontSize: '0.55rem', fontWeight: 700 }}>{osc.label}</Typography>
                      </Box>
                      {sel && <CheckCircle sx={{ fontSize: 18, color: '#1565c0' }} />}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Manual OS input */}
          <TextField
            value={manualOs} onChange={(e) => setManualOs(e.target.value.replace(/\D/g, ''))}
            placeholder="Ou digite numero da OS..." fullWidth size="small"
            sx={{ mb: 1, '& .MuiOutlinedInput-root': { fontSize: '0.85rem' } }}
          />

          {/* Service picker for selected OS */}
          {selectedOs && (
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, mb: 0.5 }}>Servicos da OS {selectedOs.NUOS}:</Typography>
              <ServicePicker
                nuos={selectedOs.NUOS}
                selectedSequencia={selectedServico?.SEQUENCIA ?? null}
                onSelect={setSelectedServico}
              />
            </Box>
          )}
        </Paper>
      )}

      {/* ═══ STEP 3b: Veiculo direto (optional) ═══ */}
      {selectedColab && !selectedOs && !manualOs && (
        <Paper sx={{ p: 2, mb: 1.5, borderRadius: 2 }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1565c0', mb: 1 }}>
            Veiculo <Typography component="span" sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>(opcional, sem OS)</Typography>
          </Typography>
          <VeiculoCombobox
            value={selectedVeiculo?.placa ?? null}
            onChange={(_placa, veiculo) => setSelectedVeiculo(veiculo ? { codveiculo: veiculo.codveiculo, placa: veiculo.placa } : null)}
            placeholder="Buscar por placa..."
          />
        </Paper>
      )}

      {/* ═══ SUBMIT ═══ */}
      {selectedColab && (
        <Button
          variant="contained" fullWidth size="large"
          onClick={handleSubmit} disabled={!canSubmit}
          sx={{
            bgcolor: '#2e7d32', fontWeight: 700, fontSize: '1rem', py: 1.5, borderRadius: 2,
            '&:hover': { bgcolor: '#1b5e20' },
          }}
        >
          {submitting ? 'Criando...' : `Criar RDO para ${selectedColab.nome.split(' ')[0]}`}
        </Button>
      )}
    </Box>
  );
}
