import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  ColaboradorTimelineOptions,
  ColaboradorTimelineResponse,
  ColaboradorTimelineDia,
  MOTIVO_ALMOCO,
} from '../../types/AD_RDOAPONTAMENTOS';
import { MotivoConfigMap } from '../../types/AD_RDOMOTIVOS';
import * as Q from '../../sql-queries/AD_RDOAPONTAMENTOS';
import { labelDiaSemana } from '../../shared/constants/dias-semana';
import { FuncionarioPerfilService } from './funcionario-perfil.service';
import { MotivoConfigService } from './motivo-config.service';
import {
  CargaDiaMeta,
  MetaTolerancias,
  calcularMeta,
  calcularJornada,
  calcularResumoPeriodo,
} from './colaborador-meta-calculator';
import { AtividadeRow, calcularResumoDia } from './colaborador-timeline.types';
import {
  buildJornadaSemanal,
  buildCargaMap,
  formatAtividade,
  buildCargaHorariaResponse,
} from './colaborador-timeline-builder';

export class ColaboradorTimelineService {
  private qe: QueryExecutor;
  private perfilService: FuncionarioPerfilService;
  private configService: MotivoConfigService;

  constructor() {
    this.qe = new QueryExecutor();
    this.perfilService = new FuncionarioPerfilService();
    this.configService = new MotivoConfigService();
  }

  async getTimeline(
    options: ColaboradorTimelineOptions,
  ): Promise<ColaboradorTimelineResponse | null> {
    const { codparc, dataInicio, dataFim } = options;

    const [perfil, configMap] = await Promise.all([
      this.perfilService.getPerfilEnriquecido(codparc),
      this.configService.getConfigMap(),
    ]);
    if (!perfil) return null;

    const cargaMap = buildCargaMap(perfil.cargaHoraria?.dias || []);
    const atividades = await this.fetchAtividades(codparc, dataInicio, dataFim);
    const dias = this.agruparPorDia(atividades, cargaMap, configMap);
    const resumoPeriodo = calcularResumoPeriodo(dias);

    return {
      colaborador: {
        codparc: perfil.codparc,
        nome: perfil.nomeparc,
        cgcCpf: perfil.cgcCpf,
        departamento: perfil.vinculoAtual?.departamento?.trim() || null,
        cargo: perfil.vinculoAtual?.cargo || null,
        funcao: perfil.vinculoAtual?.funcao || null,
        empresa: perfil.vinculoAtual?.empresa?.trim() || null,
        fotoUrl: `/funcionarios/${perfil.codparc}/foto`,
      },
      cargaHoraria: perfil.cargaHoraria
        ? buildCargaHorariaResponse(perfil.cargaHoraria)
        : null,
      jornadaSemanal: perfil.cargaHoraria
        ? buildJornadaSemanal(perfil.cargaHoraria.dias)
        : null,
      periodo: { dataInicio, dataFim, totalDias: dias.length },
      dias,
      resumoPeriodo,
    };
  }

  private async fetchAtividades(
    codparc: number,
    dataInicio: string,
    dataFim: string,
  ): Promise<AtividadeRow[]> {
    const where = `AND rdo.DTREF >= '${dataInicio}' AND rdo.DTREF <= '${dataFim}'`;
    const sql = Q.colaboradorTimeline
      .replace(/@codparc/g, codparc.toString())
      .replace('-- @WHERE', where);
    return this.qe.executeQuery<AtividadeRow>(sql);
  }

  private agruparPorDia(
    atividades: AtividadeRow[],
    cargaMap: Map<number, CargaDiaMeta>,
    configMap: MotivoConfigMap,
  ): ColaboradorTimelineDia[] {
    const diasMap = new Map<string, AtividadeRow[]>();
    for (const a of atividades) {
      if (!diasMap.has(a.dtref)) diasMap.set(a.dtref, []);
      diasMap.get(a.dtref)!.push(a);
    }

    const tolerancias: MetaTolerancias = {
      toleranciaAlmocoExtraMin: configMap.get(MOTIVO_ALMOCO)?.toleranciaMin ?? 10,
      toleranciaBanheiroMin: configMap.get(2)?.toleranciaMin ?? 10,
    };

    const dias: ColaboradorTimelineDia[] = [];
    const defaultCarga: CargaDiaMeta = {
      minutosPrevistos: 480,
      intervaloAlmocoMin: 60,
      jornadaInicio: '08:00',
      jornadaFim: '17:00',
    };

    for (const [data, items] of diasMap) {
      const diasem = items[0].diasem;
      const cargaDia = cargaMap.get(diasem) || defaultCarga;
      const atividadesFormatadas = items.map((a) => formatAtividade(a, configMap));
      const resumo = calcularResumoDia(items, configMap);
      const meta = calcularMeta(resumo, cargaDia, tolerancias);
      const jornada = calcularJornada(atividadesFormatadas, cargaDia);

      dias.push({
        data,
        diaSemana: diasem,
        diaSemanaLabel: labelDiaSemana(diasem),
        atividades: atividadesFormatadas,
        resumo,
        meta,
        jornada,
      });
    }

    return dias.sort((a, b) => a.data.localeCompare(b.data));
  }
}
