import type { AcaoTela } from '@/types/permissoes-types';

export interface DecodedPermission {
  sigla: string;
  descricao: string;
  bit: number;
  allowed: boolean;
}

/**
 * Standard Sankhya permission bits (fallback when TDDIAC actions unavailable).
 * Bit 0 = least significant bit of the hex string.
 */
const STANDARD_BITS: { bit: number; sigla: string; descricao: string }[] = [
  { bit: 0, sigla: 'VIS', descricao: 'Visualizar' },
  { bit: 1, sigla: 'INC', descricao: 'Incluir' },
  { bit: 2, sigla: 'ALT', descricao: 'Alterar' },
  { bit: 3, sigla: 'EXC', descricao: 'Excluir' },
  { bit: 4, sigla: 'IMP', descricao: 'Imprimir' },
  { bit: 5, sigla: 'EXP', descricao: 'Exportar' },
  { bit: 6, sigla: 'ANN', descricao: 'Anotar' },
  { bit: 7, sigla: 'ATH', descricao: 'Anexar' },
];

/**
 * Parse a hex ACESSO string to a bigint bitmask.
 * Handles empty, null, and "0" gracefully.
 */
function parseHex(hex: string | null | undefined): bigint {
  if (!hex || hex.trim() === '' || hex.trim() === '0') return 0n;
  const clean = hex.trim().replace(/^0x/i, '');
  try {
    return BigInt(`0x${clean}`);
  } catch {
    return 0n;
  }
}

/**
 * Check if a specific bit is set in the bitmask.
 */
function isBitSet(mask: bigint, bit: number): boolean {
  return (mask & (1n << BigInt(bit))) !== 0n;
}

/**
 * Decode ACESSO hex value using TDDIAC actions (if available) or standard bits.
 *
 * @param acesso - Hex string from TDDPER.ACESSO (e.g. "F", "A3", "1F")
 * @param acoes  - Optional TDDIAC actions with CONTROLE bit positions
 * @returns Array of decoded permissions with allowed/denied status
 */
export function decodeAcesso(
  acesso: string | null | undefined,
  acoes?: AcaoTela[],
): DecodedPermission[] {
  const mask = parseHex(acesso);

  if (acoes && acoes.length > 0) {
    return acoes.map((a) => {
      const bit = parseInt(a.controle, 10);
      return {
        sigla: a.sigla,
        descricao: a.descricao,
        bit: isNaN(bit) ? -1 : bit,
        allowed: isNaN(bit) ? false : isBitSet(mask, bit),
      };
    });
  }

  return STANDARD_BITS.map((s) => ({
    ...s,
    allowed: isBitSet(mask, s.bit),
  }));
}

/**
 * Count how many permissions are granted in an ACESSO hex value.
 */
export function countGranted(
  acesso: string | null | undefined,
  acoes?: AcaoTela[],
): number {
  return decodeAcesso(acesso, acoes).filter((p) => p.allowed).length;
}

/**
 * Quick summary: "3/8 permissoes" format.
 */
export function acessoSummary(
  acesso: string | null | undefined,
  acoes?: AcaoTela[],
): string {
  const decoded = decodeAcesso(acesso, acoes);
  const granted = decoded.filter((p) => p.allowed).length;
  return `${granted}/${decoded.length}`;
}
