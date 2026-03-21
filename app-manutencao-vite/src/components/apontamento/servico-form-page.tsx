import { useState, useEffect } from 'react';
import {
  Box, TextField, Typography, MenuItem, Button, Paper,
  CircularProgress, Chip, Divider, Stack,
} from '@mui/material';
import { Save, ArrowBack, Build, Inventory2 } from '@mui/icons-material';
import { ProdutoCombobox } from '@/components/shared/produto-combobox';
import { ServicoHistorico } from './servico-historico';
import { apiClient } from '@/api/client';
import type { ServicoFormData, ServicoApontamento } from '@/types/apontamento-types';

const EMPTY: ServicoFormData = {
  descritivo: '', codprod: null, qtd: null,
  geraOs: false, hr: null, km: null, dtProgramacao: '',
};

const rightAlign = { '& input': { textAlign: 'right' } } as const;

function toDateInput(val: string | null | undefined): string {
  if (!val) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

interface ProdutoInfo {
  CODPROD: number;
  nome: string;
  complemento?: string;
  marca?: string;
  grupo?: string;
  unidade?: string;
  USOPROD?: string;
  ATIVO?: string;
}

interface ServicoFormPageProps {
  codigoApontamento: number;
  codveiculo: number | null;
  onSubmit: (data: ServicoFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  editingItem?: ServicoApontamento | null;
}

export function ServicoFormPage({
  codigoApontamento, codveiculo, onSubmit, onCancel, loading = false,
  editingItem = null,
}: ServicoFormPageProps) {
  const [form, setForm] = useState<ServicoFormData>(EMPTY);
  const [produtoInfo, setProdutoInfo] = useState<ProdutoInfo | null>(null);
  const isEditing = !!editingItem;

  useEffect(() => {
    if (editingItem) {
      setForm({
        descritivo: editingItem.DESCRITIVO ?? '',
        codprod: editingItem.CODPROD,
        qtd: editingItem.QTD,
        geraOs: editingItem.GERAOS === 'S',
        hr: editingItem.HR,
        km: editingItem.KM,
        dtProgramacao: toDateInput(editingItem.DTPROGRAMACAO),
      });
    } else {
      setForm(EMPTY);
      setProdutoInfo(null);
    }
  }, [editingItem]);

  useEffect(() => {
    if (!form.codprod) { setProdutoInfo(null); return; }
    let c = false;
    apiClient.get<ProdutoInfo>(`/produtos/${form.codprod}/full`)
      .then(({ data }) => { if (!c) setProdutoInfo(data); })
      .catch(() => { if (!c) setProdutoInfo(null); });
    return () => { c = true; };
  }, [form.codprod]);

  const set = (field: keyof ServicoFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* ── Toolbar ── */}
      <Box sx={{
        flexShrink: 0, px: 2, py: 0.75,
        borderBottom: '1px solid', borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex', alignItems: 'center', gap: 1,
      }}>
        <Button size="small" color="inherit" onClick={onCancel} startIcon={<ArrowBack />}
          sx={{ textTransform: 'none', fontSize: 12, fontWeight: 600 }}>
          Voltar
        </Button>
        <Divider orientation="vertical" flexItem />
        <Typography sx={{ fontSize: 13, fontWeight: 700, flex: 1 }}>
          {isEditing ? `Servico #${editingItem.SEQ}` : 'Novo Servico'}
          <Typography component="span" sx={{ fontSize: 10, color: 'text.disabled', ml: 0.75 }}>
            Apt #{codigoApontamento}
          </Typography>
        </Typography>
        {isEditing && editingItem.NUOS && <Chip label={`OS #${editingItem.NUOS}`} size="small" color="info" />}
        {isEditing && editingItem.STATUSOS && (
          <Chip label={editingItem.STATUSOS} size="small" variant="outlined"
            color={editingItem.STATUSOS === 'Finalizada' ? 'success' : 'warning'} />
        )}
        <Box sx={{ position: 'relative' }}>
          <Button variant="contained" color="success" size="small" startIcon={<Save />}
            onClick={() => onSubmit(form)} disabled={loading}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12 }}>
            {isEditing ? 'Salvar' : 'Cadastrar'}
          </Button>
          {loading && <CircularProgress size={16} sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-8px', ml: '-8px' }} />}
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box sx={{
        flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden',
        bgcolor: (t) => t.palette.mode === 'dark' ? 'background.default' : '#f0f0f0',
      }}>
        {/* ── Form area ── */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5, display: 'flex', justifyContent: 'center' }}>
          <Paper elevation={1} sx={{ width: '100%', maxWidth: 600, p: 3, borderRadius: '10px', alignSelf: 'flex-start' }}>
            <Stack spacing={2}>

              {/* Produto */}
              <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.disabled' }}>
                Produto / Servico
              </Typography>
              <ProdutoCombobox value={form.codprod} onChange={(c) => set('codprod', c)} label="Buscar servico..." required />

              {/* Produto info inline */}
              {produtoInfo && (
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  p: 1.5, borderRadius: '8px',
                  bgcolor: produtoInfo.USOPROD === 'S' ? 'rgba(46,125,50,0.06)' : 'rgba(25,118,210,0.06)',
                }}>
                  <Box sx={{
                    width: 38, height: 38, borderRadius: '8px',
                    bgcolor: produtoInfo.USOPROD === 'S' ? 'rgba(46,125,50,0.12)' : 'rgba(25,118,210,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {produtoInfo.USOPROD === 'S'
                      ? <Build sx={{ fontSize: 18, color: 'success.main' }} />
                      : <Inventory2 sx={{ fontSize: 18, color: 'primary.main' }} />}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }} noWrap>{produtoInfo.nome}</Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.2 }} noWrap>
                      {[produtoInfo.grupo, produtoInfo.unidade, produtoInfo.marca].filter(Boolean).join(' · ')}
                    </Typography>
                  </Box>
                  <Chip label={`#${produtoInfo.CODPROD}`} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: 10 }} />
                </Box>
              )}

              {/* Descritivo */}
              <TextField label="Descritivo" size="small" fullWidth multiline rows={2}
                value={form.descritivo} onChange={(e) => set('descritivo', e.target.value)}
                placeholder="Descricao do servico..." />

              <Divider />

              {/* Qtd + Gera OS */}
              <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.disabled' }}>
                Quantidades
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField label="Quantidade" size="small" fullWidth type="number"
                  value={form.qtd ?? ''} onChange={(e) => set('qtd', e.target.value ? Number(e.target.value) : null)}
                  sx={rightAlign} />
                <TextField label="Gera OS" size="small" fullWidth select
                  value={form.geraOs ? 'S' : 'N'} onChange={(e) => set('geraOs', e.target.value === 'S')}>
                  <MenuItem value="N">Nao</MenuItem>
                  <MenuItem value="S">Sim</MenuItem>
                </TextField>
              </Stack>

              <Divider />

              {/* HR + KM + Data */}
              <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.disabled' }}>
                Medicoes e Programacao
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField label="Horimetro" size="small" fullWidth type="number"
                  value={form.hr ?? ''} onChange={(e) => set('hr', e.target.value ? Number(e.target.value) : null)}
                  sx={rightAlign} />
                <TextField label="KM" size="small" fullWidth type="number"
                  value={form.km ?? ''} onChange={(e) => set('km', e.target.value ? Number(e.target.value) : null)}
                  sx={rightAlign} />
                <TextField label="Programacao" size="small" fullWidth type="date"
                  value={form.dtProgramacao} onChange={(e) => set('dtProgramacao', e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }} sx={rightAlign} />
              </Stack>

              {/* Vinculacoes read-only */}
              {isEditing && editingItem.DESCRGRUPOPROD && (
                <>
                  <Divider />
                  <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.disabled' }}>
                    Vinculacoes
                  </Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                    <Chip label={editingItem.DESCRGRUPOPROD} size="small" variant="outlined" />
                    {editingItem.NUOS && <Chip label={`OS #${editingItem.NUOS}`} size="small" color="info" />}
                    {editingItem.STATUSOS && (
                      <Chip label={editingItem.STATUSOS} size="small" variant="outlined"
                        color={editingItem.STATUSOS === 'Finalizada' ? 'success' : 'warning'} />
                    )}
                  </Stack>
                </>
              )}
            </Stack>
          </Paper>
        </Box>

        {/* ── Historico sidebar ── */}
        {form.codprod && (
          <Box sx={{
            width: 280, flexShrink: 0,
            borderLeft: '1px solid', borderColor: 'divider',
            bgcolor: 'background.paper',
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column', overflow: 'hidden',
          }}>
            <ServicoHistorico codveiculo={codveiculo} codprod={form.codprod} />
          </Box>
        )}
      </Box>
    </Box>
  );
}
