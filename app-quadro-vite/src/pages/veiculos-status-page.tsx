import { useState, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Box, Typography, Stack, TextField, InputAdornment, Chip,
  alpha, CircularProgress, Tooltip, IconButton, Divider, Button,
  Select, MenuItem, ListItemText, Badge, Menu,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  Search, DirectionsCar, Edit,
  ViewColumn, FilterList, FileDownload, Add, Save,
  HelpOutline, Visibility,
} from '@mui/icons-material';
import {
  DataGrid, type GridColDef,
  Toolbar, ToolbarButton, ColumnsPanelTrigger, FilterPanelTrigger,
  ExportCsv, ExportPrint,
  QuickFilter, QuickFilterControl, QuickFilterTrigger,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { useHstVeiPainel, useCreateHstVei, useSituacoes } from '@/hooks/use-hstvei';
import { getDepartamentoInfo } from '@/utils/departamento-constants';
import { SituacaoSelect } from '@/components/situacoes/situacao-select';
import { PrioridadeSelect } from '@/components/situacoes/prioridade-select';
import { ParceiroCombobox } from '@/components/situacoes/parceiro-combobox';
import { OsManutencaoCombobox } from '@/components/situacoes/os-manutencao-combobox';
import { EquipeSelect } from '@/components/situacoes/equipe-select';
import type { CriarSituacaoPayload } from '@/types/hstvei-types';
import { PlacaVeiculo } from '@/components/shared/placa-veiculo';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import type { PainelVeiculo, PainelSituacao } from '@/types/hstvei-types';

// ── Helpers ──

function normalizeFamilia(tipo: string | null): string {
  if (!tipo) return 'Outros';
  const t = tipo.trim().toUpperCase();
  if (t.includes('EMPILHADEIRA')) return 'Empilhadeiras';
  if (t.includes('GUINDASTE')) return 'Guindastes';
  if (t.includes('GUINDAUTO')) return 'Guindautos';
  if (t.includes('CARRO') || t.includes('PICKUP') || t.includes('BICICLETA') || t.includes('MOTOCICLETA')) return 'Veiculos Leves';
  if (t.includes('CAVALO') || t.includes('CARGA') || t.includes('CAÇAMBA') || t.includes('COMBOIO')) return 'Caminhoes';
  if (t.includes('PLATAFORMA')) return 'Plataformas';
  if (t.includes('GERADOR')) return 'Geradores';
  if (t.includes('COMPRESSOR') || t.includes('BOMBA')) return 'Equipamentos';
  if (t.includes('ONIBUS') || t.includes('VAN') || t.includes('MICRO')) return 'Transporte';
  if (t.includes('CARRETA') || t.includes('PRANCHA') || t.includes('GONDOLA') || t.includes('POLIGUINDASTE')) return 'Carretas';
  return 'Outros';
}

const PRI = { URG: { color: '#d32f2f', label: 'Urgente' }, ALT: { color: '#ed6c02', label: 'Alta' }, NOR: { color: '#2e7d32', label: 'Normal' }, BAI: { color: '#9e9e9e', label: 'Baixa' } } as const;

function isOverdue(val: string | null | undefined): boolean {
  if (!val) return false;
  return new Date(val) < new Date();
}

// ── Sidebar Item ──

// PlacaVeiculo do PWA é usado diretamente com scale adequado

function VeiculoItem({ v, active, onSelect }: { v: PainelVeiculo; active: boolean; onSelect: () => void }) {
  const sit = v.situacoesAtivas?.[0];
  const dep = sit ? getDepartamentoInfo(sit.departamento) : null;
  const pri = sit?.prioridadeSigla ? PRI[sit.prioridadeSigla as keyof typeof PRI] : null;

  return (
    <Box onClick={onSelect} sx={{
      display: 'flex', gap: 1.5, px: 1.5, py: 1,
      mx: 1, my: 0.5, borderRadius: 1.5,
      cursor: 'pointer',
      bgcolor: active ? 'primary.main' : 'transparent',
      color: active ? 'primary.contrastText' : 'text.primary',
      border: '1px solid',
      borderColor: active ? 'primary.main' : 'transparent',
      '&:hover': active ? {} : { bgcolor: (t) => alpha(t.palette.primary.main, 0.05), borderColor: 'divider' },
      transition: 'all 0.12s',
    }}>
      <Stack spacing={0.3} alignItems="center" sx={{ flexShrink: 0 }}>
        <PlacaVeiculo placa={v.placa} scale={0.7} />
        {v.tag && (
          <Typography sx={{ fontSize: 9, fontWeight: 700, color: active ? 'rgba(255,255,255,0.8)' : 'primary.main', textAlign: 'center' }}>
            {v.tag}
          </Typography>
        )}
      </Stack>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3 }} noWrap>
          {v.marcaModelo ?? '-'}
        </Typography>
        <Typography sx={{ fontSize: 9, color: active ? 'rgba(255,255,255,0.5)' : 'text.disabled', mt: 0.1 }} noWrap>
          {[v.tipo, v.capacidade].filter(Boolean).join(' · ')}
        </Typography>
        {sit && (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.4 }}>
            <Box sx={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              bgcolor: active ? 'rgba(255,255,255,0.7)' : dep?.color ?? '#999',
            }} />
            <Typography sx={{ fontSize: 10, color: active ? 'rgba(255,255,255,0.85)' : dep?.color ?? 'text.secondary', fontWeight: 600 }} noWrap>
              {sit.situacao}
            </Typography>
            {pri && !active && (
              <Chip label={sit.prioridadeSigla} size="small" sx={{
                height: 16, fontSize: 8, fontWeight: 800,
                bgcolor: alpha(pri.color, 0.12), color: pri.color,
                '& .MuiChip-label': { px: 0.5 },
              }} />
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

// ── Styled QuickFilter ──

type OwnerState = { expanded: boolean };
const StyledQuickFilter = styled(QuickFilter)({ display: 'grid', alignItems: 'center' });
const StyledSearchTrigger = styled(ToolbarButton)<{ ownerState: OwnerState }>(({ theme, ownerState }) => ({
  gridArea: '1 / 1', width: 'min-content', height: 'min-content', zIndex: 1,
  opacity: ownerState.expanded ? 0 : 1, pointerEvents: ownerState.expanded ? 'none' : 'auto',
  transition: theme.transitions.create(['opacity']),
}));
const StyledSearchField = styled(TextField)<{ ownerState: OwnerState }>(({ theme, ownerState }) => ({
  gridArea: '1 / 1', overflowX: 'clip',
  width: ownerState.expanded ? 200 : 'var(--trigger-width)',
  opacity: ownerState.expanded ? 1 : 0,
  transition: theme.transitions.create(['width', 'opacity']),
}));

// ── Flat row for DataGrid ──

interface SituacaoRow {
  id: number;
  situacao: string;
  departamento: string;
  prioridadeSigla: string;
  prioridadeDescricao: string;
  descricao: string;
  obs: string;
  cliente: string;
  dtinicio: string | null;
  dtprevisao: string | null;
  equipe: string;
  pessoas: { codparc: number | null; nome: string }[];
  nuos: number | null;
  numos: number | null;
}

function buildSitRows(sits: PainelSituacao[]): SituacaoRow[] {
  return sits.map((s) => {
    const ops = s.operadores?.map((o) => o.nome?.split(' ')[0]).join(', ') ?? '';
    const mecs = s.mecanicos?.map((m) => m.nome?.split(' ')[0]).join(', ') ?? '';
    const pessoas = [
      ...(s.operadores ?? []).map((o) => ({ codparc: o.codparc, nome: o.nome })),
      ...(s.mecanicos ?? []).map((m) => ({ codparc: m.codparc, nome: m.nome })),
    ];
    return {
      id: s.id,
      situacao: s.situacao,
      departamento: s.departamento ?? '-',
      prioridadeSigla: s.prioridadeSigla ?? '-',
      prioridadeDescricao: s.prioridadeDescricao ?? '',
      descricao: s.descricao ?? '',
      obs: s.obs ?? '',
      cliente: s.nomeParc ?? '',
      dtinicio: s.dtinicio,
      dtprevisao: s.dtprevisao,
      equipe: [ops, mecs].filter(Boolean).join(' | '),
      pessoas,
      nuos: s.nuos,
      numos: s.numos,
    };
  });
}

// ── Toolbar ──

function GridToolbarSlot({ v, onAdd }: { v: PainelVeiculo; onAdd: () => void }) {
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLButtonElement>(null);

  return (
    <Toolbar>
      <PlacaVeiculo placa={v.placa} scale={0.55} />
      <Box sx={{ ml: 1.5, mr: 'auto' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>{v.marcaModelo ?? '-'}</Typography>
        <Stack direction="row" spacing={0.5} alignItems="center">
          {v.tag && <Typography sx={{ fontSize: 10, fontWeight: 700, color: 'primary.main' }}>{v.tag}</Typography>}
          <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>
            {[v.tipo, v.capacidade, v.fabricante].filter(Boolean).join(' · ')}
          </Typography>
        </Stack>
      </Box>

      <Chip label={`${v.situacoesAtivas.length} situacao${v.situacoesAtivas.length !== 1 ? 'es' : ''}`}
        size="small" sx={{ height: 22, fontSize: 10, fontWeight: 700 }} />

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

      <Tooltip title="Nova situacao">
        <IconButton size="small" color="primary" onClick={onAdd}><Add sx={{ fontSize: 18 }} /></IconButton>
      </Tooltip>

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

      <Tooltip title="Colunas"><ColumnsPanelTrigger render={<ToolbarButton />}><ViewColumn fontSize="small" /></ColumnsPanelTrigger></Tooltip>
      <Tooltip title="Filtros">
        <FilterPanelTrigger render={(fp, state) => (
          <ToolbarButton {...fp} color="default"><Badge badgeContent={state.filterCount} color="primary" variant="dot"><FilterList fontSize="small" /></Badge></ToolbarButton>
        )} />
      </Tooltip>
      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
      <Tooltip title="Exportar"><ToolbarButton ref={exportRef} onClick={() => setExportOpen(true)}><FileDownload fontSize="small" /></ToolbarButton></Tooltip>
      <Menu anchorEl={exportRef.current} open={exportOpen} onClose={() => setExportOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <ExportPrint render={<MenuItem />} onClick={() => setExportOpen(false)}><ListItemText>Imprimir</ListItemText></ExportPrint>
        <ExportCsv render={<MenuItem />} onClick={() => setExportOpen(false)}><ListItemText>Baixar CSV</ListItemText></ExportCsv>
      </Menu>
      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
      <StyledQuickFilter>
        <QuickFilterTrigger render={(triggerProps, state) => (
          <Tooltip title="Buscar"><StyledSearchTrigger {...triggerProps} ownerState={{ expanded: state.expanded }} color="default"><Search fontSize="small" /></StyledSearchTrigger></Tooltip>
        )} />
        <QuickFilterControl render={({ ref, ...controlProps }, state) => (
          <StyledSearchField {...controlProps} ownerState={{ expanded: state.expanded }} inputRef={ref}
            placeholder="Buscar..." size="small"
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }} />
        )} />
      </StyledQuickFilter>
    </Toolbar>
  );
}

// ── Detail columns ──

const LOCALE = { ...ptBR.components.MuiDataGrid.defaultProps.localeText, noRowsLabel: 'Nenhuma situacao ativa' };

const gridSx = {
  flex: 1, border: 0,
  '& .MuiDataGrid-columnHeaders': { '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 12 } },
  '& .MuiDataGrid-row': { cursor: 'pointer', '&:hover': { bgcolor: (t: any) => alpha(t.palette.primary.main, 0.04) } },
  '& .MuiDataGrid-cell': { fontSize: 12, borderColor: 'divider' },
  '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': { outline: 'none' },
  '& .MuiDataGrid-virtualScroller': { overflowX: 'auto' },
} as const;

// ── Form Section helper ──

function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', mb: 1.5 }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

// ── Inline Form ──

function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: 16 }}>Como funciona a situacao do veiculo</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>O que e uma situacao?</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.6 }}>
              Uma situacao representa o estado atual do veiculo na frota. Cada veiculo pode ter uma ou mais situacoes ativas simultaneamente.
              As situacoes sao organizadas por departamento (Manutencao, Comercial, Logistica, Operacao, Compras).
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Como aparece no Painel (TV)?</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.6 }}>
              O painel exibe todos os veiculos com situacao ativa em formato de quadro. Cada veiculo mostra:
              placa, tag, equipe (operadores e mecanicos com foto), cliente (parceiro), local, data de saida,
              previsao de retorno e a situacao atual com cor do departamento.
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Campos do formulario</Typography>
            <Stack spacing={0.75}>
              <HelpItem title="Situacao *" desc="Tipo de status do veiculo. Agrupado por departamento — escolha o que melhor descreve o momento atual." />
              <HelpItem title="Prioridade" desc="Urgente (vermelho), Alta (laranja), Normal (verde) ou Baixa (cinza). Define destaque visual no painel." />
              <HelpItem title="Descricao" desc="Texto curto visivel no painel. Ex: 'Troca de oleo', 'Locacao VALE'." />
              <HelpItem title="Observacoes" desc="Detalhes internos — visivel apenas nesta tela, nao aparece no painel." />
              <HelpItem title="Periodo" desc="Data inicio e previsao de termino. No painel, veiculos atrasados aparecem em vermelho." />
              <HelpItem title="Parceiro" desc="Cliente ou fornecedor vinculado. Aparece como 'CLIENTE' no painel." />
              <HelpItem title="OS Manutencao" desc="Vincula a uma Ordem de Servico de manutencao existente." />
              <HelpItem title="Operadores" desc="Colaboradores responsaveis pela operacao. Aparecem com foto no painel na coluna EQUIPE." />
              <HelpItem title="Mecanicos" desc="Mecanicos designados. Aparecem com foto no painel junto aos operadores." />
            </Stack>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Ciclo do veiculo</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.6 }}>
              Cliente → Desmobilizacao → Patio (checklist) → Manutencao → Disponivel → Comercial (proposta/contrato) → Logistica (composicao/carga) → Programacao (rota/DET) → Mobilizacao → Cliente.
              Ao encerrar uma situacao e criar a proxima, o veiculo avanca no ciclo.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Entendi</Button>
      </DialogActions>
    </Dialog>
  );
}

function HelpItem({ title, desc }: { title: string; desc: string }) {
  return (
    <Box sx={{ pl: 1.5, borderLeft: '2px solid', borderColor: 'primary.main' }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{title}</Typography>
      <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.4 }}>{desc}</Typography>
    </Box>
  );
}

interface PreviewData {
  situacao: string; departamento: string; prioridade: string;
  descricao: string; obs: string; cliente: string;
  dtinicio: string; dtprevisao: string;
  operadores: string[]; mecanicos: string[];
  /** codparcs for photos in form mode */
  opCodparcs?: number[]; mecCodparcs?: number[];
  /** PainelPessoa[] for grid mode */
  pessoas?: { codparc: number | null; nome: string }[];
}

function ColHeader({ label, color }: { label: string; color: string }) {
  return (
    <Box sx={{ px: 1.5, py: 0.75, bgcolor: (t) => alpha(color, t.palette.mode === 'dark' ? 0.15 : 0.06) }}>
      <Typography sx={{ fontSize: 9, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </Typography>
    </Box>
  );
}

function PainelPreviewDialog({ open, onClose, v, formData }: {
  open: boolean; onClose: () => void; v: PainelVeiculo; formData: PreviewData;
}) {
  const dep = getDepartamentoInfo(formData.departamento);
  const fmtDt = (iso: string) => { if (!iso) return '--:--'; const d = new Date(iso); return isNaN(d.getTime()) ? '--:--' : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const allPessoas = formData.pessoas ?? [];
  const allNames = [...formData.operadores, ...formData.mecanicos];
  const equipeList = allPessoas.length > 0 ? allPessoas : allNames.map((n) => ({ codparc: null, nome: n }));

  const gridTemplate = '100px 130px 1fr 160px 100px 100px';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ py: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Visibility sx={{ fontSize: 18, color: 'info.main' }} />
          <Typography sx={{ fontSize: 14, fontWeight: 700, flex: 1 }}>Preview — Painel TV</Typography>
          <Chip label={formData.departamento || 'DEPARTAMENTO'} size="small"
            sx={{ bgcolor: dep.bgLight, color: dep.color, fontWeight: 700, fontSize: 10, height: 22 }} />
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {/* Board */}
        <Box sx={{ bgcolor: 'background.paper' }}>
          {/* Column headers */}
          <Box sx={{ display: 'grid', gridTemplateColumns: gridTemplate, borderBottom: '2px solid', borderColor: 'divider' }}>
            <ColHeader label="PLACA" color="#f44336" />
            <ColHeader label="SITUACAO" color={dep.color} />
            <ColHeader label="CLIENTE / LOCAL" color="#2e7d32" />
            <ColHeader label="EQUIPE" color="#1565c0" />
            <ColHeader label="SAIDA" color="#7b1fa2" />
            <ColHeader label="PREVISAO" color="#00838f" />
          </Box>

          {/* Data row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: gridTemplate, alignItems: 'center', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            {/* PLACA */}
            <Box sx={{ px: 1.5 }}>
              <PlacaVeiculo placa={v.placa} scale={0.65} />
            </Box>

            {/* SITUACAO */}
            <Box sx={{ px: 1.5 }}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dep.color, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{formData.situacao || '--'}</Typography>
              </Stack>
            </Box>

            {/* CLIENTE / LOCAL */}
            <Box sx={{ px: 1.5 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>{formData.cliente || '--'}</Typography>
              {formData.descricao && <Typography sx={{ fontSize: 10, color: 'text.secondary' }} noWrap>{formData.descricao}</Typography>}
            </Box>

            {/* EQUIPE */}
            <Box sx={{ px: 1.5 }}>
              {equipeList.length > 0 ? (
                <Stack direction="row" spacing={-0.5} alignItems="center">
                  {equipeList.slice(0, 3).map((p, i) => (
                    <Tooltip key={i} title={p.nome} arrow>
                      <Box>
                        <FuncionarioAvatar codparc={(p as any).codparc ?? 0} nome={p.nome} size="small"
                          sx={{ width: 30, height: 30, border: '2px solid', borderColor: 'background.paper' }} />
                      </Box>
                    </Tooltip>
                  ))}
                  {equipeList.length > 3 && (
                    <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: 'action.hover', border: '2px solid', borderColor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 700 }}>+{equipeList.length - 3}</Typography>
                    </Box>
                  )}
                </Stack>
              ) : (
                <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>--</Typography>
              )}
            </Box>

            {/* SAIDA */}
            <Box sx={{ px: 1.5 }}>
              <Typography sx={{ fontSize: 13, fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>
                {fmtDt(formData.dtinicio)}
              </Typography>
            </Box>

            {/* PREVISAO */}
            <Box sx={{ px: 1.5 }}>
              <Typography sx={{ fontSize: 13, fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, color: isOverdue(formData.dtprevisao) ? 'error.main' : 'text.primary' }}>
                {fmtDt(formData.dtprevisao)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Info */}
        <Box sx={{ px: 2.5, py: 1.5, bgcolor: 'background.paper' }}>
          <Typography sx={{ fontSize: 10, color: 'text.secondary', lineHeight: 1.5 }}>
            Assim o veiculo aparecera no quadro TV do departamento <b>{formData.departamento || '?'}</b>.
            Equipe com foto, cliente, datas e situacao ficam visiveis para todos os setores.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}

function NovaSituacaoForm({ codveiculo, v, onClose }: { codveiculo: number; v: PainelVeiculo; onClose: () => void }) {
  const criar = useCreateHstVei();
  const { data: situacoesLookup } = useSituacoes();
  const formRef = useRef<HTMLFormElement>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [idsit, setIdsit] = useState<number | ''>('');
  const [idpri, setIdpri] = useState<number | ''>('');
  const [descricao, setDescricao] = useState('');
  const [obs, setObs] = useState('');
  const [dtinicio, setDtinicio] = useState('');
  const [dtprevisao, setDtprevisao] = useState('');
  const [codparc, setCodparc] = useState<number | ''>('');
  const [parceiroNome, setParceiroNome] = useState('');
  const [nuos, setNuos] = useState<number | ''>('');
  const [operadores, setOperadores] = useState<number[]>([]);
  const [mecanicos, setMecanicos] = useState<number[]>([]);
  const opNomes: string[] = [];
  const mecNomes: string[] = [];

  const sitInfo = situacoesLookup?.find((s) => s.ID === idsit);

  const handleSubmit = () => {
    if (!idsit) return;
    const payload: CriarSituacaoPayload = {
      codveiculo,
      idsit: idsit as number,
      ...(idpri !== '' && { idpri: idpri as number }),
      ...(descricao && { descricao }),
      ...(obs && { obs }),
      ...(dtinicio && { dtinicio }),
      ...(dtprevisao && { dtprevisao }),
      ...(nuos && { nuos: nuos as number }),
      ...(codparc && { codparc: codparc as number }),
      ...(operadores.length > 0 && { exeope: operadores.join(',') }),
      ...(mecanicos.length > 0 && { exemec: mecanicos.join(',') }),
    };
    criar.mutate(payload, { onSuccess: onClose });
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Header with save button */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ px: 3, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <PlacaVeiculo placa={v.placa} scale={0.7} />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{v.marcaModelo ?? '-'}</Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            {v.tag && <Chip label={v.tag} size="small" color="primary" sx={{ fontWeight: 700, fontSize: 10, height: 20 }} />}
            <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>{[v.tipo, v.capacidade].filter(Boolean).join(' · ')}</Typography>
          </Stack>
        </Box>
        <Tooltip title="Preview do Painel">
          <IconButton size="small" onClick={() => setPreviewOpen(true)} color="info"><Visibility sx={{ fontSize: 20 }} /></IconButton>
        </Tooltip>
        <Tooltip title="Ajuda">
          <IconButton size="small" onClick={() => setHelpOpen(true)}><HelpOutline sx={{ fontSize: 20 }} /></IconButton>
        </Tooltip>
        <Button variant="text" onClick={onClose} disabled={criar.isPending}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!idsit || criar.isPending}
          startIcon={criar.isPending ? <CircularProgress size={16} color="inherit" /> : <Save />}>
          {criar.isPending ? 'Salvando...' : 'Criar Situacao'}
        </Button>
      </Stack>

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
      <PainelPreviewDialog open={previewOpen} onClose={() => setPreviewOpen(false)} v={v}
        formData={{
          situacao: sitInfo?.DESCRICAO ?? '',
          departamento: sitInfo?.departamentoNome ?? '',
          prioridade: idpri !== '' ? String(idpri) : '',
          descricao, obs, cliente: parceiroNome, dtinicio, dtprevisao,
          operadores: opNomes, mecanicos: mecNomes,
        }} />

      {/* Form body */}
      <Box ref={formRef} sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.default', p: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>

          {/* LEFT */}
          <Box sx={{ p: 3, borderRight: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={3}>
              <FormSection label="Classificacao">
                <Stack spacing={2}>
                  <SituacaoSelect value={idsit} onChange={setIdsit} required />
                  <PrioridadeSelect value={idpri} onChange={setIdpri} />
                </Stack>
              </FormSection>

              <FormSection label="Detalhes">
                <Stack spacing={2}>
                  <TextField label="Descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)}
                    fullWidth size="small" inputProps={{ maxLength: 100 }}
                    placeholder="Ex: Troca de oleo, revisao preventiva..." />
                  <TextField label="Observacoes" value={obs} onChange={(e) => setObs(e.target.value)}
                    fullWidth size="small" multiline rows={3} inputProps={{ maxLength: 100 }}
                    placeholder="Informacoes adicionais..." />
                </Stack>
              </FormSection>

              <FormSection label="Periodo">
                <Stack spacing={2}>
                  <TextField label="Data Inicio" type="datetime-local" value={dtinicio}
                    onChange={(e) => setDtinicio(e.target.value)} fullWidth size="small"
                    slotProps={{ inputLabel: { shrink: true } }} />
                  <TextField label="Previsao Termino" type="datetime-local" value={dtprevisao}
                    onChange={(e) => setDtprevisao(e.target.value)} fullWidth size="small"
                    slotProps={{ inputLabel: { shrink: true } }} />
                </Stack>
              </FormSection>
            </Stack>
          </Box>

          {/* RIGHT */}
          <Box sx={{ p: 3 }}>
            <Stack spacing={3}>
              <FormSection label="Vinculacoes">
                <Stack spacing={2}>
                  <ParceiroCombobox value={codparc} onChange={(cod) => { setCodparc(cod); }} />
                  <OsManutencaoCombobox value={nuos} onChange={setNuos}
                    onParceiroDetected={(cod, nome) => { if (!codparc) { setCodparc(cod); setParceiroNome(nome); } }} />
                </Stack>
              </FormSection>

              <FormSection label="Operadores">
                <EquipeSelect label="Operadores" value={operadores} onChange={setOperadores}
                  placeholder="Buscar operador por nome..." />
              </FormSection>

              <FormSection label="Mecanicos">
                <EquipeSelect label="Mecanicos" value={mecanicos} onChange={setMecanicos}
                  placeholder="Buscar mecanico por nome..." />
              </FormSection>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ── Detail ──

function VeiculoDetail({ v, isFormView, onOpenForm, onCloseForm }: {
  v: PainelVeiculo; isFormView: boolean; onOpenForm: () => void; onCloseForm: () => void;
}) {
  const navigate = useNavigate();
  const rows = useMemo(() => buildSitRows(v.situacoesAtivas), [v.situacoesAtivas]);
  const [previewSit, setPreviewSit] = useState<SituacaoRow | null>(null);

  const columns: GridColDef<SituacaoRow>[] = useMemo(() => [
    { field: 'id', headerName: '#', width: 60, renderCell: ({ value }) => <Typography sx={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 600 }}>{value}</Typography> },
    {
      field: 'situacao', headerName: 'Situacao', width: 160,
      renderCell: ({ row }) => {
        const dep = getDepartamentoInfo(row.departamento);
        return <Chip label={row.situacao} size="small" sx={{ fontSize: 10, fontWeight: 700, height: 22, bgcolor: dep.bgLight, color: dep.color }} />;
      },
    },
    {
      field: 'departamento', headerName: 'Departamento', width: 140,
      renderCell: ({ value }) => {
        const dep = getDepartamentoInfo(value as string);
        const Icon = dep.Icon;
        return <Chip icon={<Icon sx={{ fontSize: '14px !important' }} />} label={dep.label} size="small" sx={{ fontSize: 10, height: 22, bgcolor: dep.bgLight, color: dep.color }} />;
      },
    },
    {
      field: 'prioridadeSigla', headerName: 'Prior.', width: 80, align: 'center', headerAlign: 'center',
      renderCell: ({ row }) => {
        const p = PRI[row.prioridadeSigla as keyof typeof PRI];
        return p ? <Chip label={p.label} size="small" sx={{ fontSize: 9, height: 20, fontWeight: 700, bgcolor: alpha(p.color, 0.1), color: p.color }} /> : <Typography sx={{ fontSize: 11 }}>-</Typography>;
      },
    },
    { field: 'cliente', headerName: 'Cliente', flex: 1, minWidth: 120 },
    { field: 'descricao', headerName: 'Descricao', flex: 1, minWidth: 120 },
    {
      field: 'equipe', headerName: 'Equipe', width: 180,
      renderCell: ({ row }) => {
        if (row.pessoas.length === 0) return <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>—</Typography>;
        return (
          <Tooltip
            title={
              <Stack spacing={0.5} sx={{ py: 0.5 }}>
                {row.pessoas.map((p: { codparc: number | null; nome: string }, i: number) => (
                  <Stack key={i} direction="row" spacing={1} alignItems="center">
                    <FuncionarioAvatar codparc={p.codparc ?? 0} nome={p.nome} size="small" sx={{ width: 24, height: 24 }} />
                    <Typography sx={{ fontSize: 12, color: '#fff' }}>{p.nome}</Typography>
                  </Stack>
                ))}
              </Stack>
            }
            arrow placement="left"
          >
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Stack direction="row" spacing={-0.75}>
                {row.pessoas.slice(0, 3).map((p: { codparc: number | null; nome: string }, i: number) => (
                  <FuncionarioAvatar key={i} codparc={p.codparc ?? 0} nome={p.nome} size="small"
                    sx={{ width: 32, height: 32, border: '2px solid', borderColor: 'background.paper', zIndex: 3 - i }} />
                ))}
                {row.pessoas.length > 3 && (
                  <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'action.hover', border: '2px solid', borderColor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: 'text.secondary' }}>+{row.pessoas.length - 3}</Typography>
                  </Box>
                )}
              </Stack>
              <Typography sx={{ fontSize: 10, color: 'text.secondary', ml: 0.5 }} noWrap>
                {row.pessoas.slice(0, 2).map((p: { nome: string }) => p.nome?.split(' ')[0]).join(', ')}
              </Typography>
            </Stack>
          </Tooltip>
        );
      },
    },
    {
      field: 'dtinicio', headerName: 'Inicio', width: 120,
      renderCell: ({ value }) => {
        if (!value) return <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>-</Typography>;
        const d = new Date(value as string);
        if (isNaN(d.getTime())) return <Typography sx={{ fontSize: 11 }}>-</Typography>;
        return (
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{d.toLocaleDateString('pt-BR')}</Typography>
            <Typography sx={{ fontSize: 9, color: 'text.secondary' }}>{d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'dtprevisao', headerName: 'Previsao', width: 120,
      renderCell: ({ value }) => {
        if (!value) return <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>-</Typography>;
        const d = new Date(value as string);
        if (isNaN(d.getTime())) return <Typography sx={{ fontSize: 11 }}>-</Typography>;
        const overdue = isOverdue(value as string);
        return (
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: overdue ? 'error.main' : 'text.primary' }}>
              {d.toLocaleDateString('pt-BR')}{overdue ? ' !' : ''}
            </Typography>
            <Typography sx={{ fontSize: 9, color: overdue ? 'error.main' : 'text.secondary' }}>
              {d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
        );
      },
    },
    { field: 'nuos', headerName: 'OS', width: 70, renderCell: ({ value }) => value ? <Typography sx={{ fontSize: 11, fontFamily: 'monospace' }}>{value}</Typography> : null },
    {
      field: 'actions', headerName: '', width: 80, sortable: false, filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.25}>
          <Tooltip title="Preview no painel">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setPreviewSit(row); }}>
              <Visibility sx={{ fontSize: 16, color: 'info.main' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar situacao">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/situacao/${row.id}`); }}>
              <Edit sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [navigate]);

  if (isFormView) {
    return <NovaSituacaoForm codveiculo={v.codveiculo} v={v} onClose={onCloseForm} />;
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        density="compact"
        rowHeight={44}
        disableRowSelectionOnClick
        showToolbar
        slots={{
          toolbar: () => <GridToolbarSlot v={v} onAdd={onOpenForm} />,
        }}
        onRowClick={(params) => navigate(`/situacao/${params.row.id}`)}
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        localeText={LOCALE}
        sx={gridSx}
      />
      {previewSit && (
        <PainelPreviewDialog
          open={!!previewSit}
          onClose={() => setPreviewSit(null)}
          v={v}
          formData={{
            situacao: previewSit.situacao,
            departamento: previewSit.departamento,
            prioridade: previewSit.prioridadeSigla,
            descricao: previewSit.descricao,
            obs: previewSit.obs,
            cliente: previewSit.cliente,
            dtinicio: previewSit.dtinicio ?? '',
            dtprevisao: previewSit.dtprevisao ?? '',
            operadores: [],
            mecanicos: [],
            pessoas: previewSit.pessoas,
          }}
        />
      )}
    </Box>
  );
}

// ── Page ──

export function VeiculosStatusPage() {
  const [sp, setSp] = useSearchParams();
  const selectedCod = sp.get('cod') ? Number(sp.get('cod')) : null;
  const search = sp.get('q') ?? '';
  const familia = sp.get('fam') ?? '';
  const viewMode = sp.get('view') ?? 'grid';

  const setParam = useCallback((key: string, value: string | null) => {
    setSp((prev) => { const next = new URLSearchParams(prev); if (value) next.set(key, value); else next.delete(key); return next; }, { replace: true });
  }, [setSp]);

  const { data, isLoading } = useHstVeiPainel();
  const veiculos = data?.veiculos ?? [];

  const familias = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of veiculos) { const f = normalizeFamilia(v.tipo); map.set(f, (map.get(f) ?? 0) + 1); }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [veiculos]);

  const filtered = useMemo(() => {
    let list = veiculos;
    if (familia) list = list.filter((v) => normalizeFamilia(v.tipo) === familia);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((v) => v.placa?.toLowerCase().includes(q) || v.tag?.toLowerCase().includes(q) || v.marcaModelo?.toLowerCase().includes(q) || v.situacoesAtivas?.some((s) => s.nomeParc?.toLowerCase().includes(q)));
    }
    return list;
  }, [veiculos, familia, search]);

  const selectedVeiculo = useMemo(() => veiculos.find((v) => v.codveiculo === selectedCod) ?? null, [veiculos, selectedCod]);

  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* Sidebar */}
      <Box sx={{ width: 310, flexShrink: 0, borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>

        {/* Search + Filter */}
        <Box sx={{ p: 1.5 }}>
          <TextField
            size="small" fullWidth placeholder="Buscar placa, tag, modelo..."
            value={search} onChange={(e) => setParam('q', e.target.value || null)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: 'action.active' }} /></InputAdornment> } }}
          />
          <Select
            size="small" fullWidth
            value={familia || '__all__'}
            onChange={(e) => setParam('fam', e.target.value === '__all__' ? null : e.target.value)}
            sx={{ mt: 1, fontSize: 12 }}
          >
            <MenuItem value="__all__">
              <ListItemText primary={`Todos os tipos (${veiculos.length})`} primaryTypographyProps={{ fontSize: 12 }} />
            </MenuItem>
            {familias.map(([fam, count]) => (
              <MenuItem key={fam} value={fam}>
                <ListItemText primary={`${fam} (${count})`} primaryTypographyProps={{ fontSize: 12 }} />
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Count bar */}
        <Box sx={{ px: 2, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 500 }}>
            {filtered.length} veiculo{filtered.length !== 1 ? 's' : ''}
          </Typography>
          {familia && (
            <Chip label={familia} size="small" onDelete={() => setParam('fam', null)} sx={{ height: 20, fontSize: 10 }} />
          )}
        </Box>

        {/* List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {isLoading ? (
            <Stack alignItems="center" sx={{ py: 8 }}><CircularProgress size={28} /></Stack>
          ) : filtered.length === 0 ? (
            <Stack alignItems="center" sx={{ py: 8 }}>
              <DirectionsCar sx={{ fontSize: 36, color: 'action.disabled' }} />
              <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 1 }}>Nenhum veiculo encontrado</Typography>
            </Stack>
          ) : filtered.map((v) => (
            <VeiculoItem key={v.codveiculo} v={v} active={selectedCod === v.codveiculo}
              onSelect={() => setParam('cod', String(v.codveiculo))} />
          ))}
        </Box>
      </Box>

      {/* Content */}
      {selectedVeiculo ? (
        <VeiculoDetail v={selectedVeiculo}
          isFormView={viewMode === 'form'}
          onOpenForm={() => setParam('view', 'form')}
          onCloseForm={() => setParam('view', null)} />
      ) : (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
          <Stack alignItems="center" spacing={0.75}>
            <DirectionsCar sx={{ fontSize: 48, color: 'action.disabled' }} />
            <Typography sx={{ fontSize: 14, color: 'text.disabled' }}>Selecione um veiculo</Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
