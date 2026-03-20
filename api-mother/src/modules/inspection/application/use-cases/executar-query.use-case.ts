/**
 * UseCase: ExecutarQuery
 *
 * Executa uma query SQL de leitura.
 */
import { Injectable, Inject } from '@nestjs/common';
import { IProvedorQuery, PROVEDOR_QUERY, EntradaQuery } from '../ports';
import { ResultadoQuery } from '../../domain/entities';

@Injectable()
export class ExecutarQueryUseCase {
  constructor(
    @Inject(PROVEDOR_QUERY)
    private readonly provedor: IProvedorQuery,
  ) {}

  async executar(entrada: EntradaQuery): Promise<ResultadoQuery> {
    return this.provedor.executarQuery(entrada);
  }
}
