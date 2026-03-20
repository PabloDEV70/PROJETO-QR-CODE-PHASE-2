import { useState, useMemo } from 'react';
import {
  Box, Typography, Stack, TextField, IconButton,
  MenuItem, Button, CircularProgress,
  ToggleButtonGroup, ToggleButton, Autocomplete,
  Chip, Collapse,
} from '@mui/material';
import {
  ArrowBack, Send, PersonOutline, SupportAgent,
  AdminPanelSettingsRounded, ExpandMore,
  VerifiedUser,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { useAuthStore } from '@/stores/auth-store';
import { useCreateChamado } from '@/hooks/use-chamado-mutations';
import { useChamadosUsuarios } from '@/hooks/use-chamados';
import {
  PRIO_MAP, TIPO_ENTRIES, ALL_PRIOS, ALL_STATUSES, STATUS_MAP,
  PARCEIROS_PERMITIDOS,
} from '@/utils/chamados-constants';
import { useChatColors } from './use-chat-colors';
import type {
  ChamadoPrioridadeCode, ChamadoStatusCode, ChamadoUsuario,
} from '@/types/chamados-types';

const CODGRUPO_TI = 13;

// --- Reusable field label ---
function FieldLabel({ children }: { children: React.ReactNode }) {
  const c = useChatColors();
  return (
    <Typography sx={{
      fontSize: 11.5, fontWeight: 700, color: c.textMuted, mb: 0.5,
      textTransform: 'uppercase', letterSpacing: 0.4,
    }}>
      {children}
    </Typography>
  );
}

// --- User autocomplete with avatar ---
function UserSelect({
  label, placeholder, options, value, onChange, icon,
}: {
  label: string;
  placeholder: string;
  options: ChamadoUsuario[];
  value: ChamadoUsuario | null;
  onChange: (v: ChamadoUsuario | null) => void;
  icon: React.ReactNode;
}) {
  const c = useChatColors();
  return (
    <Box>
      <FieldLabel>{label}</FieldLabel>
      <Autocomplete
        options={options}
        getOptionLabel={(o) => o.NOMEUSU}
        value={value}
        onChange={(_, v) => onChange(v)}
        renderOption={(props, option) => {
          const { key, ...rest } = props;
          return (
            <Box component="li" key={key} {...rest}
              sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 0.75, px: 1.5 }}>
              <FuncionarioAvatar codparc={option.CODPARC} nome={option.NOMEUSU}
                size="small" sx={{ width: 28, height: 28, fontSize: 11 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>
                  {option.NOMEUSU}
                </Typography>
                {option.CODGRUPO === CODGRUPO_TI && (
                  <Typography sx={{ fontSize: 10, color: c.textMuted }}>TI</Typography>
                )}
              </Box>
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: c.searchInputBg, borderRadius: 2,
                '& fieldset': { borderColor: c.listDivider },
                '&:hover fieldset': { borderColor: c.textMuted },
                '&.Mui-focused fieldset': { borderColor: c.accent },
              },
            }}
            slotProps={{
              input: {
                ...params.InputProps,
                startAdornment: value ? (
                  <>
                    <FuncionarioAvatar codparc={value.CODPARC} nome={value.NOMEUSU}
                      size="small" sx={{ width: 22, height: 22, fontSize: 9, ml: 0.5, mr: 0.5 }} />
                    {params.InputProps.startAdornment}
                  </>
                ) : (
                  <>
                    <Box sx={{ ml: 0.5, mr: 0.5, display: 'flex', color: c.textMuted }}>{icon}</Box>
                    {params.InputProps.startAdornment}
                  </>
                ),
              },
            }}
          />
        )}
      />
    </Box>
  );
}

export function ChatFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const createMutation = useCreateChamado();
  const c = useChatColors();
  const { data: allUsuarios } = useChamadosUsuarios();

  const isTI = user?.codgrupo === CODGRUPO_TI;
  const [masterMode, setMasterMode] = useState(searchParams.get('master') === '1');
  const showMaster = isTI && masterMode;

  // Core fields
  const [descricao, setDescricao] = useState('');
  const [tipoChamado, setTipoChamado] = useState('99');
  const [prioridade, setPrioridade] = useState<ChamadoPrioridadeCode>('M');
  const [status, setStatus] = useState<ChamadoStatusCode>('P');
  const [codparc, setCodparc] = useState(1);

  // People
  const [solicitante, setSolicitante] = useState<ChamadoUsuario | null>(null);
  const [atribuido, setAtribuido] = useState<ChamadoUsuario | null>(null);
  const [finalizador, setFinalizador] = useState<ChamadoUsuario | null>(null);
  const [validador, setValidador] = useState<ChamadoUsuario | null>(null);

  // Dates
  const [dhChamado, setDhChamado] = useState('');
  const [dhPrevEntrega, setDhPrevEntrega] = useState('');
  const [dhFinCham, setDhFinCham] = useState('');
  const [dhValidacao, setDhValidacao] = useState('');
  const [validado, setValidado] = useState<'S' | 'N' | ''>('');

  // Advanced section toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isPending = createMutation.isPending;

  const tiUsuarios = useMemo(
    () => allUsuarios?.filter((u) => u.CODGRUPO === CODGRUPO_TI) ?? [],
    [allUsuarios],
  );

  const handleSubmit = () => {
    if (!descricao.trim()) return;
    const codUsu = user?.codusu;
    if (!codUsu) return;

    const payload: Record<string, unknown> = {
      DESCRCHAMADO: `${descricao}\n\n— via chamados.gigantao.net`,
      PRIORIDADE: prioridade,
      TIPOCHAMADO: tipoChamado,
      SOLICITANTE: solicitante ? solicitante.CODUSU : codUsu,
      CODPARC: codparc,
    };

    if (showMaster) {
      payload.STATUS = status;
      if (atribuido) payload.SOLICITADO = atribuido.CODUSU;
      if (finalizador) payload.FINALIZADOPOR = finalizador.CODUSU;
      if (validador) payload.VALIDADOPOR = validador.CODUSU;
      if (dhChamado) payload.DHCHAMADO = new Date(dhChamado).toISOString();
      if (dhPrevEntrega) payload.DHPREVENTREGA = new Date(dhPrevEntrega).toISOString();
      if (dhFinCham) payload.DHFINCHAM = new Date(dhFinCham).toISOString();
      if (dhValidacao) payload.DHVALIDACAO = new Date(dhValidacao).toISOString();
      if (validado) payload.VALIDADO = validado;

      if (status === 'F' && !finalizador) {
        payload.FINALIZADOPOR = codUsu;
      }
      if (status === 'F' && !dhFinCham) {
        payload.DHFINCHAM = new Date().toISOString();
      }
    }

    createMutation.mutate(payload as any, {
      onSuccess: () => navigate('/chamados/chat'),
    });
  };

  const fieldBorder = c.listDivider;
  const fieldBg = c.searchInputBg;
  const inputRootSx = {
    bgcolor: fieldBg, borderRadius: 2,
    '& fieldset': { borderColor: fieldBorder },
    '&:hover fieldset': { borderColor: c.textMuted },
    '&.Mui-focused fieldset': { borderColor: c.accent },
  };
  const dtSx = {
    '& .MuiOutlinedInput-root': { ...inputRootSx, height: 38 },
    '& .MuiInputBase-input': { fontSize: 13 },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: c.sidebarBg }}>
      {/* Header */}
      <Box sx={{
        bgcolor: c.headerBg, px: 2, py: 1.25,
        display: 'flex', alignItems: 'center', gap: 1,
        minHeight: 56,
      }}>
        <IconButton onClick={() => navigate('/chamados/chat')} sx={{ color: c.textSecondary }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: c.textPrimary }}>
            Novo Chamado
          </Typography>
          {showMaster && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <AdminPanelSettingsRounded sx={{ fontSize: 11, color: '#f59e0b' }} />
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#f59e0b' }}>
                MODO MASTER
              </Typography>
            </Stack>
          )}
        </Box>
        {isTI && (
          <Chip
            label={masterMode ? 'Master' : 'Simples'}
            size="small"
            onClick={() => setMasterMode(!masterMode)}
            icon={<AdminPanelSettingsRounded sx={{
              fontSize: 14,
              color: masterMode ? '#f59e0b !important' : `${c.textMuted} !important`,
            }} />}
            sx={{
              height: 28, fontSize: 11, fontWeight: 700,
              color: masterMode ? '#f59e0b' : c.textSecondary,
              bgcolor: masterMode ? 'rgba(245,158,11,0.1)' : c.searchInputBg,
              border: masterMode ? '1px solid rgba(245,158,11,0.3)' : `1px solid ${c.listDivider}`,
              cursor: 'pointer',
              '& .MuiChip-icon': { ml: 0.5 },
            }}
          />
        )}
      </Box>

      {/* Form body */}
      <Box sx={{
        flex: 1, overflowY: 'auto',
        display: 'flex', justifyContent: 'center',
        px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 3 },
      }}>
        <Box sx={{ width: '100%', maxWidth: 540 }}>

          {/* Logged-in user card */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            bgcolor: c.bubbleOwn, borderRadius: 3,
            px: 2, py: 1.5, mb: 2.5,
          }}>
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <FuncionarioAvatar
                codparc={user?.codparc}
                nome={user?.nomecompleto || user?.nome}
                size="medium"
                sx={{ width: 44, height: 44, fontSize: 16 }}
              />
              <Box sx={{
                position: 'absolute', bottom: 0, right: 0,
                width: 12, height: 12, borderRadius: '50%',
                bgcolor: '#22c55e',
                border: '2px solid', borderColor: c.bubbleOwn,
              }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{
                fontSize: 14.5, fontWeight: 600, color: c.textPrimary,
                lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user?.nomecompleto || user?.nome || user?.username || 'Usuario'}
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: c.textMuted, lineHeight: 1.3, mt: 0.15 }}>
                {user?.nomegrupo || user?.pertencedp || 'Colaborador'}
                {isTI && ' · Admin'}
              </Typography>
            </Box>
          </Box>

          {/* ─── SEÇÃO: PESSOAS ─── */}
          {showMaster && allUsuarios && (
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{
                fontSize: 10, fontWeight: 800, color: c.accent, mb: 1.5,
                textTransform: 'uppercase', letterSpacing: 1,
              }}>
                Pessoas
              </Typography>
              <Stack spacing={1.5}>
                <UserSelect
                  label="Solicitante"
                  placeholder="Quem solicitou..."
                  options={allUsuarios}
                  value={solicitante}
                  onChange={setSolicitante}
                  icon={<PersonOutline sx={{ fontSize: 18 }} />}
                />
                <UserSelect
                  label="Atribuir para"
                  placeholder="Tecnico TI responsavel..."
                  options={tiUsuarios}
                  value={atribuido}
                  onChange={setAtribuido}
                  icon={<SupportAgent sx={{ fontSize: 18 }} />}
                />
              </Stack>
            </Box>
          )}

          {/* ─── SEÇÃO: CHAMADO ─── */}
          <Box sx={{ mb: 2.5 }}>
            {showMaster && (
              <Typography sx={{
                fontSize: 10, fontWeight: 800, color: c.accent, mb: 1.5,
                textTransform: 'uppercase', letterSpacing: 1,
              }}>
                Chamado
              </Typography>
            )}

            {/* Descricao */}
            <Box sx={{ mb: 1.5 }}>
              <FieldLabel>Descricao *</FieldLabel>
              <TextField
                placeholder="Descreva o problema ou solicitacao..."
                multiline minRows={3} maxRows={8}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                fullWidth autoFocus={!isTI} size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    ...inputRootSx, fontSize: 14, lineHeight: 1.6,
                  },
                }}
              />
            </Box>

            {/* Prioridade + Tipo */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 1.5 }}>
              <Box sx={{ flex: 1 }}>
                <FieldLabel>Prioridade</FieldLabel>
                <ToggleButtonGroup
                  value={prioridade}
                  exclusive
                  onChange={(_, val) => { if (val) setPrioridade(val); }}
                  fullWidth
                  sx={{
                    '& .MuiToggleButton-root': {
                      height: 36,
                      textTransform: 'none', fontWeight: 600, fontSize: 13,
                      borderColor: fieldBorder,
                      color: c.textSecondary,
                      '&.Mui-selected': { color: '#fff' },
                    },
                  }}
                >
                  {ALL_PRIOS.map((p) => (
                    <ToggleButton key={p} value={p} sx={{
                      '&.Mui-selected': {
                        bgcolor: `${PRIO_MAP[p].color} !important`,
                        '&:hover': { bgcolor: `${PRIO_MAP[p].fg} !important` },
                      },
                    }}>
                      {PRIO_MAP[p].label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              <Box sx={{ flex: 1 }}>
                <FieldLabel>Tipo</FieldLabel>
                <TextField
                  select value={tipoChamado}
                  onChange={(e) => setTipoChamado(e.target.value)}
                  fullWidth size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': { ...inputRootSx, height: 36 },
                    '& .MuiSelect-select': { fontSize: 13 },
                  }}
                >
                  {TIPO_ENTRIES.map(([code, label]) => (
                    <MenuItem key={code} value={code} sx={{ fontSize: 13 }}>{label}</MenuItem>
                  ))}
                </TextField>
              </Box>
            </Stack>

            {/* Status + Parceiro (master only) */}
            {showMaster && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 1.5 }}>
                <Box sx={{ flex: 1 }}>
                  <FieldLabel>Status</FieldLabel>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {ALL_STATUSES.map((s) => {
                      const def = STATUS_MAP[s];
                      const isActive = status === s;
                      return (
                        <Chip
                          key={s}
                          label={def.label}
                          size="small"
                          onClick={() => setStatus(s)}
                          sx={{
                            fontWeight: 600, fontSize: 11, height: 28,
                            bgcolor: isActive ? def.bg : fieldBg,
                            color: isActive ? def.fg : c.textSecondary,
                            border: isActive ? `1.5px solid ${def.color}` : `1px solid ${fieldBorder}`,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: def.bg },
                            '& .MuiChip-label': { px: 1 },
                          }}
                        />
                      );
                    })}
                  </Stack>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FieldLabel>Parceiro</FieldLabel>
                  <TextField
                    select value={String(codparc)}
                    onChange={(e) => setCodparc(Number(e.target.value))}
                    fullWidth size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': { ...inputRootSx, height: 36 },
                      '& .MuiSelect-select': { fontSize: 13 },
                    }}
                  >
                    {PARCEIROS_PERMITIDOS.map((p) => (
                      <MenuItem key={p.codparc} value={String(p.codparc)} sx={{ fontSize: 12 }}>
                        {p.nome}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Stack>
            )}
          </Box>

          {/* ─── SEÇÃO: AVANÇADO (collapsible, master only) ─── */}
          {showMaster && (
            <Box sx={{ mb: 2.5 }}>
              <Box
                onClick={() => setShowAdvanced(!showAdvanced)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5,
                  cursor: 'pointer', userSelect: 'none', mb: 1,
                }}
              >
                <ExpandMore sx={{
                  fontSize: 16, color: c.textMuted,
                  transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }} />
                <Typography sx={{
                  fontSize: 10, fontWeight: 800, color: c.textMuted,
                  textTransform: 'uppercase', letterSpacing: 1,
                }}>
                  Avancado
                </Typography>
              </Box>

              <Collapse in={showAdvanced}>
                <Box sx={{
                  bgcolor: fieldBg, borderRadius: 2.5,
                  border: `1px solid ${fieldBorder}`,
                  px: 2, py: 2,
                }}>
                  <Stack spacing={1.5}>
                    {/* Finalizador + Validador */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                      <Box sx={{ flex: 1 }}>
                        <UserSelect
                          label="Finalizado por"
                          placeholder="Quem finalizou..."
                          options={tiUsuarios}
                          value={finalizador}
                          onChange={setFinalizador}
                          icon={<VerifiedUser sx={{ fontSize: 16 }} />}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <UserSelect
                          label="Validado por"
                          placeholder="Quem validou..."
                          options={tiUsuarios}
                          value={validador}
                          onChange={setValidador}
                          icon={<VerifiedUser sx={{ fontSize: 16 }} />}
                        />
                      </Box>
                    </Stack>

                    {/* Validado toggle */}
                    <Box>
                      <FieldLabel>Validado</FieldLabel>
                      <ToggleButtonGroup
                        value={validado}
                        exclusive
                        onChange={(_, val) => { if (val !== null) setValidado(val); }}
                        size="small"
                        sx={{
                          '& .MuiToggleButton-root': {
                            height: 32, px: 2.5,
                            textTransform: 'none', fontWeight: 600, fontSize: 12,
                            borderColor: fieldBorder, color: c.textSecondary,
                            '&.Mui-selected': {
                              bgcolor: `${c.accent} !important`, color: '#fff',
                            },
                          },
                        }}
                      >
                        <ToggleButton value="">-</ToggleButton>
                        <ToggleButton value="S">Sim</ToggleButton>
                        <ToggleButton value="N">Nao</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>

                    {/* Dates row 1 */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                      <Box sx={{ flex: 1 }}>
                        <FieldLabel>Data abertura</FieldLabel>
                        <TextField
                          type="datetime-local" size="small" fullWidth
                          value={dhChamado}
                          onChange={(e) => setDhChamado(e.target.value)}
                          sx={dtSx}
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <FieldLabel>Prev. entrega</FieldLabel>
                        <TextField
                          type="datetime-local" size="small" fullWidth
                          value={dhPrevEntrega}
                          onChange={(e) => setDhPrevEntrega(e.target.value)}
                          sx={dtSx}
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      </Box>
                    </Stack>

                    {/* Dates row 2 */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                      <Box sx={{ flex: 1 }}>
                        <FieldLabel>Data finalizacao</FieldLabel>
                        <TextField
                          type="datetime-local" size="small" fullWidth
                          value={dhFinCham}
                          onChange={(e) => setDhFinCham(e.target.value)}
                          sx={dtSx}
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <FieldLabel>Data validacao</FieldLabel>
                        <TextField
                          type="datetime-local" size="small" fullWidth
                          value={dhValidacao}
                          onChange={(e) => setDhValidacao(e.target.value)}
                          sx={dtSx}
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      </Box>
                    </Stack>
                  </Stack>
                </Box>
              </Collapse>
            </Box>
          )}

          {/* ─── Participantes summary ─── */}
          {showMaster && (solicitante || atribuido || finalizador || validador) && (
            <Box sx={{
              bgcolor: fieldBg, borderRadius: 2.5,
              border: `1px solid ${fieldBorder}`,
              px: 2, py: 1.5, mb: 2.5,
            }}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: c.textMuted, mb: 0.75, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Participantes
              </Typography>
              <Stack direction="row" spacing={-0.75} sx={{ flexWrap: 'wrap' }}>
                {[
                  { u: solicitante, role: 'Solicitante' },
                  { u: atribuido, role: 'Atribuido' },
                  { u: finalizador, role: 'Finalizador' },
                  { u: validador, role: 'Validador' },
                ].filter((x) => x.u).map(({ u, role }) => (
                  <Box key={role} sx={{ textAlign: 'center', px: 0.75 }}>
                    <FuncionarioAvatar codparc={u!.CODPARC} nome={u!.NOMEUSU}
                      size="small" sx={{
                        width: 32, height: 32, fontSize: 12,
                        border: `2px solid ${c.sidebarBg}`,
                      }} />
                    <Typography sx={{ fontSize: 9, color: c.textMuted, mt: 0.25, lineHeight: 1.2 }}>
                      {role}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* ─── Actions ─── */}
          <Stack direction="row" spacing={1.5} sx={{ pb: 2 }}>
            <Button
              fullWidth variant="outlined"
              onClick={() => navigate('/chamados/chat')}
              disabled={isPending}
              sx={{
                height: 44, textTransform: 'none', fontWeight: 600, fontSize: 14,
                borderRadius: 2.5,
                borderColor: fieldBorder, color: c.textSecondary,
                '&:hover': { borderColor: c.textMuted, bgcolor: c.listItemHover },
              }}
            >
              Cancelar
            </Button>
            <Button
              fullWidth variant="contained"
              onClick={handleSubmit}
              disabled={isPending || !descricao.trim()}
              endIcon={isPending
                ? <CircularProgress size={16} sx={{ color: 'inherit' }} />
                : <Send sx={{ fontSize: 16 }} />}
              sx={{
                height: 44,
                textTransform: 'none', fontWeight: 600, fontSize: 14,
                borderRadius: 2.5,
                bgcolor: c.accent, boxShadow: 'none',
                '&:hover': { bgcolor: c.accentHover, boxShadow: 'none' },
                '&.Mui-disabled': { bgcolor: c.btnDisabledBg, color: c.btnDisabledColor },
              }}
            >
              Criar Chamado
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
