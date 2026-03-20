/**
 * UseCase: ListarTabelas
 *
 * Lista todas as tabelas do banco de dados.
 */
import { Injectable, Inject } from '@nestjs/common';
import { IProvedorTabelas, PROVEDOR_TABELAS, ResultadoListaTabelas } from '../ports';

@Injectable()
export class ListarTabelasUseCase {
  constructor(
    @Inject(PROVEDOR_TABELAS)
    private readonly provedor: IProvedorTabelas,
  ) {}

  async executar(): Promise<ResultadoListaTabelas> {
    return this.provedor.listarTabelas();
  }
}
