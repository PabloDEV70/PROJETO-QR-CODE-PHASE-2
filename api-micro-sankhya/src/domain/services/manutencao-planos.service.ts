import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { PlanoManutencao, AderenciaPlano } from '../../types/TCFMAN';
import * as Q from '../../sql-queries/TCFMAN';

interface AderenciaFiltros {
  situacao?: 'ATRASADA' | 'PROXIMA' | 'EM_DIA' | 'SEM_HISTORICO';
  codveiculo?: number;
}

/**
 * Serviço de planos de manutenção preventiva
 */
export class ManutencaoPlanosService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  /**
   * Lista todos os planos de manutenção preventiva
   */
  async listarPlanos(): Promise<PlanoManutencao[]> {
    return this.queryExecutor.executeQuery<PlanoManutencao>(Q.listarPlanos);
  }

  /**
   * Análise de aderência aos planos de manutenção
   */
  async getAderencia(filtros?: AderenciaFiltros): Promise<AderenciaPlano[]> {
    let sql = Q.aderenciaPlanos;

    // Filtra por situação (feito em memória pois é CASE calculado)
    const result = await this.queryExecutor.executeQuery<AderenciaPlano>(sql);

    let filtered = result;

    if (filtros?.situacao) {
      filtered = filtered.filter((r) => r.situacao === filtros.situacao);
    }

    if (filtros?.codveiculo) {
      filtered = filtered.filter((r) => r.codveiculo === filtros.codveiculo);
    }

    return filtered;
  }

  /**
   * Manutenções preventivas atrasadas
   */
  async getAtrasadas(): Promise<AderenciaPlano[]> {
    return this.queryExecutor.executeQuery<AderenciaPlano>(Q.manutencoesAtrasadas);
  }

  /**
   * Resumo da aderência (dashboard)
   */
  async getResumoAderencia(): Promise<{
    emDia: number;
    proximas: number;
    atrasadas: number;
    semHistorico: number;
    total: number;
  }> {
    const aderencia = await this.queryExecutor.executeQuery<AderenciaPlano>(Q.aderenciaPlanos);

    const resumo = {
      emDia: 0,
      proximas: 0,
      atrasadas: 0,
      semHistorico: 0,
      total: aderencia.length,
    };

    for (const item of aderencia) {
      switch (item.situacao) {
        case 'EM_DIA':
          resumo.emDia++;
          break;
        case 'PROXIMA':
          resumo.proximas++;
          break;
        case 'ATRASADA':
          resumo.atrasadas++;
          break;
        case 'SEM_HISTORICO':
          resumo.semHistorico++;
          break;
      }
    }

    return resumo;
  }
}
