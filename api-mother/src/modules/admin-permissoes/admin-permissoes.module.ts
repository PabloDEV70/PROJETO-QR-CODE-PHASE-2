import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';

// Domain - Repository Tokens
import {
  REPOSITORIO_ROLE,
  REPOSITORIO_USUARIO_ROLE,
  REPOSITORIO_PERMISSAO_TABELA,
  REPOSITORIO_PARAMETRO_SISTEMA,
} from './domain/repositories';

// Infrastructure - Repository Implementations
import {
  SankhyaRoleRepository,
  SankhyaUsuarioRoleRepository,
  SankhyaPermissaoTabelaRepository,
  SankhyaParametroSistemaRepository,
} from './infrastructure/repositories';

// Application - Use Cases
// Roles
import { CriarRoleUseCase } from './application/use-cases/roles/criar-role';
import { AtualizarRoleUseCase } from './application/use-cases/roles/atualizar-role';
import { RemoverRoleUseCase } from './application/use-cases/roles/remover-role';
import { ListarRolesUseCase } from './application/use-cases/roles/listar-roles';

// Usuario-Role
import { AssociarUsuarioRoleUseCase } from './application/use-cases/usuario-role/associar-usuario-role';
import { DesassociarUsuarioRoleUseCase } from './application/use-cases/usuario-role/desassociar-usuario-role';
import { ListarUsuariosRoleUseCase } from './application/use-cases/usuario-role/listar-usuarios-role';

// Permissoes Tabela
import { CriarPermissaoTabelaUseCase } from './application/use-cases/permissoes-tabela/criar-permissao-tabela';
import { AtualizarPermissaoTabelaUseCase } from './application/use-cases/permissoes-tabela/atualizar-permissao-tabela';
import { RemoverPermissaoTabelaUseCase } from './application/use-cases/permissoes-tabela/remover-permissao-tabela';
import { ListarPermissoesTabelaUseCase } from './application/use-cases/permissoes-tabela/listar-permissoes-tabela';

// Parametros
import { CriarParametroUseCase } from './application/use-cases/parametros/criar-parametro';
import { AtualizarParametroUseCase } from './application/use-cases/parametros/atualizar-parametro';
import { ListarParametrosUseCase } from './application/use-cases/parametros/listar-parametros';

// Presentation - Controllers
import {
  AdminRolesController,
  AdminUsuariosRolesController,
  AdminPermissoesController,
  AdminParametrosController,
} from './presentation/controllers';

// Presentation - Guards
import { AdminOnlyGuard } from './presentation/guards';

/**
 * Modulo de Administracao de Permissoes.
 *
 * Fornece API para gerenciar:
 * - Roles (papeis de acesso)
 * - Associacoes Usuario-Role
 * - Permissoes de Tabela (CRUD por role)
 * - Parametros do Sistema
 *
 * Todas as rotas requerem autenticacao JWT e acesso administrativo.
 *
 * Tabelas utilizadas:
 * - AD_APIROLE: Roles do sistema
 * - AD_APIUSUROLE: Associacoes Usuario-Role
 * - AD_APIPERMTAB: Permissoes por tabela
 * - AD_APIPARAMS: Parametros de configuracao
 */
@Module({
  imports: [DatabaseModule],
  controllers: [
    AdminRolesController,
    AdminUsuariosRolesController,
    AdminPermissoesController,
    AdminParametrosController,
  ],
  providers: [
    // Guards
    AdminOnlyGuard,

    // Use Cases - Roles
    CriarRoleUseCase,
    AtualizarRoleUseCase,
    RemoverRoleUseCase,
    ListarRolesUseCase,

    // Use Cases - Usuario-Role
    AssociarUsuarioRoleUseCase,
    DesassociarUsuarioRoleUseCase,
    ListarUsuariosRoleUseCase,

    // Use Cases - Permissoes Tabela
    CriarPermissaoTabelaUseCase,
    AtualizarPermissaoTabelaUseCase,
    RemoverPermissaoTabelaUseCase,
    ListarPermissoesTabelaUseCase,

    // Use Cases - Parametros
    CriarParametroUseCase,
    AtualizarParametroUseCase,
    ListarParametrosUseCase,

    // Repositories - Bindings
    { provide: REPOSITORIO_ROLE, useClass: SankhyaRoleRepository },
    { provide: REPOSITORIO_USUARIO_ROLE, useClass: SankhyaUsuarioRoleRepository },
    { provide: REPOSITORIO_PERMISSAO_TABELA, useClass: SankhyaPermissaoTabelaRepository },
    { provide: REPOSITORIO_PARAMETRO_SISTEMA, useClass: SankhyaParametroSistemaRepository },
  ],
  exports: [
    // Use Cases
    CriarRoleUseCase,
    AtualizarRoleUseCase,
    RemoverRoleUseCase,
    ListarRolesUseCase,
    AssociarUsuarioRoleUseCase,
    DesassociarUsuarioRoleUseCase,
    ListarUsuariosRoleUseCase,
    CriarPermissaoTabelaUseCase,
    AtualizarPermissaoTabelaUseCase,
    RemoverPermissaoTabelaUseCase,
    ListarPermissoesTabelaUseCase,
    CriarParametroUseCase,
    AtualizarParametroUseCase,
    ListarParametrosUseCase,

    // Repository Tokens (para injecao em outros modulos)
    REPOSITORIO_ROLE,
    REPOSITORIO_USUARIO_ROLE,
    REPOSITORIO_PERMISSAO_TABELA,
    REPOSITORIO_PARAMETRO_SISTEMA,
  ],
})
export class AdminPermissoesModule {}
