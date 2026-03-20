import { CrudDeleteDialog } from '@/components/shared/crud-delete-dialog';
import type { ApontamentoListItem } from '@/types/apontamento-types';

interface ApontamentoDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  isProd?: boolean;
  item: ApontamentoListItem | null;
}

export function ApontamentoDeleteDialog({
  open, onClose, onConfirm, loading = false, isProd = false, item,
}: ApontamentoDeleteDialogProps) {
  const name = item
    ? `Apontamento #${item.CODIGO}${item.TAG ? ` - ${item.TAG}` : ''}`
    : '';

  return (
    <CrudDeleteDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      loading={loading}
      itemName={name}
      isProd={isProd}
    />
  );
}
