import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Stack, Paper, Chip, alpha, CircularProgress,
  TextField, InputAdornment, Collapse, IconButton, Tooltip, Divider,
} from '@mui/material';
import {
  Search, Warehouse, ExpandMore, ExpandLess, Inventory,
  FolderOpen, Folder, Person,
} from '@mui/icons-material';
import { useArvoreLocais, useEstoquePorLocal, useProdutoDetalhes } from '@/hooks/use-locais';
import { getProdutoImagemUrl } from '@/api/locais';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import type { ArvoreLocal, EstoqueItem } from '@/types/locais-types';

function TreeNode({ node, level, selectedLocal, onSelect, expandedSet, toggleExpand, search }: {
  node: ArvoreLocal; level: number; selectedLocal: number | null;
  onSelect: (codLocal: number) => void;
  expandedSet: Set<number>; toggleExpand: (codLocal: number) => void;
  search: string;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedSet.has(node.CODLOCAL);
  const isSelected = selectedLocal === node.CODLOCAL;
  const matchesSearch = !search || node.DESCRLOCAL.toLowerCase().includes(search.toLowerCase());

  if (!matchesSearch && !hasChildren) return null;

  return (
    <Box>
      <Box
        onClick={() => onSelect(node.CODLOCAL)}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          pl: level * 2 + 1, pr: 1, py: 0.75,
          cursor: 'pointer', borderRadius: 1,
          bgcolor: isSelected ? 'primary.main' : 'transparent',
          color: isSelected ? '#fff' : 'text.primary',
          '&:hover': isSelected ? {} : { bgcolor: 'action.hover' },
          transition: 'all 0.1s',
        }}
      >
        {hasChildren ? (
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleExpand(node.CODLOCAL); }}
            sx={{ p: 0.25, color: isSelected ? '#fff' : 'text.secondary' }}>
            {isExpanded ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
          </IconButton>
        ) : (
          <Box sx={{ width: 26 }} />
        )}
        {hasChildren
          ? (isExpanded ? <FolderOpen sx={{ fontSize: 18, color: isSelected ? '#fff' : '#1565c0' }} /> : <Folder sx={{ fontSize: 18, color: isSelected ? '#fff' : '#1565c0' }} />)
          : <Warehouse sx={{ fontSize: 16, color: isSelected ? '#fff' : 'text.disabled' }} />
        }
        <Typography sx={{ fontSize: 12, fontWeight: isSelected ? 700 : 500, flex: 1 }} noWrap>
          {node.DESCRLOCAL}
        </Typography>
        {node.totalProdutosEstoque > 0 && (
          <Chip label={node.totalProdutosEstoque} size="small" sx={{
            height: 20, fontSize: 10, fontWeight: 700,
            bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : alpha('#1565c0', 0.1),
            color: isSelected ? '#fff' : '#1565c0',
          }} />
        )}
      </Box>
      {hasChildren && isExpanded && (
        <Collapse in={isExpanded}>
          {node.children.map((child) => (
            <TreeNode key={child.CODLOCAL} node={child} level={level + 1}
              selectedLocal={selectedLocal} onSelect={onSelect}
              expandedSet={expandedSet} toggleExpand={toggleExpand} search={search} />
          ))}
        </Collapse>
      )}
    </Box>
  );
}

function EstoqueGrid({ codLocal }: { codLocal: number }) {
  const { data: estoque, isLoading } = useEstoquePorLocal(codLocal);
  const [search, setSearch] = useState('');
  const [selectedProd, setSelectedProd] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!estoque) return [];
    if (!search) return estoque;
    const q = search.toLowerCase();
    return estoque.filter((e) => e.DESCRPROD.toLowerCase().includes(q) || String(e.CODPROD).includes(q));
  }, [estoque, search]);

  if (isLoading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>;
  if (!estoque?.length) return <Typography sx={{ p: 3, color: 'text.disabled', fontSize: 13 }}>Nenhum produto neste local</Typography>;

  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
      {/* Lista de produtos */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produto..." size="small" fullWidth
            sx={{ '& .MuiInputBase-root': { height: 32, fontSize: 12 } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16 }} /></InputAdornment> } }}
          />
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
          {filtered.map((item) => (
            <Paper key={`${item.CODPROD}-${item.CONTROLE}`}
              onClick={() => setSelectedProd(item.CODPROD)}
              variant="outlined"
              sx={{
                p: 1.5, mb: 0.75, borderRadius: 1.5, cursor: 'pointer',
                border: selectedProd === item.CODPROD ? '2px solid' : '1px solid',
                borderColor: selectedProd === item.CODPROD ? 'primary.main' : 'divider',
                '&:hover': { borderColor: 'primary.light' },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  component="img"
                  src={getProdutoImagemUrl(item.CODPROD)}
                  onError={(e: any) => { e.target.style.display = 'none'; }}
                  sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover', bgcolor: 'action.hover' }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600 }} noWrap>{item.DESCRPROD}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.25 }}>
                    <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>Cod: {item.CODPROD}</Typography>
                    {item.DESCRGRUPOPROD && (
                      <Chip label={item.DESCRGRUPOPROD} size="small" sx={{ height: 16, fontSize: 9 }} />
                    )}
                  </Stack>
                </Box>
                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 800, fontFamily: 'monospace', color: item.ESTOQUE > item.ESTMIN ? '#2e7d32' : '#e53935' }}>
                    {item.ESTOQUE}
                  </Typography>
                  <Typography sx={{ fontSize: 9, color: 'text.disabled' }}>estoque</Typography>
                </Box>
                {item.RESERVADO > 0 && (
                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, fontFamily: 'monospace', color: '#ed6c02' }}>
                      {item.RESERVADO}
                    </Typography>
                    <Typography sx={{ fontSize: 9, color: 'text.disabled' }}>reserv.</Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Detalhe do produto selecionado */}
      {selectedProd && <ProdutoDetalhePanel codProd={selectedProd} onClose={() => setSelectedProd(null)} />}
    </Box>
  );
}

function ProdutoDetalhePanel({ codProd, onClose }: { codProd: number; onClose: () => void }) {
  const { data, isLoading } = useProdutoDetalhes(codProd);

  return (
    <Box sx={{ width: 320, flexShrink: 0, borderLeft: '1px solid', borderColor: 'divider', overflowY: 'auto', p: 2 }}>
      {isLoading && <CircularProgress size={20} />}
      {data && (
        <>
          <Box
            component="img"
            src={getProdutoImagemUrl(codProd)}
            onError={(e: any) => { e.target.style.display = 'none'; }}
            sx={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 2, bgcolor: 'action.hover', mb: 2 }}
          />
          <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 1 }}>{data.DESCRPROD}</Typography>
          {data.COMPLDESC && <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1.5 }}>{data.COMPLDESC}</Typography>}
          <Divider sx={{ mb: 1.5 }} />
          <Stack spacing={1}>
            <Field label="Codigo" value={data.CODPROD} />
            <Field label="Grupo" value={data.DESCRGRUPOPROD} />
            <Field label="Marca" value={data.MARCA} />
            <Field label="Referencia" value={data.REFERENCIA} />
            <Field label="Unidade" value={data.CODVOL} />
            <Field label="NCM" value={data.NCM} />
            <Field label="Localizacao" value={data.LOCALIZACAO} />
            <Field label="Uso" value={data.USOPROD === 'S' ? 'Servico' : data.USOPROD === 'P' ? 'Produto' : data.USOPROD} />
            {data.PESOBRUTO && <Field label="Peso Bruto" value={`${data.PESOBRUTO} kg`} />}
            <Field label="Ativo" value={data.ATIVO === 'S' ? 'Sim' : 'Nao'} />
          </Stack>
        </>
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

export function LocaisPage() {
  const [sp, setSp] = useSearchParams();
  const selectedLocal = sp.get('local') ? Number(sp.get('local')) : null;
  const { data: arvore, isLoading } = useArvoreLocais();
  const [treeSearch, setTreeSearch] = useState('');
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set());

  const toggleExpand = (codLocal: number) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(codLocal)) next.delete(codLocal); else next.add(codLocal);
      return next;
    });
  };

  const selectLocal = (codLocal: number) => {
    setSp((prev) => { const n = new URLSearchParams(prev); n.set('local', String(codLocal)); return n; }, { replace: true });
  };

  if (isLoading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* Sidebar — arvore de locais */}
      <Box sx={{ width: 300, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            value={treeSearch} onChange={(e) => setTreeSearch(e.target.value)}
            placeholder="Filtrar locais..." size="small" fullWidth
            sx={{ '& .MuiInputBase-root': { height: 30, fontSize: 12 } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 14 }} /></InputAdornment> } }}
          />
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {(arvore ?? []).map((node) => (
            <TreeNode key={node.CODLOCAL} node={node} level={0}
              selectedLocal={selectedLocal} onSelect={selectLocal}
              expandedSet={expandedSet} toggleExpand={toggleExpand} search={treeSearch} />
          ))}
        </Box>
      </Box>

      {/* Main — estoque do local selecionado */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {selectedLocal ? (
          <EstoqueGrid codLocal={selectedLocal} />
        ) : (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stack alignItems="center" spacing={1}>
              <Warehouse sx={{ fontSize: 48, color: 'text.disabled' }} />
              <Typography sx={{ fontSize: 14, color: 'text.disabled' }}>Selecione um local para ver o estoque</Typography>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
}
