import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  FuncionarioPerfilEnriquecido,
  FuncionarioVinculoResumo,
  PerfilEnriquecidoRow,
} from '../../types/TFPFUN';
import { labelSituacao } from '../../shared/utils/sankhya-formatters';
import { perfilEnriquecido, vinculosHistorico } from '../../sql-queries/TFPFUN';
import { FuncionarioCargaHorariaService } from './funcionario-carga-horaria.service';

interface VinculoRow {
  codemp: number;
  codfunc: number;
  situacao: string;
  dtadm: string;
  dtdem: string | null;
  cargo: string | null;
  empresa: string | null;
}

/**
 * Service para buscar perfil enriquecido do funcionario
 * Funciona para QUALQUER situacao (ativo, demitido, afastado, etc.)
 */
export class FuncionarioPerfilService {
  private qe: QueryExecutor;
  private cargaService: FuncionarioCargaHorariaService;

  constructor() {
    this.qe = new QueryExecutor();
    this.cargaService = new FuncionarioCargaHorariaService();
  }

  async getPerfilEnriquecido(codparc: number): Promise<FuncionarioPerfilEnriquecido | null> {
    // 1. Buscar dados principais + vinculos (pode retornar multiplas rows)
    const sql = perfilEnriquecido.replace(/@codparc/g, codparc.toString());
    const rows = await this.qe.executeQuery<PerfilEnriquecidoRow>(sql);

    if (rows.length === 0) return null;
    const r = this.pickBestVinculo(rows);

    // 2. Buscar historico de vinculos
    const historico = await this.getHistoricoVinculos(codparc);

    // 3. Buscar carga horaria atual via TFPFHO (fonte correta)
    let cargaHorariaData = null;
    if (r.codemp && r.codfunc) {
      cargaHorariaData = await this.cargaService.getCargaHorariaAtual(r.codemp, r.codfunc);
    }
    // Fallback: se TFPFHO nao tem registro, usar TFPFUN.CODCARGAHOR
    if (!cargaHorariaData && r.codcargahor) {
      cargaHorariaData = await this.cargaService.getCargaHoraria(r.codcargahor, null);
    }

    // 4. Montar resposta
    return {
      codparc: r.codparc,
      nomeparc: r.nomeparc,
      cgcCpf: r.cgcCpf,
      dtNascimento: r.dtNascimento,
      telefone: r.telefone,
      email: r.email,

      endereco: this.buildEndereco(r),
      papeis: this.buildPapeis(r, historico.totalVinculos),
      usuarioSistema: this.buildUsuario(r),
      vinculoAtual: this.buildVinculoAtual(r),
      historico,
      cargaHoraria: cargaHorariaData,
    };
  }

  private async getHistoricoVinculos(codparc: number): Promise<{
    totalVinculos: number;
    vinculos: FuncionarioVinculoResumo[];
  }> {
    const sql = vinculosHistorico.replace(/@codparc/g, codparc.toString());
    const rows = await this.qe.executeQuery<VinculoRow>(sql);

    return {
      totalVinculos: rows.length,
      vinculos: rows.map((v) => ({
        codemp: v.codemp,
        codfunc: v.codfunc,
        situacao: v.situacao,
        situacaoLabel: labelSituacao(v.situacao),
        dtadm: v.dtadm,
        dtdem: v.dtdem,
        cargo: v.cargo,
        empresa: v.empresa,
      })),
    };
  }

  /**
   * Seleciona o vinculo correto quando ha multiplos registros TFPFUN.
   * Prioridade: ativo (SITUACAO='1') primeiro, senao mais recente por DTADM.
   */
  private pickBestVinculo(rows: PerfilEnriquecidoRow[]): PerfilEnriquecidoRow {
    if (rows.length === 1) return rows[0];
    const withVinculo = rows.filter((r) => r.codemp !== null);
    if (withVinculo.length === 0) return rows[0];
    const ativo = withVinculo.find((r) => r.situacao === '1');
    if (ativo) return ativo;
    return withVinculo.sort((a, b) => {
      const da = a.dtadm ? new Date(a.dtadm).getTime() : 0;
      const db = b.dtadm ? new Date(b.dtadm).getTime() : 0;
      return db - da;
    })[0];
  }

  private buildEndereco(r: PerfilEnriquecidoRow) {
    if (!r.numend && !r.cep) return null;
    return {
      logradouro: null,
      numero: r.numend,
      complemento: r.complemento,
      bairro: null,
      cep: r.cep,
      cidade: null,
      uf: null,
    };
  }

  private buildPapeis(r: PerfilEnriquecidoRow, totalVinculos: number) {
    return {
      funcionario: totalVinculos > 0,
      usuario: r.codusu !== null,
      cliente: r.cliente === 'S',
      fornecedor: r.fornecedor === 'S',
    };
  }

  private buildUsuario(r: PerfilEnriquecidoRow) {
    if (!r.codusu) return null;
    return {
      codusu: r.codusu,
      nomeusu: r.nomeusu!,
      emailUsuario: r.emailUsuario,
      ativo: this.isUsuarioAtivo(r.dtLimAcesso),
    };
  }

  /**
   * Verifica se usuario esta ativo baseado em DTLIMACESSO
   * NULL ou data futura = ativo, data passada = inativo
   */
  private isUsuarioAtivo(dtLimAcesso: string | null): boolean {
    if (!dtLimAcesso) return true;
    const limDate = new Date(dtLimAcesso);
    return limDate > new Date();
  }

  private buildVinculoAtual(r: PerfilEnriquecidoRow) {
    if (!r.codemp) return null;
    return {
      codemp: r.codemp,
      codfunc: r.codfunc!,
      situacao: r.situacao!,
      situacaoLabel: labelSituacao(r.situacao!),
      dtadm: r.dtadm!,
      dtdem: r.dtdem,
      cargo: r.cargo,
      funcao: r.funcao,
      departamento: r.departamento,
      empresa: r.empresa,
      salario: r.salario,
      coddep: r.coddep ?? null,
      codcargo: r.codcargo ?? null,
      codfuncao: r.codfuncao ?? null,
      codcargahor: r.codcargahor,
    };
  }
}
