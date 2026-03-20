/**
 * UseCase: ObterChavesPrimarias
 *
 * Obtém as chaves primárias de uma tabela.
 */
import { Injectable, Inject } from '@nestjs/common';
import { IProvedorRelacoes, PROVEDOR_RELACOES, ResultadoChavesPrimarias } from '../ports';

@Injectable()
export class ObterChavesPrimariasUseCase {
  constructor(
    @Inject(PROVEDOR_RELACOES)
    private readonly provedor: IProvedorRelacoes,
  ) {}

  async executar(nomeTabela: string): Promise<ResultadoChavesPrimarias> {
    return this.provedor.obterChavesPrimarias(nomeTabela);
  }
}
