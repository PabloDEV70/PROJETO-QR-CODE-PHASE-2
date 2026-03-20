/**
 * Use Case: ProcessarAprovacao
 *
 * Processa uma aprovacao pendente (aprovar ou rejeitar).
 */

import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { REPOSITORIO_APROVACAO, IAprovacaoRepository } from '../../../domain/repositories';

export interface ProcessarAprovacaoInput {
  aprovacaoId: number;
  codAprovador: number;
  aprovar: boolean;
  motivoRejeicao?: string;
  observacao?: string;
}

export interface ProcessarAprovacaoOutput {
  aprovacaoId: number;
  status: string;
  descricaoStatus: string;
  dataProcessamento: Date;
  processado: boolean;
  mensagem: string;
}

@Injectable()
export class ProcessarAprovacaoUseCase {
  constructor(
    @Inject(REPOSITORIO_APROVACAO)
    private readonly repositorio: IAprovacaoRepository,
  ) {}

  async executar(input: ProcessarAprovacaoInput): Promise<ProcessarAprovacaoOutput> {
    // Buscar aprovacao
    const aprovacao = await this.repositorio.buscarPorId(input.aprovacaoId);

    if (!aprovacao) {
      throw new NotFoundException(`Aprovacao com ID ${input.aprovacaoId} nao encontrada`);
    }

    // Verificar se ainda esta pendente
    if (!aprovacao.estaPendente()) {
      throw new BadRequestException(`Aprovacao ja foi processada. Status atual: ${aprovacao.obterDescricaoStatus()}`);
    }

    // Verificar se expirou
    if (aprovacao.estaExpirada()) {
      // Marcar como expirada
      await this.repositorio.expirar();
      throw new BadRequestException('Aprovacao expirada e nao pode mais ser processada');
    }

    // Validar motivo de rejeicao
    if (!input.aprovar && !input.motivoRejeicao) {
      throw new BadRequestException('Motivo de rejeicao e obrigatorio ao rejeitar');
    }

    // Processar
    const novoStatus = input.aprovar ? 'A' : 'R';
    const dataProcessamento = new Date();

    const processado = await this.repositorio.processar({
      aprovacaoId: input.aprovacaoId,
      codAprovador: input.codAprovador,
      novoStatus,
      motivoRejeicao: input.motivoRejeicao,
      observacao: input.observacao,
    });

    if (!processado) {
      throw new BadRequestException('Falha ao processar aprovacao. Verifique se ainda esta pendente.');
    }

    const statusDescricao = input.aprovar ? 'Aprovada' : 'Rejeitada';

    return {
      aprovacaoId: input.aprovacaoId,
      status: novoStatus,
      descricaoStatus: statusDescricao,
      dataProcessamento,
      processado: true,
      mensagem: `Operacao ${statusDescricao.toLowerCase()} com sucesso`,
    };
  }

  async aprovar(aprovacaoId: number, codAprovador: number, observacao?: string): Promise<ProcessarAprovacaoOutput> {
    return this.executar({
      aprovacaoId,
      codAprovador,
      aprovar: true,
      observacao,
    });
  }

  async rejeitar(
    aprovacaoId: number,
    codAprovador: number,
    motivoRejeicao: string,
    observacao?: string,
  ): Promise<ProcessarAprovacaoOutput> {
    return this.executar({
      aprovacaoId,
      codAprovador,
      aprovar: false,
      motivoRejeicao,
      observacao,
    });
  }
}
