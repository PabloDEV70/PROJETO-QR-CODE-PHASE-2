import { ApiMotherAuthService } from '../../infra/api-mother/login';
import { validarColaborador } from '../../sql-queries/auth';
import { TooManyRequestsError } from '@/domain/errors';
import { PublicQueryExecutor } from '@/infra/api-mother/publicQueryExecutor';
import * as rateLimiter from './rate-limiter.service';
import { logAudit } from './audit-log.service';
import { logger } from '@/shared/logger';

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  type: 'standard' | 'colaborador';
  username?: string;
  codparc?: number;
}

export class AuthService {
  private apiMotherAuth: ApiMotherAuthService;
  private publicQuery: PublicQueryExecutor;

  constructor() {
    this.apiMotherAuth = ApiMotherAuthService.getInstance();
    this.publicQuery = new PublicQueryExecutor();
  }

  async loginStandard(
    username: string,
    pass: string,
    ip: string,
    userAgent: string,
  ): Promise<AuthResponse> {
    const identifier = username;
    await this.enforceRateLimit(identifier, ip, 'standard', userAgent);

    try {
      const { accessToken, refreshToken } = await this.apiMotherAuth.login(username, pass);
      await rateLimiter.recordSuccess(identifier, ip);

      logAudit({
        eventType: 'login_success',
        loginType: 'standard',
        identifier,
        ipAddress: ip,
        userAgent,
      });
      return { token: accessToken, refreshToken, type: 'standard', username };
    } catch {
      await rateLimiter.recordFailure(identifier, ip);
      logAudit({
        eventType: 'login_failed',
        loginType: 'standard',
        identifier,
        ipAddress: ip,
        userAgent,
      });
      throw new Error('Invalid credentials');
    }
  }

  async loginColaborador(
    codparc: number,
    cpf: string,
    ip: string,
    userAgent: string,
  ): Promise<AuthResponse> {
    const identifier = String(codparc);
    await this.enforceRateLimit(identifier, ip, 'colaborador', userAgent);

    const isValid = await this.validateColaboradorDirect(codparc, cpf);
    if (!isValid) {
      await rateLimiter.recordFailure(identifier, ip);
      logAudit({
        eventType: 'login_failed',
        loginType: 'colaborador',
        identifier,
        ipAddress: ip,
        userAgent,
      });
      throw new Error('Credenciais de colaborador invalidas');
    }

    // Lookup the TSIUSU user linked to this CODPARC
    const usuario = await this.findUsuarioByCodeParcDirect(codparc);
    if (!usuario) {
      throw new Error(
        'Colaborador nao possui usuario no sistema (TSIUSU). Solicite ao administrador.',
      );
    }

    // Login with the colaborador's own Sankhya user
    // The password for colaborador is the CPF-based hash — but we can't reverse it
    // So we use the API Mother login with the username found
    // This will fail if the colaborador doesn't have a Sankhya password
    // In that case, admin must create a proper TSIUSU user for the colaborador
    logger.info(
      '[Auth] Colaborador codparc=%d mapped to TSIUSU user=%s',
      codparc,
      usuario.NOMEUSU,
    );

    await rateLimiter.recordSuccess(identifier, ip);

    logAudit({
      eventType: 'login_success',
      loginType: 'colaborador',
      identifier,
      ipAddress: ip,
      userAgent,
    });

    // Colaborador validated via CPF — needs a token.
    // Without Sankhya credentials, we cannot get a user-specific JWT.
    // Return a marker so frontend can prompt for Sankhya password if needed.
    throw new Error(
      `Colaborador validado (CODPARC=${codparc}), mas precisa fazer login com usuario e senha do sistema.`,
    );
  }

  private async enforceRateLimit(
    identifier: string,
    ip: string,
    loginType: string,
    userAgent: string,
  ): Promise<void> {
    const secondsLeft = await rateLimiter.checkLimit(identifier, ip);
    if (secondsLeft !== null) {
      logAudit({
        eventType: 'account_locked',
        loginType,
        identifier,
        ipAddress: ip,
        userAgent,
        details: `Locked for ${secondsLeft}s`,
      });
      throw new TooManyRequestsError(secondsLeft);
    }
  }

  async getMe(
    codusu: number,
  ): Promise<{
    codusu: number;
    nome: string;
    nomecompleto: string | null;
    codparc: number | null;
    codgrupo: number | null;
    codemp: number | null;
    codfunc: number | null;
    pertencedp: string | null;
    cargo: string | null;
    nomegrupo: string | null;
    codcargahor: number | null;
  }> {
    // Always fetch CODGRUPO from the database — never rely on JWT payload
    // Query base user data (simple query — API Mother rejects complex JOINs)
    const sqlUser = `SELECT TOP 1 U.CODUSU, RTRIM(U.NOMEUSU) AS NOMEUSU, U.CODPARC, U.CODGRUPO, U.CODEMP, U.CODFUNC FROM TSIUSU U WHERE U.CODUSU = ${codusu}`;
    const userRows = await this.queryWithUserToken(sqlUser);
    if (userRows.length === 0) {
      throw new Error('User not found');
    }
    const u = userRows[0] as { CODUSU: number; NOMEUSU: string; CODPARC: number | null; CODGRUPO: number | null; CODEMP: number | null; CODFUNC: number | null };

    // Enrich with parallel queries (best-effort)
    let nomeparc: string | null = null;
    let pertencedp: string | null = null;
    let funcao: string | null = null;
    let nomegrupo: string | null = null;
    let codcargahor: number | null = null;

    const enrichments: Promise<void>[] = [];

    if (u.CODPARC) {
      enrichments.push(
        this.queryWithUserToken(`SELECT TOP 1 NOMEPARC FROM TGFPAR WHERE CODPARC = ${u.CODPARC}`)
          .then((r) => { if (r[0]) nomeparc = (r[0] as { NOMEPARC: string }).NOMEPARC; })
          .catch(() => {}),
      );
    }
    if (u.CODEMP && u.CODFUNC) {
      enrichments.push(
        this.queryWithUserToken(`SELECT TOP 1 PERTENCEDP, FUNCAO, CODCARGAHOR FROM TFPFUN WHERE CODEMP = ${u.CODEMP} AND CODFUNC = ${u.CODFUNC}`)
          .then((r) => { if (r[0]) { const f = r[0] as { PERTENCEDP: string | null; FUNCAO: string | null; CODCARGAHOR: number | null }; pertencedp = f.PERTENCEDP; funcao = f.FUNCAO; codcargahor = f.CODCARGAHOR ?? null; } })
          .catch(() => {}),
      );
    }
    if (u.CODGRUPO) {
      enrichments.push(
        this.queryWithUserToken(`SELECT TOP 1 NOMEGRUPO FROM TSIGRU WHERE CODGRUPO = ${u.CODGRUPO}`)
          .then((r) => { if (r[0]) nomegrupo = (r[0] as { NOMEGRUPO: string }).NOMEGRUPO; })
          .catch(() => {}),
      );
    }

    await Promise.all(enrichments);

    return {
      codusu: u.CODUSU,
      nome: u.NOMEUSU,
      nomecompleto: nomeparc,
      codparc: u.CODPARC ?? null,
      codgrupo: u.CODGRUPO ?? null,
      codemp: u.CODEMP ?? null,
      codfunc: u.CODFUNC ?? null,
      pertencedp: pertencedp,
      cargo: funcao,
      nomegrupo: nomegrupo,
      codcargahor: codcargahor,
    };
  }

  /**
   * Execute query using the apiMotherClient (which uses user token from context)
   */
  private async queryWithUserToken(sql: string): Promise<Record<string, unknown>[]> {
    // Import dynamically to avoid circular dependency
    const { apiMotherClient } = await import('@/infra/api-mother/client');
    const response = await apiMotherClient.post('/inspection/query', { query: sql });
    let rows = response.data?.data;
    if (rows && !Array.isArray(rows) && typeof rows === 'object') {
      rows = rows.data ?? rows.dados ?? [];
    }
    return Array.isArray(rows) ? rows : [];
  }

  /**
   * Validate colaborador CPF via API Mother public-query (API key, no user credentials)
   */
  private async validateColaboradorDirect(
    codparc: number,
    cpf: string,
  ): Promise<boolean> {
    const cpfSanitized = cpf.replace(/\D/g, '');
    const sql = validarColaborador
      .replace('@codparc', codparc.toString())
      .replace('@cpfSanitized', cpfSanitized);

    try {
      const rows = await this.publicQuery.executeQuery(sql);
      return Array.isArray(rows) && rows.length > 0;
    } catch (error) {
      logger.error('[Auth] Failed to validate colaborador: %s',
        error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  private async findUsuarioByCodeParcDirect(
    codparc: number,
  ): Promise<{ CODUSU: number; NOMEUSU: string } | null> {
    const sql = `SELECT TOP 1 U.CODUSU, RTRIM(U.NOMEUSU) AS NOMEUSU FROM TSIUSU U WHERE U.CODPARC = ${codparc} AND (U.DTLIMACESSO IS NULL OR U.DTLIMACESSO >= GETDATE())`;

    try {
      const rows = await this.publicQuery.executeQuery<{ CODUSU: number; NOMEUSU: string }>(sql);
      if (rows.length > 0) {
        return rows[0];
      }
      return null;
    } catch {
      return null;
    }
  }
}
