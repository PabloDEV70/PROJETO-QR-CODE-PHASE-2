import {
  BuildRounded, EngineeringRounded, CheckCircleRounded,
  CancelRounded, HandymanRounded, DirectionsCarRounded,
  LocalShippingRounded, WarningRounded,
} from '@mui/icons-material';
import type { OsStatusCode } from '@/types/os-types';

const I = { fontSize: '13px !important' };

export interface OsStatusDef {
  label: string;
  color: string;
  fg: string;
  bg: string;
  icon: React.ReactNode;
}

export const OS_STATUS_MAP: Record<OsStatusCode, OsStatusDef> = {
  A: {
    label: 'Aberta', color: '#f59e0b', fg: '#b45309', bg: '#fef3c7',
    icon: <BuildRounded sx={I} />,
  },
  E: {
    label: 'Em Execucao', color: '#0ea5e9', fg: '#0369a1', bg: '#e0f2fe',
    icon: <EngineeringRounded sx={I} />,
  },
  F: {
    label: 'Finalizada', color: '#22c55e', fg: '#15803d', bg: '#dcfce7',
    icon: <CheckCircleRounded sx={I} />,
  },
  C: {
    label: 'Cancelada', color: '#ef4444', fg: '#b91c1c', bg: '#fee2e2',
    icon: <CancelRounded sx={I} />,
  },
  R: {
    label: 'Reaberta', color: '#a855f7', fg: '#7e22ce', bg: '#f3e8ff',
    icon: <BuildRounded sx={I} />,
  },
};

export interface TipoManutDef {
  label: string;
  color: string;
  icon: React.ReactNode;
}

export const TIPO_MANUT_MAP: Record<string, TipoManutDef> = {
  P: { label: 'Preventiva', color: '#2e7d32', icon: <DirectionsCarRounded sx={I} /> },
  C: { label: 'Corretiva', color: '#d32f2f', icon: <HandymanRounded sx={I} /> },
  '2': { label: 'Corretiva Prog.', color: '#ed6c02', icon: <HandymanRounded sx={I} /> },
  '5': { label: 'Borracharia', color: '#0288d1', icon: <LocalShippingRounded sx={I} /> },
  '1': { label: 'Rev. Garantia', color: '#7b1fa2', icon: <CheckCircleRounded sx={I} /> },
  R: { label: 'Reforma', color: '#c2185b', icon: <BuildRounded sx={I} /> },
  S: { label: 'Socorro', color: '#f44336', icon: <WarningRounded sx={I} /> },
  O: { label: 'Outros', color: '#757575', icon: <BuildRounded sx={I} /> },
  T: { label: 'Retorno', color: '#795548', icon: <HandymanRounded sx={I} /> },
  '3': { label: 'Inventariado', color: '#607d8b', icon: <BuildRounded sx={I} /> },
  '4': { label: 'Logistica', color: '#00897b', icon: <LocalShippingRounded sx={I} /> },
};

export const STATUSGIG_MAP: Record<string, { label: string; impeditivo: boolean }> = {
  MA: { label: 'Manutencao', impeditivo: true },
  AI: { label: 'Aguard. Pecas (Imp)', impeditivo: true },
  AV: { label: 'Avaliacao', impeditivo: true },
  SI: { label: 'Servico (Imp)', impeditivo: true },
  AN: { label: 'Aguard. Pecas', impeditivo: false },
  SN: { label: 'Servico Terc.', impeditivo: false },
};

export const ALL_OS_STATUSES: OsStatusCode[] = ['A', 'E', 'F', 'C', 'R'];

export const OS_STATUS_OPTIONS = [
  { value: '', label: 'Todos Status' },
  ...ALL_OS_STATUSES.map((s) => ({ value: s, label: OS_STATUS_MAP[s].label })),
];

export const TIPO_MANUT_OPTIONS = [
  { value: '', label: 'Todos Tipos' },
  ...Object.entries(TIPO_MANUT_MAP).map(([k, v]) => ({ value: k, label: v.label })),
];

export const STATUSGIG_OPTIONS = [
  { value: '', label: 'Todos Status GIG' },
  ...Object.entries(STATUSGIG_MAP).map(([k, v]) => ({ value: k, label: v.label })),
];

export const LOCAL_MANUT_MAP: Record<string, string> = {
  '1': 'Oficina',
  '2': 'Campo',
  '3': 'Terceiro',
};

export const LOCAL_MANUT_OPTIONS = [
  { value: '', label: 'Nenhum' },
  ...Object.entries(LOCAL_MANUT_MAP).map(([k, v]) => ({ value: k, label: v })),
];

export const TIPO_OS_OPTIONS = [
  { value: 'I', label: 'Interna' },
  { value: 'E', label: 'Externa' },
];

