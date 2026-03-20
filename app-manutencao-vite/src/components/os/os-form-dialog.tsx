import { useState, useEffect } from 'react';
import { Stack, TextField, MenuItem } from '@mui/material';
import { CrudFormDialog } from '@/components/shared/crud-form-dialog';
import { VeiculoCombobox } from '@/components/shared/veiculo-combobox';
import { useCreateOs, useUpdateOs } from '@/hooks/use-os-mutations';
import { useAuthStore } from '@/stores/auth-store';
import { TIPO_MANUT_MAP, STATUSGIG_MAP } from '@/utils/os-constants';
import type { OrdemServico } from '@/types/os-types';

interface OsFormDialogProps {
  open: boolean;
  onClose: () => void;
  os?: OrdemServico | null;
}

export function OsFormDialog({ open, onClose, os }: OsFormDialogProps) {
  const isProd = useAuthStore((s) => s.database) === 'PROD';
  const isEdit = !!os;

  const createMut = useCreateOs();
  const updateMut = useUpdateOs();
  const loading = createMut.isPending || updateMut.isPending;

  const [codveiculo, setCodveiculo] = useState<number | null>(null);
  const [manutencao, setManutencao] = useState('');
  const [tipo, setTipo] = useState('');
  const [statusGig, setStatusGig] = useState('');
  const [codparc, setCodparc] = useState('');
  const [codmotorista, setCodmotorista] = useState('');
  const [previsao, setPrevisao] = useState('');
  const [km, setKm] = useState('');
  const [horimetro, setHorimetro] = useState('');

  useEffect(() => {
    if (open) {
      setCodveiculo(os?.CODVEICULO ?? null);
      setManutencao(os?.MANUTENCAO ?? '');
      setTipo(os?.TIPO ?? '');
      setStatusGig(os?.AD_STATUSGIG ?? '');
      setCodparc(os?.CODPARC ? String(os.CODPARC) : '');
      setCodmotorista(os?.CODMOTORISTA ? String(os.CODMOTORISTA) : '');
      setPrevisao(os?.PREVISAO ? os.PREVISAO.slice(0, 16) : '');
      setKm(os?.KM ? String(os.KM) : '');
      setHorimetro(os?.HORIMETRO ? String(os.HORIMETRO) : '');
    }
  }, [open, os]);

  const handleSubmit = () => {
    if (!codveiculo || !manutencao || !tipo) return;
    const payload = {
      CODVEICULO: codveiculo,
      MANUTENCAO: manutencao,
      TIPO: tipo,
      AD_STATUSGIG: statusGig || undefined,
      CODPARC: codparc ? Number(codparc) : undefined,
      CODMOTORISTA: codmotorista ? Number(codmotorista) : undefined,
      PREVISAO: previsao || undefined,
      KM: km ? Number(km) : undefined,
      HORIMETRO: horimetro ? Number(horimetro) : undefined,
    };

    if (isEdit && os) {
      updateMut.mutate([os.NUOS, payload], { onSuccess: onClose });
    } else {
      createMut.mutate([payload], { onSuccess: onClose });
    }
  };

  return (
    <CrudFormDialog
      open={open} onClose={onClose}
      title={isEdit ? `Editar OS #${os?.NUOS}` : 'Nova Ordem de Servico'}
      onSubmit={handleSubmit} loading={loading} isProd={isProd} maxWidth="sm"
    >
      <Stack spacing={2} sx={{ mt: 1 }}>
        <VeiculoCombobox value={codveiculo} onChange={(v) => setCodveiculo(v)} required />
        <Stack direction="row" spacing={2}>
          <TextField
            select label="Tipo Manutencao" value={manutencao}
            onChange={(e) => setManutencao(e.target.value)}
            required fullWidth size="small"
          >
            {Object.entries(TIPO_MANUT_MAP).map(([k, v]) => (
              <MenuItem key={k} value={k}>{v.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            select label="Tipo" value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required fullWidth size="small"
          >
            <MenuItem value="I">Interna</MenuItem>
            <MenuItem value="E">Externa</MenuItem>
          </TextField>
        </Stack>
        <TextField
          select label="Status GIG" value={statusGig}
          onChange={(e) => setStatusGig(e.target.value)}
          fullWidth size="small"
        >
          <MenuItem value="">Nenhum</MenuItem>
          {Object.entries(STATUSGIG_MAP).map(([k, v]) => (
            <MenuItem key={k} value={k}>{v.label}</MenuItem>
          ))}
        </TextField>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Cod. Parceiro" value={codparc}
            onChange={(e) => setCodparc(e.target.value)}
            type="number" fullWidth size="small"
          />
          <TextField
            label="Cod. Motorista" value={codmotorista}
            onChange={(e) => setCodmotorista(e.target.value)}
            type="number" fullWidth size="small"
          />
        </Stack>
        <TextField
          label="Previsao" value={previsao}
          onChange={(e) => setPrevisao(e.target.value)}
          type="datetime-local" fullWidth size="small"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Stack direction="row" spacing={2}>
          <TextField
            label="KM" value={km} onChange={(e) => setKm(e.target.value)}
            type="number" fullWidth size="small"
          />
          <TextField
            label="Horimetro" value={horimetro}
            onChange={(e) => setHorimetro(e.target.value)}
            type="number" fullWidth size="small"
          />
        </Stack>
      </Stack>
    </CrudFormDialog>
  );
}
