import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { AdComadmOcorrencia, KanbanColumn, ListChamadosOptions } from '../../types/AD_COMADM';
import { TsiAnexo } from '../../types/TSIANX';
import { AnexosService } from './anexos.service';
import * as Q from '../../sql-queries/AD_COMADM';
import { escapeSqlString, escapeSqlDate } from '../../shared/sql-sanitize';

export const STATUS_MAP: Record<string, string> = {
  P: 'Pendente',
  E: 'Em Atendimento',
  S: 'Suspenso',
  A: 'Aguardando',
  C: 'Cancelado',
  F: 'Finalizado',
};

export const PRIORIDADE_MAP: Record<string, string> = {
  A: 'Alta',
  M: 'Media',
  B: 'Baixa',
};

export const KANBAN_COLUMNS: Omit<KanbanColumn, 'chamados' | 'total'>[] = [
  { status: 'P', label: 'Pendente', color: 'warning', ordem: 1 },
  { status: 'E', label: 'Em Atendimento', color: 'info', ordem: 2 },
  { status: 'S', label: 'Suspenso', color: 'default', ordem: 3 },
  { status: 'A', label: 'Aguardando', color: 'secondary', ordem: 4 },
  { status: 'F', label: 'Finalizado', color: 'success', ordem: 5 },
  { status: 'C', label: 'Cancelado', color: 'error', ordem: 6 },
];

export function buildWhereFilters(options: ListChamadosOptions): string {
  const conditions: string[] = [];
  if (options.status) conditions.push(`A.STATUS = '${options.status}'`);
  if (options.prioridade) conditions.push(`A.PRIORIDADE = '${options.prioridade}'`);
  if (options.tipoChamado) conditions.push(`A.TIPOCHAMADO = '${options.tipoChamado}'`);
  if (options.codparc) conditions.push(`A.CODPARC = ${options.codparc}`);
  if (options.solicitante) conditions.push(`A.SOLICITANTE = ${options.solicitante}`);
  if (options.solicitado) conditions.push(`A.SOLICITADO = ${options.solicitado}`);
  if (options.dataInicio) conditions.push(`A.DHCHAMADO >= '${escapeSqlDate(options.dataInicio)}'`);
  if (options.dataFim) conditions.push(`A.DHCHAMADO <= '${escapeSqlDate(options.dataFim)} 23:59:59'`);
  if (options.search) {
    const term = escapeSqlString(options.search);
    conditions.push(
      `(CAST(A.DESCRCHAMADO AS VARCHAR(MAX)) LIKE '%${term}%'` +
      ` OR CAST(A.NUCHAMADO AS VARCHAR) LIKE '%${term}%')`,
    );
  }
  if (options.setor) {
    const setor = escapeSqlString(options.setor);
    conditions.push(`CUS.DESCRCENCUS = '${setor}'`);
  }
  if (options.statusExclude) {
    const excluded = options.statusExclude
      .split(',')
      .map((s) => `'${escapeSqlString(s.trim())}'`)
      .join(',');
    conditions.push(`A.STATUS NOT IN (${excluded})`);
  }
  if (options.codgrupo) {
    conditions.push(
      `(A.SOLICITANTE IN (SELECT U.CODUSU FROM TSIUSU U WHERE U.CODGRUPO = ${options.codgrupo})` +
      ` OR A.SOLICITADO IN (SELECT U.CODUSU FROM TSIUSU U WHERE U.CODGRUPO = ${options.codgrupo}))`,
    );
  }
  if (options.scopeUser) {
    // User sees own chamados OR chamados from their same department (cost center)
    conditions.push(
      `(A.SOLICITANTE = ${options.scopeUser}` +
      ` OR A.SOLICITADO = ${options.scopeUser}` +
      ` OR SOL.CODCENCUSPAD = (SELECT CODCENCUSPAD FROM TSIUSU WHERE CODUSU = ${options.scopeUser}))`,
    );
  }
  return conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
}

export async function getOcorrencias(nuchamado: number): Promise<AdComadmOcorrencia[]> {
  const qe = new QueryExecutor();
  const sql = Q.getOcorrencias.replace(/@nuchamado/g, nuchamado.toString());
  return qe.executeQuery<AdComadmOcorrencia>(sql);
}

export interface SetorResumo {
  SETOR: string | null;
  TOTAL: number;
  FINALIZADOS: number;
  ATIVOS: number;
}

export async function getAnexos(nuchamado: number): Promise<TsiAnexo[]> {
  const svc = new AnexosService();
  return svc.getAnexos('COMADM', nuchamado);
}

export async function getPorSetor(): Promise<SetorResumo[]> {
  const qe = new QueryExecutor();
  return qe.executeQuery<SetorResumo>(Q.getPorSetor);
}
