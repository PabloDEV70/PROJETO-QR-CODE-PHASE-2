import { useState, useEffect } from 'react';
import {
  Box, ButtonBase, SwipeableDrawer, TextField, Typography,
  alpha, darken, lighten, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import {
  Save, DeleteForever, Warning, AccessTime, Build, DirectionsCar,
} from '@mui/icons-material';
import { getMotivoIcon } from '@/utils/motivo-icons';
import { getCategoryMeta } from '@/utils/wrench-time-categories';
import { hhmmToString, formatMinutos } from '@/utils/hora-utils';
import type { RdoDetalheItem, RdoMotivo, DetalheFormData } from '@/types/rdo-types';

interface EditAtividadeSheetProps {
  open: boolean;
  item: RdoDetalheItem | null;
  motivos: RdoMotivo[];
  onSave: (item: number, data: Partial<DetalheFormData>) => void;
  onDelete: (item: number) => void;
  onClose: () => void;
}

const MONO = '"SF Mono", "Roboto Mono", "Fira Code", monospace';

function hhmmToTimeStr(hhmm: number | null): string {
  if (hhmm == null) return '';
  const h = Math.floor(hhmm / 100);
  const m = hhmm % 100;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Parse OBS: "Servico: Nome #COD | user obs" */
function parseObs(obs: string | null): { servico: string | null; servicoCod: string | null; obs: string | null } {
  if (!obs) return { servico: null, servicoCod: null, obs: null };
  const parts = obs.split(' | ');
  let servico: string | null = null;
  let servicoCod: string | null = null;
  const rest: string[] = [];
  for (const p of parts) {
    if (p.startsWith('Servico: ')) {
      const raw = p.slice('Servico: '.length);
      const codMatch = raw.match(/#(\d+)$/);
      if (codMatch) {
        servicoCod = codMatch[1]!;
        servico = raw.slice(0, raw.lastIndexOf('#')).trim();
      } else {
        servico = raw;
      }
    } else {
      rest.push(p);
    }
  }
  return { servico, servicoCod, obs: rest.length > 0 ? rest.join(' | ') : null };
}

function resolveServico(item: RdoDetalheItem) {
  const parsed = parseObs(item.OBS);
  const nome = item.servicoNome ?? parsed.servico;
  const cod = item.servicoCodProd ?? (parsed.servicoCod ? Number(parsed.servicoCod) : null);
  const svcObs = item.servicoObs ?? null;
  const userObs = parsed.obs;
  return { nome, cod, svcObs, userObs };
}

function timeStrToHhmm(str: string): number | null {
  if (!str) return null;
  const [h, m] = str.split(':').map(Number);
  return (h ?? 0) * 100 + (m ?? 0);
}

export function EditAtividadeSheet({
  open, item, motivos, onSave, onDelete, onClose,
}: EditAtividadeSheetProps) {
  const [hrini, setHrini] = useState('');
  const [hrfim, setHrfim] = useState('');
  const [motivoCod, setMotivoCod] = useState<number | ''>('');
  const [nuos, setNuos] = useState('');
  const [obs, setObs] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open && item) {
      setHrini(hhmmToTimeStr(item.HRINI));
      setHrfim(hhmmToTimeStr(item.HRFIM));
      setMotivoCod(item.RDOMOTIVOCOD ?? '');
      setNuos(item.NUOS ? String(item.NUOS) : '');
      setObs(item.OBS ?? '');
      setConfirmDelete(false);
    }
  }, [open, item]);

  if (!item) return null;

  const catMeta = getCategoryMeta(item.motivoCategoria ?? 'wrenchTime');
  const accent = catMeta.color;
  const Icon = getMotivoIcon(item.motivoSigla);
  const duracao = item.duracaoMinutos ?? 0;

  const handleSave = () => {
    const data: Partial<DetalheFormData> = {};
    const newIni = timeStrToHhmm(hrini);
    const newFim = timeStrToHhmm(hrfim);
    if (newIni != null && newIni !== item.HRINI) data.HRINI = newIni;
    if (newFim != null && newFim !== item.HRFIM) data.HRFIM = newFim;
    if (motivoCod !== '' && motivoCod !== item.RDOMOTIVOCOD) data.RDOMOTIVOCOD = motivoCod;
    const newNuos = nuos.trim() ? Number(nuos) : null;
    if (newNuos !== item.NUOS) data.NUOS = newNuos;
    if (obs !== (item.OBS ?? '')) data.OBS = obs || null;
    if (Object.keys(data).length > 0) {
      onSave(item.ITEM, data);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete(item.ITEM);
    onClose();
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 20, borderTopRightRadius: 20,
            overflow: 'hidden', maxHeight: '90vh',
          },
        },
      }}
    >
      {/* Header */}
      <Box sx={{ bgcolor: accent, color: '#fff', px: 2.5, pt: 1.25, pb: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.75 }}>
          <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: alpha('#fff', 0.4) }} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
            bgcolor: alpha('#fff', 0.18),
            border: `1.5px solid ${alpha('#fff', 0.3)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon sx={{ fontSize: 20 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.8 }}>
              Editar atividade
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, lineHeight: 1.25 }}>
              {item.motivoDescricao}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 900, fontFamily: MONO }}>
              {duracao > 0 ? formatMinutos(duracao) : '—'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, justifyContent: 'flex-end' }}>
              <AccessTime sx={{ fontSize: 11, opacity: 0.7 }} />
              <Typography sx={{ fontSize: '0.65rem', opacity: 0.7, fontWeight: 600, fontFamily: MONO }}>
                {hhmmToString(item.HRINI)} — {hhmmToString(item.HRFIM)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Service / Vehicle info (read-only) */}
      {(() => {
        const svc = resolveServico(item);
        const veiculo = [item.veiculoModelo, item.veiculoPlaca].filter(Boolean).join(' · ');
        const hasInfo = item.NUOS || svc.nome || veiculo;
        if (!hasInfo) return null;
        return (
          <Box sx={{
            mx: 2.5, mt: 1.5, p: 1.25, borderRadius: 2,
            bgcolor: (t) => alpha(t.palette.divider, 0.06),
            border: '1px solid', borderColor: 'divider',
          }}>
            {/* OS + Service name row */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5 }}>
              {item.NUOS && (
                <Typography sx={{
                  fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800,
                  color: '#3B82F6', lineHeight: 1,
                }}>
                  OS {item.NUOS}
                </Typography>
              )}
              {item.NUOS && svc.nome && (
                <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', lineHeight: 1 }}>·</Typography>
              )}
              {svc.nome && (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, minWidth: 0 }}>
                  <Build sx={{ fontSize: 12, color: '#8B5CF6', flexShrink: 0 }} />
                  <Typography noWrap sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#7C3AED', lineHeight: 1 }}>
                    {svc.nome}
                  </Typography>
                  {svc.cod != null && (
                    <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: 'text.disabled', fontFamily: MONO, lineHeight: 1 }}>
                      #{svc.cod}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
            {/* Vehicle row */}
            {veiculo && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mt: 0.5 }}>
                <DirectionsCar sx={{ fontSize: 13, color: 'text.disabled' }} />
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: 'text.secondary', lineHeight: 1 }}>
                  {veiculo}
                </Typography>
              </Box>
            )}
            {/* Service observation */}
            {svc.svcObs && (
              <Typography noWrap sx={{
                fontSize: '0.68rem', color: '#7C3AED', fontWeight: 500,
                fontStyle: 'italic', mt: 0.4, opacity: 0.85,
              }}>
                {svc.svcObs}
              </Typography>
            )}
            {/* User observation */}
            {svc.userObs && (
              <Typography noWrap sx={{
                fontSize: '0.68rem', color: 'text.disabled', fontWeight: 400,
                fontStyle: 'italic', mt: 0.3,
              }}>
                {svc.userObs}
              </Typography>
            )}
          </Box>
        );
      })()}

      {/* Form */}
      <Box sx={{ px: 2.5, pt: 2, pb: 3.5, overflowY: 'auto' }}>
        {/* Time inputs */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <TextField
            label="Inicio"
            type="time"
            size="small"
            fullWidth
            value={hrini}
            onChange={(e) => setHrini(e.target.value)}
            slotProps={{ htmlInput: { step: 60 } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontFamily: MONO, fontWeight: 600 } }}
          />
          <TextField
            label="Fim"
            type="time"
            size="small"
            fullWidth
            value={hrfim}
            onChange={(e) => setHrfim(e.target.value)}
            slotProps={{ htmlInput: { step: 60 } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontFamily: MONO, fontWeight: 600 } }}
          />
        </Box>

        {/* Motivo select */}
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Motivo</InputLabel>
          <Select
            value={motivoCod}
            label="Motivo"
            onChange={(e) => setMotivoCod(e.target.value as number)}
            sx={{ borderRadius: 2 }}
          >
            {motivos.map((m) => (
              <MenuItem key={m.RDOMOTIVOCOD} value={m.RDOMOTIVOCOD}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontFamily: MONO, fontWeight: 700, fontSize: '0.85rem', minWidth: 24 }}>
                    {m.RDOMOTIVOCOD}
                  </Typography>
                  <Typography sx={{ fontFamily: MONO, fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', minWidth: 48 }}>
                    {m.SIGLA}
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem' }}>
                    {m.DESCRICAO}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* OS */}
        <TextField
          label="OS (opcional)"
          type="number"
          size="small"
          fullWidth
          value={nuos}
          onChange={(e) => setNuos(e.target.value)}
          slotProps={{ htmlInput: { inputMode: 'numeric' } }}
          sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        {/* OBS */}
        <TextField
          label="Observacao (opcional)"
          size="small"
          fullWidth
          multiline
          minRows={1}
          maxRows={3}
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        {/* Save button — primary action */}
        <ButtonBase
          onClick={handleSave}
          sx={{
            width: '100%',
            borderRadius: 2,
            py: 1.25,
            background: `linear-gradient(180deg, ${lighten(accent, 0.06)} 0%, ${accent} 50%, ${darken(accent, 0.06)} 100%)`,
            color: '#fff',
            boxShadow: `0 3px 0 0 ${darken(accent, 0.35)}, 0 4px 10px ${alpha(accent, 0.25)}`,
            '&:active': {
              transform: 'translateY(3px)',
              boxShadow: `0 0 0 0 ${darken(accent, 0.35)}`,
            },
            transition: 'all 60ms ease-out',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, justifyContent: 'center' }}>
            <Save sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 800 }}>
              Salvar
            </Typography>
          </Box>
        </ButtonBase>

        {/* Delete — subtle, at the bottom, requires confirmation */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
          <ButtonBase
            onClick={handleDelete}
            sx={{
              borderRadius: 2,
              px: 2, py: 0.75,
              color: confirmDelete ? '#fff' : 'text.disabled',
              bgcolor: confirmDelete ? '#EF4444' : 'transparent',
              transition: 'all 200ms',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
              {confirmDelete ? <Warning sx={{ fontSize: 14 }} /> : <DeleteForever sx={{ fontSize: 14 }} />}
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 600 }}>
                {confirmDelete ? 'Confirmar exclusao?' : 'Excluir atividade'}
              </Typography>
            </Box>
          </ButtonBase>
        </Box>
      </Box>
    </SwipeableDrawer>
  );
}
