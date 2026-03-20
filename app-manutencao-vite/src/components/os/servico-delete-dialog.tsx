import { CrudDeleteDialog } from '@/components/shared/crud-delete-dialog';
import { useDeleteServico } from '@/hooks/use-os-mutations';
import { useAuthStore } from '@/stores/auth-store';
import type { ServicoOs } from '@/types/os-types';

interface ServicoDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  nuos: number;
  servico: ServicoOs | null;
}

export function ServicoDeleteDialog({ open, onClose, nuos, servico }: ServicoDeleteDialogProps) {
  const isProd = useAuthStore((s) => s.database) === 'PROD';
  const deleteMut = useDeleteServico();

  const handleConfirm = () => {
    if (!servico) return;
    deleteMut.mutate([nuos, servico.SEQUENCIA], { onSuccess: onClose });
  };

  return (
    <CrudDeleteDialog
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      loading={deleteMut.isPending}
      itemName={servico?.DESCRPROD ?? `Servico #${servico?.SEQUENCIA ?? '?'}`}
      isProd={isProd}
    />
  );
}
