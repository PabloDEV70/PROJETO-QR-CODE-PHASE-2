import { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, TextField, Button,
  Stack, Alert, Chip, CircularProgress, Divider,
} from '@mui/material';
import { Add, Edit, AutoFixHigh, FolderOpen } from '@mui/icons-material';
import type { ArvoreGrupo } from '@/types/grupo-types';
import { GrupoPaiAutocomplete } from './grupo-pai-autocomplete';
import { getNextCodGrupo } from '@/api/grupos-mutation';

interface GrupoFormDrawerProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  arvore: ArvoreGrupo[];
  editGrupo?: ArvoreGrupo | null;
  defaultPaiCod?: number | null;
  onSave: (data: { codGrupoProd?: number; descr: string; codGrupoPai: number | null }) => void;
  saving?: boolean;
}

export function GrupoFormDrawer({
  open, onClose, mode, arvore, editGrupo, defaultPaiCod, onSave, saving,
}: GrupoFormDrawerProps) {
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [codPai, setCodPai] = useState<number | null>(null);
  const [sugestao, setSugestao] = useState<number | null>(null);
  const [loadingSugestao, setLoadingSugestao] = useState(false);

  useEffect(() => {
    if (!open || mode !== 'create') return;
    setLoadingSugestao(true);
    getNextCodGrupo(codPai ?? undefined)
      .then((res) => {
        setSugestao(res.sugestao);
        if (!codigo) setCodigo(String(res.sugestao));
      })
      .catch(() => setSugestao(null))
      .finally(() => setLoadingSugestao(false));
  }, [open, mode, codPai]);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && editGrupo) {
      setCodigo(String(editGrupo.codGrupoProd));
      setNome(editGrupo.descrGrupoProd);
      setCodPai(editGrupo.codGrupoPai === -999999999 ? null : editGrupo.codGrupoPai);
      setSugestao(null);
    } else {
      setCodigo('');
      setNome('');
      setCodPai(defaultPaiCod ?? null);
      setSugestao(null);
    }
  }, [open, mode, editGrupo, defaultPaiCod]);

  const codigoNum = Number(codigo);
  const nomeLen = nome.trim().length;
  const isCreate = mode === 'create';

  const isValid = isCreate
    ? codigo.trim().length > 0 && codigoNum > 0 && nomeLen > 0 && nomeLen <= 30
    : nomeLen > 0 && nomeLen <= 30;

  const handleSubmit = () => {
    if (!isValid) return;
    onSave({
      codGrupoProd: isCreate ? codigoNum : undefined,
      descr: nome.trim(),
      codGrupoPai: codPai,
    });
  };

  // Find parent name for display
  const findGrupoNome = (cod: number | null): string | null => {
    if (!cod) return null;
    function find(nodes: ArvoreGrupo[]): string | null {
      for (const n of nodes) {
        if (n.codGrupoProd === cod) return n.descrGrupoProd;
        const f = find(n.children);
        if (f) return f;
      }
      return null;
    }
    return find(arvore);
  };

  const paiNome = findGrupoNome(codPai);
  const title = isCreate ? 'Novo Grupo' : 'Editar Grupo';

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 420, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ px: 3, py: 2, bgcolor: isCreate ? 'success.main' : 'primary.main', color: '#fff' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            {isCreate ? <Add /> : <Edit />}
            <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{title}</Typography>
          </Stack>
          {isCreate && paiNome && (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5, opacity: 0.85 }}>
              <FolderOpen sx={{ fontSize: 14 }} />
              <Typography sx={{ fontSize: 12 }}>Subgrupo de: {paiNome}</Typography>
            </Stack>
          )}
          {!isCreate && editGrupo && (
            <Typography sx={{ fontSize: 12, mt: 0.3, opacity: 0.85, fontFamily: 'monospace' }}>
              Codigo {editGrupo.codGrupoProd} · Grau {editGrupo.grau}
            </Typography>
          )}
        </Box>

        {/* Form */}
        <Box sx={{ px: 3, py: 2.5, flex: 1, overflow: 'auto' }}>
          {/* Grupo Pai */}
          {isCreate && (
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.5, color: 'text.secondary' }}>
                GRUPO PAI
              </Typography>
              <GrupoPaiAutocomplete
                arvore={arvore}
                value={codPai}
                onChange={(v) => { setCodPai(v); setCodigo(''); }}
                excludeCodGrupo={editGrupo?.codGrupoProd}
                helperText={codPai ? undefined : 'Sem pai = grupo raiz (nivel 1)'}
              />
            </Box>
          )}

          <Divider sx={{ mb: 2.5 }} />

          {/* Codigo */}
          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.5, color: 'text.secondary' }}>
              CODIGO DO GRUPO
            </Typography>
            <TextField
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
              size="small"
              fullWidth
              disabled={!isCreate}
              placeholder={isCreate ? 'Ex: 10201' : undefined}
              helperText={
                isCreate
                  ? 'Codigo numerico unico no Sankhya. Deve seguir a hierarquia (ex: pai 101 → filho 10101).'
                  : 'O codigo nao pode ser alterado apos criacao.'
              }
              slotProps={{
                input: {
                  endAdornment: isCreate && sugestao && !loadingSugestao ? (
                    <Chip
                      icon={<AutoFixHigh sx={{ fontSize: '14px !important' }} />}
                      label={`Usar ${sugestao}`}
                      size="small"
                      onClick={() => setCodigo(String(sugestao))}
                      color="primary"
                      variant="outlined"
                      sx={{ fontSize: 11, height: 24, cursor: 'pointer' }}
                    />
                  ) : loadingSugestao ? (
                    <CircularProgress size={16} />
                  ) : undefined,
                },
              }}
              error={isCreate && codigo.length > 0 && codigoNum <= 0}
            />
          </Box>

          {/* Nome */}
          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.5, color: 'text.secondary' }}>
              NOME DO GRUPO
            </Typography>
            <TextField
              value={nome}
              onChange={(e) => setNome(e.target.value.slice(0, 30))}
              size="small"
              fullWidth
              autoFocus
              placeholder="Ex: RETIFICA MOTORES"
              helperText={`${nomeLen}/30 caracteres. Sera salvo em MAIUSCULAS.`}
              error={nomeLen > 30}
            />
          </Box>

          {/* Resumo */}
          {isCreate && isValid && (
            <Alert severity="success" sx={{ fontSize: 12 }}>
              <strong>Resumo:</strong> Grupo {codigo} "{nome.trim().toUpperCase()}"
              {paiNome ? ` dentro de "${paiNome}"` : ' como grupo raiz'}.
              Sera criado como ATIVO.
            </Alert>
          )}

          {!isCreate && (
            <Alert severity="info" sx={{ fontSize: 12 }}>
              Apenas o nome pode ser alterado. O codigo e a hierarquia sao fixos.
            </Alert>
          )}
        </Box>

        {/* Footer */}
        <Divider />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isValid || saving}
            color={isCreate ? 'success' : 'primary'}
          >
            {saving ? 'Salvando...' : isCreate ? 'Criar Grupo' : 'Salvar'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
