import { useState } from 'react';
import {
  Box, TextField, Button, Paper, Typography, CircularProgress,
} from '@mui/material';
import {
  Save, DirectionsCar, Description,
  LinkRounded, People, Schedule, InfoOutlined,
} from '@mui/icons-material';
import { VeiculoCombobox } from '@/components/situacoes/veiculo-combobox';
import { SituacaoSelect } from '@/components/situacoes/situacao-select';
import { PrioridadeSelect } from '@/components/situacoes/prioridade-select';
import { OsManutencaoCombobox } from '@/components/situacoes/os-manutencao-combobox';
import { OsComercialCombobox } from '@/components/situacoes/os-comercial-combobox';
import { ParceiroCombobox } from '@/components/situacoes/parceiro-combobox';
import { UsuarioSelect } from '@/components/shared/usuario-select';
import type { CriarSituacaoPayload } from '@/types/hstvei-types';

export type DepFilter = 'manutencao' | 'comercial' | 'logistica' | 'operacao' | 'compras' | null;

interface SituacaoFormProps {
  initialValues?: Partial<CriarSituacaoPayload>;
  onSubmit: (values: CriarSituacaoPayload) => void;
  loading?: boolean;
  disableVeiculo?: boolean;
  /** Filtra situacoes por departamento e exibe apenas campos relevantes */
  depFilter?: DepFilter;
}

function SectionHeader({ icon, label, hint }: { icon: React.ReactNode; label: string; hint?: string }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
        <Typography variant="overline" sx={{ color: 'text.secondary', lineHeight: 1, fontWeight: 700 }}>
          {label}
        </Typography>
      </Box>
      {hint && (
        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5, pl: 3.5 }}>
          {hint}
        </Typography>
      )}
    </Box>
  );
}

function FieldHint({ text }: { text: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mt: -0.5, mb: 0.5 }}>
      <InfoOutlined sx={{ fontSize: 13, color: 'info.main', mt: '1px', flexShrink: 0 }} />
      <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.3 }}>
        {text}
      </Typography>
    </Box>
  );
}

function safeDateStr(v: unknown): string {
  if (!v || typeof v !== 'string') return '';
  return v;
}

/** Map depFilter key to department name substrings for filtering situacoes */
const DEP_FILTER_MAP: Record<string, string[]> = {
  manutencao: ['MANUTENÇÃO', 'MANUTENCAO'],
  comercial: ['COMERCIAL'],
  logistica: ['LOGISTICA', 'LOGÍSTICA', 'PATIO', 'PÁTIO'],
  operacao: ['OPERAÇÃO', 'OPERACAO'],
  compras: ['COMPRAS'],
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

  // Visibility rules per department
  const showOsManut = !depFilter || depFilter === 'manutencao';
  const showOsComerc = !depFilter || depFilter === 'comercial' || depFilter === 'logistica' || depFilter === 'operacao';
  const showNota = !depFilter || depFilter === 'manutencao' || depFilter === 'compras';
  const showParceiro = !depFilter || depFilter === 'manutencao' || depFilter === 'comercial' || depFilter === 'compras';
  const showMecanicos = !depFilter || depFilter === 'manutencao';
  const showOperadores = !depFilter || depFilter === 'comercial' || depFilter === 'logistica' || depFilter === 'operacao';
  const showVinculacoes = showOsManut || showOsComerc || showNota || showParceiro;
  const showEquipe = showMecanicos || showOperadores;

  // Situacao filter keywords
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

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Secao 1: Veiculo + Classificacao */}
      <Paper sx={{ p: 2 }}>
        <SectionHeader
          icon={<DirectionsCar sx={{ fontSize: 20 }} />}
          label="Veiculo e Classificacao"
          hint="Selecione o veiculo e defina a situacao e prioridade."
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <VeiculoCombobox value={codveiculo} onChange={setCodveiculo} required disabled={disableVeiculo} />
          <FieldHint text="Busque pela placa, TAG ou modelo do veiculo." />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Box>
              <SituacaoSelect
                value={idsit}
                onChange={setIdsit}
                required
                filterByDep={depFilterKeywords}
              />
              <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5, fontSize: '0.65rem' }}>
                Tipo de ocorrencia
              </Typography>
            </Box>
            <Box>
              <PrioridadeSelect value={idpri} onChange={setIdpri} />
              <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5, fontSize: '0.65rem' }}>
                Urgente, Alta, Media ou Baixa
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Secao 2: Detalhes */}
      <Paper sx={{ p: 2 }}>
        <SectionHeader
          icon={<Description sx={{ fontSize: 20 }} />}
          label="Detalhes"
          hint="Descreva o motivo e informacoes adicionais."
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            fullWidth size="small" multiline rows={2}
            inputProps={{ maxLength: 500 }}
            placeholder="Ex: Motor com superaquecimento, veiculo parado no patio..."
            helperText="Motivo principal. Visivel no painel e timeline."
          />
          <TextField
            label="Observacoes"
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            fullWidth size="small" multiline rows={2}
            inputProps={{ maxLength: 1000 }}
            placeholder="Ex: Pecas encomendadas, aguardando aprovacao..."
            helperText="Complementar. Apenas visivel na tela de detalhe."
          />
        </Box>
      </Paper>

      {/* Secao 3: Datas */}
      <Paper sx={{ p: 2 }}>
        <SectionHeader
          icon={<Schedule sx={{ fontSize: 20 }} />}
          label="Datas"
          hint="Se nao informado, o inicio sera a data atual."
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Inicio"
            type="datetime-local"
            value={dtinicio}
            onChange={(e) => setDtinicio(e.target.value)}
            fullWidth size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="Quando a situacao comecou. Padrao: agora."
          />
          <TextField
            label="Previsao de conclusao"
            type="datetime-local"
            value={dtprevisao}
            onChange={(e) => setDtprevisao(e.target.value)}
            fullWidth size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="Gera alertas quando vencer."
          />
          <TextField
            label="Fim"
            type="datetime-local"
            value={dtfim}
            onChange={(e) => setDtfim(e.target.value)}
            fullWidth size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="Ao preencher, a situacao sera considerada encerrada."
          />
        </Box>
      </Paper>

      {/* Secao 4: Vinculacoes (condicional) */}
      {showVinculacoes && (
        <Paper sx={{ p: 2 }}>
          <SectionHeader
            icon={<LinkRounded sx={{ fontSize: 20 }} />}
            label="Vinculacoes"
            hint="Associe a OS, notas ou parceiros. Todos opcionais."
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {showOsManut && (
              <Box>
                <OsManutencaoCombobox value={nuos} onChange={setNuos} />
                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5, fontSize: '0.65rem' }}>
                  OS de manutencao (TCFOSCAB)
                </Typography>
              </Box>
            )}
            {showOsComerc && (
              <Box>
                <OsComercialCombobox value={numos} onChange={setNumos} />
                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5, fontSize: '0.65rem' }}>
                  OS comercial / mobilizacao (TCSOSE)
                </Typography>
              </Box>
            )}
            {showNota && (
              <TextField
                label="Nota Fiscal (NUNOTA)"
                type="number"
                value={nunota}
                onChange={(e) => setNunota(e.target.value)}
                fullWidth size="small"
                placeholder="Numero da nota"
                helperText="Rastrear cadeia de notas no Sankhya."
              />
            )}
            {showParceiro && (
              <Box>
                <ParceiroCombobox value={codparc} onChange={setCodparc} />
                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5, fontSize: '0.65rem' }}>
                  Fornecedor, cliente ou oficina externa
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      )}

      {/* Secao 5: Equipe (condicional) */}
      {showEquipe && (
        <Paper sx={{ p: 2 }}>
          <SectionHeader
            icon={<People sx={{ fontSize: 20 }} />}
            label="Equipe"
            hint="Responsaveis pela execucao. Foto no painel e timeline."
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {showOperadores && (
              <Box>
                <UsuarioSelect
                  label="Operadores"
                  value={operadores}
                  onChange={setOperadores}
                  placeholder="Selecionar operadores..."
                />
                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5, fontSize: '0.65rem' }}>
                  Operadores de equipamento ou responsaveis
                </Typography>
              </Box>
            )}
            {showMecanicos && (
              <Box>
                <UsuarioSelect
                  label="Mecanicos"
                  value={mecanicos}
                  onChange={setMecanicos}
                  placeholder="Selecionar mecanicos..."
                  departamento="MANUTENÇÃO"
                />
                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5, fontSize: '0.65rem' }}>
                  Mecanicos e tecnicos de manutencao
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      )}

      {/* Botao Salvar */}
      <Button
        type="submit" variant="contained" fullWidth
        sx={{ py: 1.5, fontWeight: 700, fontSize: '0.95rem', borderRadius: 2 }}
        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Save />}
        disabled={loading || !codveiculo || !idsit}
      >
        {loading ? 'Salvando...' : 'Salvar'}
      </Button>
    </Box>
  );
}
