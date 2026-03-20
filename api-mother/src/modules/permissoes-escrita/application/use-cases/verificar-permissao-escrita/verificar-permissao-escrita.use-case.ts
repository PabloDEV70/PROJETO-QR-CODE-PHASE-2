import { Injectable, Inject } from '@nestjs/common';
import {
  IRepositorioPermissaoEscrita,
  REPOSITORIO_PERMISSAO_ESCRITA,
} from '../../../domain/repositories/permissao-escrita.repository.interface';
import { IRepositorioRole, REPOSITORIO_ROLE } from '../../../domain/repositories/role.repository.interface';
import { AvaliadorPermissao, ResultadoAvaliacao } from '../../../domain/services/avaliador-permissao.service';
import { TipoOperacaoSigla } from '../../../domain/value-objects/tipo-operacao.vo';

/**
 * Entrada para verificar permissão de escrita.
 */
export interface VerificarPermissaoEscritaEntrada {
  codUsuario: number;
  tabela: string;
  operacao: TipoOperacaoSigla;
}

/**
 * Saída da verificação de permissão de escrita.
 */
export interface VerificarPermissaoEscritaSaida {
  codUsuario: number;
  tabela: string;
  operacao: string;
  permitido: boolean;
  motivo: string;
  condicaoRLS?: string | null;
  requerAprovacao: boolean;
  roleAplicada?: string | null;
}

/**
 * Use Case para verificar se um usuário tem permissão para uma operação de escrita.
 *
 * Avalia:
 * - Permissões diretas do usuário
 * - Permissões via roles atribuídas
 * - Validade temporal das permissões
 * - Condições RLS (Row Level Security)
 */
@Injectable()
export class VerificarPermissaoEscritaUseCase {
  private readonly avaliador: AvaliadorPermissao;

  constructor(
    @Inject(REPOSITORIO_PERMISSAO_ESCRITA)
    private readonly repositorioPermissao: IRepositorioPermissaoEscrita,
    @Inject(REPOSITORIO_ROLE)
    private readonly repositorioRole: IRepositorioRole,
  ) {
    this.avaliador = new AvaliadorPermissao();
  }

  async executar(entrada: VerificarPermissaoEscritaEntrada): Promise<VerificarPermissaoEscritaSaida> {
    const { codUsuario, tabela, operacao } = entrada;
    const tabelaUpper = tabela.toUpperCase();

    // 1. Buscar permissões do usuário para a tabela
    const permissoesUsuario = await this.repositorioPermissao.buscarPorUsuarioETabela(codUsuario, tabelaUpper);

    // Separar permissões diretas e via role
    const permissoesDiretas = permissoesUsuario.filter((p) => p.ehPermissaoDireta());
    const permissoesViaRole = permissoesUsuario.filter((p) => p.ehPermissaoDeRole());

    // 2. Buscar roles do usuário
    const rolesUsuario = await this.repositorioRole.buscarRolesDoUsuario(codUsuario);

    // 3. Avaliar permissão usando o domain service
    const resultado: ResultadoAvaliacao = this.avaliador.avaliar(
      { codUsuario, tabela: tabelaUpper, operacao },
      permissoesDiretas,
      permissoesViaRole,
      rolesUsuario,
    );

    // 4. Montar resposta
    let roleAplicada: string | null = null;
    if (resultado.permissaoAplicada?.roleId) {
      const role = rolesUsuario.find((r) => r.roleId === resultado.permissaoAplicada!.roleId);
      roleAplicada = role?.nome || null;
    }

    return {
      codUsuario,
      tabela: tabelaUpper,
      operacao,
      permitido: resultado.permitido,
      motivo: resultado.motivo,
      condicaoRLS: resultado.condicaoRLS?.valor || null,
      requerAprovacao: resultado.requerAprovacao,
      roleAplicada,
    };
  }
}
