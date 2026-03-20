/**
 * Use Case: ListarAprovacoesPendentes
 *
 * Lista aprovacoes pendentes para um aprovador.
 */

import { Injectable, Inject } from '@nestjs/common';
import { REPOSITORIO_APROVACAO, IAprovacaoRepository, FiltrosAprovacao } from '../../../domain/repositories';
import { StatusAprovacao, TipoOperacaoAprovacao } from '../../../domain/entities';

export interface ListarAprovacoesPendentesInput {
  codAprovador?: number;
  tabela?: string;
  operacao?: TipoOperacaoAprovacao;
  status?: StatusAprovacao;
  pagina?: number;
  limite?: number;
}

export interface AprovacaoDto {
  aprovacaoId: number;
  codUsuario: number;
  codAprovador: number | null;
  tabela: string;
  operacao: string;
  descricaoOperacao: string;
  dados: Record<string, unknown> | null;
  chaveRegistro: string | null;
  status: string;
  descricaoStatus: string;
  dataSolicitacao: Date;
  dataExpiracao: Date | null;
  horasRestantes: number | null;
  observacaoSolicitante: string | null;
  prioridade: string;
  descricaoPrioridade: string;
}

export interface ListarAprovacoesPendentesOutput {
  aprovacoes: AprovacaoDto[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

@Injectable()
export class ListarAprovacoesPendentesUseCase {
  constructor(
    @Inject(REPOSITORIO_APROVACAO)
    private readonly repositorio: IAprovacaoRepository,
  ) {}

  async executar(input: ListarAprovacoesPendentesInput): Promise<ListarAprovacoesPendentesOutput> {
    const limite = input.limite || 50;
    const pagina = input.pagina || 1;
    const offset = (pagina - 1) * limite;

    const filtros: FiltrosAprovacao = {
      codAprovador: input.codAprovador,
      tabela: input.tabela,
      operacao: input.operacao,
      status: input.status || 'P',
      limite,
      offset,
    };

    const resultado = await this.repositorio.buscarPorFiltros(filtros);

    const aprovacoes: AprovacaoDto[] = resultado.dados.map((aprov) => ({
      aprovacaoId: aprov.aprovacaoId!,
      codUsuario: aprov.codUsuario,
      codAprovador: aprov.codAprovador,
      tabela: aprov.tabela,
      operacao: aprov.operacao,
      descricaoOperacao: aprov.obterDescricaoOperacao(),
      dados: aprov.obterDadosParseados(),
      chaveRegistro: aprov.chaveRegistro,
      status: aprov.status,
      descricaoStatus: aprov.obterDescricaoStatus(),
      dataSolicitacao: aprov.dataSolicitacao,
      dataExpiracao: aprov.dataExpiracao,
      horasRestantes: aprov.obterHorasRestantes(),
      observacaoSolicitante: aprov.observacaoSolicitante,
      prioridade: aprov.prioridade,
      descricaoPrioridade: aprov.obterDescricaoPrioridade(),
    }));

    return {
      aprovacoes,
      total: resultado.total,
      pagina: resultado.pagina,
      limite: resultado.limite,
      totalPaginas: resultado.totalPaginas,
    };
  }

  async buscarPorId(aprovacaoId: number): Promise<AprovacaoDto | null> {
    const aprov = await this.repositorio.buscarPorId(aprovacaoId);

    if (!aprov) {
      return null;
    }

    return {
      aprovacaoId: aprov.aprovacaoId!,
      codUsuario: aprov.codUsuario,
      codAprovador: aprov.codAprovador,
      tabela: aprov.tabela,
      operacao: aprov.operacao,
      descricaoOperacao: aprov.obterDescricaoOperacao(),
      dados: aprov.obterDadosParseados(),
      chaveRegistro: aprov.chaveRegistro,
      status: aprov.status,
      descricaoStatus: aprov.obterDescricaoStatus(),
      dataSolicitacao: aprov.dataSolicitacao,
      dataExpiracao: aprov.dataExpiracao,
      horasRestantes: aprov.obterHorasRestantes(),
      observacaoSolicitante: aprov.observacaoSolicitante,
      prioridade: aprov.prioridade,
      descricaoPrioridade: aprov.obterDescricaoPrioridade(),
    };
  }

  async contarPendentes(codAprovador?: number): Promise<number> {
    if (codAprovador) {
      return this.repositorio.contarPendentesPorAprovador(codAprovador);
    }

    const stats = await this.repositorio.buscarEstatisticas({});
    return stats.totalPendentes;
  }

  async buscarProximasDeExpirar(horasRestantes: number): Promise<AprovacaoDto[]> {
    const aprovacoes = await this.repositorio.buscarProximasDeExpirar(horasRestantes);

    return aprovacoes.map((aprov) => ({
      aprovacaoId: aprov.aprovacaoId!,
      codUsuario: aprov.codUsuario,
      codAprovador: aprov.codAprovador,
      tabela: aprov.tabela,
      operacao: aprov.operacao,
      descricaoOperacao: aprov.obterDescricaoOperacao(),
      dados: aprov.obterDadosParseados(),
      chaveRegistro: aprov.chaveRegistro,
      status: aprov.status,
      descricaoStatus: aprov.obterDescricaoStatus(),
      dataSolicitacao: aprov.dataSolicitacao,
      dataExpiracao: aprov.dataExpiracao,
      horasRestantes: aprov.obterHorasRestantes(),
      observacaoSolicitante: aprov.observacaoSolicitante,
      prioridade: aprov.prioridade,
      descricaoPrioridade: aprov.obterDescricaoPrioridade(),
    }));
  }
}
