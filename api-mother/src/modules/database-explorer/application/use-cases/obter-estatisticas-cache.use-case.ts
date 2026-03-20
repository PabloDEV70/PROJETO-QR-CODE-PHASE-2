/**
 * UseCase: ObterEstatisticasCache
 *
 * Obtém estatísticas do cache.
 */
import { Injectable, Inject } from '@nestjs/common';
import { IProvedorCache, PROVEDOR_CACHE } from '../ports';
import { EstatisticasCache } from '../../domain/entities';

@Injectable()
export class ObterEstatisticasCacheUseCase {
  constructor(
    @Inject(PROVEDOR_CACHE)
    private readonly provedor: IProvedorCache,
  ) {}

  async executar(): Promise<EstatisticasCache> {
    return this.provedor.obterEstatisticasCache();
  }
}
