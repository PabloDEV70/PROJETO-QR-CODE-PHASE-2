/**
 * Use Case: ExpirarAprovacoes
 *
 * Marca aprovacoes expiradas.
 */

import { Injectable, Inject } from '@nestjs/common';
import { REPOSITORIO_APROVACAO, IAprovacaoRepository } from '../../../domain/repositories';

export interface ExpirarAprovacoesOutput {
  totalExpiradas: number;
  dataExecucao: Date;
  mensagem: string;
}

@Injectable()
export class ExpirarAprovacoesUseCase {
  constructor(
    @Inject(REPOSITORIO_APROVACAO)
    private readonly repositorio: IAprovacaoRepository,
  ) {}

  async executar(): Promise<ExpirarAprovacoesOutput> {
    const dataExecucao = new Date();
    const totalExpiradas = await this.repositorio.expirar();

    const mensagem =
      totalExpiradas > 0
        ? `${totalExpiradas} aprovacao(oes) expirada(s) com sucesso`
        : 'Nenhuma aprovacao para expirar';

    return {
      totalExpiradas,
      dataExecucao,
      mensagem,
    };
  }

  async buscarEstatisticas(): Promise<{
    totalPendentes: number;
    totalAprovadas: number;
    totalRejeitadas: number;
    totalExpiradas: number;
    totalCanceladas: number;
  }> {
    return this.repositorio.buscarEstatisticas({});
  }
}
