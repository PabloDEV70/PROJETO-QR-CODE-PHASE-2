import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  OsKpis,
  OsAlerta,
  OsAtivaDetalhada,
  OsVeiculoMultiplas,
  OsMediaDias,
  TempoServicosResumo,
  TempoServicosPorTipo,
  TempoServicosDistribuicaoRow,
  TempoServicosPorExecutor,
  TempoServicosPorGrupo,
  TempoServicosTopServico,
  TempoServicosTendenciaMensal,
} from '../../types/TCFOSCAB';
import * as Q from '../../sql-queries/TCFOSCAB';

/**
 * Serviço de alertas e KPIs de manutenção
 * Queries otimizadas e validadas contra PROD
 */
export class ManutencaoAlertasService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async getKpis(): Promise<OsKpis> {
    const [row] = await this.queryExecutor.executeQuery<OsKpis>(Q.kpis);
    return row;
  }

  async getAlertas(): Promise<OsAlerta[]> {
    return this.queryExecutor.executeQuery<OsAlerta>(Q.alertas);
  }

  async getAtivasDetalhadas(limit = 50): Promise<OsAtivaDetalhada[]> {
    const sql = Q.ativasDetalhadas.replace('@limit', limit.toString());
    return this.queryExecutor.executeQuery<OsAtivaDetalhada>(sql);
  }

  async getVeiculosMultiplasOs(): Promise<OsVeiculoMultiplas[]> {
    return this.queryExecutor.executeQuery<OsVeiculoMultiplas>(Q.veiculosMultiplasOs);
  }

  async getMediaDiasPorTipo(): Promise<OsMediaDias[]> {
    return this.queryExecutor.executeQuery<OsMediaDias>(Q.mediaDiasPorTipo);
  }

  async getTempoServicos(params?: {
    dataInicio?: string;
    dataFim?: string;
    codexec?: number;
    codGrupoProd?: number;
  }) {
    let whereClause = '';
    if (params?.dataInicio) {
      whereClause += ` AND O.DTABERTURA >= '${params.dataInicio}'`;
    }
    if (params?.dataFim) {
      whereClause += ` AND O.DTABERTURA <= '${params.dataFim}'`;
    }

    const execClause = params?.codexec
      ? ` AND ex.CODUSUEXEC = ${params.codexec}`
      : '';

    const grupoClause = params?.codGrupoProd
      ? ` AND pro.CODGRUPOPROD = ${params.codGrupoProd}`
      : '';

    const applyWhere = (sql: string) =>
      sql
        .replace('-- @WHERE_EXEC', execClause)
        .replace('-- @WHERE_GRUPO', grupoClause)
        .replace(/-- @WHERE/g, whereClause);

    const [
      resumoRows,
      porTipoRows,
      distRows,
      executorRows,
      grupoRows,
      topRows,
      tendenciaRows,
    ] = await Promise.all([
      this.queryExecutor.executeQuery<TempoServicosResumo>(
        applyWhere(Q.tempoServicosResumo),
      ),
      this.queryExecutor.executeQuery<TempoServicosPorTipo>(
        applyWhere(Q.tempoServicosPorTipo),
      ),
      this.queryExecutor.executeQuery<TempoServicosDistribuicaoRow>(
        applyWhere(Q.tempoServicosDistribuicao),
      ),
      this.queryExecutor.executeQuery<TempoServicosPorExecutor>(
        applyWhere(Q.tempoServicosPorExecutor),
      ),
      this.queryExecutor.executeQuery<TempoServicosPorGrupo>(
        applyWhere(Q.tempoServicosPorGrupo),
      ),
      this.queryExecutor.executeQuery<TempoServicosTopServico>(
        applyWhere(Q.tempoServicosTopServicos),
      ),
      this.queryExecutor.executeQuery<TempoServicosTendenciaMensal>(
        applyWhere(Q.tempoServicosTendenciaMensal),
      ),
    ]);

    const resumo = resumoRows[0];
    const total = Number(resumo?.totalServicos) || 0;
    const validos = Number(resumo?.comDatasValidas) || 0;

    const distTotal = distRows.reduce((s, r) => s + Number(r.total), 0);

    return {
      resumo: {
        totalServicos: total,
        comDatasValidas: validos,
        nuncaExecutados: Number(resumo?.nuncaExecutados) || 0,
        mediaHoras: Number(Number(resumo?.mediaHoras || 0).toFixed(1)),
        pctValidos: total > 0
          ? Number(((validos / total) * 100).toFixed(1))
          : 0,
      },
      porTipo: porTipoRows.map((r) => ({
        manutencao: r.manutencao,
        label: r.label,
        total: Number(r.total),
        validos: Number(r.validos),
        nuncaExecutados: Number(r.nuncaExecutados),
        mediaHoras: Number(Number(r.mediaHoras || 0).toFixed(1)),
      })),
      distribuicao: distRows.map((r) => ({
        faixa: r.faixa,
        total: Number(r.total),
        pct: distTotal > 0
          ? Number(((Number(r.total) / distTotal) * 100).toFixed(1))
          : 0,
      })),
      porExecutor: executorRows.map((r) => ({
        codusu: Number(r.codusu),
        nomeExecutor: r.nomeExecutor,
        codparc: Number(r.codparc),
        codemp: r.codemp ? Number(r.codemp) : null,
        codfunc: r.codfunc ? Number(r.codfunc) : null,
        cargo: r.cargo || null,
        departamento: r.departamento || null,
        totalServicos: Number(r.totalServicos),
        servicosConcluidos: Number(r.servicosConcluidos),
        mediaMinutos: Number(Number(r.mediaMinutos || 0).toFixed(1)),
        totalMinutos: Number(r.totalMinutos),
      })),
      porGrupo: grupoRows.map((r) => ({
        codGrupoProd: Number(r.codGrupoProd),
        descrGrupo: r.descrGrupo,
        totalServicos: Number(r.totalServicos),
        validos: Number(r.validos),
        mediaHoras: Number(Number(r.mediaHoras || 0).toFixed(1)),
      })),
      topServicos: topRows.map((r) => ({
        codProd: Number(r.codProd),
        descrProd: r.descrProd,
        totalExecucoes: Number(r.totalExecucoes),
        mediaHoras: Number(Number(r.mediaHoras || 0).toFixed(1)),
        minHoras: Number(Number(r.minHoras || 0).toFixed(1)),
        maxHoras: Number(Number(r.maxHoras || 0).toFixed(1)),
      })),
      tendencia: tendenciaRows.map((r) => ({
        ano: Number(r.ano),
        mes: Number(r.mes),
        totalServicos: Number(r.totalServicos),
        mediaHoras: Number(Number(r.mediaHoras || 0).toFixed(1)),
      })),
    };
  }

  async getPerformanceServicoExecutor(params: {
    codprod: number;
    dataInicio?: string;
    dataFim?: string;
    codveiculo?: number;
  }) {
    let whereClause = '';
    if (params.dataInicio) {
      whereClause += ` AND O.DTABERTURA >= '${params.dataInicio}'`;
    }
    if (params.dataFim) {
      whereClause += ` AND O.DTABERTURA <= '${params.dataFim}'`;
    }
    if (params.codveiculo) {
      whereClause += ` AND O.CODVEICULO = ${params.codveiculo}`;
    }

    const applyWhere = (sql: string) =>
      sql
        .replace(/@CODPROD/g, String(params.codprod))
        .replace(/-- @WHERE/g, whereClause);

    const [executorRows, resumoRows] = await Promise.all([
      this.queryExecutor.executeQuery<Record<string, unknown>>(
        applyWhere(Q.performanceServicoExecutor),
      ),
      this.queryExecutor.executeQuery<Record<string, unknown>>(
        applyWhere(Q.performanceServicoResumo),
      ),
    ]);

    const resumo = resumoRows[0];

    return {
      resumo: {
        totalExecutores: Number(resumo?.totalExecutores) || 0,
        totalExecucoes: Number(resumo?.totalExecucoes) || 0,
        mediaMinutos: Number(Number(resumo?.mediaMinutos || 0).toFixed(1)),
        minMinutos: Number(Number(resumo?.minMinutos || 0).toFixed(1)),
        maxMinutos: Number(Number(resumo?.maxMinutos || 0).toFixed(1)),
        totalMinutos: Number(resumo?.totalMinutos) || 0,
      },
      executores: executorRows.map((r) => ({
        codusu: Number(r.codusu),
        nomeUsuario: r.nomeUsuario as string,
        nomeColaborador: (r.nomeColaborador as string) || (r.nomeUsuario as string),
        codparc: r.codparc ? Number(r.codparc) : null,
        codemp: r.codemp ? Number(r.codemp) : null,
        codfunc: r.codfunc ? Number(r.codfunc) : null,
        situacao: (r.situacao as string) ?? null,
        cargo: (r.cargo as string) || null,
        departamento: (r.departamento as string) || null,
        totalExecucoes: Number(r.totalExecucoes),
        mediaMinutos: Number(Number(r.mediaMinutos || 0).toFixed(1)),
        minMinutos: Number(Number(r.minMinutos || 0).toFixed(1)),
        maxMinutos: Number(Number(r.maxMinutos || 0).toFixed(1)),
        totalMinutos: Number(r.totalMinutos),
        primeiraExec: r.primeiraExec as string | null,
        ultimaExec: r.ultimaExec as string | null,
      })),
    };
  }

  async getPerformanceServicoExecucoes(params: {
    codprod: number;
    dataInicio?: string;
    dataFim?: string;
    codveiculo?: number;
  }) {
    let whereClause = '';
    if (params.dataInicio) {
      whereClause += ` AND O.DTABERTURA >= '${params.dataInicio}'`;
    }
    if (params.dataFim) {
      whereClause += ` AND O.DTABERTURA <= '${params.dataFim}'`;
    }
    if (params.codveiculo) {
      whereClause += ` AND O.CODVEICULO = ${params.codveiculo}`;
    }

    const sql = Q.performanceServicoExecucoes
      .replace(/@CODPROD/g, String(params.codprod))
      .replace(/-- @WHERE/g, whereClause);

    const rows = await this.queryExecutor.executeQuery<Record<string, unknown>>(sql);

    return rows.map((r) => ({
      nuos: Number(r.nuos),
      sequencia: Number(r.sequencia),
      codusu: r.codusu ? Number(r.codusu) : null,
      nomeUsuario: (r.nomeUsuario as string) || null,
      nomeColaborador: (r.nomeColaborador as string) || (r.nomeUsuario as string) || null,
      codparc: r.codparc ? Number(r.codparc) : null,
      dtIni: r.dtIni as string | null,
      dtFin: r.dtFin as string | null,
      minutos: Number(r.minutos) || 0,
      statusOs: r.statusOs as string | null,
      statusOsLabel: r.statusOsLabel as string | null,
      placa: r.placa as string | null,
      marcaModelo: r.marcaModelo as string | null,
      observacao: r.observacao as string | null,
    }));
  }

  async getServicosComExecucao() {
    return this.queryExecutor.executeQuery<Record<string, unknown>>(
      Q.servicosComExecucao,
    );
  }

  async getGruposArvore() {
    return this.queryExecutor.executeQuery<Record<string, unknown>>(
      Q.gruposArvore,
    );
  }

  async getServicosPorGrupo(codGrupo: number) {
    const sql = Q.servicosPorGrupo.replace(/@CODGRUPO/g, String(codGrupo));
    return this.queryExecutor.executeQuery<Record<string, unknown>>(sql);
  }
}
