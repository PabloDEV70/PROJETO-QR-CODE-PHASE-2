import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Domain
// (entities are pure, no DI needed)

// Application - Use Cases
import { InserirRegistroUseCase } from './application/use-cases/inserir-registro';
import { AtualizarRegistroUseCase } from './application/use-cases/atualizar-registro';
import { ExcluirRegistroUseCase } from './application/use-cases/excluir-registro';

// Application - Ports (symbols for DI)
import { PROVEDOR_MUTACAO, PROVEDOR_VALIDACAO } from './application/ports';

// Infrastructure - Adapters
import { MutacaoAdapter } from './infrastructure/adapters/mutacao.adapter';
import { ValidacaoTabelaAdapter } from './infrastructure/adapters/validacao-tabela.adapter';

// Presentation
import { MutationV2Controller } from './presentation/controllers/mutation-v2.controller';

// Security
import { MutationEnabledGuard } from '../../security/mutation-enabled.guard';
import { TabelaProtegidaGuard } from '../../security/tabela-protegida.guard';

// Shared
import { DatabaseModule } from '../../database/database.module';
import { SecurityModule } from '../../security/security.module';

@Module({
  imports: [ConfigModule, DatabaseModule, SecurityModule],
  controllers: [MutationV2Controller],
  providers: [
    // Use Cases
    InserirRegistroUseCase,
    AtualizarRegistroUseCase,
    ExcluirRegistroUseCase,

    // Adapters
    MutacaoAdapter,
    ValidacaoTabelaAdapter,

    // Guards
    MutationEnabledGuard,
    TabelaProtegidaGuard,

    // Dependency Injection bindings
    {
      provide: PROVEDOR_MUTACAO,
      useExisting: MutacaoAdapter,
    },
    {
      provide: PROVEDOR_VALIDACAO,
      useExisting: ValidacaoTabelaAdapter,
    },
  ],
  exports: [InserirRegistroUseCase, AtualizarRegistroUseCase, ExcluirRegistroUseCase],
})
export class MutationV2Module {}
