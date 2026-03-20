import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';

// Domain - Repositories interfaces
import { REPOSITORIO_PERMISSAO_ESCRITA } from './domain/repositories/permissao-escrita.repository.interface';
import { REPOSITORIO_ROLE } from './domain/repositories/role.repository.interface';

// Infrastructure - Repository implementations
import { SqlPermissaoEscritaRepository } from './infrastructure/repositories/sql-permissao-escrita.repository';
import { SqlRoleRepository } from './infrastructure/repositories/sql-role.repository';

// Application - Use Cases
import { VerificarPermissaoEscritaUseCase } from './application/use-cases/verificar-permissao-escrita';
import { ObterPermissoesUsuarioUseCase } from './application/use-cases/obter-permissoes-usuario';

// Presentation - Controllers
import { PermissoesEscritaController } from './presentation/controllers/permissoes-escrita.controller';

/**
 * Módulo de Permissões de Escrita (M2)
 *
 * Responsável por:
 * - Gerenciar permissões de escrita (CRUD) em tabelas
 * - Suportar permissões diretas e via roles
 * - Implementar Row Level Security (RLS) via condições SQL
 *
 * Entidades:
 * - PermissaoEscrita: Permissão de operação em tabela
 * - Role: Papel/perfil de permissões
 * - UsuarioRole: Associação entre usuário e role
 *
 * Tabelas do banco:
 * - API_PERMISSAO_ESCRITA: Permissões de escrita
 * - API_ROLE: Roles do sistema
 * - API_USUARIO_ROLE: Associações usuário-role
 */
@Module({
  imports: [DatabaseModule],
  controllers: [PermissoesEscritaController],
  providers: [
    // Use Cases
    VerificarPermissaoEscritaUseCase,
    ObterPermissoesUsuarioUseCase,

    // Repositories (Dependency Injection)
    {
      provide: REPOSITORIO_PERMISSAO_ESCRITA,
      useClass: SqlPermissaoEscritaRepository,
    },
    {
      provide: REPOSITORIO_ROLE,
      useClass: SqlRoleRepository,
    },
  ],
  exports: [
    // Exportar use cases para uso em outros módulos
    VerificarPermissaoEscritaUseCase,
    ObterPermissoesUsuarioUseCase,

    // Exportar tokens de repositório para outros módulos que precisem
    REPOSITORIO_PERMISSAO_ESCRITA,
    REPOSITORIO_ROLE,
  ],
})
export class PermissoesEscritaModule {}
