export type Density = 'compact' | 'standard' | 'comfortable';

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Mes RH: dia 21 do mes anterior ate dia 20 do mes atual */
export function getMesRhDates(): { ini: string; fim: string } {
  const now = new Date();
  const ini = new Date(now.getFullYear(), now.getMonth() - 1, 21);
  const fim = new Date(now.getFullYear(), now.getMonth(), 20);
  return { ini: toISO(ini), fim: toISO(fim) };
}

export interface PeriodPreset {
  key: string;
  label: string;
  ini: string;
  fim: string;
}

export function getPeriodPresets(): PeriodPreset[] {
  const now = new Date();
  const today = toISO(now);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const d7 = new Date(now);
  d7.setDate(now.getDate() - 6);
  const d15 = new Date(now);
  d15.setDate(now.getDate() - 14);
  const d30 = new Date(now);
  d30.setDate(now.getDate() - 29);
  const mesAtual = new Date(now.getFullYear(), now.getMonth(), 1);
  const mesAnteriorIni = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const mesAnteriorFim = new Date(now.getFullYear(), now.getMonth(), 0);

  const mesRhIni = new Date(now.getFullYear(), now.getMonth() - 1, 21);
  const mesRhFim = new Date(now.getFullYear(), now.getMonth(), 20);

  return [
    { key: 'hoje', label: 'Hoje', ini: today, fim: today },
    { key: 'ontem', label: 'Ontem', ini: toISO(yesterday), fim: toISO(yesterday) },
    { key: '7d', label: '7 dias', ini: toISO(d7), fim: today },
    { key: '15d', label: '15 dias', ini: toISO(d15), fim: today },
    { key: '30d', label: '30 dias', ini: toISO(d30), fim: today },
    { key: 'mes', label: 'Este mes', ini: toISO(mesAtual), fim: today },
    { key: 'mesrh', label: 'Mes RH', ini: toISO(mesRhIni), fim: toISO(mesRhFim) },
    { key: 'mesant', label: 'Mes anterior', ini: toISO(mesAnteriorIni), fim: toISO(mesAnteriorFim) },
  ];
}

export function getActivePresetKey(
  dataInicio: string,
  dataFim: string,
): string | null {
  const presets = getPeriodPresets();
  const match = presets.find((p) => p.ini === dataInicio && p.fim === dataFim);
  return match?.key || null;
}
