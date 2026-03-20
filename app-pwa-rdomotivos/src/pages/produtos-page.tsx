import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Typography, TextField, InputAdornment, Chip, CircularProgress,
  Card, CardActionArea, Collapse, alpha, Skeleton, LinearProgress,
} from '@mui/material';
import {
  Search, Inventory2, Close, ExpandMore, DirectionsCar, LocalShipping,
} from '@mui/icons-material';
import {
  useProdutos, useGruposProduto, useProdutoFull,
  useEstoqueProduto, usePlacasProduto,
} from '@/hooks/use-produtos';
import { ProdutoThumb } from '@/components/shared/produto-thumb';
import type { ProdutoBusca, ProdutoEstoque, ProdutoPlaca } from '@/types/produto-types';

export default function ProdutosPage() {
  const [sp, setSp] = useSearchParams();
  const [search, setSearch] = useState(sp.get('q') ?? '');
  const [grupo, setGrupo] = useState(sp.get('grupo') ?? '');
  const [expanded, setExpanded] = useState<number | null>(
    sp.get('prod') ? Number(sp.get('prod')) : null,
  );

  const deferredSearch = useDeferredValue(search);
  const isStale = deferredSearch !== search;

  useEffect(() => {
    const p: Record<string, string> = {};
    if (deferredSearch) p.q = deferredSearch;
    if (grupo) p.grupo = grupo;
    if (expanded) p.prod = String(expanded);
    setSp(p, { replace: true });
  }, [deferredSearch, grupo, expanded, setSp]);

  const { data: produtos, isLoading, isFetching } = useProdutos(deferredSearch, grupo);
  const { data: grupos } = useGruposProduto();
  const topGrupos = useMemo(() => (grupos ?? []).slice(0, 12), [grupos]);

  return (
    <Box sx={{ pb: 10 }}>
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
          Consulta de Produtos
        </Typography>
        <TextField
          fullWidth size="small" placeholder="Buscar por nome, codigo, referencia..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  {(isStale || isFetching) ? (
                    <CircularProgress size={16} />
                  ) : (
                    <Close
                      sx={{ fontSize: 18, cursor: 'pointer', color: 'text.secondary' }}
                      onClick={() => setSearch('')}
                    />
                  )}
                </InputAdornment>
              ) : null,
            },
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
      </Box>

      {/* Group chips — horizontal scroll */}
      <Box sx={{
        px: 2, pb: 1.5, display: 'flex', gap: 0.75,
        overflowX: 'auto', WebkitOverflowScrolling: 'touch',
        '&::-webkit-scrollbar': { display: 'none' },
      }}>
        {grupo && (
          <Chip
            label="Todos" size="small" variant="outlined"
            onClick={() => setGrupo('')}
            sx={{ fontWeight: 600, fontSize: 11, flexShrink: 0 }}
          />
        )}
        {topGrupos.map((g) => (
          <Chip
            key={g.CODGRUPOPROD}
            label={`${g.nome} (${g.qtd})`}
            size="small"
            variant={grupo === String(g.CODGRUPOPROD) ? 'filled' : 'outlined'}
            color={grupo === String(g.CODGRUPOPROD) ? 'primary' : 'default'}
            onClick={() => setGrupo(
              grupo === String(g.CODGRUPOPROD) ? '' : String(g.CODGRUPOPROD),
            )}
            sx={{ fontWeight: 600, fontSize: 11, flexShrink: 0 }}
          />
        ))}
      </Box>

      {isFetching && <LinearProgress sx={{ mx: 2, borderRadius: 1 }} />}

      {isLoading && !produtos ? (
        <Box sx={{ px: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      ) : !produtos?.length ? (
        <EmptyState hasSearch={!!deferredSearch || !!grupo} />
      ) : (
        <Box sx={{ px: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {produtos.map((p) => (
            <ProdutoCard
              key={p.CODPROD}
              produto={p}
              isExpanded={expanded === p.CODPROD}
              onToggle={() => setExpanded(expanded === p.CODPROD ? null : p.CODPROD)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
      <Inventory2 sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
      <Typography color="text.secondary" fontWeight={500}>
        {hasSearch ? 'Nenhum produto encontrado' : 'Digite pelo menos 2 caracteres ou selecione um grupo'}
      </Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Product card — lightweight, no estoque in list
// ---------------------------------------------------------------------------
function ProdutoCard({ produto: p, isExpanded, onToggle }: {
  produto: ProdutoBusca; isExpanded: boolean; onToggle: () => void;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <CardActionArea onClick={onToggle} sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <ProdutoThumb codProd={p.CODPROD} temImagem={p.temImagem} size={52} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.15 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', fontFamily: 'monospace' }}>
                #{p.CODPROD}
              </Typography>
              {p.unidade && (
                <Chip label={p.unidade} size="small" sx={{ height: 16, fontSize: 10, fontWeight: 700 }} />
              )}
              {p.grupo && (
                <Typography sx={{ fontSize: 10, color: 'text.disabled' }} noWrap>
                  {p.grupo}
                </Typography>
              )}
            </Box>
            <Typography variant="body2" fontWeight={600} noWrap>
              {p.nome}
            </Typography>
            {(p.complemento || p.marca) && (
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                {[p.complemento, p.marca].filter(Boolean).join(' · ')}
              </Typography>
            )}
          </Box>
          <ExpandMore sx={{
            fontSize: 20, color: 'text.secondary', flexShrink: 0,
            transform: isExpanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 200ms',
          }} />
        </Box>
      </CardActionArea>
      <Collapse in={isExpanded} unmountOnExit>
        <ProdutoDetail codProd={p.CODPROD} />
      </Collapse>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Expanded detail — lazy loads full data, estoque, placas
// ---------------------------------------------------------------------------
function ProdutoDetail({ codProd }: { codProd: number }) {
  const { data: prod, isLoading: loadingProd } = useProdutoFull(codProd);
  const { data: estoque, isLoading: loadingEst } = useEstoqueProduto(codProd);
  const { data: placas, isLoading: loadingPlacas } = usePlacasProduto(codProd);

  if (loadingProd) {
    return (
      <Box sx={{ px: 2, pb: 2, pt: 1 }}>
        <Skeleton variant="rounded" height={80} />
      </Box>
    );
  }

  if (!prod) return null;

  return (
    <Box sx={{ px: 2, pb: 2, pt: 0.5 }}>
      {/* Info grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75, mb: 1.5 }}>
        <InfoItem label="Grupo" value={prod.grupo || '—'} />
        <InfoItem label="Referencia" value={prod.referencia || '—'} />
        <InfoItem label="Marca" value={prod.marca || '—'} />
        <InfoItem label="Uso" value={prod.USOPROD || '—'} />
        {prod.localizacao && <InfoItem label="Localizacao" value={prod.localizacao} />}
        {prod.ncm && <InfoItem label="NCM" value={prod.ncm} />}
      </Box>

      {/* Stock summary */}
      <Box sx={(t) => ({
        display: 'flex', gap: 2, p: 1.5, borderRadius: 1.5, mb: 1.5,
        bgcolor: alpha(t.palette.primary.main, 0.06),
      })}>
        <SummaryNum label="Total" value={prod.estoqueTotal} />
        <SummaryNum label="Reservado" value={prod.reservadoTotal} />
        <SummaryNum label="Disponivel" value={prod.estoqueTotal - prod.reservadoTotal} highlight />
      </Box>

      {/* Stock by location */}
      <SectionTitle icon={<Inventory2 sx={{ fontSize: 13 }} />} title="Estoque por Local" />
      {loadingEst ? (
        <LoadingRows count={3} />
      ) : !estoque?.length ? (
        <Typography variant="caption" color="text.secondary">Sem estoque</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
          {estoque.map((e, i) => (
            <EstoqueRow key={i} item={e} maxEstoque={estoque[0]!.estoque} />
          ))}
        </Box>
      )}

      {/* Vehicles that used this product */}
      <SectionTitle icon={<DirectionsCar sx={{ fontSize: 13 }} />} title="Veiculos que usaram" />
      {loadingPlacas ? (
        <LoadingRows count={2} />
      ) : !placas?.length ? (
        <Typography variant="caption" color="text.secondary">
          Nenhum veiculo encontrado em OS
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {placas.map((pl) => (
            <PlacaRow key={pl.placa} item={pl} />
          ))}
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
      <Box sx={{ color: 'text.disabled' }}>{icon}</Box>
      <Typography variant="caption" fontWeight={700} color="text.secondary">
        {title}
      </Typography>
    </Box>
  );
}

function LoadingRows({ count }: { count: number }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
      {[...Array(count)].map((_, i) => <Skeleton key={i} variant="rounded" height={32} />)}
    </Box>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 10, lineHeight: 1, color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500} noWrap sx={{ fontSize: 12 }}>
        {value}
      </Typography>
    </Box>
  );
}

function SummaryNum({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <Box sx={{ textAlign: 'center', flex: 1 }}>
      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>{label}</Typography>
      <Typography
        fontWeight={700}
        color={highlight ? 'primary.main' : 'text.primary'}
        sx={{ fontSize: 16, lineHeight: 1.2 }}
      >
        {fmt(value)}
      </Typography>
    </Box>
  );
}

function fmt(n: number) {
  return n % 1 === 0 ? String(n) : n.toFixed(2).replace('.', ',');
}

function EstoqueRow({ item: e, maxEstoque }: { item: ProdutoEstoque; maxEstoque: number }) {
  const pct = maxEstoque > 0 ? (e.estoque / maxEstoque) * 100 : 0;
  return (
    <Box sx={(t) => ({
      display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5,
      borderRadius: 1, bgcolor: alpha(t.palette.divider, 0.04),
    })}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" fontWeight={500} noWrap sx={{ fontSize: 11 }}>
          {e.nomeLocal || `Local ${e.CODLOCAL}`}
        </Typography>
        <LinearProgress
          variant="determinate" value={pct}
          sx={{ height: 3, borderRadius: 1, mt: 0.25 }}
        />
      </Box>
      <Box sx={{ textAlign: 'right', minWidth: 50 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{fmt(e.estoque)}</Typography>
        {e.reservado > 0 && (
          <Typography sx={{ fontSize: 9, color: 'warning.main' }}>
            -{fmt(e.reservado)} res.
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function PlacaRow({ item: pl }: { item: ProdutoPlaca }) {
  const dtStr = pl.ultimaOS
    ? new Date(pl.ultimaOS).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
    : '';
  return (
    <Box sx={(t) => ({
      display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5,
      borderRadius: 1, bgcolor: alpha(t.palette.divider, 0.04),
    })}>
      <LocalShipping sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography sx={{
            fontSize: 12, fontWeight: 700, fontFamily: 'monospace',
            bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
            px: 0.5, borderRadius: 0.5,
          }}>
            {pl.placa}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: 10 }}>
            {pl.modelo}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 700 }}>
          {pl.qtdOS} OS
        </Typography>
        {dtStr && (
          <Typography sx={{ fontSize: 9, color: 'text.disabled' }}>
            {dtStr}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
