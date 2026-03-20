/**
 * Use Case: ConsultarHistorico
 *
 * Consulta o historico de auditoria com filtros.
 */

import { Injectable, Inject } from '@nestjs/common';
import { REPOSITORIO_AUDITORIA, IAuditoriaRepository, FiltrosHistorico } from '../../../domain/repositories';
import { TipoOperacao } from '../../../domain/entities';

export interface ConsultarHistoricoInput {
  codUsuario?: number;
  tabela?: string;
  operacao?: TipoOperacao;
  dataInicio?: Date | string;
  dataFim?: Date | string;
  sucesso?: 'S' | 'N';
  chaveRegistro?: string;
  pagina?: number;
  limite?: number;
}

export interface RegistroHistoricoDto {
  auditoriaId: number;
  codUsuario: number;
  tabela: string;
  operacao: string;
  descricaoOperacao: string;
  dadosAntigos: Record<string, unknown> | null;
  dadosNovos: Record<string, unknown> | null;
  diferencas: Record<string, { antigo: unknown; novo: unknown }> | null;
  dataHora: Date;
  ip: string | null;
  chaveRegistro: string | null;
  sucesso: boolean;
  mensagemErro: string | null;
}

export interface ConsultarHistoricoOutput {
  registros: RegistroHistoricoDto[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

@Injectable()
export class ConsultarHistoricoUseCase {
  constructor(
    @Inject(REPOSITORIO_AUDITORIA)
    private readonly repositorio: IAuditoriaRepository,
  ) {}

  async executar(input: ConsultarHistoricoInput): Promise<ConsultarHistoricoOutput> {
    const limite = input.limite || 50;
    const pagina = input.pagina || 1;
    const offset = (pagina - 1) * limite;

    const filtros: FiltrosHistorico = {
      codUsuario: input.codUsuario,
      tabela: input.tabela,
      operacao: input.operacao,
      dataInicio: input.dataInicio ? new Date(input.dataInicio) : undefined,
      dataFim: input.dataFim ? new Date(input.dataFim) : undefined,
      sucesso: input.sucesso,
      chaveRegistro: input.chaveRegistro,
      limite,
      offset,
    };

    const resultado = await this.repositorio.buscarPorFiltros(filtros);

    const registros: RegistroHistoricoDto[] = resultado.dados.map((reg) => ({
      auditoriaId: reg.auditoriaId!,
      codUsuario: reg.codUsuario,
      tabela: reg.tabela,
      operacao: reg.operacao,
      descricaoOperacao: reg.obterDescricaoOperacao(),
      dadosAntigos: reg.obterDadosAntigosParseados(),
      dadosNovos: reg.obterDadosNovosParseados(),
      diferencas: reg.obterDiferencas(),
      dataHora: reg.dataHora,
      ip: reg.ip,
      chaveRegistro: reg.chaveRegistro,
      sucesso: reg.foiSucesso(),
      mensagemErro: reg.mensagemErro,
    }));

    return {
      registros,
      total: resultado.total,
      pagina: resultado.pagina,
      limite: resultado.limite,
      totalPaginas: resultado.totalPaginas,
    };
  }

  async buscarPorId(auditoriaId: number): Promise<RegistroHistoricoDto | null> {
    const registro = await this.repositorio.buscarPorId(auditoriaId);

    if (!registro) {
      return null;
    }

    return {
      auditoriaId: registro.auditoriaId!,
      codUsuario: registro.codUsuario,
      tabela: registro.tabela,
      operacao: registro.operacao,
      descricaoOperacao: registro.obterDescricaoOperacao(),
      dadosAntigos: registro.obterDadosAntigosParseados(),
      dadosNovos: registro.obterDadosNovosParseados(),
      diferencas: registro.obterDiferencas(),
      dataHora: registro.dataHora,
      ip: registro.ip,
      chaveRegistro: registro.chaveRegistro,
      sucesso: registro.foiSucesso(),
      mensagemErro: registro.mensagemErro,
    };
  }

  async buscarHistoricoRegistro(tabela: string, chaveRegistro: string): Promise<RegistroHistoricoDto[]> {
    const registros = await this.repositorio.buscarPorTabelaEChave(tabela, chaveRegistro);

    return registros.map((reg) => ({
      auditoriaId: reg.auditoriaId!,
      codUsuario: reg.codUsuario,
      tabela: reg.tabela,
      operacao: reg.operacao,
      descricaoOperacao: reg.obterDescricaoOperacao(),
      dadosAntigos: reg.obterDadosAntigosParseados(),
      dadosNovos: reg.obterDadosNovosParseados(),
      diferencas: reg.obterDiferencas(),
      dataHora: reg.dataHora,
      ip: reg.ip,
      chaveRegistro: reg.chaveRegistro,
      sucesso: reg.foiSucesso(),
      mensagemErro: reg.mensagemErro,
    }));
  }

  async buscarEstatisticas(input: ConsultarHistoricoInput): Promise<{
    totalRegistros: number;
    totalInserts: number;
    totalUpdates: number;
    totalDeletes: number;
    totalSelects: number;
    totalSucessos: number;
    totalFalhas: number;
    taxaSucesso: number;
  }> {
    const filtros: FiltrosHistorico = {
      tabela: input.tabela,
      dataInicio: input.dataInicio ? new Date(input.dataInicio) : undefined,
      dataFim: input.dataFim ? new Date(input.dataFim) : undefined,
    };

    const stats = await this.repositorio.buscarEstatisticas(filtros);

    const taxaSucesso = stats.totalRegistros > 0 ? (stats.totalSucessos / stats.totalRegistros) * 100 : 100;

    return {
      ...stats,
      taxaSucesso: Math.round(taxaSucesso * 100) / 100,
    };
  }
}
