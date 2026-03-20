import { useState, useMemo } from 'react';
import {
  Box, TextField, Button, Typography, Paper, Alert, IconButton,
  Stack, Chip, InputAdornment, Snackbar, Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, ContentCopy, Security, VpnKey } from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { UsuarioSidebar } from '@/components/usuarios/usuario-sidebar';
import type { UsuarioSearch } from '@/api/usuarios';
import { md5 } from '@/utils/md5';

export function PasswordGeneratorPage() {
  const [ativo, setAtivo] = useState<'S' | 'N'>('S');
  const [selected, setSelected] = useState<UsuarioSearch | null>(null);
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [hash, setHash] = useState('');
  const [snackMsg, setSnackMsg] = useState('');

  const senhaValida = senha.length >= 6 && senha === confirmar && !!selected;

  const sqlUpdate = useMemo(() => {
    if (!hash || !selected) return '';
    const escaped = selected.nomeusu.replace(/'/g, "''");
    return `UPDATE TSIUSU\nSET INTERNO = '${hash}'\nWHERE CODUSU = ${selected.codusu}\nAND NOMEUSU = '${escaped}';`;
  }, [hash, selected]);

  function handleSelect(u: UsuarioSearch) {
    setSelected(u);
    setSenha(''); setConfirmar(''); setHash('');
  }

  function handleAtivoChange(v: 'S' | 'N') {
    setAtivo(v);
    setSelected(null);
    setSenha(''); setConfirmar(''); setHash('');
  }

  function gerarHash() {
    if (!selected || !senhaValida) return;
    setHash(md5((selected.nomeusu + senha).trim()));
  }

  async function copiar(text: string) {
    await navigator.clipboard.writeText(text);
    setSnackMsg('Copiado!');
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      <Paper
        variant="outlined"
        sx={{ width: 300, minWidth: 300, borderRadius: 0, borderTop: 0, borderBottom: 0, borderLeft: 0 }}
      >
        <UsuarioSidebar
          selectedId={selected?.codusu ?? null}
          ativo={ativo}
          onSelect={handleSelect}
          onAtivoChange={handleAtivoChange}
        />
      </Paper>

      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <Alert severity="warning" icon={<Security />} sx={{ mb: 3 }}>
          <Typography variant="subtitle2">Ferramenta administrativa</Typography>
          <Typography variant="body2">
            Gera hash MD5 e instrucao SQL. NAO executa alteracoes no banco.
          </Typography>
        </Alert>

        {!selected ? (
          <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
            <VpnKey sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
            <Typography variant="h6">Selecione um usuario</Typography>
            <Typography variant="body2">Clique em um usuario na lista lateral</Typography>
          </Box>
        ) : (
          <SelectedUserPanel
            selected={selected}
            senha={senha}
            confirmar={confirmar}
            showSenha={showSenha}
            senhaValida={senhaValida}
            hash={hash}
            sqlUpdate={sqlUpdate}
            onSenhaChange={(v) => { setSenha(v); setHash(''); }}
            onConfirmarChange={(v) => { setConfirmar(v); setHash(''); }}
            onToggleShowSenha={() => setShowSenha(!showSenha)}
            onGerarHash={gerarHash}
            onCopiar={copiar}
          />
        )}
      </Box>

      <Snackbar open={!!snackMsg} autoHideDuration={2000} onClose={() => setSnackMsg('')} message={snackMsg} />
    </Box>
  );
}

interface SelectedUserPanelProps {
  selected: UsuarioSearch;
  senha: string;
  confirmar: string;
  showSenha: boolean;
  senhaValida: boolean;
  hash: string;
  sqlUpdate: string;
  onSenhaChange: (v: string) => void;
  onConfirmarChange: (v: string) => void;
  onToggleShowSenha: () => void;
  onGerarHash: () => void;
  onCopiar: (text: string) => void;
}

function SelectedUserPanel({
  selected, senha, confirmar, showSenha, senhaValida,
  hash, sqlUpdate,
  onSenhaChange, onConfirmarChange, onToggleShowSenha, onGerarHash, onCopiar,
}: SelectedUserPanelProps) {
  return (
    <Stack spacing={3} sx={{ maxWidth: 560 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FuncionarioAvatar
            codparc={selected.codparc}
            codemp={selected.codemp ?? undefined}
            codfunc={selected.codfunc ?? undefined}
            nome={selected.nomeparc}
            size="large"
          />
          <Box flex={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              {selected.nomeparc || selected.nomeusu}
              <Typography component="span" variant="body2" color="text.secondary" ml={1}>
                ({selected.nomeusu})
              </Typography>
            </Typography>
            <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap" useFlexGap>
              <Chip label={`CODUSU: ${selected.codusu}`} size="small" />
              {selected.nomegrupo && <Chip label={selected.nomegrupo} size="small" color="info" />}
              {selected.nomeempresa && (
                <Chip label={selected.nomeempresa} size="small" variant="outlined" />
              )}
              {selected.email && <Chip label={selected.email} size="small" variant="outlined" />}
              <Chip
                label={selected.ativo === 'S' ? 'Ativo' : 'Inativo'}
                size="small"
                color={selected.ativo === 'S' ? 'success' : 'default'}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Divider />

      <Stack spacing={2}>
        <TextField
          label="Nova Senha"
          type={showSenha ? 'text' : 'password'}
          value={senha}
          onChange={(e) => onSenhaChange(e.target.value)}
          error={senha.length > 0 && senha.length < 6}
          helperText={senha.length > 0 && senha.length < 6 ? 'Minimo 6 caracteres' : ''}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={onToggleShowSenha} edge="end" size="small">
                    {showSenha ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          label="Confirmar Senha"
          type={showSenha ? 'text' : 'password'}
          value={confirmar}
          onChange={(e) => onConfirmarChange(e.target.value)}
          error={confirmar.length > 0 && confirmar !== senha}
          helperText={confirmar.length > 0 && confirmar !== senha ? 'Senhas nao coincidem' : ''}
        />
      </Stack>

      <Button variant="contained" onClick={onGerarHash} disabled={!senhaValida} startIcon={<Security />}>
        Gerar Hash e SQL
      </Button>

      {hash && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">Hash MD5</Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                  {hash}
                </Typography>
                <IconButton size="small" onClick={() => onCopiar(hash)}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">SQL UPDATE</Typography>
              <Stack direction="row" alignItems="flex-start" spacing={1}>
                <Box
                  component="pre"
                  sx={{
                    fontFamily: 'monospace', fontSize: 13, m: 0, flex: 1,
                    bgcolor: 'action.hover', p: 1.5, borderRadius: 1, whiteSpace: 'pre-wrap',
                  }}
                >
                  {sqlUpdate}
                </Box>
                <IconButton size="small" onClick={() => onCopiar(sqlUpdate)}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
