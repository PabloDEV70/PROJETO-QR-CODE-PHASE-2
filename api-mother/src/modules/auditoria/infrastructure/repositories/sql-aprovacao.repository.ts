/**
 * Repository: SqlAprovacaoRepository
 *
 * Implementacao SQL Server do repositorio de aprovacoes.
 */

import { Injectable } from '@nestjs/common';
import { SqlServerService } from '../../../../database/sqlserver.service';
import {
  IAprovacaoRepository,
  FiltrosAprovacao,
  ResultadoPaginadoAprovacao,
  DadosProcessamento,
} from '../../domain/repositories';
import { AprovacaoPendente, DadosAprovacaoPendenteBruto } from '../../domain/entities';
import {
  InserirAprovacaoQuery,
  ConsultarAprovacoesPorFiltrosQuery,
  ConsultarAprovacaoPorIdQuery,
  ListarAprovacoesPendentesQuery,
  ProcessarAprovacaoQuery,
  CancelarAprovacaoQuery,
  ExpirarAprovacoesQuery,
  BuscarProximasDeExpirarQuery,
  ContarPendentesPorAprovadorQuery,
  EstatisticasAprovacaoQuery,
} from '../../application/queries';
import { SanitizadorSQLService } from '../../application/services';

@Injectable()
export class SqlAprovacaoRepository implements IAprovacaoRepository {
  constructor(
    private readonly sqlServer: SqlServerService,
    private readonly sanitizador: SanitizadorSQLService,
  ) {}

  async inserir(aprovacao: AprovacaoPendente): Promise<number> {
    const query = new InserirAprovacaoQuery(
      aprovacao.codUsuario,
      aprovacao.codAprovador,
      this.sanitizador.sanitizarNomeTabela(aprovacao.tabela),
      aprovacao.operacao,
      this.sanitizador.sanitizarJSON(aprovacao.dados),
      this.sanitizador.sanitizarChaveRegistro(aprovacao.chaveRegistro),
      aprovacao.status,
      aprovacao.dataSolicitacao,
      aprovacao.dataExpiracao,
      this.sanitizador.sanitizarString(aprovacao.observacaoSolicitante),
      this.sanitizador.sanitizarIP(aprovacao.ipOrigem),
      aprovacao.prioridade,
    );

    const resultado = await this.sqlServer.executeSQL(query.sql, query.parametros);

    if (resultado && resultado.length > 0) {
      return resultado[0].APROVACAOID;
    }

    throw new Error('Falha ao inserir solicitacao de aprovacao');
  }

  async buscarPorFiltros(filtros: FiltrosAprovacao): Promise<ResultadoPaginadoAprovacao<AprovacaoPendente>> {
    const query = new ConsultarAprovacoesPorFiltrosQuery(filtros);

    // Buscar contagem total
    const contagemResult = await this.sqlServer.executeSQL(query.sqlContagem, query.parametros);
    const total = contagemResult[0]?.TOTAL || 0;

    // Buscar dados
    const dados = await this.sqlServer.executeSQL(query.sqlDados, query.parametros);

    const aprovacoes = dados.map((bruto: DadosAprovacaoPendenteBruto) => AprovacaoPendente.deBruto(bruto));

    const limite = filtros.limite || 50;
    const pagina = Math.floor((filtros.offset || 0) / limite) + 1;
    const totalPaginas = Math.ceil(total / limite);

    return {
      dados: aprovacoes,
      total,
      pagina,
      limite,
      totalPaginas,
    };
  }

  async buscarPorId(aprovacaoId: number): Promise<AprovacaoPendente | null> {
    const query = new ConsultarAprovacaoPorIdQuery(aprovacaoId);

    const resultado = await this.sqlServer.executeSQL(query.sql, query.parametros);

    if (resultado && resultado.length > 0) {
      return AprovacaoPendente.deBruto(resultado[0]);
    }

    return null;
  }

  async listarPendentes(codAprovador?: number): Promise<AprovacaoPendente[]> {
    const query = new ListarAprovacoesPendentesQuery(codAprovador);

    const resultado = await this.sqlServer.executeSQL(query.sqlFinal, query.parametros);

    return resultado.map((bruto: DadosAprovacaoPendenteBruto) => AprovacaoPendente.deBruto(bruto));
  }

  async processar(dados: DadosProcessamento): Promise<boolean> {
    const query = new ProcessarAprovacaoQuery(
      dados.aprovacaoId,
      dados.codAprovador,
      dados.novoStatus,
      new Date(),
      dados.motivoRejeicao || null,
      dados.observacao || null,
    );

    await this.sqlServer.executeSQL(query.sql, query.parametros);

    // Verificar se a atualizacao foi realizada
    const aprovacao = await this.buscarPorId(dados.aprovacaoId);
    return aprovacao?.status === dados.novoStatus;
  }

  async cancelar(aprovacaoId: number, codUsuario: number): Promise<boolean> {
    const query = new CancelarAprovacaoQuery(aprovacaoId, codUsuario);

    await this.sqlServer.executeSQL(query.sql, query.parametros);

    // Verificar se o cancelamento foi realizado
    const aprovacao = await this.buscarPorId(aprovacaoId);
    return aprovacao?.status === 'C';
  }

  async expirar(): Promise<number> {
    const query = new ExpirarAprovacoesQuery();

    // Primeiro, contar quantas serao expiradas
    const contagem = await this.sqlServer.executeSQL(
      `SELECT COUNT(*) as TOTAL FROM API_APROVACAO_PENDENTE
       WHERE STATUS = 'P' AND DATA_EXPIRACAO IS NOT NULL AND DATA_EXPIRACAO < GETDATE()`,
      [],
    );

    const totalParaExpirar = contagem[0]?.TOTAL || 0;

    if (totalParaExpirar > 0) {
      await this.sqlServer.executeSQL(query.sql, query.parametros);
    }

    return totalParaExpirar;
  }

  async buscarProximasDeExpirar(horasRestantes: number): Promise<AprovacaoPendente[]> {
    const query = new BuscarProximasDeExpirarQuery(horasRestantes);

    const resultado = await this.sqlServer.executeSQL(query.sql, query.parametros);

    return resultado.map((bruto: DadosAprovacaoPendenteBruto) => AprovacaoPendente.deBruto(bruto));
  }

  async contarPendentesPorAprovador(codAprovador: number): Promise<number> {
    const query = new ContarPendentesPorAprovadorQuery(codAprovador);

    const resultado = await this.sqlServer.executeSQL(query.sql, query.parametros);

    return resultado[0]?.TOTAL || 0;
  }

  async buscarEstatisticas(filtros: FiltrosAprovacao): Promise<{
    totalPendentes: number;
    totalAprovadas: number;
    totalRejeitadas: number;
    totalExpiradas: number;
    totalCanceladas: number;
  }> {
    const query = new EstatisticasAprovacaoQuery(filtros);

    const resultado = await this.sqlServer.executeSQL(query.sqlCompleto, query.parametros);

    if (resultado && resultado.length > 0) {
      const stats = resultado[0];
      return {
        totalPendentes: stats.TOTAL_PENDENTES || 0,
        totalAprovadas: stats.TOTAL_APROVADAS || 0,
        totalRejeitadas: stats.TOTAL_REJEITADAS || 0,
        totalExpiradas: stats.TOTAL_EXPIRADAS || 0,
        totalCanceladas: stats.TOTAL_CANCELADAS || 0,
      };
    }

    return {
      totalPendentes: 0,
      totalAprovadas: 0,
      totalRejeitadas: 0,
      totalExpiradas: 0,
      totalCanceladas: 0,
    };
  }
}
