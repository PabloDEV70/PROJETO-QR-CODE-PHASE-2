import { useState, useEffect } from 'react';
import {
  Autocomplete, Box, ButtonBase, Chip, Skeleton,
  SwipeableDrawer, TextField, Typography, alpha, darken, lighten,
} from '@mui/material';
import { Build, Close, DirectionsCar, Search, CheckCircle } from '@mui/icons-material';
import { getMotivoIcon } from '@/utils/motivo-icons';
import { getCategoryMeta } from '@/utils/wrench-time-categories';
import { useOsServicos } from '@/hooks/use-os-servicos';
import type { RdoMotivo, DetalheFormData } from '@/types/rdo-types';
import type { OsListItem, OsServiceItem } from '@/types/os-types';

interface ConfirmActivitySheetProps {
  open: boolean;
  motivo: RdoMotivo | null;
  onConfirm: (extra?: Partial<DetalheFormData>) => void;
  onClose: () => void;
  lastNuos?: number | null;
  actionLabel?: string;
  disabled?: boolean;
  minhasOs?: OsListItem[];
  osLoading?: boolean;
}

const MONO = '"SF Mono", "Roboto Mono", "Fira Code", monospace';

function getAccent(m: RdoMotivo): string {
  if (m.PRODUTIVO === 'S') return '#16A34A';
  if (m.WTCATEGORIA) return getCategoryMeta(m.WTCATEGORIA).color;
  return '#64748B';
}

function getStatusColor(status: string): string {
  if (status === 'A') return '#3B82F6';
  if (status === 'E') return '#F59E0B';
  return '#64748B';
}

function fmtMin(min: number): string {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h${m}min` : `${h}h`;
}

/** Card showing the selected OS — full readable info */
function SelectedOsCard({
  os, accent, onClear,
}: {
  os: OsListItem;
  accent: string;
  onClear: () => void;
}) {
  const statusColor = getStatusColor(os.STATUS);
  return (
    <Box sx={{
      p: 1.5, borderRadius: 2.5,
      border: `2px solid ${accent}`,
      bgcolor: alpha(accent, 0.04),
      position: 'relative',
    }}>
      {/* Clear button */}
      <ButtonBase
        onClick={onClear}
        sx={{
          position: 'absolute', top: 8, right: 8,
          width: 24, height: 24, borderRadius: '50%',
          bgcolor: alpha('#000', 0.06),
          '&:active': { bgcolor: alpha('#000', 0.12) },
        }}
      >
        <Close sx={{ fontSize: 14, color: 'text.secondary' }} />
      </ButtonBase>

      {/* OS number + status chip */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
        <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: MONO, color: accent }}>
          OS {os.NUOS}
        </Typography>
        <Chip
          label={os.statusLabel}
          size="small"
          sx={{
            height: 22, fontSize: '0.7rem', fontWeight: 700,
            bgcolor: alpha(statusColor, 0.12), color: statusColor,
          }}
        />
        {os.manutencaoLabel && (
          <Chip
            label={os.manutencaoLabel}
            size="small"
            sx={{
              height: 22, fontSize: '0.7rem', fontWeight: 600,
              bgcolor: alpha('#64748B', 0.1), color: 'text.secondary',
            }}
          />
        )}
      </Box>

      {/* Vehicle */}
      {(os.marcaModelo || os.placa) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <DirectionsCar sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography sx={{ fontSize: '0.85rem', color: 'text.primary', fontWeight: 600 }}>
            {os.marcaModelo ?? ''}{os.placa ? ` · ${os.placa}` : ''}
          </Typography>
        </Box>
      )}

      {/* Services count */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Build sx={{ fontSize: 14, color: 'text.disabled' }} />
        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', fontWeight: 600 }}>
          {os.qtdServicos} {os.qtdServicos === 1 ? 'servico' : 'servicos'}
        </Typography>
      </Box>
    </Box>
  );
}

/** Service item — tappable row */
function ServicoItem({
  servico, selected, accent, onTap,
}: {
  servico: OsServiceItem;
  selected: boolean;
  accent: string;
  onTap: () => void;
}) {
  return (
    <ButtonBase
      onClick={onTap}
      sx={{
        width: '100%', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 1.5, py: 1.25, borderRadius: 2,
        border: '1.5px solid',
        borderColor: selected ? accent : 'divider',
        bgcolor: selected ? alpha(accent, 0.06) : 'transparent',
        transition: 'all 120ms',
      }}
    >
      {/* Check icon or number */}
      {selected ? (
        <CheckCircle sx={{ fontSize: 22, color: accent, flexShrink: 0 }} />
      ) : (
        <Box sx={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          border: '2px solid', borderColor: 'divider',
        }} />
      )}

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography sx={{
            fontSize: '0.9rem', fontWeight: selected ? 700 : 600,
            color: selected ? accent : 'text.primary',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            flex: 1, minWidth: 0,
          }}>
            {servico.nomeProduto ?? `Servico #${servico.SEQUENCIA}`}
          </Typography>
          <Typography sx={{
            fontSize: '0.68rem', fontWeight: 700, fontFamily: MONO,
            color: 'text.disabled', flexShrink: 0,
            bgcolor: 'action.hover', px: 0.6, py: 0.15, borderRadius: 0.75,
          }}>
            #{servico.CODPROD}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, mt: 0.15, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled', fontWeight: 600, fontFamily: MONO }}>
            seq {servico.SEQUENCIA}
          </Typography>
          {servico.TEMPO != null && servico.TEMPO > 0 && (
            <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled', fontWeight: 600 }}>
              {fmtMin(servico.TEMPO)} gasto
            </Typography>
          )}
          {servico.statusLabel && (
            <Typography sx={{ fontSize: '0.75rem', color: servico.STATUS === 'F' ? 'success.main' : 'text.disabled', fontWeight: 600 }}>
              {servico.statusLabel}
            </Typography>
          )}
        </Box>
        {servico.OBSERVACAO && (
          <Typography sx={{
            fontSize: '0.72rem', color: 'text.secondary', fontStyle: 'italic',
            mt: 0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {servico.OBSERVACAO}
          </Typography>
        )}
      </Box>
    </ButtonBase>
  );
}

export function ConfirmActivitySheet({
  open, motivo, onConfirm, onClose, lastNuos,
  actionLabel = 'Iniciar', disabled, minhasOs, osLoading,
}: ConfirmActivitySheetProps) {
  const [selectedOs, setSelectedOs] = useState<OsListItem | null>(null);
  const [selectedServico, setSelectedServico] = useState<OsServiceItem | null>(null);
  const [manualOs, setManualOs] = useState('');
  const [obsValue, setObsValue] = useState('');

  const { data: servicosOs = [], isLoading: servicosLoading } = useOsServicos(
    open && selectedOs ? selectedOs.NUOS : undefined,
  );

  const hasOsList = !!minhasOs && minhasOs.length > 0;

  // Reset on close; pre-select last OS on open (only for productive motivos)
  useEffect(() => {
    if (!open) {
      setSelectedOs(null);
      setSelectedServico(null);
      setManualOs('');
      setObsValue('');
      return;
    }
    if (motivo?.PRODUTIVO === 'S' && lastNuos && minhasOs) {
      const match = minhasOs.find((os) => os.NUOS === lastNuos);
      if (match) setSelectedOs(match);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear servico when OS changes
  useEffect(() => {
    setSelectedServico(null);
  }, [selectedOs]);

  const handleConfirm = () => {
    const extra: Partial<DetalheFormData> = {};
    const isProd = motivo?.PRODUTIVO === 'S';
    if (isProd) {
      const nuos = selectedOs?.NUOS ?? (manualOs.trim() ? Number(manualOs) : undefined);
      if (nuos) extra.NUOS = nuos;
    }
    const obsParts: string[] = [];
    if (isProd && selectedServico) {
      const svcLabel = selectedServico.nomeProduto ?? `Servico`;
      obsParts.push(`Servico: ${svcLabel} #${selectedServico.CODPROD}`);
    }
    if (obsValue.trim()) obsParts.push(obsValue.trim());
    if (obsParts.length > 0) extra.OBS = obsParts.join(' | ');
    onConfirm(extra);
  };

  if (!motivo) return null;

  const accent = getAccent(motivo);
  const Icon = getMotivoIcon(motivo.SIGLA);
  const showOsSection = motivo.PRODUTIVO === 'S';

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
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
            maxHeight: '88vh',
          },
        },
      }}
    >
      {/* Colored header — compact */}
      <Box sx={{ bgcolor: accent, color: '#fff', px: 2.5, pt: 1.5, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: alpha('#fff', 0.4) }} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            bgcolor: alpha('#fff', 0.18),
            border: `2px solid ${alpha('#fff', 0.3)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.25 }}>
              {motivo.DESCRICAO}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
              <Typography sx={{
                px: 0.6, py: 0.1, borderRadius: 1,
                bgcolor: alpha('#fff', 0.2),
                fontSize: '0.8rem', fontWeight: 800, fontFamily: MONO,
              }}>
                {motivo.RDOMOTIVOCOD}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: MONO, opacity: 0.9 }}>
                {motivo.SIGLA}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Form content */}
      <Box sx={{ px: 2.5, pt: 2, pb: 3.5, overflowY: 'auto' }}>

        {/* ── STEP 1: OS (only for productive activities) ── */}
        {showOsSection && (<>
        <Typography sx={{
          fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary',
          textTransform: 'uppercase', letterSpacing: 1.5, mb: 1,
        }}>
          1. Ordem de Servico (opcional)
        </Typography>

        {osLoading ? (
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 2, mb: 2 }} />
        ) : selectedOs ? (
          /* Show selected OS as readable card */
          <Box sx={{ mb: 2 }}>
            <SelectedOsCard os={selectedOs} accent={accent} onClear={() => setSelectedOs(null)} />
          </Box>
        ) : hasOsList ? (
          /* Autocomplete search */
          <Box sx={{ mb: 2 }}>
            <Autocomplete<OsListItem>
              value={null}
              onChange={(_, val) => {
                if (val) {
                  setSelectedOs(val);
                  setManualOs('');
                }
              }}
              options={minhasOs!}
              getOptionLabel={(os) => `OS ${os.NUOS}`}
              getOptionKey={(os) => String(os.NUOS)}
              filterOptions={(options, { inputValue }) => {
                const q = inputValue.toLowerCase().trim();
                if (!q) return options;
                return options.filter((os) =>
                  String(os.NUOS).includes(q) ||
                  (os.placa?.toLowerCase().includes(q)) ||
                  (os.marcaModelo?.toLowerCase().includes(q))
                );
              }}
              isOptionEqualToValue={(opt, val) => opt.NUOS === val.NUOS}
              renderOption={(props, os) => {
                const statusColor = getStatusColor(os.STATUS);
                return (
                  <li {...props} key={os.NUOS}>
                    <Box sx={{ width: '100%', py: 0.25 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, fontFamily: MONO }}>
                          OS {os.NUOS}
                        </Typography>
                        <Chip
                          label={os.statusLabel}
                          size="small"
                          sx={{
                            height: 20, fontSize: '0.65rem', fontWeight: 700,
                            bgcolor: alpha(statusColor, 0.12), color: statusColor,
                          }}
                        />
                      </Box>
                      {(os.marcaModelo || os.placa) && (
                        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', fontWeight: 500 }}>
                          {os.marcaModelo}{os.placa ? ` · ${os.placa}` : ''}
                        </Typography>
                      )}
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled', fontWeight: 500 }}>
                        {os.qtdServicos} {os.qtdServicos === 1 ? 'servico' : 'servicos'}
                        {os.manutencaoLabel ? ` · ${os.manutencaoLabel}` : ''}
                      </Typography>
                    </Box>
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Buscar OS por numero ou placa..."
                  size="small"
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <Search sx={{ fontSize: 18, color: 'text.disabled', mr: 0.5 }} />
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accent },
                    },
                  }}
                />
              )}
              noOptionsText="Nenhuma OS encontrada"
              blurOnSelect
              openOnFocus
            />

            {/* Manual fallback */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 1.5 }}>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
              <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled', fontWeight: 600 }}>
                ou digitar manualmente
              </Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
            </Box>
            <TextField
              fullWidth size="small"
              placeholder="Numero da OS"
              type="number"
              value={manualOs}
              onChange={(e) => setManualOs(e.target.value)}
              slotProps={{ htmlInput: { inputMode: 'numeric', style: { fontSize: '1rem', fontWeight: 600 } } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accent },
                },
              }}
            />
          </Box>
        ) : (
          /* No list available — manual only */
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth size="small"
              placeholder="Numero da OS"
              type="number"
              value={manualOs}
              onChange={(e) => setManualOs(e.target.value)}
              slotProps={{ htmlInput: { inputMode: 'numeric', style: { fontSize: '1rem', fontWeight: 600 } } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accent },
                },
              }}
            />
          </Box>
        )}

        {/* ── STEP 2: SERVICO ── */}
        {selectedOs && (
          <>
            <Typography sx={{
              fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary',
              textTransform: 'uppercase', letterSpacing: 1.5, mb: 1,
            }}>
              2. Servico (opcional)
            </Typography>

            {servicosLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 2 }}>
                <Skeleton variant="rounded" height={48} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rounded" height={48} sx={{ borderRadius: 2 }} />
              </Box>
            ) : servicosOs.length > 0 ? (
              <Box sx={{
                display: 'flex', flexDirection: 'column', gap: 0.75,
                mb: 2, maxHeight: 200, overflowY: 'auto',
              }}>
                {servicosOs.map((s) => (
                  <ServicoItem
                    key={`${s.NUOS}-${s.SEQUENCIA}`}
                    servico={s}
                    selected={selectedServico?.SEQUENCIA === s.SEQUENCIA && selectedServico?.NUOS === s.NUOS}
                    accent={accent}
                    onTap={() => {
                      setSelectedServico(
                        selectedServico?.SEQUENCIA === s.SEQUENCIA ? null : s,
                      );
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography sx={{ fontSize: '0.85rem', color: 'text.disabled', fontStyle: 'italic', mb: 2 }}>
                Nenhum servico vinculado a esta OS
              </Typography>
            )}
          </>
        )}
        </>)}

        {/* ── OBS ── */}
        <TextField
          fullWidth size="small"
          label="Observacao (opcional)"
          value={obsValue}
          onChange={(e) => setObsValue(e.target.value)}
          multiline minRows={1} maxRows={3}
          sx={{
            mb: 2.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accent },
            },
            '& .MuiInputLabel-root.Mui-focused': { color: accent },
          }}
        />

        {/* ── CONFIRM BUTTON ── */}
        <ButtonBase
          disabled={disabled}
          onClick={handleConfirm}
          sx={{
            width: '100%',
            borderRadius: 2.5,
            background: `linear-gradient(180deg, ${lighten(accent, 0.08)} 0%, ${accent} 40%, ${darken(accent, 0.08)} 100%)`,
            color: '#fff',
            py: 1.5,
            boxShadow: [
              `0 5px 0 0 ${darken(accent, 0.35)}`,
              `0 7px 14px 0 ${alpha(accent, 0.3)}`,
              `inset 0 2px 0 0 ${alpha(lighten(accent, 0.25), 0.5)}`,
            ].join(', '),
            border: `1px solid ${alpha(darken(accent, 0.35), 0.3)}`,
            '&:active': {
              transform: 'translateY(4px)',
              boxShadow: `0 1px 0 0 ${darken(accent, 0.35)}, inset 0 2px 4px ${alpha('#000', 0.15)}`,
            },
            transition: 'all 80ms ease-out',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, letterSpacing: 1 }}>
              {actionLabel} {motivo.SIGLA}
            </Typography>
            {(selectedOs || manualOs.trim()) && (
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.85 }}>
                OS {selectedOs?.NUOS ?? manualOs}
                {selectedServico ? ` · ${selectedServico.nomeProduto ?? 'Servico'} #${selectedServico.CODPROD}` : ''}
              </Typography>
            )}
          </Box>
        </ButtonBase>
      </Box>
    </SwipeableDrawer>
  );
}
