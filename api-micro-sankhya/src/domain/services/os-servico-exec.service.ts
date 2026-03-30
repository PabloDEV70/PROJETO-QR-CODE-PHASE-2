import { MutationExecutor } from '../../infra/api-mother/mutationExecutor';
import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { ValidationError } from '../errors/app-error';
import { cache } from '../../shared/cache';
import { logger } from '../../shared/logger';
import { tempoAtvpServico } from '../../sql-queries/TCFSERVOS/tempo-atvp-servico';

function bustCache() {
  cache.deleteByPrefix('os:');
  cache.deleteByPrefix('rdo:');
}

function assertMutationSuccess(
  result: { sucesso?: boolean; foiSucesso?: boolean; registrosAfetados?: number; mensagem?: string },
  operation: string,
) {
  const ok = result.sucesso ?? result.foiSucesso ?? false;
  if (!ok || (result.registrosAfetados !== undefined && result.registrosAfetados === 0)) {
    const msg = result.mensagem || `Falha ao ${operation} — nenhum registro afetado`;
    logger.error({ result, operation }, `[OsServicoExec] ${operation} FAILED`);
    throw new Error(msg);
  }
}

function nowDatetime(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

export class OsServicoExecService {
  private me: MutationExecutor;
  private qe: QueryExecutor;

  constructor() {
    this.me = new MutationExecutor();
    this.qe = new QueryExecutor();
  }

  /** Start execution of a service within an OS */
  async startServico(nuos: number, sequencia: number, codparc: number, userToken?: string) {
    if (!nuos || nuos <= 0) throw new ValidationError('NUOS must be a positive number');
    if (!sequencia || sequencia <= 0) throw new ValidationError('SEQUENCIA must be a positive number');

    const now = nowDatetime();

    // 1. Check current service status
    const srvRows = await this.qe.executeQuery<{ STATUS: string | null }>(
      `SELECT TOP 1 STATUS FROM TCFSERVOS WHERE NUOS = ${Number(nuos)} AND SEQUENCIA = ${Number(sequencia)}`,
    );
    if (srvRows.length === 0) {
      throw new ValidationError(`Servico NUOS=${nuos} SEQUENCIA=${sequencia} not found`);
    }

    const srvStatus = srvRows[0]!.STATUS;
    if (srvStatus === 'F') {
      throw new ValidationError(`Servico already finalized (STATUS=F)`);
    }

    // 2. Update TCFSERVOS -> STATUS='E', DATAINI=now (if not already E)
    if (srvStatus !== 'E') {
      const srvResult = await this.me.update(
        'TCFSERVOS', { NUOS: nuos, SEQUENCIA: sequencia },
        { STATUS: 'E', DATAINI: now }, { userToken },
      );
      assertMutationSuccess(srvResult, 'iniciar servico');
    }

    // 3. Update TCFOSCAB -> STATUS='E' if currently 'A'
    const osRows = await this.qe.executeQuery<{ STATUS: string }>(
      `SELECT TOP 1 STATUS FROM TCFOSCAB WHERE NUOS = ${Number(nuos)}`,
    );
    if (osRows.length > 0 && osRows[0]!.STATUS === 'A') {
      const osResult = await this.me.update(
        'TCFOSCAB', { NUOS: nuos },
        { STATUS: 'E', DATAINI: now, AD_DHALTERSTATUS: now }, { userToken },
      );
      assertMutationSuccess(osResult, 'iniciar OS');
    }

    // 4. Upsert AD_TCFEXEC — resolve CODUSU from CODPARC
    await this.upsertExec(nuos, sequencia, codparc, now, null, userToken);

    bustCache();
    logger.info({ nuos, sequencia, codparc }, '[OsServicoExec] servico started');
    return { ok: true, nuos, sequencia, status: 'E' };
  }

  /** Finish execution of a service within an OS */
  async finishServico(nuos: number, sequencia: number, codparc: number, userToken?: string) {
    if (!nuos || nuos <= 0) throw new ValidationError('NUOS must be a positive number');
    if (!sequencia || sequencia <= 0) throw new ValidationError('SEQUENCIA must be a positive number');

    const now = nowDatetime();

    // 1. Check service exists and is not already F
    const srvRows = await this.qe.executeQuery<{ STATUS: string | null }>(
      `SELECT TOP 1 STATUS FROM TCFSERVOS WHERE NUOS = ${Number(nuos)} AND SEQUENCIA = ${Number(sequencia)}`,
    );
    if (srvRows.length === 0) {
      throw new ValidationError(`Servico NUOS=${nuos} SEQUENCIA=${sequencia} not found`);
    }
    if (srvRows[0]!.STATUS === 'F') {
      throw new ValidationError('Servico already finalized');
    }

    // 2. Calculate total productive minutes from RDO
    const sql = tempoAtvpServico
      .replace(/@nuos/g, String(nuos))
      .replace(/@sequencia/g, String(sequencia));
    const tempoRows = await this.qe.executeQuery<{ totalMinutos: number }>(sql);
    const totalMinutos = tempoRows[0]?.totalMinutos ?? 0;

    // 3. Finalize TCFSERVOS
    const srvResult = await this.me.update(
      'TCFSERVOS', { NUOS: nuos, SEQUENCIA: sequencia },
      { STATUS: 'F', DATAFIN: now, TEMPO: totalMinutos > 0 ? totalMinutos : null },
      { userToken },
    );
    assertMutationSuccess(srvResult, 'finalizar servico');

    // 4. Update AD_TCFEXEC.DTFIN
    await this.upsertExec(nuos, sequencia, codparc, null, now, userToken);

    // 5. Auto-finalize OS if ALL services are F
    const osAutoFinalized = await this.tryAutoFinalizeOs(nuos, now, userToken);

    bustCache();
    logger.info({ nuos, sequencia, totalMinutos, osAutoFinalized }, '[OsServicoExec] servico finished');
    return { ok: true, nuos, sequencia, status: 'F', totalMinutos, osAutoFinalized };
  }

  private async upsertExec(
    nuos: number, sequencia: number, codparc: number,
    dtini: string | null, dtfin: string | null, userToken?: string,
  ) {
    const codusuRows = await this.qe.executeQuery<{ CODUSU: number }>(
      `SELECT TOP 1 CODUSU FROM TFPFUN WHERE CODPARC = ${Number(codparc)} AND CODUSU > 0`,
    );
    const codusu = codusuRows.length > 0 ? codusuRows[0]!.CODUSU : null;
    if (!codusu || codusu <= 0) return;

    const execRows = await this.qe.executeQuery<{ NUOS: number }>(
      `SELECT TOP 1 NUOS FROM AD_TCFEXEC WHERE NUOS = ${Number(nuos)} AND SEQUENCIA = ${Number(sequencia)}`,
    );

    try {
      if (execRows.length === 0) {
        const dados: Record<string, unknown> = { NUOS: nuos, SEQUENCIA: sequencia, CODUSU: codusu };
        if (dtini) dados.DTINI = dtini;
        if (dtfin) dados.DTFIN = dtfin;
        await this.me.insert('AD_TCFEXEC', dados, { userToken });
      } else {
        const dados: Record<string, unknown> = { CODUSU: codusu };
        if (dtini) { dados.DTINI = dtini; dados.DTFIN = null; }
        if (dtfin) dados.DTFIN = dtfin;
        await this.me.update('AD_TCFEXEC', { NUOS: nuos, SEQUENCIA: sequencia }, dados, { userToken });
      }
    } catch (err) {
      logger.warn({ err, nuos, sequencia }, '[OsServicoExec] AD_TCFEXEC upsert failed (non-critical)');
    }
  }

  private async tryAutoFinalizeOs(nuos: number, now: string, userToken?: string): Promise<boolean> {
    const pendingRows = await this.qe.executeQuery<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM TCFSERVOS WHERE NUOS = ${nuos} AND (STATUS IS NULL OR STATUS <> 'F')`,
    );
    if (pendingRows[0]?.cnt !== 0) return false;

    try {
      await this.me.update(
        'TCFOSCAB', { NUOS: nuos },
        { STATUS: 'F', DATAFIN: now, AD_DHALTERSTATUS: now }, { userToken },
      );
      logger.info({ nuos }, '[OsServicoExec] OS auto-finalized (all services F)');
      return true;
    } catch (err) {
      logger.warn({ err, nuos }, '[OsServicoExec] OS auto-finalize failed');
      return false;
    }
  }
}
