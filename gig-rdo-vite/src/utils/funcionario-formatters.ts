/** Format date string to pt-BR locale */
export function fmtDate(val: string | null | undefined): string {
  if (!val) return '-';
  return new Date(val).toLocaleDateString('pt-BR');
}

/** Format BRL currency */
export function fmtCurrency(val: number | null | undefined): string {
  if (val == null) return '-';
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Calculate age from birth date, accounting for birthday edge case */
export function calcIdade(dtNasc: string | null | undefined): number | null {
  if (!dtNasc) return null;
  const birth = new Date(dtNasc);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

/** Format days-at-company as Xa Ym or Xm or Xd */
export function fmtTempoEmpresa(dtadm: string | null | undefined): string {
  if (!dtadm) return '-';
  const adm = new Date(dtadm);
  const now = new Date();
  const dias = Math.floor((now.getTime() - adm.getTime()) / 86_400_000);
  if (dias < 0) return '-';
  const anos = Math.floor(dias / 365);
  const meses = Math.floor((dias % 365) / 30);
  if (anos > 0 && meses > 0) return `${anos}a ${meses}m`;
  if (anos > 0) return `${anos}a`;
  if (meses > 0) return `${meses}m`;
  return `${dias}d`;
}

/** Format CPF with dots and dash */
export function fmtCpf(val: string | null | undefined): string {
  if (!val) return '-';
  const digits = val.replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  return val;
}
