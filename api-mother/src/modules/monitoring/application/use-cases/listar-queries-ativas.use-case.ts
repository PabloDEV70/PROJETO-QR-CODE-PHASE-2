/**
 * UseCase: ListarQueriesAtivas
 *
 * Lista queries em execução no momento.
 */
import { Injectable, Inject } from '@nestjs/common';
import { IProvedorQueriesAtivas, PROVEDOR_QUERIES_ATIVAS } from '../ports';
import { QueryAtiva } from '../../domain/entities';

@Injectable()
export class ListarQueriesAtivasUseCase {
  constructor(
    @Inject(PROVEDOR_QUERIES_ATIVAS)
    private readonly provedor: IProvedorQueriesAtivas,
  ) {}

  async executar(): Promise<QueryAtiva[]> {
    return this.provedor.obterQueriesAtivas();
  }
}
