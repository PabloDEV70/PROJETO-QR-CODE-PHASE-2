import { useState, useEffect } from 'react';
import { Stack, TextField, Typography } from '@mui/material';
import { CrudFormDialog } from '@/components/shared/crud-form-dialog';
import { ProdutoCombobox } from '@/components/shared/produto-combobox';
import { useAddServico, useUpdateServico } from '@/hooks/use-os-mutations';
import { useAuthStore } from '@/stores/auth-store';
import type { ServicoOs } from '@/types/os-types';

interface ServicoFormDialogProps {
  open: boolean;
  onClose: () => void;
  nuos: number;
  servico?: ServicoOs | null;
}

export function ServicoFormDialog({ open, onClose, nuos, servico }: ServicoFormDialogProps) {
  const isProd = useAuthStore((s) => s.database) === 'PROD';
  const isEdit = !!servico;

  const addMut = useAddServico();
  const updateMut = useUpdateServico();
  const loading = addMut.isPending || updateMut.isPending;

  const [codprod, setCodprod] = useState<number | null>(null);
  const [prodDesc, setProdDesc] = useState('');
  const [qtd, setQtd] = useState('1');
  const [vlrunit, setVlrunit] = useState('');
  const [tempo, setTempo] = useState('');
  const [obs, setObs] = useState('');

  useEffect(() => {
    if (open) {
      setCodprod(servico?.CODPROD ?? null);
      setProdDesc(servico?.DESCRPROD ?? '');
      setQtd(servico?.QTD ? String(servico.QTD) : '1');
      setVlrunit(servico?.VLRUNIT ? String(servico.VLRUNIT) : '');
      setTempo(servico?.TEMPO ? String(servico.TEMPO) : '');
      setObs(servico?.OBSERVACAO ?? '');
    }
  }, [open, servico]);

  const vlrtot = (Number(qtd) || 0) * (Number(vlrunit) || 0);

  const handleSubmit = () => {
    if (!codprod) return;
    const data = {
      CODPROD: codprod,
      QTD: qtd ? Number(qtd) : undefined,
      VLRUNIT: vlrunit ? Number(vlrunit) : undefined,
      VLRTOT: vlrtot || undefined,
      TEMPO: tempo ? Number(tempo) : undefined,
      OBSERVACAO: obs || undefined,
    };

    if (isEdit && servico) {
      updateMut.mutate([nuos, servico.SEQUENCIA, data], { onSuccess: onClose });
    } else {
      addMut.mutate([nuos, data], { onSuccess: onClose });
    }
  };

  return (
    <CrudFormDialog
      open={open} onClose={onClose}
      title={isEdit ? `Editar Servico #${servico?.SEQUENCIA}` : 'Adicionar Servico'}
      onSubmit={handleSubmit} loading={loading} isProd={isProd} maxWidth="sm"
    >
      <Stack spacing={2} sx={{ mt: 1 }}>
        {isEdit ? (
          <TextField
            label="Produto / Servico" value={prodDesc || `#${codprod}`}
            disabled size="small" fullWidth
          />
        ) : (
          <ProdutoCombobox
            value={codprod}
            onChange={(id, desc) => { setCodprod(id); if (desc) setProdDesc(desc); }}
            required
          />
        )}
        <Stack direction="row" spacing={2}>
          <TextField
            label="Quantidade" value={qtd}
            onChange={(e) => setQtd(e.target.value)}
            type="number" fullWidth size="small"
            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
          />
          <TextField
            label="Valor Unitario (R$)" value={vlrunit}
            onChange={(e) => setVlrunit(e.target.value)}
            type="number" fullWidth size="small"
            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
          />
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, px: 0.5 }}>
          Total: R$ {vlrtot.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Typography>
        <TextField
          label="Tempo (minutos)" value={tempo}
          onChange={(e) => setTempo(e.target.value)}
          type="number" fullWidth size="small"
          slotProps={{ htmlInput: { min: 0 } }}
        />
        <TextField
          label="Observacao" value={obs}
          onChange={(e) => setObs(e.target.value)}
          multiline rows={2} fullWidth size="small"
        />
      </Stack>
    </CrudFormDialog>
  );
}
