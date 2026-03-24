import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Paper, TextField, Button, Typography, IconButton, Stack, Box,
  CircularProgress, alpha,
} from '@mui/material';
import {
  ArrowBack, Save, DirectionsCar, Description,
  Schedule, LinkRounded, People, Receipt,
} from '@mui/icons-material';
import { useHstVeiDetail, useUpdateHstVei } from '@/hooks/use-hstvei';
import { SituacaoSelect } from '@/components/situacoes/situacao-select';
import { PrioridadeSelect } from '@/components/situacoes/prioridade-select';
import { ParceiroCombobox } from '@/components/situacoes/parceiro-combobox';
import { OsManutencaoCombobox } from '@/components/situacoes/os-manutencao-combobox';
import { OsComercialCombobox } from '@/components/situacoes/os-comercial-combobox';
import { EquipeSelect } from '@/components/situacoes/equipe-select';
import type { AtualizarSituacaoPayload } from '@/types/hstvei-types';

function SectionHeader({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <Box sx={{
        width: 32, height: 32, borderRadius: '50%',
        bgcolor: alpha(color, 0.1),
        display: 'flex', alignItems: 'center', justifyContent: 'center', color,
      }}>{icon}</Box>
      <Typography sx={{ fontSize: 14, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Typography>
    </Box>
  );
}

function safeDateLocal(val: unknown): string {
  if (!val || typeof val !== 'string') return '';
  // "2026-03-23 08:00:00" → "2026-03-23T08:00"
  return val.replace(' ', 'T').slice(0, 16);
}

export function SituacaoEditPage() {
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);
  const navigate = useNavigate();
  const { data: detail, isLoading } = useHstVeiDetail(numId);
  const update = useUpdateHstVei();

  const [idsit, setIdsit] = useState<number | ''>('');
  const [idpri, setIdpri] = useState<number | ''>('');
  const [descricao, setDescricao] = useState('');
  const [obs, setObs] = useState('');
  const [dtinicio, setDtinicio] = useState('');
  const [dtprevisao, setDtprevisao] = useState('');
  const [codparc, setCodparc] = useState<number | ''>('');
  const [nuos, setNuos] = useState<number | ''>('');
  const [numos, setNumos] = useState<number | ''>('');
  const [nunota, setNunota] = useState('');
  const [operadores, setOperadores] = useState<number[]>([]);
  const [mecanicos, setMecanicos] = useState<number[]>([]);

  // Populate from detail
  useEffect(() => {
    if (!detail) return;
    setIdsit(detail.IDSIT ?? '');
    setIdpri(detail.IDPRI ?? '');
    setDescricao(detail.DESCRICAO ?? '');
    setObs(detail.OBS ?? '');
    setDtinicio(safeDateLocal(detail.DTINICIO));
    setDtprevisao(safeDateLocal(detail.DTPREVISAO));
    setCodparc(detail.CODPARC ?? '');
    setNuos(detail.NUOS ?? '');
    setNumos(detail.NUMOS ?? '');
    setNunota(detail.NUNOTA ? String(detail.NUNOTA) : '');
    setOperadores(detail.EXEOPE ? detail.EXEOPE.split(',').map(Number).filter(Boolean) : []);
    setMecanicos(detail.EXEMEC ? detail.EXEMEC.split(',').map(Number).filter(Boolean) : []);
  }, [detail]);

  if (isLoading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (!detail) return <Typography sx={{ p: 4 }}>Situacao #{id} nao encontrada.</Typography>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idsit) return;
    const payload: AtualizarSituacaoPayload = {
      idsit: idsit as number,
      ...(idpri !== '' ? { idpri: idpri as number } : { idpri: null }),
      descricao: descricao || null,
      obs: obs || null,
      dtinicio: dtinicio || null,
      dtprevisao: dtprevisao || null,
      ...(nuos !== '' ? { nuos: nuos as number } : { nuos: null }),
      ...(numos !== '' ? { numos: numos as number } : { numos: null }),
      ...(codparc !== '' ? { codparc: codparc as number } : { codparc: null }),
      ...(nunota ? { nunota: Number(nunota) } : { nunota: null }),
      exeope: operadores.length > 0 ? operadores.join(',') : null,
      exemec: mecanicos.length > 0 ? mecanicos.join(',') : null,
    };
    update.mutate({ id: numId, payload }, { onSuccess: () => navigate(`/situacao/${numId}`) });
  };

  return (
    <Box sx={{ flex: 1, overflow: 'auto', py: 3, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, maxWidth: 1400, mx: 'auto' }}>
        <IconButton onClick={() => navigate(-1)} size="small"><ArrowBack /></IconButton>
        <Typography sx={{ fontSize: 22, fontWeight: 800 }}>
          Editar Situacao #{detail.ID}
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
          {detail.placa} {detail.veiculoTag && `(${detail.veiculoTag})`}
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          maxWidth: 1400, mx: 'auto',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
          gap: 2, alignItems: 'start',
        }}
      >
        {/* COLUNA 1 */}
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <SectionHeader icon={<DirectionsCar sx={{ fontSize: 18 }} />} label="Veiculo" color="#2e7d32" />
            <Typography sx={{ fontSize: 18, fontWeight: 800, fontFamily: 'monospace' }}>
              {detail.placa} {detail.veiculoTag && <Typography component="span" sx={{ color: 'primary.main', fontWeight: 700 }}> ({detail.veiculoTag})</Typography>}
            </Typography>
            <Typography variant="body2" color="text.secondary">{detail.marcaModelo}</Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <SectionHeader icon={<Description sx={{ fontSize: 18 }} />} label="Classificacao" color="#1565c0" />
            <Stack spacing={2}>
              <SituacaoSelect value={idsit} onChange={setIdsit} required />
              <PrioridadeSelect value={idpri} onChange={setIdpri} />
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <SectionHeader icon={<Description sx={{ fontSize: 18 }} />} label="Descricao" color="#1565c0" />
            <Stack spacing={2}>
              <TextField label="Descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)}
                fullWidth multiline rows={3} inputProps={{ maxLength: 500 }} />
              <TextField label="Observacoes" value={obs} onChange={(e) => setObs(e.target.value)}
                fullWidth multiline rows={2} inputProps={{ maxLength: 1000 }} />
            </Stack>
          </Paper>
        </Stack>

        {/* COLUNA 2 */}
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <SectionHeader icon={<Schedule sx={{ fontSize: 18 }} />} label="Periodo" color="#6a1b9a" />
            <Stack spacing={2}>
              <TextField label="Data Inicio" type="datetime-local" value={dtinicio}
                onChange={(e) => setDtinicio(e.target.value)} fullWidth
                slotProps={{ inputLabel: { shrink: true } }} />
              <TextField label="Previsao de Conclusao" type="datetime-local" value={dtprevisao}
                onChange={(e) => setDtprevisao(e.target.value)} fullWidth
                slotProps={{ inputLabel: { shrink: true } }} />
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <SectionHeader icon={<LinkRounded sx={{ fontSize: 18 }} />} label="Vinculacoes" color="#00838f" />
            <Stack spacing={2}>
              <ParceiroCombobox value={codparc} onChange={setCodparc} />
              <OsManutencaoCombobox value={nuos} onChange={setNuos} />
              <OsComercialCombobox value={numos} onChange={setNumos} />
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <SectionHeader icon={<Receipt sx={{ fontSize: 18 }} />} label="Nota / Requisicao" color="#f57f17" />
            <TextField label="NUNOTA" type="number" value={nunota}
              onChange={(e) => setNunota(e.target.value)} fullWidth placeholder="Numero da nota" />
          </Paper>
        </Stack>

        {/* COLUNA 3 */}
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <SectionHeader icon={<People sx={{ fontSize: 18 }} />} label="Operadores" color="#e65100" />
            <EquipeSelect label="Operadores" value={operadores} onChange={setOperadores} placeholder="Buscar operador..." />
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <SectionHeader icon={<People sx={{ fontSize: 18 }} />} label="Mecanicos" color="#ff9800" />
            <EquipeSelect label="Mecanicos" value={mecanicos} onChange={setMecanicos} placeholder="Buscar mecanico..." />
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Stack spacing={1.5}>
              <Button type="submit" variant="contained" disabled={!idsit || update.isPending}
                size="large" fullWidth
                startIcon={update.isPending ? <CircularProgress size={18} color="inherit" /> : <Save />}
                sx={{ py: 1.5, fontWeight: 700, fontSize: 15 }}>
                {update.isPending ? 'Salvando...' : 'Salvar Alteracoes'}
              </Button>
              <Button onClick={() => navigate(-1)} disabled={update.isPending} size="large" fullWidth>
                Cancelar
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
}
