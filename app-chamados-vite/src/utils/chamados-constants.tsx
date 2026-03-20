import {
  HourglassBottomRounded, SupportAgentRounded, PauseCircleRounded,
  ScheduleRounded, CheckCircleRounded, CancelRounded,
  FlagRounded, RemoveCircleOutlineRounded,
} from '@mui/icons-material';
import type { ChamadoStatusCode, ChamadoPrioridadeCode } from '@/types/chamados-types';

const I = { fontSize: '13px !important' };

export interface StatusDef {
  label: string;
  color: string;
  fg: string;
  bg: string;
  icon: React.ReactNode;
}

export interface PrioDef {
  label: string;
  color: string;
  fg: string;
  bg: string;
  icon: React.ReactNode;
}

export const STATUS_MAP: Record<ChamadoStatusCode, StatusDef> = {
  P: {
    label: 'Pendente', color: '#f59e0b', fg: '#b45309', bg: '#fef3c7',
    icon: <HourglassBottomRounded sx={I} />,
  },
  E: {
    label: 'Em Atendimento', color: '#0ea5e9', fg: '#0369a1', bg: '#e0f2fe',
    icon: <SupportAgentRounded sx={I} />,
  },
  S: {
    label: 'Solic. Aprovacao', color: '#94a3b8', fg: '#475569', bg: '#f1f5f9',
    icon: <PauseCircleRounded sx={I} />,
  },
  A: {
    label: 'Aprovado', color: '#8b5cf6', fg: '#7c3aed', bg: '#ede9fe',
    icon: <ScheduleRounded sx={I} />,
  },
  F: {
    label: 'Finalizado', color: '#22c55e', fg: '#15803d', bg: '#dcfce7',
    icon: <CheckCircleRounded sx={I} />,
  },
  C: {
    label: 'Cancelado', color: '#ef4444', fg: '#b91c1c', bg: '#fee2e2',
    icon: <CancelRounded sx={I} />,
  },
};

export const PRIO_MAP: Record<ChamadoPrioridadeCode, PrioDef> = {
  A: {
    label: 'Alta', color: '#ef4444', fg: '#dc2626', bg: '#fef2f2',
    icon: <FlagRounded sx={I} />,
  },
  M: {
    label: 'Media', color: '#f59e0b', fg: '#d97706', bg: '#fffbeb',
    icon: <FlagRounded sx={I} />,
  },
  B: {
    label: 'Baixa', color: '#22c55e', fg: '#16a34a', bg: '#f0fdf4',
    icon: <RemoveCircleOutlineRounded sx={I} />,
  },
};

export const TIPO_MAP: Record<string, string> = {
  '01': 'Rede',
  '02': 'Erro de Sistema',
  '03': 'Solicitacao de Acesso',
  '04': 'Solicitacao de Relatorio',
  '05': 'Alteracao de Relatorio',
  '06': 'Software',
  '07': 'Problema em Hardware',
  '08': 'Criacao novo usuario',
  '09': 'Cadastros',
  '10': 'Cancelar Registro',
  '99': 'Outros',
};

export const PARCEIROS_PERMITIDOS: { codparc: number; nome: string }[] = [
  { codparc: 1, nome: 'GIGANTAO LOCADORA DE EQUIPAMENTOS LTDA' },
  { codparc: 174, nome: 'SOLUTEL TELECOM' },
  { codparc: 448, nome: 'GESET GESTAO DE SERVICOS TECNOLOGICOS LT' },
  { codparc: 557, nome: 'SANKHYA JIVA TECNOLOGIA E INOVACAO LTDA' },
];

export const PARCEIROS_EXTERNOS = PARCEIROS_PERMITIDOS.filter((p) => p.codparc !== 1);

export const ALL_STATUSES: ChamadoStatusCode[] = ['P', 'E', 'S', 'A', 'F', 'C'];
export const ALL_PRIOS: ChamadoPrioridadeCode[] = ['A', 'M', 'B'];
export const TIPO_ENTRIES = Object.entries(TIPO_MAP);

export const STATUS_OPTIONS = [
  { value: '', label: 'Todos Status' },
  ...ALL_STATUSES.map((s) => ({ value: s, label: STATUS_MAP[s].label })),
];

export const PRIO_OPTIONS = [
  { value: '', label: 'Todas Prioridades' },
  ...ALL_PRIOS.map((p) => ({ value: p, label: PRIO_MAP[p].label })),
];
