/**
 * UseCase: ObterRelacoesTabela
 *
 * Obtém os relacionamentos FK de uma tabela.
 */
import { Injectable, Inject } from '@nestjs/common';
import { IProvedorRelacoes, PROVEDOR_RELACOES, ResultadoRelacoes } from '../ports';

@Injectable()
export class ObterRelacoesTabelaUseCase {
  constructor(
    @Inject(PROVEDOR_RELACOES)
    private readonly provedor: IProvedorRelacoes,
  ) {}

  async executar(nomeTabela: string): Promise<ResultadoRelacoes> {
    return this.provedor.obterRelacoes(nomeTabela);
  }
}
