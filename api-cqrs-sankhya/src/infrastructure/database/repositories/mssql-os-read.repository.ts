import { Injectable } from '@nestjs/common';
import { ReadQueryExecutor } from '../read-query-executor';
import { IOsReadRepository, OsListFilters, Pagination, OsListResult } from '../../../domain/os/interfaces/os-read.repository';
import { DatabaseKey } from '../../../config/database.config';
import * as Q from '../queries/os';

function escapeSql(val: string): string {
  return val.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

function buildWhere(f: OsListFilters): string {
  const parts: string[] = [];
  if (f.dataInicio) parts.push(`AND os.DTABERTURA >= '${escapeSql(f.dataInicio)}'`);
  if (f.dataFim) parts.push(`AND os.DTABERTURA <= '${escapeSql(f.dataFim)} 23:59:59'`);
  if (f.status) parts.push(`AND os.STATUS = '${escapeSql(f.status)}'`);
  if (f.manutencao) parts.push(`AND os.MANUTENCAO = '${escapeSql(f.manutencao)}'`);
  if (f.tipo) parts.push(`AND os.TIPO = '${escapeSql(f.tipo)}'`);
  if (f.statusGig) parts.push(`AND os.AD_STATUSGIG = '${escapeSql(f.statusGig)}'`);
  if (f.codveiculo) parts.push(`AND os.CODVEICULO = ${Number(f.codveiculo)}`);
  if (f.search) {
    const safe = escapeSql(f.search).replace(/[%_[\]]/g, '');
    if (/^\d+$/.test(safe)) {
      parts.push(`AND os.NUOS = ${parseInt(safe, 10)}`);
    } else {
      parts.push(`AND (v.PLACA LIKE '%${safe}%' OR v.AD_TAG LIKE '%${safe}%')`);
    }
  }
  return parts.join('\n');
}

@Injectable()
export class MssqlOsReadRepository implements IOsReadRepository {
  constructor(private readonly qe: ReadQueryExecutor) {}

  async listar(filters: OsListFilters, pagination: Pagination, db: DatabaseKey): Promise<OsListResult> {
    const where = buildWhere(filters);
    const offset = (pagination.page - 1) * pagination.limit;

    const listSql = Q.osListQuery
      .replace('-- @WHERE', where)
      .replace(/@OFFSET/g, String(offset))
      .replace(/@LIMIT/g, String(pagination.limit));

    const countSql = Q.osListCountQuery.replace('-- @WHERE', where);

    const [items, countResult] = await Promise.all([
      this.qe.execute(listSql, db),
      this.qe.execute<{ total: number }>(countSql, db),
    ]);

    return {
      items,
      total: countResult[0]?.total ?? 0,
    };
  }

  async ativas(db: DatabaseKey, opts?: { codparcexec?: number; placa?: string }): Promise<Record<string, unknown>[]> {
    const parts: string[] = [];
    if (opts?.codparcexec) {
      parts.push(
        `AND EXISTS (SELECT 1 FROM TCFSERVOS s2 INNER JOIN TCFSERVOSATO a2` +
        ` ON s2.NUOS = a2.NUOS AND s2.SEQUENCIA = a2.SEQUENCIA` +
        ` INNER JOIN TSIUSU u2 ON a2.CODEXEC = u2.CODUSU` +
        ` WHERE s2.NUOS = os.NUOS AND u2.CODPARC = ${Number(opts.codparcexec)})`,
      );
    }
    if (opts?.placa) {
      const safe = escapeSql(opts.placa).replace(/[%_[\]]/g, '');
      parts.push(`AND v.PLACA LIKE '%${safe}%'`);
    }

    const sql = Q.osAtivasQuery.replace('-- @WHERE', parts.join('\n')).replace(/--.*$/gm, '');
    return this.qe.execute(sql, db);
  }

  async porId(nuos: number, db: DatabaseKey): Promise<Record<string, unknown> | null> {
    const sql = Q.osListQuery
      .replace('-- @WHERE', `AND os.NUOS = ${Number(nuos)}`)
      .replace(/@OFFSET/g, '0')
      .replace(/@LIMIT/g, '1');

    const rows = await this.qe.execute(sql, db);
    return rows[0] ?? null;
  }

  async resumo(filters: OsListFilters, db: DatabaseKey): Promise<Record<string, unknown>> {
    const where = buildWhere(filters);
    const sql = Q.osResumoQuery.replace('-- @WHERE', where);
    const rows = await this.qe.execute(sql, db);
    return rows[0] ?? { totalOs: 0, abertas: 0, emExecucao: 0, fechadas: 0, canceladas: 0, veiculosAtendidos: 0 };
  }

  async servicos(nuos: number, db: DatabaseKey): Promise<Record<string, unknown>[]> {
    const sql = `
      SELECT s.NUOS, s.SEQUENCIA, s.CODPROD, p.DESCRPROD AS nomeProduto,
        s.QTD, s.VLRUNIT, s.VLRTOT, s.TEMPO, s.STATUS,
        s.DATAINI, s.DATAFIN, s.OBSERVACAO,
        par.NOMEPARC AS NOMEPARCEIRO
      FROM TCFSERVOS s
      LEFT JOIN TGFPRO p ON s.CODPROD = p.CODPROD
      LEFT JOIN TGFPAR par ON s.CODPARC = par.CODPARC
      WHERE s.NUOS = ${Number(nuos)}
      ORDER BY s.SEQUENCIA
    `;
    return this.qe.execute(sql, db);
  }

  async executores(nuos: number, db: DatabaseKey): Promise<Record<string, unknown>[]> {
    const sql = `
      SELECT a.NUOS, a.SEQUENCIA, a.CODEXEC, u.NOMEUSU AS NOMEEXECUTOR,
        a.DTINICIO, a.DTFIM, a.MINUTOS, a.OBSERVACAO
      FROM TCFSERVOSATO a
      LEFT JOIN TSIUSU u ON a.CODEXEC = u.CODUSU
      WHERE a.NUOS = ${Number(nuos)}
      ORDER BY a.SEQUENCIA, a.DTINICIO
    `;
    return this.qe.execute(sql, db);
  }

  async compras(nuos: number, db: DatabaseKey): Promise<Record<string, unknown>> {
    const notasSql = `
      SELECT DISTINCT c.NUNOTA, c.NUMNOTA, c.CODTIPOPER,
        t.DESCROPER AS TIPO_OPER_DESCRICAO, c.TIPMOV,
        c.STATUSNOTA, c.VLRNOTA, c.DTNEG,
        u.NOMEUSU AS NOME_USUARIO
      FROM TGFCAB c
      JOIN TGFTOP t ON c.CODTIPOPER = t.CODTIPOPER AND c.DHTIPOPER = t.DHALTER
      LEFT JOIN TSIUSU u ON c.CODUSU = u.CODUSU
      WHERE c.NUOSCAB = ${Number(nuos)}
      ORDER BY c.DTNEG DESC
    `;
    const itensSql = `
      SELECT i.NUNOTA, i.SEQUENCIA, i.CODPROD,
        p.DESCRPROD AS PRODUTO_DESCRICAO,
        i.QTDNEG, i.VLRUNIT, i.VLRTOT, i.UNIDADE
      FROM TGFITE i
      JOIN TGFPRO p ON i.CODPROD = p.CODPROD
      JOIN TGFCAB c ON i.NUNOTA = c.NUNOTA
      WHERE c.NUOSCAB = ${Number(nuos)}
      ORDER BY i.NUNOTA, i.SEQUENCIA
    `;
    const [notas, itens] = await Promise.all([
      this.qe.execute(notasSql, db),
      this.qe.execute(itensSql, db),
    ]);
    return { notas, itens };
  }

  async timeline(nuos: number, db: DatabaseKey): Promise<Record<string, unknown>[]> {
    const sql = `
      SELECT l.SEQUENCIA, l.NUOS, l.DHALTER,
        l.CODUSU, u.NOMEUSU AS NOME_USUARIO,
        l.AD_STATUSGIG, l.AD_FINALIZACAO
      FROM AD_LOGSTATUSOS l
      LEFT JOIN TSIUSU u ON l.CODUSU = u.CODUSU
      WHERE l.NUOS = ${Number(nuos)}
      ORDER BY l.DHALTER
    `;
    return this.qe.execute(sql, db);
  }
}
