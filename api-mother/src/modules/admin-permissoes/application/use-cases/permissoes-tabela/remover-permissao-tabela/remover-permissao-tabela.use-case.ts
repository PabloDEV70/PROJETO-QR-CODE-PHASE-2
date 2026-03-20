import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IRepositorioPermissaoTabela,
  REPOSITORIO_PERMISSAO_TABELA,
} from '../../../../domain/repositories/permissao-tabela.repository.interface';

export interface RemoverPermissaoTabelaEntrada {
  codPermissao: number;
}

export interface RemoverPermissaoTabelaResultado {
  sucesso: boolean;
  mensagem: string;
}

/**
 * Caso de uso para remover uma permissao de tabela.
 */
@Injectable()
export class RemoverPermissaoTabelaUseCase {
  constructor(
    @Inject(REPOSITORIO_PERMISSAO_TABELA)
    private readonly repositorio: IRepositorioPermissaoTabela,
  ) {}

  async executar(entrada: RemoverPermissaoTabelaEntrada): Promise<RemoverPermissaoTabelaResultado> {
    // Verificar se permissao existe
    const permissaoExistente = await this.repositorio.buscarPorCodigo(entrada.codPermissao);
    if (!permissaoExistente) {
      throw new NotFoundException(`Permissao com codigo ${entrada.codPermissao} nao encontrada`);
    }

    // Remover
    await this.repositorio.remover(entrada.codPermissao);

    return {
      sucesso: true,
      mensagem: `Permissao de ${permissaoExistente.operacao} na tabela '${permissaoExistente.nomeTabela}' removida com sucesso`,
    };
  }
}
