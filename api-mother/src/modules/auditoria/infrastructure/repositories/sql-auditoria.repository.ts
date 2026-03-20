/**
 * Repository: SqlAuditoriaRepository
 *
 * Implementacao SQL Server do repositorio de auditoria.
 */

import { Injectable } from '@nestjs/common';
import { SqlServerService } from '../../../../database/sqlserver.service';
import { IAuditoriaRepository, FiltrosHistorico, ResultadoPaginado } from '../../domain/repositories';
import { RegistroAuditoria, DadosRegistroAuditoriaBruto } from '../../domain/entities';
import {
  InserirHistoricoQuery,
  ConsultarHistoricoQuery,
  ConsultarHistoricoPorIdQuery,
  ConsultarHistoricoPorTabelaEChaveQuery,
  ConsultarUltimosRegistrosQuery,
  ConsultarEstatisticasQuery,
} from '../../application/queries';
import { SanitizadorSQLService } from '../../application/services';

@Injectable()
export class SqlAuditoriaRepository implements IAuditoriaRepository {
  constructor(
    private readonly sqlServer: SqlServerService,
    private readonly sanitizador: SanitizadorSQLService,
  ) {}

  async inserir(registro: RegistroAuditoria): Promise<number> {
    const query = new InserirHistoricoQuery(
      registro.codUsuario,
      this.sanitizador.sanitizarNomeTabela(registro.tabela),
      registro.operacao,
      registro.dadosAntigos ? this.sanitizador.sanitizarJSON(registro.dadosAntigos) : null,
      registro.dadosNovos ? this.sanitizador.sanitizarJSON(registro.dadosNovos) : null,
      registro.dataHora,
      this.sanitizador.sanitizarIP(registro.ip),
      this.sanitizador.sanitizarUserAgent(registro.userAgent),
      this.sanitizador.sanitizarChaveRegistro(registro.chaveRegistro),
      this.sanitizador.sanitizarString(registro.observacao),
      registro.sucesso,
      this.sanitizador.sanitizarString(registro.mensagemErro),
    );

    const resultado = await this.sqlServer.executeSQL(query.sql, query.parametros);

    if (resultado && resultado.length > 0) {
      return resultado[0].AUDITORIAID;
    }

    throw new Error('Falha ao inserir registro de auditoria');
  }

  async buscarPorFiltros(filtros: FiltrosHistorico): Promise<ResultadoPaginado<RegistroAuditoria>> {
    const query = new ConsultarHistoricoQuery(filtros);

    // Buscar contagem total
    const contagemResult = await this.sqlServer.executeSQL(query.sqlContagem, query.parametros);
    const total = contagemResult[0]?.TOTAL || 0;

    // Buscar dados
    const dados = await this.sqlServer.executeSQL(query.sqlDados, query.parametros);

    const registros = dados.map((bruto: DadosRegistroAuditoriaBruto) => RegistroAuditoria.deBruto(bruto));

    const limite = filtros.limite || 50;
    const pagina = Math.floor((filtros.offset || 0) / limite) + 1;
    const totalPaginas = Math.ceil(total / limite);

    return {
      dados: registros,
      total,
      pagina,
      limite,
      totalPaginas,
    };
  }

  async buscarPorId(auditoriaId: number): Promise<RegistroAuditoria | null> {
    const query = new ConsultarHistoricoPorIdQuery(auditoriaId);

    const resultado = await this.sqlServer.executeSQL(query.sql, query.parametros);

    if (resultado && resultado.length > 0) {
      return RegistroAuditoria.deBruto(resultado[0]);
    }

    return null;
  }

  async buscarPorTabelaEChave(tabela: string, chaveRegistro: string): Promise<RegistroAuditoria[]> {
    const query = new ConsultarHistoricoPorTabelaEChaveQuery(tabela, chaveRegistro);

    const resultado = await this.sqlServer.executeSQL(query.sql, query.parametros);

    return resultado.map((bruto: DadosRegistroAuditoriaBruto) => RegistroAuditoria.deBruto(bruto));
  }

  async contarPorFiltros(filtros: FiltrosHistorico): Promise<number> {
    const query = new ConsultarHistoricoQuery(filtros);

    const resultado = await this.sqlServer.executeSQL(query.sqlContagem, query.parametros);

    return resultado[0]?.TOTAL || 0;
  }

  async buscarUltimosRegistros(tabela: string, limite: number): Promise<RegistroAuditoria[]> {
    const query = new ConsultarUltimosRegistrosQuery(tabela, limite);

    const resultado = await this.sqlServer.executeSQL(query.sql, query.parametros);

    return resultado.map((bruto: DadosRegistroAuditoriaBruto) => RegistroAuditoria.deBruto(bruto));
  }

  async buscarEstatisticas(filtros: FiltrosHistorico): Promise<{
    totalRegistros: number;
    totalInserts: number;
    totalUpdates: number;
    totalDeletes: number;
    totalSelects: number;
    totalSucessos: number;
    totalFalhas: number;
  }> {
    const query = new ConsultarEstatisticasQuery(filtros);

    const resultado = await this.sqlServer.executeSQL(query.sqlCompleto, query.parametros);

    if (resultado && resultado.length > 0) {
      const stats = resultado[0];
      return {
        totalRegistros: stats.TOTAL_REGISTROS || 0,
        totalInserts: stats.TOTAL_INSERTS || 0,
        totalUpdates: stats.TOTAL_UPDATES || 0,
        totalDeletes: stats.TOTAL_DELETES || 0,
        totalSelects: stats.TOTAL_SELECTS || 0,
        totalSucessos: stats.TOTAL_SUCESSOS || 0,
        totalFalhas: stats.TOTAL_FALHAS || 0,
      };
    }

    return {
      totalRegistros: 0,
      totalInserts: 0,
      totalUpdates: 0,
      totalDeletes: 0,
      totalSelects: 0,
      totalSucessos: 0,
      totalFalhas: 0,
    };
  }
}
