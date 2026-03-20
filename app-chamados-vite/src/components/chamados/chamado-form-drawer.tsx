import { useState, useEffect, useMemo } from 'react';
import {
  Drawer, Box, Typography, Stack, IconButton, TextField,
  Button, CircularProgress, ToggleButtonGroup, ToggleButton,
  Autocomplete, Avatar,
} from '@mui/material';
import { Close, PersonAddRounded } from '@mui/icons-material';
import { useAuthStore } from '@/stores/auth-store';
import { useCreateChamado, useUpdateChamado } from '@/hooks/use-chamado-mutations';
import { useChamadosUsuarios } from '@/hooks/use-chamados';
import { getFuncionarioFotoUrl } from '@/api/funcionarios';
import {
  STATUS_MAP, PRIO_MAP, TIPO_ENTRIES, ALL_STATUSES, ALL_PRIOS,
  PARCEIROS_EXTERNOS,
} from '@/utils/chamados-constants';

import type {
  Chamado,
  ChamadoStatusCode,
  ChamadoPrioridadeCode,
  ChamadoUsuario,
} from '@/types/chamados-types';

type Destino = 'interno' | 'externo';

interface ChamadoFormDrawerProps {
  open: boolean;
  onClose: () => void;
  chamado?: Chamado | null;
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    fontSize: 14,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'action.active' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main', borderWidth: 1.5 },
  },
};


function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography component="div" sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {children}
    </Typography>
  );
}

export function ChamadoFormDrawer({ open, onClose, chamado }: ChamadoFormDrawerProps) {
  const isEdit = !!chamado;
  const user = useAuthStore((s) => s.user);
  const createMutation = useCreateChamado();
  const updateMutation = useUpdateChamado();
  const { data: usuarios } = useChamadosUsuarios();

  const [descricao, setDescricao] = useState('');
  const [tipoChamado, setTipoChamado] = useState('99');
  const [prioridade, setPrioridade] = useState<ChamadoPrioridadeCode>('M');
  const [status, setStatus] = useState<ChamadoStatusCode>('P');
  const [destino, setDestino] = useState<Destino>('interno');
  const [codparc, setCodparc] = useState(1);
  const [atribuido, setAtribuido] = useState<ChamadoUsuario | null>(null);

  const tipoOptions = useMemo(() => TIPO_ENTRIES.map(([code, label]) => ({ code, label })), []);

  useEffect(() => {
    if (!open) return;
    if (isEdit && chamado) {
      setDescricao(chamado.DESCRCHAMADO ?? '');
      setTipoChamado(chamado.TIPOCHAMADO ?? '99');
      setPrioridade(chamado.PRIORIDADE ?? 'M');
      setStatus(chamado.STATUS);
      const isExterno = chamado.CODPARC != null && chamado.CODPARC !== 1;
      setDestino(isExterno ? 'externo' : 'interno');
      setCodparc(chamado.CODPARC ?? 1);
      if (chamado.SOLICITADO && usuarios) {
        setAtribuido(usuarios.find((u) => u.CODUSU === chamado.SOLICITADO) ?? null);
      } else {
        setAtribuido(null);
      }
    } else {
      setDescricao('');
      setTipoChamado('99');
      setPrioridade('M');
      setStatus('P');
      setDestino('interno');
      setCodparc(1);
      setAtribuido(null);
    }
  }, [open, isEdit, chamado, usuarios]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleDestinoChange = (_: React.MouseEvent<HTMLElement>, val: Destino | null) => {
    if (!val) return;
    setDestino(val);
    if (val === 'interno') setCodparc(1);
    else setCodparc(PARCEIROS_EXTERNOS[0].codparc);
  };

  const handleSubmit = () => {
    if (!descricao.trim()) return;
    const parceiro = destino === 'interno' ? 1 : codparc;

    if (isEdit && chamado) {
      updateMutation.mutate(
        {
          nuchamado: chamado.NUCHAMADO,
          payload: {
            DESCRCHAMADO: descricao,
            STATUS: status,
            PRIORIDADE: prioridade,
            TIPOCHAMADO: tipoChamado,
            CODPARC: parceiro,
            SOLICITADO: atribuido?.CODUSU,
          },
        },
        { onSuccess: onClose },
      );
    } else {
      const solicitante = user?.codusu;
      if (!solicitante) return;
      createMutation.mutate(
        {
          DESCRCHAMADO: descricao,
          PRIORIDADE: prioridade,
          TIPOCHAMADO: tipoChamado,
          SOLICITANTE: solicitante,
          SOLICITADO: atribuido?.CODUSU,
          CODPARC: parceiro,
        },
        { onSuccess: onClose },
      );
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 460 },
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box sx={{
        px: 2.5, py: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <Box>
          <Typography sx={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary' }}>
            {isEdit ? `Editar #${chamado?.NUCHAMADO}` : 'Novo Chamado'}
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 0.25 }}>
            {isEdit ? 'Atualize os dados do chamado' : 'Preencha os dados para abrir um chamado'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{
          width: 36, height: 36,
          border: '1px solid', borderColor: 'divider',
          borderRadius: '10px',
        }}>
          <Close sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Form body */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2.5, py: 2.5 }}>
        <Stack spacing={2.5}>

          {/* Descricao */}
          <Box>
            <FieldLabel>Descricao *</FieldLabel>
            <TextField
              placeholder="Descreva o problema ou solicitacao..."
              multiline
              minRows={3}
              maxRows={8}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              fullWidth
              autoFocus={!isEdit}
              sx={fieldSx}
            />
          </Box>

          {/* Prioridade */}
          <Box>
            <FieldLabel>Prioridade</FieldLabel>
            <ToggleButtonGroup
              value={prioridade}
              exclusive
              onChange={(_, val) => { if (val) setPrioridade(val); }}
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  minHeight: 40,
                  textTransform: 'none', fontWeight: 600, fontSize: 13,
                  borderRadius: '10px !important',
                  borderColor: 'divider',
                  '&.Mui-selected': { color: '#fff', borderColor: 'transparent' },
                },
              }}
            >
              {ALL_PRIOS.map((p) => (
                <ToggleButton key={p} value={p} sx={{
                  '&.Mui-selected': {
                    bgcolor: `${PRIO_MAP[p].color} !important`,
                    '&:hover': { bgcolor: `${PRIO_MAP[p].color} !important`, filter: 'brightness(0.9)' },
                  },
                }}>
                  {PRIO_MAP[p].icon}
                  <Box component="span" sx={{ ml: 0.5 }}>{PRIO_MAP[p].label}</Box>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* Tipo */}
          <Box>
            <FieldLabel>Tipo</FieldLabel>
            <Autocomplete
              value={tipoOptions.find((t) => t.code === tipoChamado) ?? undefined}
              onChange={(_, v) => setTipoChamado(v?.code ?? '99')}
              options={tipoOptions}
              getOptionLabel={(o) => o.label}
              renderInput={(params) => (
                <TextField {...params} placeholder="Selecione o tipo" size="small" sx={fieldSx} />
              )}
              disableClearable
              size="small"
            />
          </Box>

          {/* Atribuir a */}
          <Box>
            <FieldLabel>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <PersonAddRounded sx={{ fontSize: 14 }} />
                <span>Atribuir a</span>
              </Stack>
            </FieldLabel>
            <Autocomplete
              value={atribuido}
              onChange={(_, v) => setAtribuido(v)}
              options={usuarios ?? []}
              getOptionLabel={(o) => o.NOMEUSU}
              isOptionEqualToValue={(o, v) => o.CODUSU === v.CODUSU}
              renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                  <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75 }}>
                    <Avatar
                      src={option.CODPARC ? getFuncionarioFotoUrl(option.CODPARC) : undefined}
                      sx={{ width: 28, height: 28, fontSize: 11 }}
                    >
                      {option.NOMEUSU?.[0]}
                    </Avatar>
                    <Typography sx={{ fontSize: 13 }}>{option.NOMEUSU}</Typography>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField {...params} placeholder="Buscar usuario..." size="small" sx={fieldSx} />
              )}
              size="small"
            />
          </Box>

          {/* Interno / Externo */}
          <Box>
            <FieldLabel>Solicitado para</FieldLabel>
            <ToggleButtonGroup
              value={destino}
              exclusive
              onChange={handleDestinoChange}
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  minHeight: 40,
                  textTransform: 'none', fontWeight: 600, fontSize: 13,
                  borderRadius: '10px !important',
                  borderColor: 'divider',
                  '&.Mui-selected': {
                    bgcolor: 'text.primary', color: 'background.paper',
                    borderColor: 'transparent',
                    '&:hover': { bgcolor: 'text.primary', filter: 'brightness(0.85)' },
                  },
                },
              }}
            >
              <ToggleButton value="interno">Interno</ToggleButton>
              <ToggleButton value="externo">Externo</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Parceiro externo */}
          {destino === 'externo' && (
            <Box>
              <FieldLabel>Parceiro</FieldLabel>
              <Autocomplete
                value={PARCEIROS_EXTERNOS.find((p) => p.codparc === codparc) ?? undefined}
                onChange={(_, v) => setCodparc(v?.codparc ?? PARCEIROS_EXTERNOS[0].codparc)}
                options={PARCEIROS_EXTERNOS}
                getOptionLabel={(o) => o.nome}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione o parceiro" size="small" sx={fieldSx} />
                )}
                disableClearable
                size="small"
              />
            </Box>
          )}

          {/* Status (edit only) */}
          {isEdit && (
            <Box>
              <FieldLabel>Status</FieldLabel>
              <ToggleButtonGroup
                value={status}
                exclusive
                onChange={(_, val) => { if (val) setStatus(val); }}
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.5,
                  '& .MuiToggleButton-root': {
                    minHeight: 36,
                    textTransform: 'none', fontWeight: 600, fontSize: 12,
                    borderRadius: '8px !important',
                    border: '1px solid',
                    borderColor: 'divider !important',
                    px: 1.5,
                    '&.Mui-selected': {
                      borderColor: 'transparent !important',
                      color: '#fff',
                    },
                  },
                }}
              >
                {ALL_STATUSES.map((s) => (
                  <ToggleButton key={s} value={s} sx={{
                    '&.Mui-selected': {
                      bgcolor: `${STATUS_MAP[s].color} !important`,
                      '&:hover': { bgcolor: `${STATUS_MAP[s].color} !important`, filter: 'brightness(0.9)' },
                    },
                  }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_MAP[s].color, mr: 0.75 }} />
                    {STATUS_MAP[s].label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          )}
        </Stack>
      </Box>

      {/* Footer */}
      <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Stack direction="row" spacing={1.5}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            disabled={isPending}
            sx={{
              minHeight: 44, textTransform: 'none', fontWeight: 600,
              borderRadius: '10px', borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': { borderColor: 'action.active', bgcolor: 'action.hover' },
            }}
          >
            Cancelar
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={isPending || !descricao.trim()}
            disableElevation
            startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : undefined}
            sx={{
              minHeight: 44, textTransform: 'none', fontWeight: 700,
              borderRadius: '10px', fontSize: 14,
            }}
          >
            {isEdit ? 'Salvar Alteracoes' : 'Criar Chamado'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
