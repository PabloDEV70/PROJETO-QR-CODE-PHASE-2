import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Stack, Paper, Chip, alpha, CircularProgress,
  TextField, InputAdornment, Autocomplete,
} from '@mui/material';
import { Search, Inventory } from '@mui/icons-material';
import { useProdutosBusca, useGruposProduto, useProdutoFull, useProdutoEstoque, useProdutoVeiculos } from '@/hooks/use-locais';
import { getProdutoImagemUrl } from '@/api/locais';

export function ProdutosPage() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get('q') ?? '';
  const grupo = sp.get('grupo') ?? '';
  const selectedCod = sp.get('cod') ? Number(sp.get('cod')) : null;

  const { data: produtos, isLoading } = useProdutosBusca({ q: q || undefined, grupo: grupo || undefined, limit: 50 });
  const { data: grupos } = useGruposProduto();
  const { data: detalhe } = useProdutoFull(selectedCod);
  const { data: estoque } = useProdutoEstoque(selectedCod);
  const { data: veiculos } = useProdutoVeiculos(selectedCod);

  const setParam = (key: string, val: string) => {
    setSp((prev) => { const n = new URLSearchParams(prev); if (val) n.set(key, val); else n.delete(key); return n; }, { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* Lista de produtos */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Produtos</Typography>
          <TextField
            value={q} onChange={(e) => setParam('q', e.target.value)}
            placeholder="Buscar por nome, codigo, marca..."
            size="small" sx={{ flex: 1, maxWidth: 400, '& .MuiInputBase-root': { height: 32, fontSize: 12 } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16 }} /></InputAdornment> } }}
          />
          {grupos && (
            <Autocomplete
              size="small"
              options={grupos}
              value={grupos.find((g) => g.NOME === grupo) ?? null}
              onChange={(_, v) => setParam('grupo', v?.NOME ?? '')}
              getOptionLabel={(g) => `${g.NOME} (${g.QTD})`}
              renderInput={(params) => <TextField {...params} placeholder="Grupo..." />}
              sx={{ width: 220, '& .MuiInputBase-root': { height: 32, fontSize: 12 } }}
            />
          )}
          {produtos && <Chip label={`${produtos.length} resultados`} size="small" sx={{ fontWeight: 700 }} />}
        </Stack>

        <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
          {isLoading && <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>}
          {produtos?.map((p) => (
            <Paper key={p.CODPROD}
              onClick={() => setParam('cod', String(p.CODPROD))}
              variant="outlined"
              sx={{
                p: 1.5, mb: 1, borderRadius: 1.5, cursor: 'pointer',
                border: selectedCod === p.CODPROD ? '2px solid' : '1px solid',
                borderColor: selectedCod === p.CODPROD ? 'primary.main' : 'divider',
                '&:hover': { borderColor: 'primary.light' },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  component="img"
                  src={getProdutoImagemUrl(p.CODPROD)}
                  onError={(e: any) => { e.target.style.display = 'none'; }}
                  sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'cover', bgcolor: 'action.hover' }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>{p.DESCRPROD}</Typography>
                  <Stack direction="row" spacing={0.75} sx={{ mt: 0.25 }}>
                    <Typography sx={{ fontSize: 10, fontFamily: 'monospace', color: 'text.disabled' }}>#{p.CODPROD}</Typography>
                    {p.MARCA && <Chip label={p.MARCA} size="small" sx={{ height: 16, fontSize: 9 }} />}
                    {p.GRUPO && <Chip label={p.GRUPO} size="small" variant="outlined" sx={{ height: 16, fontSize: 9 }} />}
                  </Stack>
                </Box>
                {p.UNIDADE && <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{p.UNIDADE}</Typography>}
              </Stack>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Painel de detalhe */}
      {selectedCod && detalhe && (
        <Box sx={{ width: 360, flexShrink: 0, borderLeft: '1px solid', borderColor: 'divider', overflowY: 'auto', p: 2 }}>
          <Box
            component="img"
            src={getProdutoImagemUrl(selectedCod)}
            onError={(e: any) => { e.target.style.display = 'none'; }}
            sx={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 2, bgcolor: 'action.hover', mb: 2 }}
          />
          <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 0.5 }}>{detalhe.DESCRPROD}</Typography>
          <Typography sx={{ fontSize: 11, fontFamily: 'monospace', color: 'text.disabled', mb: 1.5 }}>#{detalhe.CODPROD}</Typography>

          {detalhe.COMPLDESC && <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 2 }}>{detalhe.COMPLDESC}</Typography>}

          <Stack spacing={1} sx={{ mb: 2 }}>
            {detalhe.DESCRGRUPOPROD && <Field label="Grupo" value={detalhe.DESCRGRUPOPROD} />}
            {detalhe.MARCA && <Field label="Marca" value={detalhe.MARCA} />}
            {detalhe.REFERENCIA && <Field label="Referencia" value={detalhe.REFERENCIA} />}
            {detalhe.CODVOL && <Field label="Unidade" value={detalhe.CODVOL} />}
            {detalhe.NCM && <Field label="NCM" value={detalhe.NCM} />}
            {detalhe.LOCALIZACAO && <Field label="Localizacao" value={detalhe.LOCALIZACAO} />}
            {(detalhe as any).estoqueTotal != null && (
              <Field label="Estoque Total" value={`${(detalhe as any).estoqueTotal} (${(detalhe as any).qtdLocais} locais)`} />
            )}
          </Stack>

          {/* Estoque por local */}
          {estoque && estoque.length > 0 && (
            <>
              <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1, textTransform: 'uppercase', color: 'text.secondary' }}>
                Estoque por Local ({estoque.length})
              </Typography>
              {estoque.map((e, i) => (
                <Paper key={i} variant="outlined" sx={{ p: 1, mb: 0.5, borderRadius: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: 11, fontWeight: 500 }}>{e.NOMELOCAL}</Typography>
                    <Stack direction="row" spacing={1}>
                      <Typography sx={{ fontSize: 13, fontWeight: 800, fontFamily: 'monospace', color: '#2e7d32' }}>{e.ESTOQUE}</Typography>
                      {e.RESERVADO > 0 && <Typography sx={{ fontSize: 11, fontFamily: 'monospace', color: '#ed6c02' }}>R:{e.RESERVADO}</Typography>}
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </>
          )}

          {/* Veiculos que usam este produto */}
          {veiculos && veiculos.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1, textTransform: 'uppercase', color: 'text.secondary' }}>
                Veiculos ({veiculos.length})
              </Typography>
              {veiculos.slice(0, 10).map((v) => (
                <Chip key={v.CODVEICULO} label={`${v.PLACA} ${v.AD_TAG ?? ''}`} size="small"
                  sx={{ mr: 0.5, mb: 0.5, fontSize: 10, fontWeight: 600, fontFamily: 'monospace' }} />
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

function Field({ label, value }: { label: string; value: unknown }) {
  if (!value) return null;
  return (
    <Box>
      <Typography sx={{ fontSize: 10, color: 'text.disabled', textTransform: 'uppercase' }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{String(value)}</Typography>
    </Box>
  );
}
