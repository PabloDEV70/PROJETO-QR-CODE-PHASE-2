import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Paper, TextField, Button, Typography, IconButton, Stack, Box,
  CircularProgress, alpha,
} from '@mui/material';
import {
  ArrowBack, Save, DirectionsCar, Description,
  Schedule, LinkRounded, People, Receipt,
} from '@mui/icons-material';
import { useCreateHstVei } from '@/hooks/use-hstvei';
import { VeiculoCombobox } from '@/components/situacoes/veiculo-combobox';
import { SituacaoSelect } from '@/components/situacoes/situacao-select';
import { PrioridadeSelect } from '@/components/situacoes/prioridade-select';
import { ParceiroCombobox } from '@/components/situacoes/parceiro-combobox';
import { OsManutencaoCombobox } from '@/components/situacoes/os-manutencao-combobox';
import { OsComercialCombobox } from '@/components/situacoes/os-comercial-combobox';
import { EquipeSelect } from '@/components/situacoes/equipe-select';
import type { CriarSituacaoPayload } from '@/types/hstvei-types';

function SectionHeader({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <Box sx={{
        width: 32, height: 32, borderRadius: '50%',
        bgcolor: alpha(color, 0.1),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color,
      }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: 14, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </Typography>
    </Box>
  );
}

export function NovaSituacaoPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const criar = useCreateHstVei();

  const codParam = params.get('cod') ? Number(params.get('cod')) : null;

  const [codveiculo, setCodveiculo] = useState<number | null>(codParam);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codveiculo || !idsit) return;
    const payload: CriarSituacaoPayload = {
      codveiculo,
      idsit: idsit as number,
      ...(idpri !== '' && { idpri: idpri as number }),
      ...(descricao && { descricao }),
      ...(obs && { obs }),
      ...(dtinicio && { dtinicio }),
      ...(dtprevisao && { dtprevisao }),
      ...(nuos !== '' && { nuos: nuos as number }),
      ...(numos !== '' && { numos: numos as number }),
      ...(codparc !== '' && { codparc: codparc as number }),
      ...(nunota && { nunota: Number(nunota) }),
      ...(operadores.length > 0 && { exeope: operadores.join(',') }),
      ...(mecanicos.length > 0 && { exemec: mecanicos.join(',') }),
    };
    criar.mutate(payload, { onSuccess: () => navigate('/dashboard') });
  };

  const canSubmit = !!codveiculo && !!idsit && !criar.isPending;

  return (
    <Box sx={{ flex: 1, overflow: 'auto', py: 3, px: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, maxWidth: 1400, mx: 'auto' }}>
        <IconButton onClick={() => navigate(-1)} size="small"><ArrowBack /></IconButton>
        <Typography sx={{ fontSize: 22, fontWeight: 800 }}>Nova Situacao</Typography>
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          maxWidth: 1400,
          mx: 'auto',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {/* ═══ COLUNA 1: Veiculo + Classificacao + Descricao ═══ */}
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <SectionHeader icon={<DirectionsCar sx={{ fontSize: 18 }} />} label="Veiculo" color="#2e7d32" />
            <VeiculoCombobox value={codveiculo} onChange={setCodveiculo} required />
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
              <TextField
                label="Descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                fullWidth multiline rows={3}
                inputProps={{ maxLength: 500 }}
                placeholder="O que esta acontecendo com o veiculo?"
              />
              <TextField
                label="Observacoes"
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                fullWidth multiline rows={2}
                inputProps={{ maxLength: 1000 }}
                placeholder="Notas internas..."
              />
            </Stack>
          </Paper>
        </Stack>

        {/* ═══ COLUNA 2: Datas + Vinculacoes ═══ */}
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <SectionHeader icon={<Schedule sx={{ fontSize: 18 }} />} label="Periodo" color="#6a1b9a" />
            <Stack spacing={2}>
              <TextField
                label="Data Inicio"
                type="datetime-local"
                value={dtinicio}
                onChange={(e) => setDtinicio(e.target.value)}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                helperText="Padrao: data/hora atual"
              />
              <TextField
                label="Previsao de Conclusao"
                type="datetime-local"
                value={dtprevisao}
                onChange={(e) => setDtprevisao(e.target.value)}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                helperText="Gera alertas quando vencer"
              />
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
            <SectionHeader icon={<Receipt sx={{ fontSize: 18 }} />} label="Nota / Requisicao de Compra" color="#f57f17" />
            <TextField
              label="Numero da Nota ou Requisicao (NUNOTA)"
              type="number"
              value={nunota}
              onChange={(e) => setNunota(e.target.value)}
              fullWidth
              placeholder="Ex: 123456"
              helperText="Vincula requisicao de compras ou nota fiscal do Sankhya"
            />
          </Paper>
        </Stack>

        {/* ═══ COLUNA 3: Equipe + Acoes ═══ */}
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <SectionHeader icon={<People sx={{ fontSize: 18 }} />} label="Operadores" color="#e65100" />
            <EquipeSelect
              label="Operadores"
              value={operadores}
              onChange={setOperadores}
              placeholder="Buscar operador por nome..."
            />
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <SectionHeader icon={<People sx={{ fontSize: 18 }} />} label="Mecanicos" color="#ff9800" />
            <EquipeSelect
              label="Mecanicos"
              value={mecanicos}
              onChange={setMecanicos}
              placeholder="Buscar mecanico por nome..."
            />
          </Paper>

          {/* Acoes */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Stack spacing={1.5}>
              <Button
                type="submit"
                variant="contained"
                disabled={!canSubmit}
                size="large"
                fullWidth
                startIcon={criar.isPending ? <CircularProgress size={18} color="inherit" /> : <Save />}
                sx={{ py: 1.5, fontWeight: 700, fontSize: 15 }}
              >
                {criar.isPending ? 'Salvando...' : 'Criar Situacao'}
              </Button>
              <Button onClick={() => navigate(-1)} disabled={criar.isPending} size="large" fullWidth>
                Cancelar
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
}
