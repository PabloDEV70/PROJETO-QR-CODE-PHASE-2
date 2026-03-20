import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { cache } from '../../shared/cache';
import { parseCodusus, UsuarioBasico, CACHE_HSTVEI_STATS } from './hstvei-helpers';

export interface OperadorAtribuicao {
  hstveiId: number;
  codveiculo: number;
  placa: string;
  marcaModelo: string | null;
  veiculoTag: string | null;
  veiculoTipo: string | null;
  veiculoCapacidade: string | null;
  veiculoFabricante: string | null;
  situacao: string;
  departamento: string | null;
  dtinicio: string;
  dtprevisao: string | null;
  idpri: number | null;
  prioridadeSigla: string | null;
  descricao: string | null;
  nuos: number | null;
  numos: number | null;
  nomeParc: string | null;
}

export interface OperadorResumo {
  codusu: number;
  nome: string;
  codparc: number | null;
  tipo: 'operador' | 'mecanico';
  atribuicoes: OperadorAtribuicao[];
}

interface OperadorRow {
  ID: number; CODVEICULO: number; IDSIT: number;
  EXEOPE: string | null; EXEMEC: string | null;
  placa: string; marcaModelo: string | null; veiculoTag: string | null;
  veiculoTipo: string | null; veiculoCapacidade: string | null; veiculoFabricante: string | null;
  situacaoDescricao: string; departamentoNome: string | null;
  DTINICIO: string; DTPREVISAO: string | null; IDPRI: number | null;
  prioridadeSigla: string | null; DESCRICAO: string | null;
  NUOS: number | null; NUMOS: number | null; nomeParc: string | null;
}

export async function getOperadores(qe: QueryExecutor): Promise<OperadorResumo[]> {
  const ck = 'hstvei:operadores';
  const cached = cache.get<OperadorResumo[]>(ck);
  if (cached) return cached;

  const rows = await qe.executeQuery<OperadorRow>(`
    SELECT h.ID, h.CODVEICULO, h.IDSIT, h.EXEOPE, h.EXEMEC,
      v.PLACA AS placa, CAST(v.MARCAMODELO AS VARCHAR(200)) AS marcaModelo,
      v.AD_TAG AS veiculoTag,
      CAST(v.AD_TIPOEQPTO AS VARCHAR(100)) AS veiculoTipo,
      CAST(v.AD_CAPACIDADE AS VARCHAR(100)) AS veiculoCapacidade,
      CAST(v.AD_FABRICANTE AS VARCHAR(100)) AS veiculoFabricante,
      s.DESCRICAO AS situacaoDescricao, dep.DESCRDEP AS departamentoNome,
      h.DTINICIO, h.DTPREVISAO, h.IDPRI, p.SIGLA AS prioridadeSigla,
      h.DESCRICAO, h.NUOS, h.NUMOS,
      par.NOMEPARC AS nomeParc
    FROM AD_HSTVEI h
    INNER JOIN TGFVEI v ON v.CODVEICULO = h.CODVEICULO
    INNER JOIN AD_ADHSTVEISIT s ON s.ID = h.IDSIT
    LEFT JOIN TFPDEP dep ON dep.CODDEP = s.CODDEP
    LEFT JOIN AD_ADHSTVEIPRI p ON p.IDPRI = h.IDPRI
    LEFT JOIN TGFPAR par ON par.CODPARC = h.CODPARC
    WHERE h.DTFIM IS NULL AND (h.EXEOPE IS NOT NULL OR h.EXEMEC IS NOT NULL)
  `);

  const allCodusus = new Set<number>();
  for (const row of rows) {
    parseCodusus(row.EXEOPE).forEach((c) => allCodusus.add(c));
    parseCodusus(row.EXEMEC).forEach((c) => allCodusus.add(c));
  }

  if (allCodusus.size === 0) {
    cache.set(ck, [], CACHE_HSTVEI_STATS);
    return [];
  }

  const ids = [...allCodusus].join(',');
  const usuarios = await qe.executeQuery<UsuarioBasico>(
    `SELECT CODUSU, NOMEUSU, CODPARC FROM TSIUSU WHERE CODUSU IN (${ids})`,
  );
  const mapa = new Map(usuarios.map((u) => [u.CODUSU, u]));

  const opMap = new Map<number, OperadorResumo>();

  for (const row of rows) {
    const opes = parseCodusus(row.EXEOPE);
    const mecs = parseCodusus(row.EXEMEC);

    const atribuicao: OperadorAtribuicao = {
      hstveiId: row.ID,
      codveiculo: row.CODVEICULO,
      placa: row.placa,
      marcaModelo: row.marcaModelo,
      veiculoTag: row.veiculoTag,
      veiculoTipo: row.veiculoTipo,
      veiculoCapacidade: row.veiculoCapacidade,
      veiculoFabricante: row.veiculoFabricante,
      situacao: row.situacaoDescricao,
      departamento: row.departamentoNome,
      dtinicio: row.DTINICIO,
      dtprevisao: row.DTPREVISAO,
      idpri: row.IDPRI,
      prioridadeSigla: row.prioridadeSigla,
      descricao: row.DESCRICAO,
      nuos: row.NUOS,
      numos: row.NUMOS,
      nomeParc: row.nomeParc,
    };

    for (const codusu of [...opes, ...mecs]) {
      if (!opMap.has(codusu)) {
        const u = mapa.get(codusu);
        opMap.set(codusu, {
          codusu,
          nome: u?.NOMEUSU ?? `USU ${codusu}`,
          codparc: u?.CODPARC ?? null,
          tipo: mecs.includes(codusu) ? 'mecanico' : 'operador',
          atribuicoes: [],
        });
      }
      const op = opMap.get(codusu)!;
      op.atribuicoes.push(atribuicao);
      if (mecs.includes(codusu)) op.tipo = 'mecanico';
    }
  }

  const result = [...opMap.values()].sort((a, b) => b.atribuicoes.length - a.atribuicoes.length);
  cache.set(ck, result, CACHE_HSTVEI_STATS);
  return result;
}
