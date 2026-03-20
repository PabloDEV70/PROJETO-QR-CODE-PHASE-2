import type { EstoqueLocal } from '@/types/local-produto';

export type HealthLevel = 'critico' | 'atencao' | 'ok' | 'excesso';

export function getHealthLevel(item: EstoqueLocal): HealthLevel {
  const { estoque, estMin, estMax } = item;

  if (estMin > 0 && estoque < estMin) return 'critico';
  if (estMax > 0 && estoque > estMax) return 'excesso';
  if (estMin > 0 && estoque <= estMin * 1.2) return 'atencao';
  return 'ok';
}

export function getHealthColor(level: HealthLevel): string {
  const map: Record<HealthLevel, string> = {
    critico: 'error.main',
    atencao: 'warning.main',
    ok: 'success.main',
    excesso: 'info.main',
  };
  return map[level];
}

export function getHealthLabel(level: HealthLevel): string {
  const map: Record<HealthLevel, string> = {
    critico: 'Crítico',
    atencao: 'Atenção',
    ok: 'OK',
    excesso: 'Excesso',
  };
  return map[level];
}

export function getHealthChipColor(
  level: HealthLevel,
): 'error' | 'warning' | 'success' | 'info' {
  const map: Record<HealthLevel, 'error' | 'warning' | 'success' | 'info'> = {
    critico: 'error',
    atencao: 'warning',
    ok: 'success',
    excesso: 'info',
  };
  return map[level];
}

export function getDisponivel(item: EstoqueLocal): number {
  return Math.max(0, item.estoque - item.reservado);
}

export function isDesativado(item: EstoqueLocal): boolean {
  const nameMatch = item.descrProd.toUpperCase().includes('DESATIV');
  const atoInativo = item.prodAtivo === 'N';
  return nameMatch || atoInativo;
}
