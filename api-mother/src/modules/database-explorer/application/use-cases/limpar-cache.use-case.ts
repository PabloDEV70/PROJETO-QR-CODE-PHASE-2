/**
 * UseCase: LimparCache
 *
 * Limpa o cache do serviço de exploração do banco.
 */
import { Injectable, Inject } from '@nestjs/common';
import { IProvedorCache, PROVEDOR_CACHE } from '../ports';

@Injectable()
export class LimparCacheUseCase {
  constructor(
    @Inject(PROVEDOR_CACHE)
    private readonly provedor: IProvedorCache,
  ) {}

  async executar(): Promise<void> {
    return this.provedor.limparCache();
  }
}
