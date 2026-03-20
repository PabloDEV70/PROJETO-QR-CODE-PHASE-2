import { Inject, Injectable } from '@nestjs/common';
import { Tabela } from '../../../domain/entities';
import { IProvedorTabelas, PROVEDOR_TABELAS, OpcoesPaginacao, ResultadoPaginado } from '../../ports';

/**
 * Use Case: BuscarTabelasUseCase
 *
 * Busca tabelas por termo no nome ou descrição.
 */
@Injectable()
export class BuscarTabelasUseCase {
  constructor(
    @Inject(PROVEDOR_TABELAS)
    private readonly provedorTabelas: IProvedorTabelas,
  ) {}

  async executar(termo: string, opcoes?: OpcoesPaginacao): Promise<ResultadoPaginado<Tabela>> {
    return this.provedorTabelas.buscarTabelas(termo, opcoes);
  }
}
