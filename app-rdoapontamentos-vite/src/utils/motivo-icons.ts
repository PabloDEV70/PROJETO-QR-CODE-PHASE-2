import {
  Build, Wc, Restaurant, LocalCafe, DirectionsCar,
  HourglassEmpty, Description, School, SmokeFree, Cloud,
  LocalHospital, CleanHands, Handyman, Schedule, Engineering,
  PrecisionManufacturing, SettingsAccessibility, Coffee,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

export const MOTIVO_ICONS: Record<string, SvgIconComponent> = {
  ATVP: Build, AGEXT: PrecisionManufacturing,
  BANH: Wc, ALMOC: Restaurant, LANCHE: LocalCafe, CAFE: Coffee,
  DESLOC: DirectionsCar, AGPECA: HourglassEmpty, AGD: Schedule,
  'O.S': Description, DDS: School, TREINO: School,
  SOCORR: LocalHospital, FUMAR: SmokeFree, '5S': CleanHands,
  PECAS: Handyman, EPI: SettingsAccessibility, ALINHAM: Engineering,
  CLIMA: Cloud, PESSOAL: Coffee,
};

export function getMotivoIcon(sigla: string | null | undefined): SvgIconComponent {
  return MOTIVO_ICONS[sigla ?? ''] ?? Coffee;
}

export function getMotivoIconProd(sigla: string | null | undefined): SvgIconComponent {
  return MOTIVO_ICONS[sigla ?? ''] ?? Build;
}
