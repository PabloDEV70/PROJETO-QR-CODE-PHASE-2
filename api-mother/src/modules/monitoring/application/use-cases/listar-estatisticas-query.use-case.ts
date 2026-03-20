/**
 * UseCase: ListarEstatisticasQuery
 *
 * Lista estatísticas de execução de queries.
 */
import { Injectable, Inject } from '@nestjs/common';
import { IProvedorEstatisticasQuery, PROVEDOR_ESTATISTICAS_QUERY } from '../ports';
import { EstatisticasQuery } from '../../domain/entities';

@Injectable()
export class ListarEstatisticasQueryUseCase {
  constructor(
    @Inject(PROVEDOR_ESTATISTICAS_QUERY)
    private readonly provedor: IProvedorEstatisticasQuery,
  ) {}

  async executar(limite = 50): Promise<EstatisticasQuery[]> {
    return this.provedor.obterEstatisticas(limite);
  }

  async obterPesadas(limite = 50, cpuMinimoMs = 1000): Promise<EstatisticasQuery[]> {
    return this.provedor.obterQueriesPesadas(limite, cpuMinimoMs);
  }
}
