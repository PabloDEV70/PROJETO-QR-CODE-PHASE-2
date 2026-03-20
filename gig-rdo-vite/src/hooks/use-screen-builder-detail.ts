import { useQuery } from '@tanstack/react-query';
import { executeQuery } from '@/api/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = Record<string, any>;

const STALE = 10 * 60_000;
const GC = 30 * 60_000;

export function useScreenFields(tableName: string | null) {
  return useQuery({
    queryKey: ['db', 'screens', 'fields', tableName],
    queryFn: async () => {
      const { linhas } = await executeQuery(
        `SELECT NUCAMPO, RTRIM(NOMECAMPO) AS NOMECAMPO,`
        + ` RTRIM(DESCRCAMPO) AS DESCRCAMPO, RTRIM(TIPCAMPO) AS TIPCAMPO,`
        + ` TAMANHO, ORDEM`
        + ` FROM TDDCAM WHERE NOMETAB = '${tableName!.replace(/'/g, "''")}'`
        + ` ORDER BY ORDEM, NOMECAMPO`,
      );
      return linhas as R[];
    },
    enabled: !!tableName,
    staleTime: STALE,
    gcTime: GC,
  });
}

export function useScreenLinks(nuInstancia: number | null) {
  return useQuery({
    queryKey: ['db', 'screens', 'links', nuInstancia],
    queryFn: async () => {
      const { linhas } = await executeQuery(
        `SELECT LIG.NUINSTDEST, RTRIM(INSDES.NOMEINSTANCIA) AS NOMEINSTDEST,`
        + ` RTRIM(INSDES.NOMETAB) AS TABDEST, RTRIM(LIG.TIPLIGACAO) AS TIPLIGACAO,`
        + ` RTRIM(CAMORI.NOMECAMPO) AS CAMPO_ORIG, RTRIM(CAMDES.NOMECAMPO) AS CAMPO_DEST`
        + ` FROM TDDLIG LIG`
        + ` INNER JOIN TDDINS INSDES ON LIG.NUINSTDEST = INSDES.NUINSTANCIA`
        + ` INNER JOIN TDDLGC LGC ON LIG.NUINSTORIG = LGC.NUINSTORIG`
        + `   AND LIG.NUINSTDEST = LGC.NUINSTDEST`
        + ` INNER JOIN TDDCAM CAMORI ON LGC.NUCAMPOORIG = CAMORI.NUCAMPO`
        + ` INNER JOIN TDDCAM CAMDES ON LGC.NUCAMPODEST = CAMDES.NUCAMPO`
        + ` WHERE LIG.NUINSTORIG = ${nuInstancia}`,
      );
      return linhas as R[];
    },
    enabled: nuInstancia != null,
    staleTime: STALE,
    gcTime: GC,
  });
}

export function useScreenProperties(nuInstancia: number | null) {
  return useQuery({
    queryKey: ['db', 'screens', 'properties', nuInstancia],
    queryFn: async () => {
      const { linhas } = await executeQuery(
        `SELECT RTRIM(NOME) AS NOME, RTRIM(VALOR) AS VALOR`
        + ` FROM TDDPIN WHERE NUINSTANCIA = ${nuInstancia}`
        + ` ORDER BY NOME`,
      );
      return linhas as R[];
    },
    enabled: nuInstancia != null,
    staleTime: STALE,
    gcTime: GC,
  });
}
