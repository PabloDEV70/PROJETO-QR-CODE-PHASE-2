import {
  Build, LocalShipping, Engineering, Storefront, Settings,
  DirectionsCar, Handyman, BusinessCenter,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

export interface DepartamentoInfo {
  label: string;
  color: string;
  Icon: SvgIconComponent;
}

const DEFAULT_DEP: DepartamentoInfo = { label: 'Outro', color: '#9e9e9e', Icon: Settings };

export const DEPARTAMENTO_MAP: Record<number, DepartamentoInfo> = {
  1: { label: 'Mecanica', color: '#1976d2', Icon: Build },
  2: { label: 'Eletrica', color: '#f57c00', Icon: Engineering },
  3: { label: 'Funilaria', color: '#7b1fa2', Icon: Handyman },
  4: { label: 'Pneus', color: '#388e3c', Icon: DirectionsCar },
  5: { label: 'Comercial', color: '#c62828', Icon: Storefront },
  6: { label: 'Logistica', color: '#00838f', Icon: LocalShipping },
  7: { label: 'Administrativo', color: '#5d4037', Icon: BusinessCenter },
};

export function getDepartamentoInfo(coddep: number): DepartamentoInfo {
  return DEPARTAMENTO_MAP[coddep] ?? DEFAULT_DEP;
}
