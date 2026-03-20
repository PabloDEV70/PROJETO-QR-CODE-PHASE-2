import {
  Build, LocalShipping, Engineering, Storefront, Settings,
  Handyman, BusinessCenter, ShoppingCart, PrecisionManufacturing,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

export interface DepartamentoInfo {
  label: string;
  color: string;
  bgLight: string;
  Icon: SvgIconComponent;
}

const DEFAULT_DEP: DepartamentoInfo = {
  label: 'Outro', color: '#9e9e9e', bgLight: '#f5f5f5', Icon: Settings,
};

/** Paleta de cores por nome normalizado do departamento (vem da tabela TFPDEP) */
const DEP_STYLES: Record<string, { color: string; bgLight: string; Icon: SvgIconComponent }> = {
  'mecanica':            { color: '#1976d2', bgLight: '#e3f2fd', Icon: Build },
  'mecânica':            { color: '#1976d2', bgLight: '#e3f2fd', Icon: Build },
  'eletrica':            { color: '#f57c00', bgLight: '#fff3e0', Icon: Engineering },
  'elétrica':            { color: '#f57c00', bgLight: '#fff3e0', Icon: Engineering },
  'funilaria':           { color: '#7b1fa2', bgLight: '#f3e5f5', Icon: Handyman },
  'pneus':               { color: '#388e3c', bgLight: '#e8f5e9', Icon: Build },
  'comercial':           { color: '#c62828', bgLight: '#ffebee', Icon: Storefront },
  'logistica':           { color: '#00838f', bgLight: '#e0f7fa', Icon: LocalShipping },
  'logistica / patio':   { color: '#00838f', bgLight: '#e0f7fa', Icon: LocalShipping },
  'administrativo':      { color: '#5d4037', bgLight: '#efebe9', Icon: BusinessCenter },
  'compras':             { color: '#ffc107', bgLight: '#fffde7', Icon: ShoppingCart },
  'operacao':            { color: '#00bcd4', bgLight: '#e0f7fa', Icon: PrecisionManufacturing },
  'operação':            { color: '#00bcd4', bgLight: '#e0f7fa', Icon: PrecisionManufacturing },
  'manutencao':          { color: '#ff9800', bgLight: '#fff3e0', Icon: Build },
  'manutenção':          { color: '#ff9800', bgLight: '#fff3e0', Icon: Build },
};

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\.$/, '');
}

/** Resolve departamento por NOME (string da tabela TFPDEP), nao por codigo */
export function getDepartamentoInfo(departamentoNome: string | null | undefined): DepartamentoInfo {
  if (!departamentoNome) return DEFAULT_DEP;
  const key = normalize(departamentoNome);
  const found = DEP_STYLES[key];
  if (found) return { label: departamentoNome.trim().replace(/\.$/, ''), ...found };
  // Busca parcial para departamentos futuros
  for (const [k, v] of Object.entries(DEP_STYLES)) {
    if (key.includes(k) || k.includes(key)) {
      return { label: departamentoNome.trim().replace(/\.$/, ''), ...v };
    }
  }
  return { ...DEFAULT_DEP, label: departamentoNome.trim().replace(/\.$/, '') };
}
