/**
 * UseCase: ObterDetalheProcedure
 *
 * Obtém detalhes de uma procedure específica.
 */
import { Injectable, Inject } from '@nestjs/common';
import { IProvedorProcedures, PROVEDOR_PROCEDURES } from '../ports';
import { ProcedureDetalhe } from '../../domain/entities';

@Injectable()
export class ObterDetalheProcedureUseCase {
  constructor(
    @Inject(PROVEDOR_PROCEDURES)
    private readonly provedor: IProvedorProcedures,
  ) {}

  async executar(schema: string, nome: string, truncar = false): Promise<ProcedureDetalhe> {
    return this.provedor.obterDetalheProcedure(schema, nome, truncar);
  }
}
