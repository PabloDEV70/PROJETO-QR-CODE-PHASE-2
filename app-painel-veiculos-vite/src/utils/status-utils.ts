import type { PainelVeiculo } from '@/types/hstvei-types';

export interface StatusInfo {
  label: string;
  color: string;
  bgLight: string;
}

/** Paleta de cores por departamento — chave é o nome normalizado */
const DEP_COLORS: Record<string, { color: string; bgLight: string }> = {
  'comercial':           { color: '#2196f3', bgLight: '#e3f2fd' },
  'manutencao':          { color: '#ff9800', bgLight: '#fff3e0' },
  'manutenção':          { color: '#ff9800', bgLight: '#fff3e0' },
  'compras':             { color: '#ffc107', bgLight: '#fffde7' },
  'logistica':           { color: '#4caf50', bgLight: '#e8f5e9' },
  'logistica / patio':   { color: '#4caf50', bgLight: '#e8f5e9' },
  'operacao':            { color: '#00bcd4', bgLight: '#e0f7fa' },
  'operação':            { color: '#00bcd4', bgLight: '#e0f7fa' },
};

const FALLBACK: StatusInfo = { label: 'Outro', color: '#9e9e9e', bgLight: '#f5f5f5' };

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\.$/, '');
}

/** Resolve cor pelo nome do departamento (dado da tabela) */
export function getStatusInfo(departamento: string | undefined): StatusInfo {
  if (!departamento) return FALLBACK;
  const key = normalize(departamento);
  const found = DEP_COLORS[key];
  if (found) return { label: departamento.trim().replace(/\.$/, ''), ...found };
  // Busca parcial para departamentos futuros
  for (const [k, v] of Object.entries(DEP_COLORS)) {
    if (key.includes(k) || k.includes(key)) return { label: departamento.trim().replace(/\.$/, ''), ...v };
  }
  return { ...FALLBACK, label: departamento.trim().replace(/\.$/, '') };
}

/** Pega StatusInfo do veiculo usando categoria (=departamentoNome) da 1a situacao */
export function getVeiculoStatusInfo(v: PainelVeiculo): StatusInfo {
  const sit = v.situacoesAtivas[0];
  return getStatusInfo(sit?.categoria ?? sit?.departamento);
}

export function contarPorDepartamento(veiculos: PainelVeiculo[]) {
  const counts: Record<string, number> = {};
  for (const v of veiculos) {
    const dep = v.situacoesAtivas[0]?.categoria ?? v.situacoesAtivas[0]?.departamento ?? 'Outro';
    const key = dep.trim().replace(/\.$/, '');
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export function normalizeFamilia(tipo: string | null): string {
  if (!tipo) return 'Outros';
  const t = tipo.trim().toUpperCase();
  if (t.includes('EMPILHADEIRA') || t.includes('EMPILHADEIR')) return 'Empilhadeiras';
  if (t.includes('GUINDASTE')) return 'Guindastes';
  if (t.includes('GUINDAUTO')) return 'Guindautos';
  if (t.includes('CARRO') || t.includes('CAMINHONETE') || t.includes('SUV')) return 'Veiculos Leves';
  if (t.includes('CAMINHAO') || t.includes('CAMINHÃO')) return 'Caminhoes';
  if (t.includes('PLATAFORMA')) return 'Plataformas';
  if (t.includes('GERADOR')) return 'Geradores';
  if (t.includes('COMPRESSOR')) return 'Compressores';
  if (t.includes('ONIBUS') || t.includes('ÔNIBUS') || t.includes('VAN') || t.includes('MICRO')) return 'Transporte';
  if (t.includes('TRATOR') || t.includes('RETROESCAV') || t.includes('ESCAVAD')) return 'Linha Amarela';
  return tipo.trim();
}
