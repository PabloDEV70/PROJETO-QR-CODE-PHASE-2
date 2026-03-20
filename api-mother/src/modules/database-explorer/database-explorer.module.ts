/**
 * Module: Database Explorer
 *
 * Módulo para exploração do banco de dados com Clean Architecture.
 * Endpoints disponíveis:
 * - GET /database/resumo - Resumo estatístico do banco
 * - GET /database/views - Lista de views
 * - GET /database/views/:schema/:nome - Detalhes de uma view
 * - GET /database/triggers - Lista de triggers
 * - GET /database/triggers/:schema/:nome - Detalhes de um trigger
 * - GET /database/procedures - Lista de procedures
 * - GET /database/procedures/:schema/:nome - Detalhes de uma procedure
 * - GET /database/relacionamentos - Lista de relacionamentos FK
 * - POST /database/cache/limpar - Limpar cache
 * - GET /database/cache/estatisticas - Estatísticas do cache
 */
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';

// Presentation
import { DatabaseExplorerController } from './presentation/controllers';

// Application - Use Cases
import {
  ObterResumoDatabaseUseCase,
  ListarViewsUseCase,
  ObterDetalheViewUseCase,
  ListarTriggersUseCase,
  ObterDetalheTriggerUseCase,
  ListarProceduresUseCase,
  ObterDetalheProcedureUseCase,
  ListarRelacionamentosUseCase,
  LimparCacheUseCase,
  ObterEstatisticasCacheUseCase,
} from './application/use-cases';

// Application - Ports
import {
  PROVEDOR_RESUMO_DATABASE,
  PROVEDOR_VIEWS,
  PROVEDOR_TRIGGERS,
  PROVEDOR_PROCEDURES,
  PROVEDOR_RELACIONAMENTOS,
  PROVEDOR_CACHE,
} from './application/ports';

// Infrastructure - Adapters
import { DatabaseExplorerAdapter } from './infrastructure/adapters';

@Module({
  imports: [DatabaseModule],
  controllers: [DatabaseExplorerController],
  providers: [
    // Use Cases
    ObterResumoDatabaseUseCase,
    ListarViewsUseCase,
    ObterDetalheViewUseCase,
    ListarTriggersUseCase,
    ObterDetalheTriggerUseCase,
    ListarProceduresUseCase,
    ObterDetalheProcedureUseCase,
    ListarRelacionamentosUseCase,
    LimparCacheUseCase,
    ObterEstatisticasCacheUseCase,

    // Adapter único que implementa todas as interfaces
    DatabaseExplorerAdapter,

    // Bindings de interface para adapter usando useExisting
    { provide: PROVEDOR_RESUMO_DATABASE, useExisting: DatabaseExplorerAdapter },
    { provide: PROVEDOR_VIEWS, useExisting: DatabaseExplorerAdapter },
    { provide: PROVEDOR_TRIGGERS, useExisting: DatabaseExplorerAdapter },
    { provide: PROVEDOR_PROCEDURES, useExisting: DatabaseExplorerAdapter },
    { provide: PROVEDOR_RELACIONAMENTOS, useExisting: DatabaseExplorerAdapter },
    { provide: PROVEDOR_CACHE, useExisting: DatabaseExplorerAdapter },
  ],
})
export class DatabaseExplorerModule {}
