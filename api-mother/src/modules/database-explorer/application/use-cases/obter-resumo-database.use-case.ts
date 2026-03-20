/**
 * UseCase: ObterResumoDatabase
 *
 * Obtém o resumo estatístico do banco de dados.
 */
import { Injectable, Inject } from '@nestjs/common';
import { IProvedorResumoDatabase, PROVEDOR_RESUMO_DATABASE } from '../ports';
import { ResumoDatabase } from '../../domain/entities';

@Injectable()
export class ObterResumoDatabaseUseCase {
  constructor(
    @Inject(PROVEDOR_RESUMO_DATABASE)
    private readonly provedor: IProvedorResumoDatabase,
  ) {}

  async executar(): Promise<ResumoDatabase> {
    return this.provedor.obterResumo();
  }
}
