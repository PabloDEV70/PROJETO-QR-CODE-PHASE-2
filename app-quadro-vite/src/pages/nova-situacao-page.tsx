import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Paper, TextField, Button, Typography, IconButton, Stack, Box,
  CircularProgress, Divider,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useCreateHstVei } from '@/hooks/use-hstvei';
import { VeiculoCombobox } from '@/components/situacoes/veiculo-combobox';
import { SituacaoSelect } from '@/components/situacoes/situacao-select';
import { PrioridadeSelect } from '@/components/situacoes/prioridade-select';
import type { CriarSituacaoPayload } from '@/types/hstvei-types';

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
  const [codparc, setCodparc] = useState('');
  const [nuos, setNuos] = useState('');
  const [numos, setNumos] = useState('');
  const [exeope, setExeope] = useState('');
  const [exemec, setExemec] = useState('');

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
      ...(nuos && { nuos: Number(nuos) }),
      ...(numos && { numos: Number(numos) }),
      ...(codparc && { codparc: Number(codparc) }),
      ...(exeope.trim() && { exeope: exeope.trim() }),
      ...(exemec.trim() && { exemec: exemec.trim() }),
    };
    criar.mutate(payload, { onSuccess: () => navigate('/dashboard') });
  };

  const canSubmit = !!codveiculo && !!idsit && !criar.isPending;

  return (
    <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', py: 4, px: 2 }}>
      <Paper variant="outlined" sx={{ maxWidth: 720, width: '100%', overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton onClick={() => navigate(-1)} size="small"><ArrowBack /></IconButton>
          <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Nova Situacao</Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Veiculo */}
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', mb: 1 }}>
                Veiculo
              </Typography>
              <VeiculoCombobox value={codveiculo} onChange={setCodveiculo} required />
            </Box>

            <Divider />

            {/* Situacao + Prioridade */}
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', mb: 1 }}>
                Classificacao
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <SituacaoSelect value={idsit} onChange={setIdsit} required />
                <PrioridadeSelect value={idpri} onChange={setIdpri} />
              </Box>
            </Box>

            <Divider />

            {/* Descricao + Obs */}
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', mb: 1 }}>
                Detalhes
              </Typography>
              <Stack spacing={2}>
                <TextField label="Descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)}
                  fullWidth size="small" multiline rows={2} inputProps={{ maxLength: 100 }} />
                <TextField label="Observacoes" value={obs} onChange={(e) => setObs(e.target.value)}
                  fullWidth size="small" multiline rows={2} inputProps={{ maxLength: 100 }} />
              </Stack>
            </Box>

            <Divider />

            {/* Datas */}
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', mb: 1 }}>
                Periodo
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField label="Data Inicio" type="datetime-local" value={dtinicio}
                  onChange={(e) => setDtinicio(e.target.value)} fullWidth size="small"
                  slotProps={{ inputLabel: { shrink: true } }} />
                <TextField label="Previsao Termino" type="datetime-local" value={dtprevisao}
                  onChange={(e) => setDtprevisao(e.target.value)} fullWidth size="small"
                  slotProps={{ inputLabel: { shrink: true } }} />
              </Box>
            </Box>

            <Divider />

            {/* Vinculacoes */}
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', mb: 1 }}>
                Vinculacoes
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                <TextField label="Parceiro (CODPARC)" type="number" value={codparc}
                  onChange={(e) => setCodparc(e.target.value)} fullWidth size="small" />
                <TextField label="OS Manutencao" type="number" value={nuos}
                  onChange={(e) => setNuos(e.target.value)} fullWidth size="small" />
                <TextField label="OS Comercial" type="number" value={numos}
                  onChange={(e) => setNumos(e.target.value)} fullWidth size="small" />
              </Box>
            </Box>

            <Divider />

            {/* Equipe */}
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', mb: 1 }}>
                Equipe
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField label="Operadores" value={exeope} onChange={(e) => setExeope(e.target.value)}
                  fullWidth size="small" placeholder="10012, 10184"
                  helperText="Codigos de usuario separados por virgula" />
                <TextField label="Mecanicos" value={exemec} onChange={(e) => setExemec(e.target.value)}
                  fullWidth size="small" placeholder="288, 340"
                  helperText="Codigos de usuario separados por virgula" />
              </Box>
            </Box>
          </Stack>

          {/* Actions */}
          <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button onClick={() => navigate(-1)} disabled={criar.isPending}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={!canSubmit}
              startIcon={criar.isPending ? <CircularProgress size={16} color="inherit" /> : <Save />}>
              {criar.isPending ? 'Salvando...' : 'Criar Situacao'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
