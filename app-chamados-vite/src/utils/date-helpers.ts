function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function formatDate(value: string | null | object): string {
  if (!value || typeof value !== 'string') return '-';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString('pt-BR');
}

export function elapsedText(dateStr: string | null | object): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const ms = Date.now() - new Date(dateStr).getTime();
  if (isNaN(ms) || ms < 0) return null;
  const h = Math.floor(ms / 3_600_000);
  if (h < 1) return 'Agora mesmo';
  if (h < 24) return `${h}h atras`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} dia${d > 1 ? 's' : ''} atras`;
  const m = Math.floor(d / 30);
  return `${m} mes${m > 1 ? 'es' : ''} atras`;
}

export function elapsedShort(dateStr: string | null): string {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const h = Math.floor((Date.now() - new Date(dateStr).getTime()) / 3_600_000);
  if (isNaN(h) || h < 0) return '';
  if (h < 1) return 'agora';
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return d < 30 ? `${d}d` : `${Math.floor(d / 30)}m`;
}

export function fmtDateShort(val: string | null): string {
  if (!val || typeof val !== 'string') return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function fmtDateTime(val: string | null): string {
  if (!val) return '-';
  return new Date(val).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

/** WhatsApp-style: HH:mm for today, DD/MM HH:mm for older */
export function fmtBubbleTime(val: string | null): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

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
