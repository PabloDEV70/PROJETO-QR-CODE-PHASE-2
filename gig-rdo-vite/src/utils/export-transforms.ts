export function txDate(val: unknown): string {
  if (val == null) return '';
  const s = String(val);
  const dateOnly = s.split('T')[0];
  if (!dateOnly || dateOnly.length < 10) return s;
  const [y, m, d] = dateOnly.split('-');
  return `${d}/${m}/${y}`;
}

export function txBool(val: unknown): string {
  if (val === true || val === 'Sim') return 'Sim';
  if (val === false || val === 'Nao') return 'Nao';
  return val == null ? '' : String(val);
}

export function txNum2(val: unknown): string {
  if (val == null) return '';
  const n = Number(val);
  if (isNaN(n)) return String(val);
  return n.toFixed(2).replace('.', ',');
}

export function txDash(val: unknown): string {
  return val == null || val === '' ? '-' : String(val);
}
