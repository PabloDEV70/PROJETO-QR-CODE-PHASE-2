import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { PainelPessoa, PainelSituacao, PainelVeiculo } from '../../types/AD_HSTVEI';

export interface UsuarioBasico {
  CODUSU: number;
  NOMEUSU: string;
  CODPARC: number | null;
}

export const CACHE_HSTVEI_PAINEL = 15_000;
export const CACHE_HSTVEI_STATS = 30_000;
export const CACHE_HSTVEI_LIST = 30_000;
export const CACHE_HSTVEI_LOOKUPS = 30 * 60 * 1000;

export function parseCodusus(campo: string | null): number[] {
  if (!campo) return [];
  return campo
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n > 0);
}

export function mapUsuario(mapa: Map<number, UsuarioBasico>, codusu: number): PainelPessoa {
  const u = mapa.get(codusu);
  return {
    codusu,
    nome: u?.NOMEUSU ?? `USU ${codusu}`,
    codparc: u?.CODPARC ?? null,
  };
}

export async function enrichPessoas(
  rows: Record<string, unknown>[],
  qe: QueryExecutor,
): Promise<Record<string, unknown>[]> {
  const allCodusus = new Set<number>();
  for (const row of rows) {
    parseCodusus((row.EXEOPE ?? row.exeope) as string | null).forEach((c) => allCodusus.add(c));
    parseCodusus((row.EXEMEC ?? row.exemec) as string | null).forEach((c) => allCodusus.add(c));
    const codusuinc = (row.CODUSUINC ?? row.codusuinc) as number | undefined;
    if (codusuinc) allCodusus.add(codusuinc);
  }

  if (allCodusus.size === 0) return rows;

  const ids = [...allCodusus].join(',');
  const usuarios = await qe.executeQuery<UsuarioBasico>(
    `SELECT CODUSU, NOMEUSU, CODPARC FROM TSIUSU WHERE CODUSU IN (${ids})`,
  );
  const mapa = new Map(usuarios.map((u) => [u.CODUSU, u]));

  for (const row of rows) {
    (row as Record<string, unknown>)._operadores = parseCodusus((row.EXEOPE ?? row.exeope) as string | null).map((c) => mapUsuario(mapa, c));
    (row as Record<string, unknown>)._mecanicos = parseCodusus((row.EXEMEC ?? row.exemec) as string | null).map((c) => mapUsuario(mapa, c));
    (row as Record<string, unknown>)._criadoPor = mapUsuario(mapa, (row.CODUSUINC ?? row.codusuinc) as number);
  }

  return rows;
}

export function rowToPainelSituacao(row: Record<string, unknown>): PainelSituacao {
  return {
    id: row.ID as number,
    idsit: row.IDSIT as number,
    situacao: (row.situacaoDescricao as string) ?? '',
    categoria: (row.departamentoNome as string)?.trim() ?? '',
    departamento: (row.departamentoNome as string) ?? null,
    coddep: (row.situacaoCoddep as number) ?? 0,
    prioridadeSigla: (row.prioridadeSigla as string) ?? null,
    prioridadeDescricao: (row.prioridadeDescricao as string) ?? null,
    idpri: (row.IDPRI as number) ?? null,
    descricao: (row.DESCRICAO as string) ?? null,
    obs: (row.OBS as string) ?? null,
    dtinicio: (row.DTINICIO as string) ?? '',
    dtprevisao: (row.DTPREVISAO as string) ?? null,
    nuos: (row.NUOS as number) ?? null,
    numos: (row.NUMOS as number) ?? null,
    nunota: (row.NUNOTA as number) ?? null,
    codparc: (row.CODPARC as number) ?? null,
    nomeParc: (row.nomeParc as string) ?? null,
    osStatus: (row.osStatus as string) ?? null,
    osTipo: (row.osTipo as string) ?? null,
    mosCliente: (row.mosCliente as string) ?? null,
    mosSituacao: (row.mosSituacao as string) ?? null,
    mosDhChamada: (row.mosDhChamada as string) ?? null,
    mosDtPrevista: (row.mosDtPrevista as string) ?? null,
    mosDescricao: (row.mosDescricao as string) ?? null,
    mosEndereco: (row.mosEndereco as string) ?? null,
    mosCidade: (row.mosCidade as string) ?? null,
    mosUrgencia: (row.mosUrgencia as string) ?? null,
    mosContrato: (row.mosContrato as string) ?? null,
    mosResponsavel: (row.mosResponsavel as string) ?? null,
    mosLocalExec: (row.mosLocalExec as string) ?? null,
    mosNrProposta: (row.mosNrProposta as string) ?? null,
    operadores: (row._operadores as PainelPessoa[]) ?? [],
    mecanicos: (row._mecanicos as PainelPessoa[]) ?? [],
    criadoPor: (row._criadoPor as PainelPessoa) ?? { codusu: 0, nome: '', codparc: null },
  };
}

export function agruparPorVeiculo(
  rows: Record<string, unknown>[],
): PainelVeiculo[] {
  const map = new Map<number, PainelVeiculo>();

  for (const row of rows) {
    const codveiculo = row.CODVEICULO as number;

    if (!map.has(codveiculo)) {
      map.set(codveiculo, {
        codveiculo,
        placa: (row.placa as string) ?? '',
        marcaModelo: (row.marcaModelo as string) ?? null,
        tag: (row.veiculoTag as string) ?? null,
        tipo: (row.veiculoTipo as string) ?? null,
        capacidade: (row.veiculoCapacidade as string) ?? null,
        fabricante: (row.veiculoFabricante as string) ?? null,
        situacoesAtivas: [],
        totalSituacoes: 0,
        prioridadeMaxima: null,
        previsaoMaisProxima: null,
      });
    }

    const veiculo = map.get(codveiculo)!;
    const situacao = rowToPainelSituacao(row);
    veiculo.situacoesAtivas.push(situacao);
    veiculo.totalSituacoes++;

    const pri = row.IDPRI as number | null;
    if (pri !== null && (veiculo.prioridadeMaxima === null || pri < veiculo.prioridadeMaxima)) {
      veiculo.prioridadeMaxima = pri;
    }

    const prev = row.DTPREVISAO as string | null;
    if (prev && (!veiculo.previsaoMaisProxima || prev < veiculo.previsaoMaisProxima)) {
      veiculo.previsaoMaisProxima = prev;
    }
  }

  return [...map.values()].sort((a, b) => {
    const pa = a.prioridadeMaxima ?? 99;
    const pb = b.prioridadeMaxima ?? 99;
    if (pa !== pb) return pa - pb;
    const da = String(a.previsaoMaisProxima ?? '9999');
    const db = String(b.previsaoMaisProxima ?? '9999');
    return da.localeCompare(db);
  });
}
