import { useQuery } from '@tanstack/react-query';
import { executeQuery } from '@/api/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = Record<string, any>;

const STALE = 10 * 60_000;
const GC = 30 * 60_000;

/** Find menu entry (TRDCON) for this screen via resourceID -> TRDPCO match */
export function useScreenMenu(resourceId: string | null) {
  return useQuery({
    queryKey: ['db', 'screens', 'menu', resourceId],
    queryFn: async () => {
      const resId = resourceId!;
      if (!resId) return { menu: null, hierarchy: [], props: [] };
      const { linhas: menuRows } = await executeQuery(
        `SELECT CON.NUCONTROLE, RTRIM(CON.DESCRCONTROLE) AS DESCRCONTROLE,`
        + ` RTRIM(CON.NOME) AS NOME_MENU, RTRIM(EVE.ONCLICK) AS ONCLICK`
        + ` FROM TRDCON CON`
        + ` INNER JOIN TRDPCO PCO ON CON.NUCONTROLE = PCO.NUCONTROLE`
        + ` LEFT JOIN TRDEVE EVE ON EVE.NUCONTROLE = CON.NUCONTROLE`
        + ` WHERE CON.TIPOCONTROLE = 'MN'`
        + ` AND PCO.NOME = 'resourceID'`
        + ` AND LTRIM(RTRIM(SUBSTRING(PCO.VALOR, 1, 4000))) = '${resId.replace(/'/g, "''")}'`,
      );
      const menu = (menuRows[0] as R) ?? null;
      if (!menu) return { menu: null, hierarchy: [], props: [] };
      const nc = Number(menu.NUCONTROLE);
      const { linhas: hier } = await executeQuery(
        `SELECT RTRIM(PAI.DESCRCONTROLE) AS DESCR, RTRIM(PAI.NOME) AS NOME`
        + ` FROM TRDFCO FCO INNER JOIN TRDCON PAI ON PAI.NUCONTROLE = FCO.NUCONTROLE`
        + ` WHERE FCO.NUCONTROLEFILHO = ${nc}`,
      );
      const { linhas: props } = await executeQuery(
        `SELECT RTRIM(PCO.NOME) AS NOME, RTRIM(SUBSTRING(PCO.VALOR, 1, 4000)) AS VALOR`
        + ` FROM TRDPCO PCO WHERE PCO.NUCONTROLE = ${nc} ORDER BY PCO.NOME`,
      );
      return { menu: menu as R, hierarchy: hier as R[], props: props as R[] };
    },
    enabled: !!resourceId,
    staleTime: STALE, gcTime: GC, retry: false,
  });
}

/** Access history from TRDEAC */
export function useScreenAccessHistory(resourceId: string | null) {
  return useQuery({
    queryKey: ['db', 'screens', 'access', resourceId],
    queryFn: async () => {
      const { linhas } = await executeQuery(
        `SELECT TOP 50 EAC.CODUSU, RTRIM(U.NOMEUSU) AS NOMEUSU,`
        + ` EAC.QTDPERIODO, EAC.DTINIPERIODO`
        + ` FROM TRDEAC EAC`
        + ` LEFT JOIN TSIUSU U ON U.CODUSU = EAC.CODUSU`
        + ` WHERE EAC.RESOURCEID = '${resourceId!.replace(/'/g, "''")}'`
        + ` ORDER BY EAC.QTDPERIODO DESC`,
      );
      return linhas as R[];
    },
    enabled: !!resourceId,
    staleTime: STALE, gcTime: GC, retry: false,
  });
}
