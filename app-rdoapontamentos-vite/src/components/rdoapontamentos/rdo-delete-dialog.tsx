import { CrudDeleteDialog } from '@/components/shared/crud-delete-dialog';
import { useDeleteRdo, useWriteGuard } from '@/hooks/use-rdo-mutations';
import type { RdoCabecalho } from '@/types/rdo-types';

interface RdoDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  rdo: RdoCabecalho | null;
}

export function RdoDeleteDialog({ open, onClose, rdo }: RdoDeleteDialogProps) {
  const { blocked: isProd } = useWriteGuard();
  const deleteMut = useDeleteRdo();

  const handleConfirm = () => {
    if (!rdo) return;
    deleteMut.mutate(rdo.CODRDO, { onSuccess: onClose });
  };

  const label = rdo
    ? `RDO #${rdo.CODRDO} - ${rdo.nomeparc ?? 'Sem nome'}`
    : '';

  return (
    <CrudDeleteDialog
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      loading={deleteMut.isPending}
      itemName={label}
      isProd={isProd}
    />
  );
}
