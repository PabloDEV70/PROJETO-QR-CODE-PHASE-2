import { Inject, Injectable } from '@nestjs/common';
import { Tabela } from '../../../domain/entities';
import { IProvedorTabelas, PROVEDOR_TABELAS, OpcoesPaginacao, ResultadoPaginado } from '../../ports';

/**
 * Use Case: ListarTabelasUseCase
 *
 * Lista todas as tabelas do dicionário de dados.
 */
@Injectable()
export class ListarTabelasUseCase {
  constructor(
    @Inject(PROVEDOR_TABELAS)
    private readonly provedorTabelas: IProvedorTabelas,
  ) {}

  async executar(opcoes?: OpcoesPaginacao): Promise<ResultadoPaginado<Tabela>> {
    return this.provedorTabelas.listarTabelas(opcoes);
  }
}
