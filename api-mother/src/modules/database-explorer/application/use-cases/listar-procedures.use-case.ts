/**
 * UseCase: ListarProcedures
 *
 * Lista procedures do banco de dados.
 */
import { Injectable, Inject } from '@nestjs/common';
import { IProvedorProcedures, PROVEDOR_PROCEDURES, OpcoesPaginacao } from '../ports';
import { Procedure } from '../../domain/entities';

@Injectable()
export class ListarProceduresUseCase {
  constructor(
    @Inject(PROVEDOR_PROCEDURES)
    private readonly provedor: IProvedorProcedures,
  ) {}

  async executar(opcoes: OpcoesPaginacao = {}): Promise<Procedure[]> {
    return this.provedor.listarProcedures(opcoes);
  }
}
