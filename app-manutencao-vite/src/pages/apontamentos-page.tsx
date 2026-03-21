import { useMemo, useCallback, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Build } from '@mui/icons-material';
import { ApontamentoSidebar } from '@/components/apontamento/apontamento-sidebar';
import { ApontamentoDetail } from '@/components/apontamento/apontamento-detail';
import { ApontamentoFormPage } from '@/components/apontamento/apontamento-form-page';
import { ApontamentoDeleteDialog } from '@/components/apontamento/apontamento-delete-dialog';
import { ServicoFormPage } from '@/components/apontamento/servico-form-page';
import { CrudDeleteDialog } from '@/components/shared/crud-delete-dialog';
import { ResizeHandle } from '@/components/shared/resize-handle';
import {
  useApontamentosList, useCreateApontamento, useUpdateApontamento,
  useDeleteApontamento, useAddServico, useUpdateServico, useDeleteServico,
  useApontamentoServicos,
} from '@/hooks/use-apontamentos';
import { useAuthStore } from '@/stores/auth-store';
import type {
  ApontamentoListItem, ApontamentoListParams, ApontamentoFormData,
  ServicoApontamento, ServicoFormData,
} from '@/types/apontamento-types';

const STORAGE_KEY = 'apontamentos-sidebar-width';
const DEFAULT_WIDTH = 340;
const MIN_WIDTH = 260;
const MAX_WIDTH = 500;

function getInitialWidth(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const n = Number(stored);
      if (n >= MIN_WIDTH && n <= MAX_WIDTH) return n;
    }
  } catch { /* ignore */ }
  return DEFAULT_WIDTH;
}

export function ApontamentosPage() {
  const [sp, setSp] = useSearchParams();
  const codusu = useAuthStore((s) => s.user?.codusu);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [sidebarWidth, setSidebarWidth] = useState(getInitialWidth);
  const handleResize = useCallback((delta: number) => {
    setSidebarWidth((prev) => {
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, prev + delta));
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // ── Full URL state ──
  const page = Number(sp.get('page')) || 1;
  const limit = Number(sp.get('limit')) || 25;
  const orderBy = sp.get('orderBy') || 'CODIGO';
  const orderDir = (sp.get('orderDir') || 'DESC') as 'ASC' | 'DESC';
  const statusOs = sp.get('statusOs') || '';
  const search = sp.get('search') || '';
  const selectedCodigo = Number(sp.get('codigo')) || null;
  const dialog = sp.get('dialog') || '';
  const editServicoSeq = Number(sp.get('seq')) || null;

  // dialog values: novo | editar | excluir | novoServico | editarServico | excluirServico
  const isFormView = dialog === 'novo' || dialog === 'editar';
  const isServicoFormView = dialog === 'novoServico' || dialog === 'editarServico';

  // Debounced search — input is local for responsiveness, URL updates on debounce
  const [searchInput, setSearchInput] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleSearchChange = useCallback((val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSp((prev) => {
        const next = new URLSearchParams(prev);
        if (val) { next.set('search', val); } else { next.delete('search'); }
        next.set('page', '1');
        return next;
      }, { replace: true });
    }, 400);
  }, [setSp]);

  const params: ApontamentoListParams = useMemo(() => ({
    page, limit, orderBy, orderDir,
    statusOs: statusOs || undefined,
    search: search || undefined,
  }), [page, limit, orderBy, orderDir, statusOs, search]);

  const { data, isLoading, refetch } = useApontamentosList(params);
  const createMut = useCreateApontamento();
  const updateMut = useUpdateApontamento();
  const deleteMut = useDeleteApontamento();
  const addServicoMut = useAddServico();
  const updateServicoMut = useUpdateServico();
  const deleteServicoMut = useDeleteServico();

  const selectedItem = useMemo<ApontamentoListItem | null>(() => {
    if (!selectedCodigo || !data?.data) return null;
    return data.data.find((i) => i.CODIGO === selectedCodigo) ?? null;
  }, [selectedCodigo, data?.data]);

  const { data: servicos } = useApontamentoServicos(selectedCodigo);
  const editingServico = useMemo<ServicoApontamento | null>(() => {
    if (!editServicoSeq || !servicos) return null;
    return servicos.find((s) => s.SEQ === editServicoSeq) ?? null;
  }, [editServicoSeq, servicos]);

  const deletingServico = useMemo<ServicoApontamento | null>(() => {
    if (dialog !== 'excluirServico' || !editServicoSeq || !servicos) return null;
    return servicos.find((s) => s.SEQ === editServicoSeq) ?? null;
  }, [dialog, editServicoSeq, servicos]);

  const update = useCallback((patch: Record<string, string | null>) => {
    setSp((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === '') next.delete(k); else next.set(k, v);
      }
      return next;
    }, { replace: true });
  }, [setSp]);

  const closeDialog = useCallback(() => {
    update({ dialog: null, seq: null });
  }, [update]);

  const handleSelect = useCallback((item: ApontamentoListItem) => {
    update({ codigo: String(item.CODIGO), dialog: null, seq: null });
  }, [update]);

  const handleDeselect = useCallback(() => {
    update({ codigo: null, dialog: null, seq: null });
  }, [update]);

  const handleStatusChange = useCallback((s: string) => {
    update({ statusOs: s || null, page: '1', codigo: null, dialog: null, seq: null });
  }, [update]);

  const handlePageChange = useCallback((p: number) => {
    update({ page: String(p), codigo: null, dialog: null, seq: null });
  }, [update]);

  // Mestre CRUD
  const handleCreateSubmit = useCallback((formData: ApontamentoFormData) => {
    createMut.mutate([formData, codusu], {
      onSuccess: () => { closeDialog(); refetch(); },
    });
  }, [createMut, codusu, closeDialog, refetch]);

  const handleEditSubmit = useCallback((formData: ApontamentoFormData) => {
    if (!selectedCodigo) return;
    updateMut.mutate([selectedCodigo, formData], {
      onSuccess: () => { closeDialog(); refetch(); },
    });
  }, [selectedCodigo, updateMut, closeDialog, refetch]);

  const handleDeleteConfirm = useCallback(() => {
    if (!selectedCodigo) return;
    deleteMut.mutate([selectedCodigo], {
      onSuccess: () => { update({ codigo: null, dialog: null, seq: null }); refetch(); },
    });
  }, [selectedCodigo, deleteMut, update, refetch]);

  // Detalhe CRUD
  const handleServicoSubmit = useCallback((formData: ServicoFormData) => {
    if (!selectedCodigo) return;
    if (dialog === 'editarServico' && editingServico) {
      updateServicoMut.mutate([selectedCodigo, editingServico.SEQ, formData], { onSuccess: closeDialog });
    } else {
      addServicoMut.mutate([selectedCodigo, formData], { onSuccess: closeDialog });
    }
  }, [selectedCodigo, dialog, editingServico, addServicoMut, updateServicoMut, closeDialog]);

  const handleDeleteServicoConfirm = useCallback(() => {
    if (!selectedCodigo || !deletingServico) return;
    deleteServicoMut.mutate([selectedCodigo, deletingServico.SEQ], { onSuccess: closeDialog });
  }, [selectedCodigo, deletingServico, deleteServicoMut, closeDialog]);

  // ── Content renderer ──
  function renderContent() {
    // Form inline (novo ou editar mestre)
    if (isFormView) {
      return (
        <ApontamentoFormPage
          onSubmit={dialog === 'editar' ? handleEditSubmit : handleCreateSubmit}
          onCancel={closeDialog}
          loading={createMut.isPending || updateMut.isPending}

          editingItem={dialog === 'editar' ? selectedItem : null}
        />
      );
    }

    // Detail view (with optional servico form override)
    if (selectedItem) {
      const servicoFormOverride = isServicoFormView ? (
        <ServicoFormPage
          codigoApontamento={selectedItem.CODIGO}
          codveiculo={selectedItem.CODVEICULO}
          onSubmit={handleServicoSubmit}
          onCancel={closeDialog}
          loading={addServicoMut.isPending || updateServicoMut.isPending}
          editingItem={dialog === 'editarServico' ? editingServico : null}
        />
      ) : undefined;

      return (
        <ApontamentoDetail
          item={selectedItem}
          onEditMestre={() => update({ dialog: 'editar' })}
          onDeleteMestre={() => update({ dialog: 'excluir' })}
          onAddServico={() => update({ dialog: 'novoServico', seq: null })}
          onEditServico={(s) => update({ dialog: 'editarServico', seq: String(s.SEQ) })}
          onDeleteServico={(s) => update({ dialog: 'excluirServico', seq: String(s.SEQ) })}
          contentOverride={servicoFormOverride}
        />
      );
    }

    // Empty state
    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <Build sx={{ fontSize: 48, color: 'text.disabled' }} />
        <Typography sx={{ fontSize: 14, color: 'text.disabled' }}>Selecione um apontamento na lista</Typography>
      </Box>
    );
  }

  // ── Dialogs (apenas deletes) ──
  function renderDialogs() {
    return (
      <>
        <ApontamentoDeleteDialog
          open={dialog === 'excluir'}
          onClose={closeDialog}
          onConfirm={handleDeleteConfirm}
          loading={deleteMut.isPending}
          item={selectedItem}
        />
        <CrudDeleteDialog
          open={dialog === 'excluirServico'}
          onClose={closeDialog}
          onConfirm={handleDeleteServicoConfirm}
          loading={deleteServicoMut.isPending}
          itemName={deletingServico ? `Servico #${deletingServico.SEQ}` : ''}

        />
      </>
    );
  }

  // Mobile
  if (isMobile) {
    if (isFormView || selectedItem) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {!isFormView && (
            <Box
              sx={{ px: 1.5, py: 0.75, borderBottom: '1px solid', borderColor: 'divider', cursor: 'pointer', bgcolor: 'action.hover' }}
              onClick={handleDeselect}
            >
              <Typography sx={{ fontSize: 12, color: 'primary.main', fontWeight: 600 }}>← Voltar para lista</Typography>
            </Box>
          )}
          {renderContent()}
          {renderDialogs()}
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <ApontamentoSidebar
          items={data?.data ?? []} total={data?.total ?? 0} isLoading={isLoading}
          selectedId={null} onSelect={handleSelect}
          onAdd={() => update({ dialog: 'novo', codigo: null })}
          onRefresh={() => refetch()}
          statusOs={statusOs} onStatusChange={handleStatusChange}
          page={page} limit={limit} onPageChange={handlePageChange}
          search={searchInput} onSearchChange={handleSearchChange}
        />
        {renderDialogs()}
      </Box>
    );
  }

  // Desktop
  return (
    <Box sx={{ display: 'flex', height: 'calc(100dvh - 64px)', overflow: 'hidden' }}>
      <ApontamentoSidebar
        items={data?.data ?? []} total={data?.total ?? 0} isLoading={isLoading}
        selectedId={selectedCodigo} onSelect={handleSelect}
        onAdd={() => update({ dialog: 'novo', codigo: null })}
        onRefresh={() => refetch()}
        statusOs={statusOs} onStatusChange={handleStatusChange}
        page={page} limit={limit} onPageChange={handlePageChange}
        width={sidebarWidth}
        search={searchInput} onSearchChange={handleSearchChange}
      />

      <ResizeHandle onResize={handleResize} />

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {renderContent()}
      </Box>

      {renderDialogs()}
    </Box>
  );
}
