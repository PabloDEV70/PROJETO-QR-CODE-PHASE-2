import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';

// Common
import { PERMISSOES_SERVICE } from '../../common/guards/interfaces/permissoes-service.interface';

// Domain
import { REPOSITORIO_CONTROLE_UI } from './domain/repositories/controle-ui.repository.interface';
import { REPOSITORIO_PARAMETRO_USUARIO } from './domain/repositories/parametro-usuario.repository.interface';

// Infrastructure
import { SankhyaControleUIRepository } from './infrastructure/repositories/sankhya-controle-ui.repository';
import { SankhyaParametroUsuarioRepository } from './infrastructure/repositories/sankhya-parametro-usuario.repository';

// Application
import { ObterPermissoesTelaUseCase } from './application/use-cases/obter-permissoes-tela';
import { VerificarAcessoControleUseCase } from './application/use-cases/verificar-acesso-controle';
import { ObterParametrosUsuarioUseCase } from './application/use-cases/obter-parametros-usuario';

// Services
import { PermissoesGuardService } from './services/permissoes-guard.service';
import { SankhyaPermissionValidatorService } from './services/sankhya-permission-validator.service';
import { SankhyaPermissionService } from './services/sankhya-permission.service';

// Presentation
import { PermissoesController } from './presentation/controllers';
import { PermissionsDebugController } from './controllers/permissions-debug.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [PermissoesController, PermissionsDebugController],
  providers: [
    // Use Cases
    ObterPermissoesTelaUseCase,
    VerificarAcessoControleUseCase,
    ObterParametrosUsuarioUseCase,
    // Repositories
    { provide: REPOSITORIO_CONTROLE_UI, useClass: SankhyaControleUIRepository },
    { provide: REPOSITORIO_PARAMETRO_USUARIO, useClass: SankhyaParametroUsuarioRepository },
    // Guard Service (implementa IPermissoesService)
    PermissoesGuardService,
    { provide: PERMISSOES_SERVICE, useExisting: PermissoesGuardService },
    // Sankhya Table Permission Validator
    SankhyaPermissionValidatorService,
    // Sankhya Permission Service (CORE - módulo central de permissões)
    SankhyaPermissionService,
  ],
  exports: [
    ObterPermissoesTelaUseCase,
    VerificarAcessoControleUseCase,
    ObterParametrosUsuarioUseCase,
    PermissoesGuardService,
    PERMISSOES_SERVICE,
    SankhyaPermissionValidatorService,
    SankhyaPermissionService,
  ],
})
export class PermissoesModule {}
