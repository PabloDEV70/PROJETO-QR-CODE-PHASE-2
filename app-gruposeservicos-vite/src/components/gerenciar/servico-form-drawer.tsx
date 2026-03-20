import { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, TextField, Button,
  Stack, Alert, Chip, Tooltip, Divider,
} from '@mui/material';
import {
  Add, Edit, SwapHoriz, CheckCircle, Cancel,
} from '@mui/icons-material';
import type { ArvoreGrupo, ServicoItem } from '@/types/grupo-types';
import { GrupoPaiAutocomplete } from './grupo-pai-autocomplete';

export type ServicoDrawerMode = 'create' | 'edit' | 'move';

interface ServicoFormDrawerProps {
  open: boolean;
  onClose: () => void;
  mode: ServicoDrawerMode;
  /** Obrigatorio para edit/move, null para create */
  servico: ServicoItem | null;
  /** Grupo atual (usado como default no create) */
  currentGrupoCod: number | null;
  currentGrupoNome: string;
  arvore: ArvoreGrupo[];
  onCreate: (nome: string, codGrupo: number) => void;
  onSaveName: (codProd: number, nome: string) => void;
  onMove: (codProd: number, novoCodGrupo: number) => void;
  saving?: boolean;
}

const MODE_CONFIG: Record<ServicoDrawerMode, { title: string; color: string; btn: string }> = {
  create: { title: 'Novo Servico', color: 'success.main', btn: 'Criar' },
  edit: { title: 'Editar Servico', color: 'primary.main', btn: 'Salvar' },
  move: { title: 'Mover Servico', color: 'info.main', btn: 'Mover' },
};

const MODE_ICONS: Record<ServicoDrawerMode, typeof Add> = {
  create: Add,
  edit: Edit,
  move: SwapHoriz,
};

export function ServicoFormDrawer({
  open, onClose, mode, servico, currentGrupoCod, currentGrupoNome,
  arvore, onCreate, onSaveName, onMove, saving,
}: ServicoFormDrawerProps) {
  const [nome, setNome] = useState('');
  const [grupoCod, setGrupoCod] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    if (mode === 'create') {
      setNome('');
      setGrupoCod(currentGrupoCod);
    } else if (servico) {
      setNome(servico.descrProd);
      setGrupoCod(null);
    }
  }, [open, mode, servico, currentGrupoCod]);

  const cfg = MODE_CONFIG[mode];
  const IconComp = MODE_ICONS[mode];

  const isValid = (() => {
    if (mode === 'create') return nome.trim().length > 0 && grupoCod !== null && grupoCod > 0;
    if (mode === 'edit') return servico && nome.trim().length > 0 && nome.trim() !== servico.descrProd;
    if (mode === 'move') return servico && grupoCod !== null && grupoCod !== servico.codGrupoProd;
    return false;
  })();

  const handleSubmit = () => {
    if (!isValid) return;
    if (mode === 'create') {
      onCreate(nome.trim(), grupoCod!);
    } else if (mode === 'edit' && servico) {
      onSaveName(servico.codProd, nome.trim());
    } else if (mode === 'move' && servico) {
      onMove(servico.codProd, grupoCod!);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 420, p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
          <IconComp sx={{ color: cfg.color }} />
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: cfg.color }}>
            {cfg.title}
          </Typography>
        </Stack>

        {/* Grupo context */}
        {mode !== 'move' && currentGrupoNome && (
          <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 2 }}>
            Grupo: <b>{currentGrupoNome}</b>
            {currentGrupoCod && <> &middot; #{currentGrupoCod}</>}
          </Typography>
        )}
        {mode === 'move' && servico && (
          <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 2 }}>
            Grupo atual: #{servico.codGrupoProd}
          </Typography>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Codigo (edit/move only) */}
        {servico && mode !== 'create' && (
          <TextField
            label="Codigo"
            value={servico.codProd}
            size="small"
            disabled
            sx={{ mb: 2 }}
          />
        )}

        {/* Situacao (edit/move only) */}
        {servico && mode !== 'create' && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Situacao:</Typography>
            <Tooltip title={servico.ativo === 'S' ? 'Servico ativo' : 'Servico inativo'}>
              <Chip
                icon={servico.ativo === 'S' ? <CheckCircle sx={{ fontSize: '14px !important' }} /> : <Cancel sx={{ fontSize: '14px !important' }} />}
                label={servico.ativo === 'S' ? 'Ativo' : 'Inativo'}
                size="small"
                sx={{
                  height: 24, fontSize: 11, fontWeight: 600,
                  bgcolor: servico.ativo === 'S' ? 'success.light' : 'warning.light',
                  color: servico.ativo === 'S' ? 'success.dark' : 'warning.dark',
                  '& .MuiChip-icon': { color: servico.ativo === 'S' ? 'success.dark' : 'warning.dark' },
                }}
              />
            </Tooltip>
            {servico.utilizacoes > 0 && (
              <Tooltip title="Quantidade de utilizacoes em OS">
                <Chip label={`${servico.utilizacoes} uso(s) em OS`} size="small" sx={{ height: 24, fontSize: 11 }} />
              </Tooltip>
            )}
          </Stack>
        )}

        {/* Nome */}
        {mode === 'move' ? (
          <TextField
            label="Nome (somente leitura)"
            value={servico?.descrProd ?? ''}
            size="small"
            disabled
            sx={{ mb: 2 }}
          />
        ) : (
          <TextField
            label="Nome do servico"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            size="small"
            helperText={mode === 'create' ? 'Sera convertido para maiusculas' : undefined}
            sx={{ mb: 2 }}
          />
        )}

        {/* Grupo destino (create ou move) */}
        {(mode === 'create' || mode === 'move') && (
          <GrupoPaiAutocomplete
            arvore={arvore}
            value={grupoCod}
            onChange={setGrupoCod}
            label={mode === 'create' ? 'Grupo' : 'Novo Grupo'}
          />
        )}

        {mode === 'move' && (
          <Alert severity="warning" sx={{ mt: 2, fontSize: 12 }}>
            O servico sera movido para o grupo selecionado. Esta acao altera CODGRUPOPROD na TGFPRO.
          </Alert>
        )}

        <Box sx={{ flex: 1 }} />

        {/* Actions */}
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isValid || saving}
            color={mode === 'create' ? 'success' : mode === 'move' ? 'info' : 'primary'}
          >
            {saving ? 'Salvando...' : cfg.btn}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
