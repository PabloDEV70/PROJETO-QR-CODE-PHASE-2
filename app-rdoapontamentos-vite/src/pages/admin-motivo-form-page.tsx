import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, IconButton, Paper, Stack, TextField, Typography,
  Alert, Switch, FormControlLabel, Chip, MenuItem,
} from '@mui/material';
import { ArrowBack, Delete, Save } from '@mui/icons-material';
import CircleIcon from '@mui/icons-material/Circle';
import { useMotivoById, useCreateMotivo, useUpdateMotivo, useDeleteMotivo } from '@/hooks/use-motivos-crud';
import { useWriteGuard } from '@/hooks/use-rdo-mutations';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';

const WT_OPTIONS = [
  { value: '', label: '(nenhuma)', color: '#9e9e9e' },
  { value: 'wrenchTime', label: 'Wrench Time', color: '#1976d2' },
  { value: 'desloc', label: 'Deslocamento', color: '#0288d1' },
  { value: 'espera', label: 'Espera', color: '#ed6c02' },
  { value: 'buro', label: 'Burocracia', color: '#9c27b0' },
  { value: 'trein', label: 'Treinamento', color: '#2e7d32' },
  { value: 'pausas', label: 'Pausas', color: '#757575' },
  { value: 'externos', label: 'Externos', color: '#d32f2f' },
];

export function AdminMotivoFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id != null && id !== 'novo';
  const motivoId = isEdit ? Number(id) : null;
  const { blocked: isProd } = useWriteGuard();

  const { data: existing, isLoading } = useMotivoById(motivoId);
  const createMut = useCreateMotivo();
  const updateMut = useUpdateMotivo();
  const deleteMut = useDeleteMotivo();
  const saving = createMut.isPending || updateMut.isPending;

  const [sigla, setSigla] = useState('');
  const [descricao, setDescricao] = useState('');
  const [produtivo, setProdutivo] = useState(true);
  const [ativo, setAtivo] = useState(true);
  const [tolerancia, setTolerancia] = useState('');
  const [penalidade, setPenalidade] = useState('');
  const [categoria, setCategoria] = useState('');

  useEffect(() => {
    if (existing) {
      setSigla(existing.SIGLA);
      setDescricao(existing.DESCRICAO);
      setProdutivo(existing.PRODUTIVO === 'S');
      setAtivo(existing.ATIVO === 'S');
      setTolerancia(existing.TOLERANCIA != null ? String(existing.TOLERANCIA) : '');
      setPenalidade(existing.PENALIDADE != null ? String(existing.PENALIDADE) : '');
      setCategoria(existing.WTCATEGORIA || '');
    }
  }, [existing]);

  const valid = sigla.trim().length > 0 && descricao.trim().length > 0;

  const goBack = () => navigate('/admin/motivos', { replace: true });

  const handleSubmit = () => {
    if (!valid) return;
    const data = {
      SIGLA: sigla.toUpperCase().trim(),
      DESCRICAO: descricao.trim(),
      PRODUTIVO: produtivo ? 'S' as const : 'N' as const,
      ATIVO: ativo ? 'S' as const : 'N' as const,
      TOLERANCIA: tolerancia ? Number(tolerancia) : null,
      PENALIDADE: penalidade ? Number(penalidade) : null,
      WTCATEGORIA: categoria || null,
    };
    if (isEdit && motivoId != null) {
      updateMut.mutate({ id: motivoId, data }, { onSuccess: goBack });
    } else {
      createMut.mutate(data, { onSuccess: goBack });
    }
  };

  const handleDelete = () => {
    if (!motivoId || !confirm(`Excluir motivo ${sigla}?`)) return;
    deleteMut.mutate(motivoId, { onSuccess: goBack });
  };

  if (isEdit && isLoading) return <LoadingSkeleton message="Carregando motivo..." />;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={goBack} size="small">
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
          {isEdit ? `Editar Motivo — ${existing?.SIGLA ?? ''}` : 'Novo Motivo'}
        </Typography>
        {isEdit && (
          <Button
            color="error" size="small" startIcon={<Delete />}
            onClick={handleDelete} disabled={isProd || deleteMut.isPending}
          >
            Excluir
          </Button>
        )}
      </Stack>

      {isProd && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Escrita bloqueada no banco PROD. Selecione TESTE ou TREINA.
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Sigla" size="small" required fullWidth
              value={sigla}
              onChange={(e) => setSigla(e.target.value)}
              inputProps={{ maxLength: 5 }}
              helperText="Max 5 caracteres"
              sx={{ flex: 1 }}
            />
            <TextField
              label="Descricao" size="small" required fullWidth
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              sx={{ flex: 2 }}
            />
          </Stack>

          <Stack direction="row" spacing={3}>
            <FormControlLabel
              control={<Switch checked={produtivo} onChange={(_, c) => setProdutivo(c)} color="success" />}
              label={
                <Chip label={produtivo ? 'Produtivo' : 'Improdutivo'} size="small"
                  color={produtivo ? 'success' : 'error'} variant="outlined"
                  sx={{ fontSize: 12, fontWeight: 600 }} />
              }
            />
            <FormControlLabel
              control={<Switch checked={ativo} onChange={(_, c) => setAtivo(c)} color="success" />}
              label={
                <Chip label={ativo ? 'Ativo' : 'Inativo'} size="small"
                  color={ativo ? 'success' : 'default'}
                  variant={ativo ? 'filled' : 'outlined'}
                  sx={{ fontSize: 12, fontWeight: 600, ...(ativo ? {} : { borderStyle: 'dashed' }) }} />
              }
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Tolerancia (min)" size="small" type="number" fullWidth
              value={tolerancia} onChange={(e) => setTolerancia(e.target.value)}
            />
            <TextField
              label="Penalidade (min)" size="small" type="number" fullWidth
              value={penalidade} onChange={(e) => setPenalidade(e.target.value)}
            />
          </Stack>

          <TextField
            label="Categoria WT" size="small" select fullWidth
            value={categoria} onChange={(e) => setCategoria(e.target.value)}
          >
            {WT_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CircleIcon sx={{ fontSize: 12, color: o.color }} />
                  <Typography fontSize={13}>{o.label}</Typography>
                </Stack>
              </MenuItem>
            ))}
          </TextField>

          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
            <Button onClick={goBack}>Cancelar</Button>
            <Button
              variant="contained" startIcon={<Save />}
              onClick={handleSubmit}
              disabled={!valid || isProd || saving}
            >
              {saving ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

export default AdminMotivoFormPage;
