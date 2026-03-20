import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  VeiculoMonitoramento,
  VeiculoMonitoramentoRow,
  VeiculoStatus,
  MonitoramentoFilters,
  MonitoramentoStats,
  TipoAlerta,
} from '../../types/TGFVEI/tgf-vei-monitoramento';
import * as Q from '../../sql-queries/TGFVEI';

const STATUS_LABELS: Record<VeiculoStatus, string> = {
  LIVRE: 'Disponivel',
  EM_USO: 'Em Uso',
  MANUTENCAO: 'Em Manutencao',
  AGUARDANDO_MANUTENCAO: 'Aguardando Manutencao',
  BLOQUEIO_COMERCIAL: 'Bloqueio Comercial',
  PARADO: 'Parado',
  ALUGADO_CONTRATO: 'Em Contrato',
  RESERVADO_CONTRATO: 'Reservado',
  AGENDADO: 'Agendado',
};

const TIPO_OS_LABELS: Record<string, string> = {
  P: 'Preventiva',
  C: 'Corretiva',
  R: 'Reforma',
  S: 'Socorro',
};

export class VeiculoMonitoramentoService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async getMonitoramento(filters?: MonitoramentoFilters): Promise<VeiculoMonitoramento[]> {
    const rows = await this.queryExecutor.executeQuery<VeiculoMonitoramentoRow>(Q.monitoramento);
    let result = rows.map(this.mapRowToMonitoramento);

    if (filters?.status) {
      result = result.filter((v) => v.status === filters.status);
    }
    if (filters?.comAlerta) {
      result = result.filter((v) => v.alertas.length > 0);
    }
    if (filters?.categoria) {
      result = result.filter((v) =>
        v.categoria.toLowerCase().includes(filters.categoria!.toLowerCase()),
      );
    }

    return result;
  }

  async getStats(): Promise<MonitoramentoStats> {
    interface StatsRow {
      total: number;
      livres: number;
      emUso: number;
      manutencao: number;
      aguardandoManutencao: number;
      bloqueioComercial: number;
      parado: number;
      alugadoContrato: number;
      reservadoContrato: number;
      agendado: number;
      comAlerta: number;
    }
    const rows = await this.queryExecutor.executeQuery<StatsRow>(Q.monitoramentoStats);
    const row = rows[0];

    return {
      total: row.total,
      porStatus: {
        LIVRE: row.livres,
        EM_USO: row.emUso,
        MANUTENCAO: row.manutencao,
        AGUARDANDO_MANUTENCAO: row.aguardandoManutencao,
        BLOQUEIO_COMERCIAL: row.bloqueioComercial,
        PARADO: row.parado,
        ALUGADO_CONTRATO: row.alugadoContrato,
        RESERVADO_CONTRATO: row.reservadoContrato,
        AGENDADO: row.agendado,
      },
      comAlerta: row.comAlerta,
    };
  }

  private mapRowToMonitoramento = (row: VeiculoMonitoramentoRow): VeiculoMonitoramento => {
    const alertas: VeiculoMonitoramento['alertas'] = [];
    if (row.alertaTipo) {
      alertas.push({
        tipo: row.alertaTipo as TipoAlerta,
        mensagem: row.alertaMensagem || '',
        diasAtraso: row.alertaDias ?? undefined,
      });
    }

    return {
      codveiculo: row.codveiculo,
      placa: row.placa,
      marcaModelo: row.marcamodelo,
      categoria: row.categoria,
      tag: row.tag || null,
      status: row.status,
      statusLabel: STATUS_LABELS[row.status] || row.status,
      statusSince: row.osDataIni || null,
      osAtiva: row.osNuos
        ? {
            nuos: row.osNuos,
            tipo: row.osTipo || '',
            tipoLabel: TIPO_OS_LABELS[row.osTipo || ''] || row.osTipo || '',
            dtAbertura: row.osDtAbertura || '',
            previsao: row.osPrevisao || null,
            parceiro: row.osParceiro || null,
          }
        : null,
      alertas,
      ultimaAtividade: row.ultimaOsFinalizada
        ? {
            tipo: 'OS_FINALIZADA',
            descricao: 'OS finalizada',
            data: row.ultimaOsFinalizada,
          }
        : null,
      metricas: {
        totalOsAno: row.totalOsAno,
        corretivasAno: row.corretivasAno,
        preventivasAno: row.preventivasAno,
        kmAtual: row.kmacum,
      },
    };
  };
}
