import { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, Stack, IconButton, TextField,
  FormControl, InputLabel, Select, MenuItem, Button,
  CircularProgress, Autocomplete, Collapse, Divider,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { Close, ExpandMore, ExpandLess } from '@mui/icons-material';
import { useAuthStore } from '@/stores/auth-store';
import { useChamadosUsuarios } from '@/hooks/use-chamados';
import { useCreateChamado, useUpdateChamado } from '@/hooks/use-chamado-mutations';
import type {
  Chamado,
  ChamadoStatusCode,
  ChamadoPrioridadeCode,
} from '@/types/chamados-types';

interface ChamadoFormDrawerProps {
  open: boolean;
  onClose: () => void;
  chamado?: Chamado | null;
}

const STATUS_LABELS: Record<string, string> = {
  P: 'Pendente', E: 'Em andamento', S: 'Suspenso',
  A: 'Aguardando', F: 'Finalizado', C: 'Cancelado',
};

const PRIO_LABELS: Record<string, string> = {
  A: 'Alta', M: 'Media', B: 'Baixa',
};

const TIPO_MAP: Record<string, string> = {
  '01': 'Incidente', '02': 'Requisicao', '03': 'Melhoria',
  '04': 'Duvida', '05': 'Problema', '06': 'Tarefa',
  '07': 'Projeto', '08': 'Mudanca', '09': 'Liberacao', '99': 'Outros',
};

const ALL_STATUSES: ChamadoStatusCode[] = ['P', 'E', 'S', 'A', 'F', 'C'];
const ALL_PRIOS: ChamadoPrioridadeCode[] = ['A', 'M', 'B'];
const TIPO_ENTRIES = Object.entries(TIPO_MAP);

function nowLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function ChamadoFormDrawer({ open, onClose, chamado }: ChamadoFormDrawerProps) {
  const isEdit = !!chamado;
  const user = useAuthStore((s) => s.user);
  const { data: usuarios = [] } = useChamadosUsuarios();
  const createMutation = useCreateChamado();
  const updateMutation = useUpdateChamado();

  const [descricao, setDescricao] = useState('');
  const [tipoChamado, setTipoChamado] = useState('99');
  const [prioridade, setPrioridade] = useState<ChamadoPrioridadeCode>('M');
  const [setor, setSetor] = useState('');
  const [solicitante, setSolicitante] = useState<number | null>(null);
  const [solicitado, setSolicitado] = useState<number | null>(null);
  const [codparc, setCodparc] = useState('');
  const [status, setStatus] = useState<ChamadoStatusCode>('P');
  const [dhChamado, setDhChamado] = useState('');
  const [previsao, setPrevisao] = useState('');
  const [finalizadoPor, setFinalizadoPor] = useState<number | null>(null);
  const [dhFinCham, setDhFinCham] = useState('');
  const [validado, setValidado] = useState('');
  const [validadoPor, setValidadoPor] = useState<number | null>(null);
  const [dhValidacao, setDhValidacao] = useState('');
  const [validacaoOpen, setValidacaoOpen] = useState(false);

  const showFinalizacao = status === 'F' || status === 'C';

  useEffect(() => {
    if (!open) return;
    if (isEdit && chamado) {
      setDescricao(chamado.DESCRCHAMADO ?? '');
      setTipoChamado(chamado.TIPOCHAMADO ?? '99');
      setPrioridade(chamado.PRIORIDADE ?? 'M');
      setSetor(chamado.SETOR ?? '');
      setSolicitante(chamado.SOLICITANTE);
      setSolicitado(chamado.SOLICITADO);
      setCodparc(chamado.CODPARC?.toString() ?? '');
      setStatus(chamado.STATUS);
      setDhChamado(chamado.DHCHAMADO?.slice(0, 16) ?? '');
      setPrevisao(chamado.DHPREVENTREGA?.slice(0, 16) ?? '');
      setFinalizadoPor(chamado.FINALIZADOPOR);
      setDhFinCham(chamado.DHFINCHAM?.slice(0, 16) ?? '');
      setValidado('');
      setValidadoPor(chamado.VALIDADOPOR);
      setDhValidacao(chamado.DHVALIDACAO?.slice(0, 16) ?? '');
      setValidacaoOpen(false);
    } else {
      setDescricao('');
      setTipoChamado('99');
      setPrioridade('M');
      setSetor('');
      setSolicitante(user?.codusu ?? null);
      setSolicitado(null);
      setCodparc('');
      setStatus('P');
      setDhChamado(nowLocal());
      setPrevisao('');
      setFinalizadoPor(null);
      setDhFinCham('');
      setValidado('');
      setValidadoPor(null);
      setDhValidacao('');
      setValidacaoOpen(false);
    }
  }, [open, isEdit, chamado, user?.codusu]);

  const handleStatusChange = (newStatus: ChamadoStatusCode) => {
    setStatus(newStatus);
    if (newStatus === 'F') {
      if (!finalizadoPor) setFinalizadoPor(user?.codusu ?? null);
      if (!dhFinCham) setDhFinCham(nowLocal());
    } else if (newStatus !== 'C') {
      setFinalizadoPor(null);
      setDhFinCham('');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (!descricao.trim()) return;
    if (isEdit && chamado) {
      updateMutation.mutate(
        {
          nuchamado: chamado.NUCHAMADO,
          payload: {
            DESCRCHAMADO: descricao,
            STATUS: status,
            PRIORIDADE: prioridade,
            SOLICITADO: solicitado ?? undefined,
            DHPREVENTREGA: previsao || undefined,
          },
        },
        { onSuccess: onClose },
      );
    } else {
      if (!solicitante) return;
      createMutation.mutate(
        {
          DESCRCHAMADO: descricao,
          STATUS: status,
          PRIORIDADE: prioridade,
          TIPOCHAMADO: tipoChamado,
          SOLICITANTE: solicitante,
          SOLICITADO: solicitado ?? undefined,
          CODPARC: codparc ? Number(codparc) : undefined,
          DHPREVENTREGA: previsao || undefined,
          SETOR: setor || undefined,
          DHCHAMADO: dhChamado || undefined,
          ...(showFinalizacao && {
            FINALIZADOPOR: finalizadoPor ?? undefined,
            DHFINCHAM: dhFinCham || undefined,
          }),
          ...(validado && {
            VALIDADO: validado as 'S' | 'N',
            VALIDADOPOR: validadoPor ?? undefined,
            DHVALIDACAO: dhValidacao || undefined,
          }),
        },
        { onSuccess: onClose },
      );
    }
  };

  const findUsuario = (codusu: number | null) =>
    usuarios.find((u) => u.CODUSU === codusu) ?? null;

  const sectionTitle = (label: string) => (
    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mt: 1 }}>
      {label}
    </Typography>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 440 }, p: 0 } }}
    >
      <Box sx={{
        p: 2, bgcolor: 'primary.main', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
          {isEdit ? `Editar #${chamado?.NUCHAMADO}` : 'Novo Chamado'}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#fff' }} size="small">
          <Close />
        </IconButton>
      </Box>

      <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
        <Stack spacing={2}>
          {sectionTitle('Informacoes Basicas')}

          <TextField
            label="Descricao"
            multiline
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            fullWidth
            size="small"
            required
          />

          <Stack direction="row" spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={tipoChamado}
                label="Tipo"
                onChange={(e: SelectChangeEvent) => setTipoChamado(e.target.value)}
              >
                {TIPO_ENTRIES.map(([code, label]) => (
                  <MenuItem key={code} value={code}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Prioridade</InputLabel>
              <Select
                value={prioridade}
                label="Prioridade"
                onChange={(e: SelectChangeEvent) =>
                  setPrioridade(e.target.value as ChamadoPrioridadeCode)
                }
              >
                {ALL_PRIOS.map((p) => (
                  <MenuItem key={p} value={p}>{PRIO_LABELS[p]}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <TextField
            label="Setor"
            value={setor}
            onChange={(e) => setSetor(e.target.value)}
            fullWidth
            size="small"
          />

          <Divider />
          {sectionTitle('Pessoas')}

          <Autocomplete
            options={usuarios}
            getOptionLabel={(o) => o.NOMEUSU}
            value={findUsuario(solicitante)}
            onChange={(_, v) => setSolicitante(v?.CODUSU ?? null)}
            renderInput={(params) => (
              <TextField {...params} label="Solicitante" size="small" required />
            )}
            size="small"
            isOptionEqualToValue={(o, v) => o.CODUSU === v.CODUSU}
          />

          <Autocomplete
            options={usuarios}
            getOptionLabel={(o) => o.NOMEUSU}
            value={findUsuario(solicitado)}
            onChange={(_, v) => setSolicitado(v?.CODUSU ?? null)}
            renderInput={(params) => (
              <TextField {...params} label="Atribuido a" size="small" />
            )}
            size="small"
            isOptionEqualToValue={(o, v) => o.CODUSU === v.CODUSU}
          />

          <TextField
            label="CODPARC"
            value={codparc}
            onChange={(e) => setCodparc(e.target.value.replace(/\D/g, ''))}
            fullWidth
            size="small"
            type="number"
          />

          <Divider />
          {sectionTitle('Status e Datas')}

          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e: SelectChangeEvent) =>
                handleStatusChange(e.target.value as ChamadoStatusCode)
              }
            >
              {ALL_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Data de abertura"
            type="datetime-local"
            value={dhChamado}
            onChange={(e) => setDhChamado(e.target.value)}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Previsao de entrega"
            type="datetime-local"
            value={previsao}
            onChange={(e) => setPrevisao(e.target.value)}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Collapse in={showFinalizacao}>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Divider />
              {sectionTitle('Finalizacao')}

              <Autocomplete
                options={usuarios}
                getOptionLabel={(o) => o.NOMEUSU}
                value={findUsuario(finalizadoPor)}
                onChange={(_, v) => setFinalizadoPor(v?.CODUSU ?? null)}
                renderInput={(params) => (
                  <TextField {...params} label="Finalizado por" size="small" />
                )}
                size="small"
                isOptionEqualToValue={(o, v) => o.CODUSU === v.CODUSU}
              />

              <TextField
                label="Data de finalizacao"
                type="datetime-local"
                value={dhFinCham}
                onChange={(e) => setDhFinCham(e.target.value)}
                fullWidth
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
          </Collapse>

          <Box>
            <Button
              size="small"
              onClick={() => setValidacaoOpen(!validacaoOpen)}
              endIcon={validacaoOpen ? <ExpandLess /> : <ExpandMore />}
              sx={{ textTransform: 'none', color: 'text.secondary' }}
            >
              Validacao
            </Button>
            <Collapse in={validacaoOpen}>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Validado</InputLabel>
                  <Select
                    value={validado}
                    label="Validado"
                    onChange={(e: SelectChangeEvent) => setValidado(e.target.value)}
                  >
                    <MenuItem value="">-</MenuItem>
                    <MenuItem value="S">Sim</MenuItem>
                    <MenuItem value="N">Nao</MenuItem>
                  </Select>
                </FormControl>

                <Autocomplete
                  options={usuarios}
                  getOptionLabel={(o) => o.NOMEUSU}
                  value={findUsuario(validadoPor)}
                  onChange={(_, v) => setValidadoPor(v?.CODUSU ?? null)}
                  renderInput={(params) => (
                    <TextField {...params} label="Validado por" size="small" />
                  )}
                  size="small"
                  isOptionEqualToValue={(o, v) => o.CODUSU === v.CODUSU}
                />

                <TextField
                  label="Data de validacao"
                  type="datetime-local"
                  value={dhValidacao}
                  onChange={(e) => setDhValidacao(e.target.value)}
                  fullWidth
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Stack>
            </Collapse>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1}>
          <Button fullWidth variant="outlined" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={isPending || !descricao.trim()}
            startIcon={isPending ? <CircularProgress size={16} /> : undefined}
          >
            {isEdit ? 'Salvar' : 'Criar'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
