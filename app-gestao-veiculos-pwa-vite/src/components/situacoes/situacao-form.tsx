import { useState } from 'react';
import {
  Box, TextField, Button, Paper, Typography, CircularProgress,
  alpha, Collapse,
} from '@mui/material';
import {
  Save, DirectionsCar, Description,
  LinkRounded, People, Schedule,
  ExpandMore, ExpandLess,
} from '@mui/icons-material';
import { VeiculoCombobox } from '@/components/situacoes/veiculo-combobox';
import { SituacaoSelect } from '@/components/situacoes/situacao-select';
import { PrioridadeSelect } from '@/components/situacoes/prioridade-select';
import { OsManutencaoCombobox } from '@/components/situacoes/os-manutencao-combobox';
import { OsComercialCombobox } from '@/components/situacoes/os-comercial-combobox';
import { ParceiroCombobox } from '@/components/situacoes/parceiro-combobox';
import { UsuarioSelect } from '@/components/shared/usuario-select';
import type { CriarSituacaoPayload } from '@/types/hstvei-types';

export type DepFilter = 'manutencao' | 'comercial' | 'logistica' | 'operacao' | 'compras' | 'seguranca' | 'programacao' | null;

interface SituacaoFormProps {
  initialValues?: Partial<CriarSituacaoPayload>;
  onSubmit: (values: CriarSituacaoPayload) => void;
  loading?: boolean;
  disableVeiculo?: boolean;
  depFilter?: DepFilter;
}

function SectionHeader({
  icon, label, hint, color,
  collapsible, collapsed, onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  color: string;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  return (
    <Box
      onClick={collapsible ? onToggle : undefined}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, mb: 2,
        cursor: collapsible ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      <Box sx={{
        width: 36, height: 36, borderRadius: '50%',
        bgcolor: alpha(color, 0.12),
        border: `2px solid ${alpha(color, 0.3)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color,
        flexShrink: 0,
      }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
          {label}
        </Typography>
        {hint && (
          <Typography sx={{ fontSize: 11, color: 'text.disabled', lineHeight: 1.3, mt: 0.25 }}>
            {hint}
          </Typography>
        )}
      </Box>
      {collapsible && (
        <Box sx={{ color: 'text.disabled' }}>
          {collapsed ? <ExpandMore /> : <ExpandLess />}
        </Box>
      )}
    </Box>
  );
}

function safeDateStr(v: unknown): string {
  if (!v || typeof v !== 'string') return '';
  return v;
}

const DEP_FILTER_MAP: Record<string, string[]> = {
  manutencao: ['MANUTENÇÃO', 'MANUTENCAO'],
  comercial: ['COMERCIAL'],
  logistica: ['LOGISTICA', 'LOGÍSTICA', 'PATIO', 'PÁTIO'],
  operacao: ['OPERAÇÃO', 'OPERACAO'],
  compras: ['COMPRAS'],
  seguranca: ['SEGURANCA', 'SEGURANÇA', 'SEGURANCA DO TRABALHO'],
  programacao: ['PROGRAMAÇÃO', 'PROGRAMACAO'],
};

export function SituacaoForm({ initialValues, onSubmit, loading, disableVeiculo, depFilter }: SituacaoFormProps) {
  const [codveiculo, setCodveiculo] = useState<number | null>(initialValues?.codveiculo ?? null);
  const [idsit, setIdsit] = useState<number | ''>(initialValues?.idsit ?? '');
  const [idpri, setIdpri] = useState<number | ''>(initialValues?.idpri ?? '');
  const [descricao, setDescricao] = useState(initialValues?.descricao ?? '');
  const [obs, setObs] = useState(initialValues?.obs ?? '');
  const [dtinicio, setDtinicio] = useState(safeDateStr(initialValues?.dtinicio));
  const [dtprevisao, setDtprevisao] = useState(safeDateStr(initialValues?.dtprevisao));
  const [dtfim, setDtfim] = useState(safeDateStr(initialValues?.dtfim));
  const [nuos, setNuos] = useState<number | ''>(initialValues?.nuos ?? '');
  const [numos, setNumos] = useState<number | ''>(initialValues?.numos ?? '');
  const [nunota, setNunota] = useState(initialValues?.nunota ? String(initialValues.nunota) : '');
  const [codparc, setCodparc] = useState<number | ''>(initialValues?.codparc ?? '');
  const [operadores, setOperadores] = useState<number[]>(
    initialValues?.exeope ? initialValues.exeope.split(',').map(Number).filter(Boolean) : []
  );
  const [mecanicos, setMecanicos] = useState<number[]>(
    initialValues?.exemec ? initialValues.exemec.split(',').map(Number).filter(Boolean) : []
  );

  // Collapsible sections
  const [showDates, setShowDates] = useState(!!initialValues?.dtinicio || !!initialValues?.dtprevisao);
  const [showLinks, setShowLinks] = useState(!!initialValues?.nuos || !!initialValues?.numos || !!initialValues?.nunota || !!initialValues?.codparc);
  const [showTeam, setShowTeam] = useState(!!initialValues?.exeope || !!initialValues?.exemec);

  // Visibility rules per department
  const showOsManut = !depFilter || depFilter === 'manutencao';
  const showOsComerc = !depFilter || depFilter === 'comercial' || depFilter === 'logistica' || depFilter === 'operacao';
  const showNota = !depFilter || depFilter === 'manutencao' || depFilter === 'compras';
  const showParceiro = !depFilter || depFilter === 'manutencao' || depFilter === 'comercial' || depFilter === 'compras';
  const showMecanicos = !depFilter || depFilter === 'manutencao';
  const showOperadores = !depFilter || depFilter === 'comercial' || depFilter === 'logistica' || depFilter === 'operacao';
  const showVinculacoes = showOsManut || showOsComerc || showNota || showParceiro;
  const showEquipe = showMecanicos || showOperadores;

  const depFilterKeywords = depFilter ? DEP_FILTER_MAP[depFilter] : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codveiculo || !idsit) return;
    const payload: CriarSituacaoPayload = {
      codveiculo,
      idsit: idsit as number,
      ...(idpri !== '' && { idpri: idpri as number }),
      ...(descricao && { descricao }),
      ...(obs && { obs }),
      ...(dtinicio && { dtinicio }),
      ...(dtprevisao && { dtprevisao }),
      ...(dtfim && { dtfim }),
      ...(nuos !== '' && { nuos: nuos as number }),
      ...(numos !== '' && { numos: numos as number }),
      ...(nunota && { nunota: Number(nunota) }),
      ...(codparc !== '' && { codparc: codparc as number }),
      ...(operadores.length > 0 && { exeope: operadores.join(',') }),
      ...(mecanicos.length > 0 && { exemec: mecanicos.join(',') }),
    };
    onSubmit(payload);
  };

  const canSubmit = !!codveiculo && !!idsit && !loading;

  const paperSx = {
    p: 2.5,
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'divider',
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

      {/* ═══ Secao 1: Veiculo e Classificacao (sempre visivel) ═══ */}
      <Paper sx={{
        ...paperSx,
        border: '2px solid',
        borderColor: (t) => alpha(t.palette.primary.main, 0.3),
        bgcolor: (t) => alpha(t.palette.primary.main, 0.02),
      }}>
        <SectionHeader
          icon={<DirectionsCar sx={{ fontSize: 20 }} />}
          label="Veiculo e Classificacao"
          hint="Campos obrigatorios"
                    color="#2e7d32"
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <VeiculoCombobox value={codveiculo} onChange={setCodveiculo} required disabled={disableVeiculo} />

          <SituacaoSelect
            value={idsit}
            onChange={setIdsit}
            required
            filterByDep={depFilterKeywords}
          />

          <PrioridadeSelect value={idpri} onChange={setIdpri} />
        </Box>
      </Paper>

      {/* ═══ Secao 2: Descricao (sempre visivel, simplificada) ═══ */}
      <Paper sx={paperSx}>
        <SectionHeader
          icon={<Description sx={{ fontSize: 20 }} />}
          label="Descricao"
          hint="O que esta acontecendo?"
                    color="#1565c0"
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            fullWidth
            multiline
            rows={3}
            inputProps={{ maxLength: 500 }}
            placeholder="Ex: Motor com superaquecimento, veiculo parado..."
          />
          <TextField
            label="Observacoes (opcional)"
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            fullWidth
            multiline
            rows={2}
            inputProps={{ maxLength: 1000 }}
            placeholder="Notas internas, pecas necessarias..."
            sx={{
              '& .MuiInputBase-root': {
                bgcolor: (t) => alpha(t.palette.action.hover, 0.3),
              },
            }}
          />
        </Box>
      </Paper>

      {/* ═══ Secao 3: Datas (colapsavel) ═══ */}
      <Paper sx={paperSx}>
        <SectionHeader
          icon={<Schedule sx={{ fontSize: 20 }} />}
          label="Datas"
          hint={showDates ? undefined : 'Inicio padrao: agora. Toque para expandir.'}
                    color="#6a1b9a"
          collapsible
          collapsed={!showDates}
          onToggle={() => setShowDates((s) => !s)}
        />
        <Collapse in={showDates}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Inicio"
              type="datetime-local"
              value={dtinicio}
              onChange={(e) => setDtinicio(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              helperText="Padrao: data/hora atual"
            />
            <TextField
              label="Previsao de conclusao"
              type="datetime-local"
              value={dtprevisao}
              onChange={(e) => setDtprevisao(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              helperText="Gera alertas quando vencer"
            />
            <TextField
              label="Fim (encerra a situacao)"
              type="datetime-local"
              value={dtfim}
              onChange={(e) => setDtfim(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              helperText="Se preenchido, situacao considerada encerrada"
            />
          </Box>
        </Collapse>
      </Paper>

      {/* ═══ Secao 4: Vinculacoes (colapsavel, condicional) ═══ */}
      {showVinculacoes && (
        <Paper sx={paperSx}>
          <SectionHeader
            icon={<LinkRounded sx={{ fontSize: 20 }} />}
            label="Vinculacoes"
            hint={showLinks ? 'OS, notas e parceiros (opcionais)' : 'Toque para vincular OS, notas ou parceiros'}
                        color="#00838f"
            collapsible
            collapsed={!showLinks}
            onToggle={() => setShowLinks((s) => !s)}
          />
          <Collapse in={showLinks}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {showOsManut && (
                <OsManutencaoCombobox value={nuos} onChange={setNuos} />
              )}
              {showOsComerc && (
                <OsComercialCombobox value={numos} onChange={setNumos} />
              )}
              {showNota && (
                <TextField
                  label="Nota Fiscal (NUNOTA)"
                  type="number"
                  value={nunota}
                  onChange={(e) => setNunota(e.target.value)}
                  fullWidth
                  placeholder="Numero da nota"
                />
              )}
              {showParceiro && (
                <ParceiroCombobox value={codparc} onChange={setCodparc} />
              )}
            </Box>
          </Collapse>
        </Paper>
      )}

      {/* ═══ Secao 5: Equipe (colapsavel, condicional) ═══ */}
      {showEquipe && (
        <Paper sx={paperSx}>
          <SectionHeader
            icon={<People sx={{ fontSize: 20 }} />}
            label="Equipe"
            hint={showTeam ? 'Quem vai executar?' : 'Toque para atribuir operadores ou mecanicos'}
                        color="#e65100"
            collapsible
            collapsed={!showTeam}
            onToggle={() => setShowTeam((s) => !s)}
          />
          <Collapse in={showTeam}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {showOperadores && (
                <UsuarioSelect
                  label="Operadores"
                  value={operadores}
                  onChange={setOperadores}
                  placeholder="Selecionar operadores..."
                />
              )}
              {showMecanicos && (
                <UsuarioSelect
                  label="Mecanicos"
                  value={mecanicos}
                  onChange={setMecanicos}
                  placeholder="Selecionar mecanicos..."
                  departamento="MANUTENÇÃO"
                />
              )}
            </Box>
          </Collapse>
        </Paper>
      )}

      {/* ═══ Botao Salvar — grande e claro ═══ */}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={!canSubmit}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
        sx={{
          py: 2,
          fontWeight: 800,
          fontSize: 16,
          borderRadius: 3,
          letterSpacing: 0.5,
          boxShadow: canSubmit ? '0 4px 14px rgba(46,125,50,0.3)' : 'none',
          '&:not(:disabled):hover': {
            boxShadow: '0 6px 20px rgba(46,125,50,0.4)',
          },
        }}
      >
        {loading ? 'Salvando...' : 'Salvar Situacao'}
      </Button>
    </Box>
  );
}
