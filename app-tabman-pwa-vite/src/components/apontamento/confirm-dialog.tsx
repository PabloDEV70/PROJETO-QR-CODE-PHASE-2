import { useState, useEffect } from 'react';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, List, ListItemButton, ListItemIcon, ListItemText,
  Radio, Skeleton, TextField, Typography,
} from '@mui/material';
import { ServicePicker } from './service-picker';
import { VeiculoCombobox } from '@/components/shared/veiculo-combobox';
import { getOsStatusColor } from '@/utils/os-status-colors';
import { useMinhasOs } from '@/hooks/use-minhas-os';
import { agoraHhmm } from '@/utils/hora-utils';
import type { RdoMotivo, DetalheFormData } from '@/types/rdo-types';
import type { OsListItem, OsServiceItem } from '@/types/os-types';

interface LastOsContext {
  NUOS: number;
  AD_SEQUENCIA_OS: number | null;
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  motivo: RdoMotivo;
  codparc: number;
  isSwitch: boolean;
  onConfirm: (form: DetalheFormData) => void;
  isPending?: boolean;
  lastOs?: LastOsContext | null;
}

export function ConfirmDialog({
  open, onClose, motivo, codparc, isSwitch, onConfirm, isPending, lastOs,
}: ConfirmDialogProps) {
  const [selectedOs, setSelectedOs] = useState<OsListItem | null>(null);
  const [selectedServico, setSelectedServico] = useState<OsServiceItem | null>(null);
  const [selectedVeiculo, setSelectedVeiculo] = useState<{ codveiculo: number; placa: string } | null>(null);
  const [obs, setObs] = useState('');

  const { data: osList, isLoading: osLoading } = useMinhasOs(codparc);
  const isProd = motivo.PRODUTIVO === 'S';
  const actionLabel = isSwitch ? 'Trocar' : 'Iniciar';

  // Pre-select last OS+Service on open (quick-resume after pause)
  useEffect(() => {
    if (!open) { setSelectedOs(null); setSelectedServico(null); setSelectedVeiculo(null); setObs(''); return; }
    if (lastOs && osList && osList.length > 0) {
      const match = osList.find((os) => os.NUOS === lastOs.NUOS);
      if (match) setSelectedOs(match);
    }
  }, [open, lastOs, osList]);

  // Reset service when OS changes (except on quick-resume)
  useEffect(() => {
    if (!selectedOs) { setSelectedServico(null); return; }
    // Quick-resume handled by ServicePicker's initial selection
  }, [selectedOs]);

  const handleConfirm = () => {
    const obsParts: string[] = [];
    if (selectedServico) {
      obsParts.push(`Servico: ${selectedServico.nomeProduto ?? 'Servico'} #${selectedServico.CODPROD}`);
    }
    if (obs.trim()) obsParts.push(obs.trim());

    // CODVEICULO: from OS if selected, otherwise from manual vehicle search
    const codveiculo = selectedOs?.CODVEICULO ?? selectedVeiculo?.codveiculo ?? null;

    const form: DetalheFormData = {
      HRINI: agoraHhmm(),
      HRFIM: agoraHhmm() + 1,
      RDOMOTIVOCOD: motivo.RDOMOTIVOCOD,
      NUOS: selectedOs?.NUOS ?? null,
      AD_SEQUENCIA_OS: selectedServico?.SEQUENCIA ?? null,
      CODVEICULO: codveiculo,
      OBS: obsParts.length > 0 ? obsParts.join(' | ') : null,
    };
    onConfirm(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{actionLabel} {motivo.SIGLA}</DialogTitle>

      <DialogContent dividers>
        {isProd && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Ordem de Servico</Typography>

            {osLoading ? (
              <>
                <Skeleton variant="rounded" height={48} sx={{ mb: 1 }} />
                <Skeleton variant="rounded" height={48} />
              </>
            ) : (osList && osList.length > 0) ? (
              <List dense sx={{ maxHeight: 200, overflow: 'auto', mb: 1 }}>
                {osList.map((os) => (
                  <ListItemButton
                    key={os.NUOS}
                    selected={selectedOs?.NUOS === os.NUOS}
                    onClick={() => setSelectedOs(selectedOs?.NUOS === os.NUOS ? null : os)}
                    sx={{ borderRadius: 1, mb: 0.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Radio checked={selectedOs?.NUOS === os.NUOS} size="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          {os.placa && (
                            <Box sx={{ px: 0.5, py: 0.1, borderRadius: 0.4, bgcolor: '#1a237e', color: '#fff', flexShrink: 0 }}>
                              <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.72rem', fontWeight: 700 }}>
                                {os.placa}
                              </Typography>
                            </Box>
                          )}
                          <Typography fontWeight={700} fontSize="0.85rem">OS {os.NUOS}</Typography>
                          <Chip
                            label={os.statusLabel} size="small"
                            sx={{
                              height: 18, fontSize: '0.6rem', fontWeight: 700,
                              bgcolor: getOsStatusColor(os.STATUS).bg, color: getOsStatusColor(os.STATUS).text,
                            }}
                          />
                        </Box>
                      }
                      secondary={os.marcaModelo ?? undefined}
                    />
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.disabled" sx={{ mb: 1 }}>
                Nenhuma OS aberta
              </Typography>
            )}

            {selectedOs && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Servicos da OS {selectedOs.NUOS}
                </Typography>
                <ServicePicker
                  nuos={selectedOs.NUOS}
                  selectedSequencia={selectedServico?.SEQUENCIA ?? null}
                  onSelect={setSelectedServico}
                  autoSelectSequencia={lastOs?.NUOS === selectedOs.NUOS ? (lastOs?.AD_SEQUENCIA_OS ?? null) : null}
                />
              </Box>
            )}
          </Box>
        )}

        {/* Vehicle search — shown when NO OS selected (working without OS) */}
        {isProd && !selectedOs && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Veiculo (sem OS)
            </Typography>
            <VeiculoCombobox
              value={selectedVeiculo?.placa ?? null}
              onChange={(_placa, veiculo) => {
                setSelectedVeiculo(veiculo ? { codveiculo: veiculo.codveiculo, placa: veiculo.placa } : null);
              }}
              label="Buscar por placa"
              placeholder="Digite a placa do veiculo..."
            />
          </Box>
        )}

        <TextField
          fullWidth label="Observacao (opcional)" value={obs}
          onChange={(e) => setObs(e.target.value)}
          multiline maxRows={3} size="small"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">Cancelar</Button>
        <Button onClick={handleConfirm} variant="contained" color="success" disabled={isPending}>
          {isPending ? 'Aguarde...' : `${actionLabel} ${motivo.SIGLA}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
