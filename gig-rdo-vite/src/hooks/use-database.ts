import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { executeQuery, getTables, getDbResumo } from '@/api/database';

export interface FkDetail { table: string; column: string }

const DESCR_RE = /^(DESCR|NOME|RAZAO|DESCRPROD|NOMEPARC|RAZAOSOCIAL|FANTASIA)/i;

export function pickDescriptiveColumn(
  row: Record<string, unknown>,
  refColumn: string,
): string | null {
  const keys = Object.keys(row).filter((k) => k !== refColumn);
  const match = keys.find((k) => DESCR_RE.test(k));
  if (match && row[match] != null) return String(row[match]);
  const strCol = keys.find((k) => typeof row[k] === 'string' && String(row[k]).length > 2);
  if (strCol) return String(row[strCol]);
  const first2 = keys.slice(0, 2);
  if (first2.length > 0) return first2.map((k) => `${k}=${row[k] ?? ''}`).join(', ');
  return null;
}

const GC_LONG = 30 * 60_000;

export function useDbQuery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sql: string) => executeQuery(sql),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['db', 'monitor'] }),
  });
}

export function useDbTables() {
  return useQuery({
    queryKey: ['db', 'tables'],
    queryFn: getTables,
    staleTime: 10 * 60_000,
    gcTime: GC_LONG,
  });
}

export function useDbResumo() {
  return useQuery({
    queryKey: ['db', 'resumo'],
    queryFn: getDbResumo,
    staleTime: 10 * 60_000,
    gcTime: GC_LONG,
  });
}
