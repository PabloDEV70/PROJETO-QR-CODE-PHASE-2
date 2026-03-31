import { MutationExecutor } from '../../infra/api-mother/mutationExecutor';
import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { ValidationError } from '../errors/app-error';
import { cache } from '../../shared/cache';
import { logger } from '../../shared/logger';
import * as QNext from '../../sql-queries/TGFPRO/next-codgrupoprod';

function bustCache() {
  cache.deleteByPrefix('servicos-grupo:');
}

function assertMutationSuccess(
  result: { sucesso?: boolean; foiSucesso?: boolean; registrosAfetados?: number; mensagem?: string },
  operation: string,
) {
  const ok = result.sucesso ?? result.foiSucesso ?? false;
  if (!ok || (result.registrosAfetados !== undefined && result.registrosAfetados === 0)) {
    const msg = result.mensagem || `Falha ao ${operation} — nenhum registro afetado`;
    logger.error({ result, operation }, `[ServicosGrupoMutation] ${operation} FAILED`);
    throw new Error(msg);
  }
}

export interface CreateGrupoInput {
  CODGRUPOPROD: number;
  DESCRGRUPOPROD: string;
  CODGRUPAI?: number | null;
}

export interface UpdateGrupoInput {
  DESCRGRUPOPROD: string;
}

export interface UpdateServicoInput {
  DESCRPROD: string;
}

export class ServicosGrupoMutationService {
  private me: MutationExecutor;
  private qe: QueryExecutor;

  constructor() {
    this.me = new MutationExecutor();
    this.qe = new QueryExecutor();
  }

  async createGrupo(input: CreateGrupoInput, userToken?: string) {
    if (!input.CODGRUPOPROD || input.CODGRUPOPROD <= 0) {
      throw new ValidationError('CODGRUPOPROD deve ser um numero positivo');
    }
    if (!input.DESCRGRUPOPROD || input.DESCRGRUPOPROD.trim().length === 0) {
      throw new ValidationError('DESCRGRUPOPROD e obrigatorio');
    }
    if (input.DESCRGRUPOPROD.length > 30) {
      throw new ValidationError('DESCRGRUPOPROD max 30 caracteres');
    }

    let grau = 1;
    if (input.CODGRUPAI && input.CODGRUPAI > 0) {
      const rows = await this.qe.executeQuery<Record<string, unknown>>(
        `SELECT GRAU FROM TGFGRU WHERE CODGRUPOPROD = ${input.CODGRUPAI}`,
      );
      if (rows.length === 0) {
        throw new ValidationError(`Grupo pai ${input.CODGRUPAI} nao encontrado`);
      }
      grau = (rows[0].GRAU as number) + 1;
    }

    const dados: Record<string, unknown> = {
      CODGRUPOPROD: input.CODGRUPOPROD,
      DESCRGRUPOPROD: input.DESCRGRUPOPROD.trim().toUpperCase(),
      CODGRUPAI: input.CODGRUPAI ?? -999999999,
      GRAU: grau,
      ATIVO: 'S',
      ANALITICO: 'S',
      CODNAT: 0,
      CODCENCUS: 0,
      CODPROJ: 0,
    };

    const result = await this.me.insert('TGFGRU', dados, { userToken });
    assertMutationSuccess(result, 'criar grupo');
    bustCache();
    return result;
  }

  async updateGrupo(codGrupo: number, input: UpdateGrupoInput, userToken?: string) {
    if (!codGrupo || codGrupo <= 0) {
      throw new ValidationError('CODGRUPOPROD deve ser um numero positivo');
    }
    if (!input.DESCRGRUPOPROD || input.DESCRGRUPOPROD.trim().length === 0) {
      throw new ValidationError('DESCRGRUPOPROD e obrigatorio');
    }
    if (input.DESCRGRUPOPROD.length > 30) {
      throw new ValidationError('DESCRGRUPOPROD max 30 caracteres');
    }

    const result = await this.me.update(
      'TGFGRU',
      { CODGRUPOPROD: codGrupo },
      { DESCRGRUPOPROD: input.DESCRGRUPOPROD.trim().toUpperCase() },
      { userToken },
    );
    assertMutationSuccess(result, 'atualizar grupo');
    bustCache();
    return result;
  }

  async toggleGrupoAtivo(codGrupo: number, ativo: string, userToken?: string) {
    if (!codGrupo || codGrupo <= 0) {
      throw new ValidationError('CODGRUPOPROD deve ser um numero positivo');
    }
    if (ativo !== 'S' && ativo !== 'N') {
      throw new ValidationError('ATIVO deve ser S ou N');
    }

    const result = await this.me.update(
      'TGFGRU',
      { CODGRUPOPROD: codGrupo },
      { ATIVO: ativo },
      { userToken },
    );
    assertMutationSuccess(result, 'toggle grupo ativo');
    bustCache();
    return result;
  }

  async updateServico(codProd: number, input: UpdateServicoInput, userToken?: string) {
    if (!codProd || codProd <= 0) {
      throw new ValidationError('CODPROD deve ser um numero positivo');
    }
    if (!input.DESCRPROD || input.DESCRPROD.trim().length === 0) {
      throw new ValidationError('DESCRPROD e obrigatorio');
    }

    const result = await this.me.update(
      'TGFPRO',
      { CODPROD: codProd },
      { DESCRPROD: input.DESCRPROD.trim().toUpperCase() },
      { userToken },
    );
    assertMutationSuccess(result, 'atualizar servico');
    bustCache();
    return result;
  }

  async moveServico(codProd: number, novoCodGrupo: number, userToken?: string) {
    if (!codProd || codProd <= 0) {
      throw new ValidationError('CODPROD deve ser um numero positivo');
    }
    if (!novoCodGrupo || novoCodGrupo <= 0) {
      throw new ValidationError('CODGRUPOPROD destino deve ser um numero positivo');
    }

    const rows = await this.qe.executeQuery<Record<string, unknown>>(
      `SELECT CODGRUPOPROD FROM TGFGRU WHERE CODGRUPOPROD = ${novoCodGrupo}`,
    );
    if (rows.length === 0) {
      throw new ValidationError(`Grupo destino ${novoCodGrupo} nao encontrado`);
    }

    const result = await this.me.update(
      'TGFPRO',
      { CODPROD: codProd },
      { CODGRUPOPROD: novoCodGrupo },
      { userToken },
    );
    assertMutationSuccess(result, 'mover servico');
    bustCache();
    return result;
  }

  async getNextCodGrupo(codGrupoPai?: number | null): Promise<{ sugestao: number; filhos: number[] }> {
    if (codGrupoPai && codGrupoPai > 0) {
      const sql = QNext.getChildrenCods.replace(/@CODGRUPAI/g, String(codGrupoPai));
      const rows = await this.qe.executeQuery<Record<string, unknown>>(sql);
      const filhos = rows.map((r) => r.CODGRUPOPROD as number);

      if (filhos.length === 0) {
        return { sugestao: codGrupoPai * 100 + 1, filhos: [] };
      }
      const max = Math.max(...filhos);
      return { sugestao: max + 1, filhos };
    }

    const rows = await this.qe.executeQuery<Record<string, unknown>>(QNext.getNextCodGrupoProd);
    const maxCod = (rows[0]?.MAX_COD as number) || 0;
    return { sugestao: maxCod + 1, filhos: [] };
  }

  async toggleServicoAtivo(codProd: number, ativo: string, userToken?: string) {
    if (!codProd || codProd <= 0) {
      throw new ValidationError('CODPROD deve ser um numero positivo');
    }
    if (ativo !== 'S' && ativo !== 'N') {
      throw new ValidationError('ATIVO deve ser S ou N');
    }

    const result = await this.me.update(
      'TGFPRO',
      { CODPROD: codProd },
      { ATIVO: ativo },
      { userToken },
    );
    assertMutationSuccess(result, 'toggle servico ativo');
    bustCache();
    return result;
  }
}
