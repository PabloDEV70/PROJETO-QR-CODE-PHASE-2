/**
 * Use Case: SolicitarAprovacao
 *
 * Cria uma nova solicitacao de aprovacao.
 */

import { Injectable, Inject } from '@nestjs/common';
import { REPOSITORIO_APROVACAO, IAprovacaoRepository } from '../../../domain/repositories';
import { AprovacaoPendente, TipoOperacaoAprovacao, PrioridadeAprovacao } from '../../../domain/entities';

export interface SolicitarAprovacaoInput {
  codUsuario: number;
  codAprovador?: number;
  tabela: string;
  operacao: TipoOperacaoAprovacao;
  dados: Record<string, unknown>;
  chaveRegistro?: string;
  observacao?: string;
  ip?: string;
  prioridade?: PrioridadeAprovacao;
  diasParaExpirar?: number;
}

export interface SolicitarAprovacaoOutput {
  aprovacaoId: number;
  status: string;
  dataSolicitacao: Date;
  dataExpiracao: Date | null;
  mensagem: string;
}

@Injectable()
export class SolicitarAprovacaoUseCase {
  constructor(
    @Inject(REPOSITORIO_APROVACAO)
    private readonly repositorio: IAprovacaoRepository,
  ) {}

  async executar(input: SolicitarAprovacaoInput): Promise<SolicitarAprovacaoOutput> {
    const dataSolicitacao = new Date();
    const diasParaExpirar = input.diasParaExpirar || 7; // Default: 7 dias

    const dataExpiracao = new Date(dataSolicitacao);
    dataExpiracao.setDate(dataExpiracao.getDate() + diasParaExpirar);

    const aprovacao = AprovacaoPendente.criar({
      codUsuario: input.codUsuario,
      codAprovador: input.codAprovador || null,
      tabela: input.tabela,
      operacao: input.operacao,
      dados: JSON.stringify(input.dados),
      chaveRegistro: input.chaveRegistro || null,
      status: 'P',
      dataSolicitacao,
      dataExpiracao,
      observacaoSolicitante: input.observacao || null,
      ipOrigem: input.ip || null,
      prioridade: input.prioridade || 'N',
    });

    const aprovacaoId = await this.repositorio.inserir(aprovacao);

    return {
      aprovacaoId,
      status: 'Pendente',
      dataSolicitacao,
      dataExpiracao,
      mensagem: `Solicitacao de ${aprovacao.obterDescricaoOperacao()} criada com sucesso. Aguardando aprovacao.`,
    };
  }
}
