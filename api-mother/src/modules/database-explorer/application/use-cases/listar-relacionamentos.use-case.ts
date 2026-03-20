/**
 * UseCase: ListarRelacionamentos
 *
 * Lista relacionamentos de chave estrangeira do banco de dados.
 */
import { Injectable, Inject } from '@nestjs/common';
import { IProvedorRelacionamentos, PROVEDOR_RELACIONAMENTOS, OpcoesPaginacao } from '../ports';
import { Relacionamento } from '../../domain/entities';

@Injectable()
export class ListarRelacionamentosUseCase {
  constructor(
    @Inject(PROVEDOR_RELACIONAMENTOS)
    private readonly provedor: IProvedorRelacionamentos,
  ) {}

  async executar(opcoes: OpcoesPaginacao = {}): Promise<Relacionamento[]> {
    return this.provedor.listarRelacionamentos(opcoes);
  }
}
