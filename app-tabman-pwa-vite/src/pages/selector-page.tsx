import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Box, Typography, Skeleton, IconButton } from '@mui/material';
import { ArrowBack, Settings } from '@mui/icons-material';
import { useSessionStore } from '@/stores/session-store';
import { useColaboradores } from '@/hooks/use-colaboradores';
import { useAtividadesAtivas } from '@/hooks/use-atividades-ativas';
import { ColaboradorGridView } from '@/components/selector/colaborador-grid';
import { PinDialog } from '@/components/selector/pin-dialog';
import type { ColaboradorGrid } from '@/types/funcionario-types';

interface OutletCtx { search: string; setSearch: (v: string) => void }

function LoadingSkeleton() {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 1.25 }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <Skeleton key={i} variant="rounded" sx={{ borderRadius: 3, aspectRatio: '1 / 1' }} />
      ))}
    </Box>
  );
}

export function SelectorPage() {
  const navigate = useNavigate();
  const startSession = useSessionStore((s) => s.startSession);
  const { data: colaboradores, isLoading } = useColaboradores();
  const { mapa: atividades } = useAtividadesAtivas();
  const ctx = useOutletContext<OutletCtx | undefined>();
  const search = ctx?.search ?? '';
  const [pinTarget, setPinTarget] = useState<ColaboradorGrid | null>(null);

  const filtered = useMemo(() => {
    if (!colaboradores) return [];
    const query = search.trim();
    if (!query) return colaboradores;
    const isDigits = /^\d+$/.test(query);
    if (isDigits) return colaboradores.filter((c) => String(c.codparc).includes(query));
    return colaboradores.filter((c) => c.nomeparc.toLowerCase().includes(query.toLowerCase()));
  }, [colaboradores, search]);

  const handleSelect = useCallback((_codparc: number, _nome: string) => {
    const colab = colaboradores?.find((c) => c.codparc === _codparc);
    if (colab) setPinTarget(colab);
  }, [colaboradores]);

  const handlePinConfirm = useCallback(() => {
    if (!pinTarget) return;
    startSession(pinTarget.codparc, pinTarget.nomeparc);
    setPinTarget(null);
    navigate(`/apontar/${pinTarget.codparc}`);
  }, [pinTarget, startSession, navigate]);

  return (
    <>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <IconButton onClick={() => navigate('/')} size="small">
          <ArrowBack sx={{ fontSize: 18 }} />
        </IconButton>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Selecionar colaborador</Typography>
      </Box>

      {isLoading && <LoadingSkeleton />}

      {!isLoading && filtered.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <Typography color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            {search ? `Nenhum resultado para "${search}"` : 'Nenhum colaborador disponivel'}
          </Typography>
        </Box>
      )}

      {!isLoading && filtered.length > 0 && (
        <ColaboradorGridView
          colaboradores={filtered}
          onSelect={handleSelect}
          atividades={atividades}
        />
      )}

      {/* Footer count */}
      {!isLoading && filtered.length > 0 && (
        <Typography sx={{
          textAlign: 'center', color: 'text.disabled', fontSize: '0.7rem',
          fontWeight: 500, py: 1,
        }}>
          {filtered.length} colaborador{filtered.length !== 1 ? 'es' : ''}
        </Typography>
      )}

      <PinDialog
        open={!!pinTarget}
        colaborador={pinTarget}
        onConfirm={handlePinConfirm}
        onClose={() => setPinTarget(null)}
      />

      <IconButton
        onClick={() => navigate('/configuracoes')}
        size="small"
        sx={{
          position: 'fixed', bottom: 12, right: 12,
          bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
          width: 36, height: 36,
        }}
      >
        <Settings sx={{ fontSize: 18 }} />
      </IconButton>
    </>
  );
}
