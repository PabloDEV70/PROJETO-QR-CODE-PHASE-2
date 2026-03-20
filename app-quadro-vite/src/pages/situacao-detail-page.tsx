import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Stack, Chip, Paper, Grid, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, CircularProgress,
} from '@mui/material';
import { ArrowBack, Edit, SwapHoriz, Close } from '@mui/icons-material';
import { useHstVeiDetail, useUpdateHstVei, useEncerrarHstVei, useTrocarSituacao, useSituacoes } from '@/hooks/use-hstvei';
import { getDepartamentoInfo } from '@/utils/departamento-constants';
import { getPrioridadeInfo } from '@/utils/prioridade-constants';
import type { AtualizarSituacaoPayload, TrocarSituacaoPayload } from '@/types/hstvei-types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function fmtDt(val: unknown): string {
  if (!val) return '-';
  const d = new Date(val as string);
  if (isNaN(d.getTime())) return '-';
  try { return format(d, 'dd/MM/yyyy HH:mm', { locale: ptBR }); } catch { return '-'; }
}
function isOverdue(val: string | null): boolean {
  if (!val) return false;
  const d = new Date(val);
  return !isNaN(d.getTime()) && d < new Date();
}

export function SituacaoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);
  const navigate = useNavigate();
  const { data: detail, isLoading } = useHstVeiDetail(numId);
  const updateMut = useUpdateHstVei();
  const encerrarMut = useEncerrarHstVei();
  const trocarMut = useTrocarSituacao();
  const { data: situacoesList } = useSituacoes();

  const [editing, setEditing] = useState(false);
  const [editFields, setEditFields] = useState<AtualizarSituacaoPayload>({});
  const [encerrarOpen, setEncerrarOpen] = useState(false);
  const [trocarOpen, setTrocarOpen] = useState(false);
  const [trocarIdsit, setTrocarIdsit] = useState<number | ''>('');

  if (isLoading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (!detail) return <Typography sx={{ p: 4 }}>Situacao #{id} nao encontrada.</Typography>;

  const dep = getDepartamentoInfo(detail.departamentoNome);
  const pri = getPrioridadeInfo(detail.IDPRI);
  const allOps = detail.operadores ?? [];
  const allMecs = detail.mecanicos ?? [];

  function startEdit() {
    setEditFields({ descricao: detail!.DESCRICAO, obs: detail!.OBS, dtprevisao: detail!.DTPREVISAO });
    setEditing(true);
  }
  function saveEdit() {
    updateMut.mutate({ id: numId, payload: editFields }, { onSuccess: () => setEditing(false) });
  }
  function confirmEncerrar() {
    encerrarMut.mutate(numId, { onSuccess: () => { setEncerrarOpen(false); navigate(-1); } });
  }
  function confirmTrocar() {
    if (!trocarIdsit) return;
    const payload: TrocarSituacaoPayload = { idsit: trocarIdsit as number };
    trocarMut.mutate({ id: numId, payload }, { onSuccess: () => { setTrocarOpen(false); navigate(-1); } });
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>{title}</Typography>
      {children}
    </Paper>
  );
  const Field = ({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) => (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ color: color || 'text.primary' }}>{value || '-'}</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Button size="small" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>Voltar</Button>
          <Typography variant="h5" fontWeight={700}>Situacao #{detail.ID}</Typography>
        </Stack>
        {!detail.DTFIM && (
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Edit />} onClick={startEdit} disabled={editing}>Editar</Button>
            <Button variant="outlined" color="warning" startIcon={<SwapHoriz />} onClick={() => setTrocarOpen(true)}>Trocar Situacao</Button>
            <Button variant="outlined" color="error" startIcon={<Close />} onClick={() => setEncerrarOpen(true)}>Encerrar</Button>
          </Stack>
        )}
        {detail.DTFIM && <Chip label="Encerrada" color="default" />}
      </Stack>

      <Grid container spacing={3}>
        {/* LEFT COLUMN */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Section title="Veiculo">
            <Typography variant="h6" fontWeight={700}>{detail.placa ?? '-'}</Typography>
            <Typography variant="body2" color="text.secondary">{detail.marcaModelo}</Typography>
            {detail.veiculoTag && <Chip label={detail.veiculoTag} size="small" sx={{ mt: 0.5 }} />}
          </Section>

          <Section title="Detalhes da Situacao">
            <Field label="Tipo" value={detail.situacaoDescricao} />
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Prioridade</Typography>
                <Box><Chip label={pri.label} size="small" sx={{ bgcolor: pri.color, color: '#fff', fontWeight: 600 }} /></Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Departamento</Typography>
                <Box><Chip label={dep.label} size="small" icon={<dep.Icon sx={{ fontSize: 16 }} />} sx={{ bgcolor: dep.bgLight, color: dep.color, fontWeight: 600 }} /></Box>
              </Box>
            </Stack>
            <Field label="Inicio" value={fmtDt(detail.DTINICIO)} />
            <Field label="Previsao" value={fmtDt(detail.DTPREVISAO)} color={isOverdue(detail.DTPREVISAO) && !detail.DTFIM ? '#f44336' : undefined} />
            {detail.DTFIM && <Field label="Encerrada em" value={fmtDt(detail.DTFIM)} color="green" />}
            <Field label="Criacao" value={fmtDt(detail.DTCRIACAO)} />
            {detail.DTALTER !== detail.DTCRIACAO && <Field label="Ultima alteracao" value={fmtDt(detail.DTALTER)} />}

            {editing ? (
              <Box sx={{ mt: 2 }}>
                <TextField fullWidth size="small" label="Descricao" multiline rows={2} sx={{ mb: 1 }}
                  value={editFields.descricao ?? ''} onChange={(e) => setEditFields((p) => ({ ...p, descricao: e.target.value }))} />
                <TextField fullWidth size="small" label="Observacao" multiline rows={2} sx={{ mb: 1 }}
                  value={editFields.obs ?? ''} onChange={(e) => setEditFields((p) => ({ ...p, obs: e.target.value }))} />
                <TextField fullWidth size="small" label="Previsao" type="datetime-local" sx={{ mb: 1 }} InputLabelProps={{ shrink: true }}
                  value={editFields.dtprevisao ? editFields.dtprevisao.slice(0, 16) : ''} onChange={(e) => setEditFields((p) => ({ ...p, dtprevisao: e.target.value }))} />
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" size="small" onClick={saveEdit} disabled={updateMut.isPending}>
                    {updateMut.isPending ? <CircularProgress size={16} /> : 'Salvar'}
                  </Button>
                  <Button size="small" onClick={() => setEditing(false)}>Cancelar</Button>
                </Stack>
              </Box>
            ) : (
              <>
                {detail.DESCRICAO && <Field label="Descricao" value={detail.DESCRICAO} />}
                {detail.OBS && <Field label="Observacao" value={detail.OBS} />}
              </>
            )}
          </Section>
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Section title="Equipe">
            {detail.criadoPor && <Field label="Criado por" value={detail.criadoPor.nome} />}
            {!detail.criadoPor && detail.nomeUsuInc && <Field label="Criado por" value={detail.nomeUsuInc} />}
            {detail.nomeUsuAlt && <Field label="Alterado por" value={detail.nomeUsuAlt} />}
            {allOps.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">Operadores</Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">{allOps.map((p) => <Chip key={p.codusu} label={p.nome} size="small" color="info" variant="outlined" />)}</Stack>
              </Box>
            )}
            {allMecs.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">Mecanicos</Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">{allMecs.map((p) => <Chip key={p.codusu} label={p.nome} size="small" color="warning" variant="outlined" />)}</Stack>
              </Box>
            )}
            {!detail.criadoPor && allOps.length === 0 && allMecs.length === 0 && !detail.nomeUsuInc && (
              <Typography variant="body2" color="text.disabled">Nenhuma pessoa atribuida</Typography>
            )}
          </Section>

          <Section title="OS / Notas / Parceiro">
            <Field label="NUOS" value={detail.NUOS} />
            <Field label="NUMOS" value={detail.NUMOS} />
            <Field label="NUNOTA" value={detail.NUNOTA} />
            {detail.NUOS && <Field label="OS Status" value={detail.osStatus} />}
            {detail.NUOS && <Field label="OS Tipo" value={detail.osTipo} />}
            {detail.NUMOS && <Field label="MOS Cliente" value={detail.mosCliente} />}
            {detail.NUMOS && <Field label="MOS Situacao" value={detail.mosSituacao} />}
            <Field label="Parceiro" value={detail.nomeParc} />
          </Section>
        </Grid>
      </Grid>

      {/* Encerrar Dialog */}
      <Dialog open={encerrarOpen} onClose={() => setEncerrarOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Encerrar Situacao</DialogTitle>
        <DialogContent><Typography>Confirma o encerramento da situacao #{detail.ID}?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setEncerrarOpen(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={confirmEncerrar} disabled={encerrarMut.isPending}>
            {encerrarMut.isPending ? <CircularProgress size={16} /> : 'Encerrar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Trocar Situacao Dialog */}
      <Dialog open={trocarOpen} onClose={() => setTrocarOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Trocar Situacao</DialogTitle>
        <DialogContent>
          <TextField select fullWidth size="small" label="Nova situacao" sx={{ mt: 1 }}
            value={trocarIdsit} onChange={(e) => setTrocarIdsit(Number(e.target.value))}
            SelectProps={{ native: true }}>
            <option value="" />
            {(situacoesList ?? []).map((s) => <option key={s.ID} value={s.ID}>{s.DESCRICAO} ({s.departamentoNome})</option>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrocarOpen(false)}>Cancelar</Button>
          <Button color="warning" variant="contained" onClick={confirmTrocar} disabled={!trocarIdsit || trocarMut.isPending}>
            {trocarMut.isPending ? <CircularProgress size={16} /> : 'Trocar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
