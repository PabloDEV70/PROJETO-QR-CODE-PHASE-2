import { useQuery } from '@tanstack/react-query';
import { executeQuery } from '@/api/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = Record<string, any>;

const STALE = 10 * 60_000;
const GC = 30 * 60_000;

/** Eagerly fetch resourceID from TDDPIN for this instance */
export function useScreenResourceId(nuInstancia: number | null) {
  return useQuery({
    queryKey: ['db', 'screens', 'resourceId', nuInstancia],
    queryFn: async () => {
      const { linhas } = await executeQuery(
        `SELECT RTRIM(VALOR) AS RESOURCEID`
        + ` FROM TDDPIN WHERE NUINSTANCIA = ${nuInstancia} AND NOME = 'resourceID'`,
      );
      const row = linhas[0] as R | undefined;
      return row ? String(row.RESOURCEID ?? '').trim() : null;
    },
    enabled: nuInstancia != null,
    staleTime: STALE, gcTime: GC, retry: false,
  });
}

/** RBAC permissions from TDDPER (user + group level) */
export function useScreenPermissions(resourceId: string | null) {
  return useQuery({
    queryKey: ['db', 'screens', 'permissions', resourceId],
    queryFn: async () => {
      const esc = resourceId!.replace(/'/g, "''");
      const { linhas } = await executeQuery(
        `SELECT PER.CODUSU, PER.CODGRUPO, RTRIM(PER.ACESSO) AS ACESSO,`
        + ` RTRIM(PER.IDACESSO) AS IDACESSO,`
        + ` RTRIM(U.NOMEUSU) AS NOMEUSU,`
        + ` RTRIM(G.NOMEGRUPO) AS NOMEGRUPO`
        + ` FROM TDDPER PER`
        + ` LEFT JOIN TSIUSU U ON PER.CODUSU = U.CODUSU AND PER.CODUSU > 0`
        + ` LEFT JOIN TSIGRU G ON PER.CODGRUPO = G.CODGRUPO AND PER.CODGRUPO > 0`
        + ` WHERE PER.IDACESSO = '${esc}'`
        + ` ORDER BY PER.CODUSU DESC, PER.CODGRUPO`,
      );
      return linhas as R[];
    },
    enabled: !!resourceId,
    staleTime: STALE, gcTime: GC, retry: false,
  });
}
