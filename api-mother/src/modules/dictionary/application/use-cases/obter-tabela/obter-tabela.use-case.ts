import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Tabela } from '../../../domain/entities';
import { IProvedorTabelas, PROVEDOR_TABELAS } from '../../ports';

/**
 * Use Case: ObterTabelaUseCase
 *
 * Obtém detalhes de uma tabela específica pelo nome.
 */
@Injectable()
export class ObterTabelaUseCase {
  constructor(
    @Inject(PROVEDOR_TABELAS)
    private readonly provedorTabelas: IProvedorTabelas,
  ) {}

  async executar(nomeTabela: string): Promise<Tabela> {
    const tabela = await this.provedorTabelas.obterTabelaPorNome(nomeTabela.toUpperCase());

    if (!tabela) {
      throw new NotFoundException(`Tabela '${nomeTabela}' não encontrada no dicionário`);
    }

    return tabela;
  }
}
