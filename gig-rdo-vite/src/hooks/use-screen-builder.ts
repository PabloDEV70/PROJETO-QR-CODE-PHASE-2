import { useQuery } from '@tanstack/react-query';
import { executeQuery } from '@/api/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = Record<string, any>;

const STALE = 10 * 60_000;
const GC = 30 * 60_000;

export function useScreenInstances() {
  return useQuery({
    queryKey: ['db', 'screens', 'instances'],
    queryFn: async () => {
      const { linhas } = await executeQuery(
        `SELECT I.NUINSTANCIA, RTRIM(I.NOMEINSTANCIA) AS NOMEINSTANCIA,`
        + ` RTRIM(I.DESCRINSTANCIA) AS DESCRINSTANCIA, RTRIM(I.NOMETAB) AS NOMETAB,`
        + ` RTRIM(I.CATEGORIA) AS CATEGORIA,`
        + ` I.ATIVO, RTRIM(I.TIPOFORM) AS TIPOFORM, I.RAIZ`
        + ` FROM TDDINS I`
        + ` INNER JOIN TDDTAB T ON I.NOMETAB = T.NOMETAB`
        + ` WHERE T.ADICIONAL = 'S'`
        + ` ORDER BY I.CATEGORIA, I.NOMEINSTANCIA`,
      );
      return linhas as R[];
    },
    staleTime: STALE,
    gcTime: GC,
  });
}

export function useScreenDetail(nuInstancia: number | null) {
  return useQuery({
    queryKey: ['db', 'screens', 'detail', nuInstancia],
    queryFn: async () => {
      const { linhas } = await executeQuery(
        `SELECT I.NUINSTANCIA, RTRIM(I.NOMEINSTANCIA) AS NOMEINSTANCIA,`
        + ` RTRIM(I.DESCRINSTANCIA) AS DESCRINSTANCIA, RTRIM(I.NOMETAB) AS NOMETAB,`
        + ` RTRIM(I.CATEGORIA) AS CATEGORIA,`
        + ` I.ATIVO, RTRIM(I.TIPOFORM) AS TIPOFORM, I.RAIZ,`
        + ` RTRIM(I.FILTRO) AS FILTRO,`
        + ` RTRIM(T.DESCRTAB) AS DESCRTAB, T.TIPONUMERACAO`
        + ` FROM TDDINS I`
        + ` LEFT JOIN TDDTAB T ON I.NOMETAB = T.NOMETAB`
        + ` WHERE I.NUINSTANCIA = ${nuInstancia}`,
      );
      return (linhas[0] as R) ?? null;
    },
    enabled: nuInstancia != null,
    staleTime: STALE,
    gcTime: GC,
  });
}

