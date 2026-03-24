import { useState, useCallback, useMemo, memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Chip, alpha, Stack, TextField, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItemButton, ListItemText, Divider, CircularProgress,
  InputAdornment, Autocomplete, Checkbox,
} from '@mui/material';
import { Search, CheckBoxOutlineBlank, CheckBox as CheckBoxIcon } from '@mui/icons-material';
import {
  DndContext,
  DragOverlay,
  useDroppable,
  useDraggable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useHstVeiPainel, useTrocarSituacao } from '@/hooks/use-hstvei';
import { getDepartamentoInfo } from '@/utils/departamento-constants';
import { SituacaoSelect } from '@/components/situacoes/situacao-select';
import { PrioridadeSelect } from '@/components/situacoes/prioridade-select';
import { ParceiroCombobox } from '@/components/situacoes/parceiro-combobox';
import { OsManutencaoCombobox } from '@/components/situacoes/os-manutencao-combobox';
import { OsComercialCombobox } from '@/components/situacoes/os-comercial-combobox';
import { EquipeSelect } from '@/components/situacoes/equipe-select';
import type { PainelVeiculo, Situacao, TrocarSituacaoPayload } from '@/types/hstvei-types';

// ── Data ──

interface CardData {
  id: number;
  idsit: number;
  codveiculo: number;
  placa: string;
  tag: string;
  tipo: string;
  situacao: string;
  departamento: string;
  cliente: string;
  dtinicio: string | null;
}

function flatten(veiculos: PainelVeiculo[]): CardData[] {
  const out: CardData[] = [];
  for (const v of veiculos) {
    for (const s of v.situacoesAtivas) {
      out.push({
        id: s.id,
        idsit: s.idsit,
        codveiculo: v.codveiculo,
        placa: v.placa ?? '-',
        tag: v.tag ?? '',
        tipo: v.tipo ?? '',
        situacao: s.situacao ?? '-',
        departamento: s.departamento ?? '-',
        cliente: s.nomeParc ?? '',
        dtinicio: s.dtinicio ?? null,
      });
    }
  }
  return out;
}

// ── Dep column order ──

const DEP_ORDER = [
  'LOGISTICA / PATIO',
  'MANUTENÇÃO',
  'COMERCIAL.',
  'OPERAÇÃO',
  'SEGURANCA DO TRABALHO',
  'PROGRAMAÇÃO',
  'COMPRAS',
];

// ── Column (memo) ──

const Column = memo(function Column({ id, label, color, icon: Icon, count, children }: {
  id: string; label: string; color: string; icon: React.ElementType; count: number; children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minWidth: 280, width: 280, flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        bgcolor: isOver ? alpha(color, 0.18) : alpha(color, 0.04),
        border: '2px solid',
        borderColor: isOver ? color : alpha(color, 0.12),
        borderRadius: 2,
        transition: 'background-color 0.15s, border-color 0.15s',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}
        sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: alpha(color, 0.15) }}>
        <Icon sx={{ fontSize: 18, color }} />
        <Typography sx={{ fontSize: 12, fontWeight: 700, color, textTransform: 'uppercase', flex: 1 }}>
          {label}
        </Typography>
        <Chip label={count} size="small" sx={{
          height: 22, fontWeight: 800, fontSize: 12,
          bgcolor: alpha(color, 0.12), color, borderRadius: '6px',
        }} />
      </Stack>
      <Box sx={{
        flex: 1, p: 1, minHeight: 0,
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: 10 },
        '&::-webkit-scrollbar-track': { bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 5 },
        '&::-webkit-scrollbar-thumb': { bgcolor: alpha(color, 0.3), borderRadius: 5, '&:hover': { bgcolor: alpha(color, 0.5) } },
      }}>
        {children}
      </Box>
    </Box>
  );
});

// ── Card content (pure) ──

const CardContent = memo(function CardContent({ card }: { card: CardData }) {
  const dep = getDepartamentoInfo(card.departamento);
  return (
    <>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 800, fontFamily: 'monospace', letterSpacing: 1 }}>
          {card.placa}
        </Typography>
        {card.tag && (
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'primary.main', fontFamily: 'monospace' }}>
            {card.tag}
          </Typography>
        )}
      </Stack>
      {card.tipo && (
        <Typography sx={{ fontSize: 10, color: 'text.disabled', mb: 0.5 }} noWrap>{card.tipo}</Typography>
      )}
      <Chip
        label={card.situacao}
        size="small"
        sx={{ fontSize: 10, fontWeight: 600, bgcolor: dep.bgLight, color: dep.color, height: 20, mb: 0.5 }}
      />
      {card.cliente && (
        <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary' }} noWrap>{card.cliente}</Typography>
      )}
    </>
  );
});

// ── Draggable wrapper (memo) ──

const DraggableCard = memo(function DraggableCard({ card }: { card: CardData }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `card-${card.id}`,
    data: card,
  });

  const style: React.CSSProperties = {
    ...(transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 999 } : {}),
    opacity: isDragging ? 0.3 : 1,
    touchAction: 'none',
  };

  return (
    <Paper
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      elevation={0}
      sx={{
        p: 1.5, mb: 1,
        borderRadius: 1.5,
        cursor: isDragging ? 'grabbing' : 'grab',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        '&:hover': { borderColor: 'primary.light', boxShadow: 1 },
      }}
    >
      <CardContent card={card} />
    </Paper>
  );
});

// ── Overlay ──

function OverlayCard({ card }: { card: CardData }) {
  return (
    <Paper
      elevation={12}
      sx={{
        p: 1.5, width: 260,
        borderRadius: 1.5,
        border: '2px solid',
        borderColor: 'primary.main',
        bgcolor: 'background.paper',
        transform: 'rotate(3deg)',
        cursor: 'grabbing',
      }}
    >
      <CardContent card={card} />
    </Paper>
  );
}

// ── Campos por departamento ──

type FieldKey = 'prioridade' | 'descricao' | 'obs' | 'dtprevisao' | 'nuos' | 'numos' | 'codparc' | 'exeope' | 'exemec';

const DEPT_FIELDS: Record<string, { fields: FieldKey[]; descLabel: string }> = {
  logistica:    { fields: ['descricao', 'prioridade'], descLabel: 'O que foi observado?' },
  manutencao:   { fields: ['prioridade', 'descricao', 'dtprevisao', 'nuos', 'exemec'], descLabel: 'Qual o problema/servico?' },
  comercial:    { fields: ['codparc', 'numos', 'dtprevisao', 'descricao'], descLabel: 'Detalhes do servico' },
  operacao:     { fields: ['exeope', 'descricao', 'dtprevisao'], descLabel: 'Local / servico' },
  seguranca:    { fields: ['descricao', 'obs'], descLabel: 'O que foi inspecionado?' },
  programacao:  { fields: ['dtprevisao', 'descricao', 'exeope'], descLabel: 'Rota / destino' },
};

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function getDeptConfig(depName: string) {
  const norm = stripAccents(depName.toLowerCase()).replace(/[.\s/]+/g, ' ').trim();
  for (const [key, cfg] of Object.entries(DEPT_FIELDS)) {
    if (norm.includes(key)) return cfg;
  }
  return { fields: ['descricao', 'obs'] as FieldKey[], descLabel: 'Descricao' };
}

// ── Dialog contextual ──

function TrocarSituacaoDialog({ open, onClose, targetDep, card, onConfirm, isPending }: {
  open: boolean;
  onClose: () => void;
  targetDep: string;
  card: CardData | null;
  onConfirm: (idsit: number, extras: Partial<TrocarSituacaoPayload>) => void;
  isPending: boolean;
}) {
  const [idsit, setIdsit] = useState<number | ''>('');
  const [idpri, setIdpri] = useState<number | ''>('');
  const [descricao, setDescricao] = useState('');
  const [obs, setObs] = useState('');
  const [dtprevisao, setDtprevisao] = useState('');
  const [nuos, setNuos] = useState<number | ''>('');
  const [numos, setNumos] = useState<number | ''>('');
  const [codparc, setCodparc] = useState<number | ''>('');
  const [operadores, setOperadores] = useState<number[]>([]);
  const [mecanicos, setMecanicos] = useState<number[]>([]);

  const depInfo = getDepartamentoInfo(targetDep);
  const deptCfg = getDeptConfig(targetDep);
  const has = (f: FieldKey) => deptCfg.fields.includes(f);

  const handleClose = () => {
    setIdsit(''); setIdpri(''); setDescricao(''); setObs('');
    setDtprevisao(''); setNuos(''); setNumos(''); setCodparc('');
    setOperadores([]); setMecanicos([]);
    onClose();
  };

  const handleConfirm = () => {
    if (!idsit) return;
    const extras: Partial<TrocarSituacaoPayload> = {};
    if (idpri !== '') extras.idpri = idpri as number;
    if (descricao) extras.descricao = descricao;
    if (obs) extras.obs = obs;
    if (dtprevisao) extras.dtprevisao = dtprevisao;
    if (nuos !== '') extras.nuos = nuos as number;
    if (numos !== '') extras.numos = numos as number;
    if (codparc !== '') extras.codparc = codparc as number;
    if (operadores.length) extras.exeope = operadores.join(',');
    if (mecanicos.length) extras.exemec = mecanicos.join(',');
    onConfirm(idsit as number, extras);
    handleClose();
  };

  // Filtrar departamento destino para o SituacaoSelect
  const filterDeps = targetDep ? [targetDep] : undefined;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '50%',
            bgcolor: alpha(depInfo.color, 0.1),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <depInfo.Icon sx={{ color: depInfo.color, fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Mover para {depInfo.label}</Typography>
            {card && (
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                {card.placa} {card.tag && `(${card.tag})`} — saindo de {card.departamento.replace(/\.$/, '')}
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* Situacao — autocomplete agrupado por departamento */}
          <SituacaoSelect value={idsit} onChange={setIdsit} required filterByDep={filterDeps} />

          {/* Campos extras contextuais — so aparecem apos escolher situacao */}
          {idsit && (
            <>
              <Divider />
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 1 }}>
                Informacoes adicionais
              </Typography>

              {has('prioridade') && (
                <PrioridadeSelect value={idpri} onChange={setIdpri} />
              )}

              {has('descricao') && (
                <TextField
                  label={deptCfg.descLabel}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  fullWidth multiline rows={2}
                  inputProps={{ maxLength: 500 }}
                />
              )}

              {has('obs') && (
                <TextField
                  label="Observacoes"
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  fullWidth multiline rows={2}
                  inputProps={{ maxLength: 1000 }}
                  placeholder="Notas internas..."
                />
              )}

              {has('dtprevisao') && (
                <TextField
                  label="Previsao de Conclusao"
                  type="datetime-local"
                  value={dtprevisao}
                  onChange={(e) => setDtprevisao(e.target.value)}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  helperText="Gera alertas quando vencer"
                />
              )}

              {has('codparc') && (
                <ParceiroCombobox value={codparc} onChange={setCodparc} />
              )}

              {has('nuos') && (
                <OsManutencaoCombobox value={nuos} onChange={setNuos} codveiculo={card?.codveiculo} />
              )}

              {has('numos') && (
                <OsComercialCombobox value={numos} onChange={setNumos} />
              )}

              {has('exeope') && (
                <EquipeSelect
                  label="Operadores"
                  value={operadores}
                  onChange={setOperadores}
                  placeholder="Buscar operador por nome..."
                />
              )}

              {has('exemec') && (
                <EquipeSelect
                  label="Mecanicos"
                  value={mecanicos}
                  onChange={setMecanicos}
                  placeholder="Buscar mecanico por nome..."
                />
              )}
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">Cancelar</Button>
        <Button
          variant="contained"
          disabled={!idsit || isPending}
          onClick={handleConfirm}
          startIcon={isPending ? <CircularProgress size={16} /> : <depInfo.Icon sx={{ fontSize: 18 }} />}
          sx={{ bgcolor: depInfo.color, '&:hover': { bgcolor: alpha(depInfo.color, 0.85) } }}
        >
          {isPending ? 'Movendo...' : `Mover para ${depInfo.label}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Page ──

export function QuadroKanbanPage() {
  const { data, isLoading } = useHstVeiPainel();
  const trocarMutation = useTrocarSituacao();

  const allCards = useMemo(() => flatten(data?.veiculos ?? []), [data]);

  const [sp, setSp] = useSearchParams();
  const searchTerm = sp.get('q') ?? '';
  const tiposFilter = useMemo(() => sp.get('tipos')?.split(',').filter(Boolean) ?? [], [sp]);

  const setSearchTerm = useCallback((v: string) => {
    setSp((prev) => { const n = new URLSearchParams(prev); if (v) n.set('q', v); else n.delete('q'); return n; }, { replace: true });
  }, [setSp]);
  const setTiposFilter = useCallback((v: string[]) => {
    setSp((prev) => { const n = new URLSearchParams(prev); if (v.length) n.set('tipos', v.join(',')); else n.delete('tipos'); return n; }, { replace: true });
  }, [setSp]);
  const [activeCard, setActiveCard] = useState<CardData | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingDrop, setPendingDrop] = useState<{ card: CardData; targetDep: string } | null>(null);

  // Tipos de veiculo disponiveis
  const tipos = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of allCards) {
      const t = c.tipo || 'Sem Tipo';
      map.set(t, (map.get(t) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [allCards]);

  // Opcoes para o autocomplete de tipos
  const tipoOptions = useMemo(() =>
    tipos.map(([tipo, count]) => ({ label: tipo, count })),
  [tipos]);

  // Opcoes para o autocomplete de busca (placas, tags, clientes)
  const searchOptions = useMemo(() => {
    const opts: { label: string; sub: string; group: string }[] = [];
    const seenPlacas = new Set<string>();
    const seenTags = new Set<string>();
    const seenClientes = new Set<string>();
    for (const c of allCards) {
      if (c.placa && !seenPlacas.has(c.placa)) {
        seenPlacas.add(c.placa);
        opts.push({ label: c.placa, sub: c.tag || c.tipo, group: 'Placas' });
      }
      if (c.tag && !seenTags.has(c.tag)) {
        seenTags.add(c.tag);
        opts.push({ label: c.tag, sub: c.placa, group: 'Tags' });
      }
      if (c.cliente && !seenClientes.has(c.cliente)) {
        seenClientes.add(c.cliente);
        opts.push({ label: c.cliente, sub: '', group: 'Clientes' });
      }
    }
    return opts;
  }, [allCards]);

  // Filtrar cards
  const cards = useMemo(() => {
    let list = allCards;
    if (tiposFilter.length > 0) list = list.filter((c) => tiposFilter.includes(c.tipo || 'Sem Tipo'));
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((c) =>
        c.placa.toLowerCase().includes(q)
        || c.tag.toLowerCase().includes(q)
        || c.cliente.toLowerCase().includes(q)
        || c.situacao.toLowerCase().includes(q),
      );
    }
    return list;
  }, [allCards, tiposFilter, searchTerm]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  // Group by departamento
  const columnDefs = useMemo(() => {
    const map = new Map<string, CardData[]>();
    // Garantir que todos os departamentos aparecem sempre (mesmo vazios, para permitir drop)
    for (const dep of DEP_ORDER) map.set(dep, []);
    for (const c of cards) {
      if (!map.has(c.departamento)) map.set(c.departamento, []);
      map.get(c.departamento)!.push(c);
    }
    return Array.from(map.entries()).map(([dep, items]) => {
      const info = getDepartamentoInfo(dep);
      return { key: dep, label: info.label, color: info.color, Icon: info.Icon, items };
    });
  }, [cards]);

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveCard((e.active.data.current as CardData) ?? null);
  }, []);

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    setActiveCard(null);
    if (!e.over) return;

    const card = e.active.data.current as CardData;
    const targetDep = (e.over.id as string).replace('col-', '');

    if (card.departamento === targetDep) return;

    // Abrir dialog para escolher situacao do departamento destino
    setPendingDrop({ card, targetDep });
    setPickerOpen(true);
  }, []);

  const handleConfirmTroca = useCallback((idsit: number, extras: Partial<TrocarSituacaoPayload>) => {
    if (!pendingDrop) return;
    trocarMutation.mutate({ id: pendingDrop.card.id, payload: { idsit, ...extras } });
    setPendingDrop(null);
  }, [pendingDrop, trocarMutation]);

  if (isLoading) return <Typography sx={{ p: 4 }}>Carregando...</Typography>;

  return (
    <Box sx={{ p: 2, pb: 0, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5, flexShrink: 0, flexWrap: 'wrap', rowGap: 1 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, mr: 0.5 }}>Kanban</Typography>
        <Chip label={`${cards.length} situacoes`} size="small" sx={{ height: 24, fontWeight: 700 }} />
        {cards.length < allCards.length && (
          <Chip label={`de ${allCards.length}`} size="small" variant="outlined" sx={{ height: 24, fontSize: 10 }} />
        )}

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: 'center' }} />

        {/* Busca por placa/tag — autocomplete com sugestoes reais */}
        <Autocomplete
          freeSolo
          size="small"
          options={searchOptions}
          inputValue={searchTerm}
          onInputChange={(_, val, reason) => { if (reason !== 'reset') setSearchTerm(val); }}
          onChange={(_, val) => setSearchTerm(typeof val === 'string' ? val : val?.label ?? '')}
          getOptionLabel={(o) => typeof o === 'string' ? o : o.label}
          groupBy={(o) => typeof o === 'string' ? '' : o.group}
          renderOption={({ key, ...props }, option) => (
            <li key={key} {...props}>
              <Typography sx={{ fontSize: 12 }}>
                {typeof option === 'string' ? option : (
                  <>
                    <strong>{option.label}</strong>
                    {option.sub && <Typography component="span" sx={{ fontSize: 11, color: 'text.secondary', ml: 1 }}>{option.sub}</Typography>}
                  </>
                )}
              </Typography>
            </li>
          )}
          renderInput={(params) => (
            <TextField {...params} placeholder="Buscar placa, tag, cliente..."
              slotProps={{ input: { ...params.InputProps, startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16 }} /></InputAdornment> } }}
            />
          )}
          sx={{ width: 280, '& .MuiInputBase-root': { minHeight: 32, fontSize: 12 } }}
          noOptionsText="Nenhum resultado"
        />

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: 'center' }} />

        {/* Filtro por tipo de veiculo — multi-select */}
        <Autocomplete
          multiple
          size="small"
          options={tipoOptions}
          value={tipoOptions.filter((o) => tiposFilter.includes(o.label))}
          onChange={(_, vals) => setTiposFilter(vals.map((v) => v.label))}
          getOptionLabel={(o) => `${o.label} (${o.count})`}
          isOptionEqualToValue={(o, v) => o.label === v.label}
          disableCloseOnSelect
          renderOption={({ key, ...props }, option, { selected }) => (
            <li key={key} {...props}>
              <Checkbox
                icon={<CheckBoxOutlineBlank fontSize="small" />}
                checkedIcon={<CheckBoxIcon fontSize="small" />}
                checked={selected}
                sx={{ mr: 1, p: 0 }}
              />
              <Typography sx={{ fontSize: 12, flex: 1 }}>{option.label}</Typography>
              <Chip label={option.count} size="small" sx={{ height: 18, fontSize: 10, ml: 1 }} />
            </li>
          )}
          renderTags={(vals, getTagProps) =>
            vals.map((v, i) => (
              <Chip {...getTagProps({ index: i })} key={v.label} label={v.label} size="small"
                sx={{ height: 22, fontSize: 10, fontWeight: 600 }} />
            ))
          }
          renderInput={(params) => (
            <TextField {...params} placeholder={tiposFilter.length === 0 ? 'Tipo de veiculo...' : ''} />
          )}
          sx={{ minWidth: 250, maxWidth: 450, '& .MuiInputBase-root': { minHeight: 32, fontSize: 12 } }}
          noOptionsText="Nenhum tipo"
        />
      </Stack>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Box sx={{
          display: 'flex', gap: 1.5, overflowX: 'auto', flex: 1, pb: 1,
          alignItems: 'stretch',
          '&::-webkit-scrollbar': { height: 14 },
          '&::-webkit-scrollbar-track': { bgcolor: 'rgba(0,0,0,0.04)', borderRadius: 7 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 7, border: '3px solid transparent', backgroundClip: 'padding-box', '&:hover': { bgcolor: 'rgba(0,0,0,0.35)' } },
        }}>
          {columnDefs.map((col) => (
            <Column key={col.key} id={`col-${col.key}`} label={col.label} color={col.color} icon={col.Icon} count={col.items.length}>
              {col.items.length === 0 ? (
                <Box sx={{
                  py: 3, textAlign: 'center',
                  border: '1px dashed', borderColor: alpha(col.color, 0.2),
                  borderRadius: 1.5, bgcolor: alpha(col.color, 0.03),
                }}>
                  <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>Arraste aqui</Typography>
                </Box>
              ) : col.items.map((c) => (
                <DraggableCard key={c.id} card={c} />
              ))}
            </Column>
          ))}
        </Box>

        <DragOverlay dropAnimation={null}>
          {activeCard ? <OverlayCard card={activeCard} /> : null}
        </DragOverlay>
      </DndContext>

      <TrocarSituacaoDialog
        open={pickerOpen}
        onClose={() => { setPickerOpen(false); setPendingDrop(null); }}
        targetDep={pendingDrop?.targetDep ?? ''}
        card={pendingDrop?.card ?? null}
        onConfirm={handleConfirmTroca}
        isPending={trocarMutation.isPending}
      />
    </Box>
  );
}
