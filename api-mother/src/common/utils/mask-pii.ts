/**
 * Utilitários para mascarar dados pessoais sensíveis (PII)
 * antes de retornar em respostas de API.
 */

export function maskCpf(cpf: string | null | undefined): string | null {
  if (!cpf) return null;
  const clean = cpf.replace(/\D/g, '');
  if (clean.length < 11) return '***';
  return `***.***. ${clean.slice(7, 10)}-${clean.slice(10)}`;
}

export function maskEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local[0]}***@${domain}`;
}

export function maskRg(rg: string | null | undefined): string | null {
  if (!rg) return null;
  const clean = rg.replace(/\D/g, '');
  if (clean.length < 3) return '***';
  return `***${clean.slice(-3)}`;
}

/**
 * Remove campos sensíveis e mascara PII em um objeto de usuário.
 * Campos removidos: SENHASMTP, SENHAECONECT, DTNASC, RG
 * Campos mascarados: CPF, EMAIL
 */
export function sanitizeUserResponse(user: Record<string, any>): Record<string, any> {
  if (!user) return user;
  const sanitized: Record<string, any> = { ...user };

  // Remover campos que nunca devem sair na API
  delete sanitized['SENHASMTP'];
  delete sanitized['SENHAECONECT'];
  delete sanitized['DTNASC'];
  delete sanitized['RG'];
  delete sanitized['INTERNO'];

  // Mascarar PII
  if (sanitized['CPF']) {
    sanitized['CPF'] = maskCpf(sanitized['CPF']);
  }
  if (sanitized['EMAIL']) {
    sanitized['EMAIL'] = maskEmail(sanitized['EMAIL']);
  }

  return sanitized;
}
