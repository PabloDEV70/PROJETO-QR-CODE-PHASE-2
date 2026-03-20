import { useQuery } from '@tanstack/react-query';
import {
  executeQuery,
  getTableSchema,
  getTableKeys,
  getTableRelations,
} from '@/api/database';
import { pickDescriptiveColumn } from '@/hooks/use-database';

const GC_LONG = 30 * 60_000;

export function useTableSchema(tableName: string | null) {
  return useQuery({
    queryKey: ['db', 'tables', tableName, 'schema'],
    queryFn: () => getTableSchema(tableName!),
    enabled: !!tableName,
    staleTime: 10 * 60_000,
    gcTime: GC_LONG,
  });
}

export function useTableKeys(tableName: string | null) {
  return useQuery({
    queryKey: ['db', 'tables', tableName, 'keys'],
    queryFn: () => getTableKeys(tableName!),
    enabled: !!tableName,
    staleTime: 10 * 60_000,
    gcTime: GC_LONG,
  });
}

export function useTableRelations(tableName: string | null) {
  return useQuery({
    queryKey: ['db', 'tables', tableName, 'relations'],
    queryFn: () => getTableRelations(tableName!),
    enabled: !!tableName,
    staleTime: 10 * 60_000,
    gcTime: GC_LONG,
  });
}

export function useFkLookup(
  refTable: string | null,
  refColumn: string | null,
  value: unknown,
) {
  const escaped = value != null ? String(value).replace(/'/g, "''") : '';
  return useQuery({
    queryKey: ['db', 'fk-lookup', refTable, refColumn, String(value)],
    queryFn: async () => {
      try {
        const result = await executeQuery(
          `SELECT TOP 1 * FROM [${refTable}] WHERE [${refColumn}] = '${escaped}'`,
        );
        const row = result.linhas[0] ?? null;
        if (!row) return null;
        return pickDescriptiveColumn(row, refColumn!);
      } catch {
        return null;
      }
    },
    enabled: !!refTable && !!refColumn && value != null && value !== '',
    staleTime: 10 * 60_000,
    gcTime: GC_LONG,
    retry: false,
  });
}
