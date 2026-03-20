import { PermissaoEscrita } from '../entities/permissao-escrita.entity';
import { Role } from '../entities/role.entity';
import { TipoOperacaoSigla } from '../value-objects/tipo-operacao.vo';
import { CondicaoSQL } from '../value-objects/condicao-sql.vo';

/**
 * Resultado da avaliação de permissão.
 */
export interface ResultadoAvaliacao {
  permitido: boolean;
  motivo: string;
  permissaoAplicada?: PermissaoEscrita;
  condicaoRLS?: CondicaoSQL;
  requerAprovacao: boolean;
}

/**
 * Contexto para avaliação de permissão.
 */
export interface ContextoAvaliacao {
  codUsuario: number;
  tabela: string;
  operacao: TipoOperacaoSigla;
  parametrosContexto?: Record<string, unknown>;
}

/**
 * Domain Service responsável por avaliar se um usuário tem permissão
 * para executar uma operação em uma tabela.
 *
 * Este serviço implementa a lógica de negócio para avaliação de permissões,
 * considerando permissões diretas, via roles e condições RLS.
 */
export class AvaliadorPermissao {
  /**
   * Avalia se um usuário tem permissão para uma operação.
   *
   * Ordem de avaliação:
   * 1. Permissões diretas do usuário
   * 2. Permissões via roles atribuídas ao usuário
   *
   * @param contexto - Contexto da avaliação (usuário, tabela, operação)
   * @param permissoesUsuario - Permissões diretas do usuário
   * @param permissoesViaRoles - Permissões via roles do usuário
   * @param rolesUsuario - Roles ativas do usuário
   */
  avaliar(
    contexto: ContextoAvaliacao,
    permissoesUsuario: PermissaoEscrita[],
    permissoesViaRoles: PermissaoEscrita[],
    rolesUsuario: Role[],
  ): ResultadoAvaliacao {
    const { tabela, operacao } = contexto;
    const tabelaUpper = tabela.toUpperCase();

    // 1. Verificar permissão direta do usuário (maior prioridade)
    const permissaoDireta = this.encontrarPermissaoAplicavel(permissoesUsuario, tabelaUpper, operacao);

    if (permissaoDireta) {
      if (!permissaoDireta.estaValida()) {
        return this.negarAcesso('Permissão direta encontrada mas está inativa ou expirada');
      }

      return this.permitirAcesso(permissaoDireta, 'Permissão direta do usuário');
    }

    // 2. Verificar permissões via roles
    const rolesAtivas = rolesUsuario.filter((r) => r.estaAtiva());

    if (rolesAtivas.length === 0) {
      return this.negarAcesso('Usuário não possui roles ativas nem permissão direta');
    }

    const roleIds = new Set(rolesAtivas.map((r) => r.roleId));
    const permissoesRolesAtivas = permissoesViaRoles.filter((p) => p.roleId !== null && roleIds.has(p.roleId));

    const permissaoViaRole = this.encontrarPermissaoAplicavel(permissoesRolesAtivas, tabelaUpper, operacao);

    if (permissaoViaRole) {
      if (!permissaoViaRole.estaValida()) {
        return this.negarAcesso('Permissão via role encontrada mas está inativa ou expirada');
      }

      const roleNome = rolesAtivas.find((r) => r.roleId === permissaoViaRole.roleId)?.nome || 'Desconhecida';
      return this.permitirAcesso(permissaoViaRole, `Permissão via role: ${roleNome}`);
    }

    // 3. Nenhuma permissão encontrada
    return this.negarAcesso(`Nenhuma permissão encontrada para ${operacao} em ${tabelaUpper}`);
  }

  /**
   * Avalia múltiplas operações de uma vez.
   */
  avaliarMultiplas(
    contextos: ContextoAvaliacao[],
    permissoesUsuario: PermissaoEscrita[],
    permissoesViaRoles: PermissaoEscrita[],
    rolesUsuario: Role[],
  ): Map<string, ResultadoAvaliacao> {
    const resultados = new Map<string, ResultadoAvaliacao>();

    for (const contexto of contextos) {
      const chave = `${contexto.tabela}:${contexto.operacao}`;
      const resultado = this.avaliar(contexto, permissoesUsuario, permissoesViaRoles, rolesUsuario);
      resultados.set(chave, resultado);
    }

    return resultados;
  }

  /**
   * Combina condições RLS de múltiplas permissões aplicáveis.
   */
  combinarCondicoesRLS(permissoes: PermissaoEscrita[]): CondicaoSQL {
    const permissoesComCondicao = permissoes.filter((p) => p.possuiCondicaoRLS());

    if (permissoesComCondicao.length === 0) {
      return CondicaoSQL.vazia();
    }

    return permissoesComCondicao.reduce((combinada, p) => combinada.combinarCom(p.condicaoRLS), CondicaoSQL.vazia());
  }

  private encontrarPermissaoAplicavel(
    permissoes: PermissaoEscrita[],
    tabela: string,
    operacao: TipoOperacaoSigla,
  ): PermissaoEscrita | undefined {
    return permissoes.find((p) => p.aplicaA(tabela, operacao) && p.estaValida());
  }

  private permitirAcesso(permissao: PermissaoEscrita, motivo: string): ResultadoAvaliacao {
    return {
      permitido: true,
      motivo,
      permissaoAplicada: permissao,
      condicaoRLS: permissao.condicaoRLS,
      requerAprovacao: permissao.requerAprovacao,
    };
  }

  private negarAcesso(motivo: string): ResultadoAvaliacao {
    return {
      permitido: false,
      motivo,
      requerAprovacao: false,
    };
  }
}
