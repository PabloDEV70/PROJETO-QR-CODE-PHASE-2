import { MutationExecutor } from '../../infra/api-mother/mutationExecutor';
import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { ValidationError } from '../errors/app-error';
import { cache } from '../../shared/cache';
import { logger } from '../../shared/logger';
import { CriarHstVeiInput, AtualizarHstVeiInput } from '../../types/AD_HSTVEI';

function bustCache() {
  cache.deleteByPrefix('hstvei:');
}

function assertMutationSuccess(
  result: { sucesso?: boolean; foiSucesso?: boolean; registrosAfetados?: number; mensagem?: string },
  operation: string,
) {
  const ok = result.sucesso ?? result.foiSucesso ?? false;
  if (!ok || (result.registrosAfetados !== undefined && result.registrosAfetados === 0)) {
    const msg = result.mensagem || `Falha ao ${operation} — nenhum registro afetado`;
    logger.error({ result, operation }, `[HstVeiMutation] ${operation} FAILED`);
    throw new Error(msg);
  }
}

function nowDatetime(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function sanitizeDatetime(val: string): string {
  // "2026-03-15T14:30" → "2026-03-15 14:30:00"
  return val.replace('T', ' ').replace(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2})$/, '$1:00');
}

export class HstVeiMutationService {
  private me: MutationExecutor;
  private qe: QueryExecutor;

  constructor() {
    this.me = new MutationExecutor();
    this.qe = new QueryExecutor();
  }

  async criar(input: CriarHstVeiInput, codusu: number, userToken?: string) {
    if (!input.codveiculo || input.codveiculo <= 0) {
      throw new ValidationError('CODVEICULO deve ser um número positivo');
    }
    if (!input.idsit || input.idsit <= 0) {
      throw new ValidationError('IDSIT deve ser um número positivo');
    }

    const dados: Record<string, unknown> = {
      CODVEICULO: input.codveiculo,
      IDSIT: input.idsit,
      DTINICIO: input.dtinicio ? sanitizeDatetime(input.dtinicio) : nowDatetime(),
      CODUSUINC: codusu,
      CODUSUALT: codusu,
      DTCRIACAO: nowDatetime(),
      DTALTER: nowDatetime(),
    };

    if (input.idpri !== undefined) dados.IDPRI = input.idpri;
    if (input.descricao !== undefined) dados.DESCRICAO = input.descricao;
    if (input.obs !== undefined) dados.OBS = input.obs;
    if (input.dtprevisao) dados.DTPREVISAO = sanitizeDatetime(input.dtprevisao);
    if (input.nunota !== undefined) dados.NUNOTA = input.nunota;
    if (input.nuos !== undefined) dados.NUOS = input.nuos;
    if (input.numos !== undefined) dados.NUMOS = input.numos;
    if (input.codparc !== undefined) dados.CODPARC = input.codparc;
    if (input.exeope !== undefined) dados.EXEOPE = input.exeope;
    if (input.exemec !== undefined) dados.EXEMEC = input.exemec;

    const result = await this.me.insert('AD_HSTVEI', dados, { userToken });
    assertMutationSuccess(result, 'criar situação veículo');
    bustCache();

    logger.info({ codveiculo: input.codveiculo, idsit: input.idsit, codusu }, '[HstVei] Situação criada');
    return result;
  }

  async atualizar(id: number, input: AtualizarHstVeiInput, codusu: number, userToken?: string) {
    if (!id || id <= 0) {
      throw new ValidationError('ID deve ser um número positivo');
    }

    const dadosNovos: Record<string, unknown> = {
      CODUSUALT: codusu,
      DTALTER: nowDatetime(),
    };

    if (input.idsit !== undefined) dadosNovos.IDSIT = input.idsit;
    if (input.idpri !== undefined) dadosNovos.IDPRI = input.idpri;
    if (input.descricao !== undefined) dadosNovos.DESCRICAO = input.descricao;
    if (input.obs !== undefined) dadosNovos.OBS = input.obs;
    if (input.dtinicio !== undefined) dadosNovos.DTINICIO = input.dtinicio ? sanitizeDatetime(input.dtinicio) : null;
    if (input.dtprevisao !== undefined) dadosNovos.DTPREVISAO = input.dtprevisao ? sanitizeDatetime(input.dtprevisao) : null;
    if (input.dtfim !== undefined) dadosNovos.DTFIM = input.dtfim ? sanitizeDatetime(input.dtfim) : null;
    if (input.nunota !== undefined) dadosNovos.NUNOTA = input.nunota;
    if (input.nuos !== undefined) dadosNovos.NUOS = input.nuos;
    if (input.numos !== undefined) dadosNovos.NUMOS = input.numos;
    if (input.codparc !== undefined) dadosNovos.CODPARC = input.codparc;
    if (input.exeope !== undefined) dadosNovos.EXEOPE = input.exeope;
    if (input.exemec !== undefined) dadosNovos.EXEMEC = input.exemec;

    const result = await this.me.update('AD_HSTVEI', { ID: id }, dadosNovos, { userToken });
    assertMutationSuccess(result, 'atualizar situação veículo');
    bustCache();

    logger.info({ id, codusu }, '[HstVei] Situação atualizada');
    return result;
  }

  async encerrar(id: number, codusu: number, userToken?: string) {
    if (!id || id <= 0) {
      throw new ValidationError('ID deve ser um número positivo');
    }

    const result = await this.me.update(
      'AD_HSTVEI',
      { ID: id },
      { DTFIM: nowDatetime(), CODUSUALT: codusu, DTALTER: nowDatetime() },
      { userToken },
    );
    assertMutationSuccess(result, 'encerrar situação veículo');
    bustCache();

    logger.info({ id, codusu }, '[HstVei] Situação encerrada');
    return result;
  }

  async trocarSituacao(idAtual: number, novaInput: CriarHstVeiInput, codusu: number, userToken?: string) {
    await this.encerrar(idAtual, codusu, userToken);
    return this.criar(novaInput, codusu, userToken);
  }

  // --- CRUD Situacoes (AD_ADHSTVEISIT) ---

  // --- CRUD Situacoes (AD_ADHSTVEISIT) ---
  // Requer AD_ADHSTVEISIT na allowlist da API Mother (table-permissions.config.ts)

  async createSituacao(input: { DESCRICAO: string; CODDEP: number; OBS?: string }, userToken?: string) {
    const result = await this.me.insert('AD_ADHSTVEISIT', {
      DESCRICAO: input.DESCRICAO.trim(),
      CODDEP: input.CODDEP,
      OBS: input.OBS?.trim() || null,
    }, { userToken });
    assertMutationSuccess(result, 'criar situacao');
    bustCache();
    return result;
  }

  async updateSituacao(id: number, input: Record<string, unknown>, userToken?: string) {
    const dados: Record<string, unknown> = {};
    if (input.DESCRICAO) dados.DESCRICAO = (input.DESCRICAO as string).trim();
    if (input.CODDEP) dados.CODDEP = input.CODDEP;
    if (input.OBS !== undefined) dados.OBS = input.OBS ? (input.OBS as string).trim() : null;
    const result = await this.me.update('AD_ADHSTVEISIT', { ID: id }, dados, { userToken });
    assertMutationSuccess(result, 'atualizar situacao');
    bustCache();
    return result;
  }

  async deleteSituacao(id: number, userToken?: string) {
    const result = await this.me.delete('AD_ADHSTVEISIT', { ID: id }, { userToken });
    assertMutationSuccess(result, 'deletar situacao');
    bustCache();
    return result;
  }

  // --- CRUD Prioridades (AD_ADHSTVEIPRI) ---
  // Requer AD_ADHSTVEIPRI na allowlist da API Mother (table-permissions.config.ts)

  async createPrioridade(input: { IDPRI: number; SIGLA: string; DESCRICAO: string }, userToken?: string) {
    const result = await this.me.insert('AD_ADHSTVEIPRI', {
      IDPRI: input.IDPRI,
      SIGLA: input.SIGLA.trim().toUpperCase(),
      DESCRICAO: input.DESCRICAO.trim(),
    }, { userToken });
    assertMutationSuccess(result, 'criar prioridade');
    bustCache();
    return result;
  }

  async updatePrioridade(idpri: number, input: Record<string, unknown>, userToken?: string) {
    const dados: Record<string, unknown> = {};
    if (input.SIGLA) dados.SIGLA = (input.SIGLA as string).trim().toUpperCase();
    if (input.DESCRICAO) dados.DESCRICAO = (input.DESCRICAO as string).trim();
    const result = await this.me.update('AD_ADHSTVEIPRI', { IDPRI: idpri }, dados, { userToken });
    assertMutationSuccess(result, 'atualizar prioridade');
    bustCache();
    return result;
  }

  async deletePrioridade(idpri: number, userToken?: string) {
    const result = await this.me.delete('AD_ADHSTVEIPRI', { IDPRI: idpri }, { userToken });
    assertMutationSuccess(result, 'deletar prioridade');
    bustCache();
    return result;
  }
}
