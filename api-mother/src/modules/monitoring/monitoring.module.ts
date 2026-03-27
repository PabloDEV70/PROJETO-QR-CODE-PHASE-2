/**
 * Module: MonitoringModule
 *
 * Módulo de monitoramento com Clean Architecture V3.
 */
import { Module } from '@nestjs/common';

// Ports (Symbols)
import {
  PROVEDOR_ESTATISTICAS_QUERY,
  PROVEDOR_QUERIES_ATIVAS,
  PROVEDOR_ESTATISTICAS_ESPERA,
  PROVEDOR_SESSOES,
  PROVEDOR_VISAO_SERVIDOR,
} from './application/ports';

// Use Cases
import {
  ObterVisaoServidorUseCase,
  ListarEstatisticasQueryUseCase,
  ListarQueriesAtivasUseCase,
  ListarEstatisticasEsperaUseCase,
  ListarSessoesUseCase,
} from './application/use-cases';

// Adapters
import { MonitoramentoAdapter } from './infrastructure/adapters';

// Controllers
import { MonitoringController } from './presentation/controllers';
import { UsersOnlineController } from './controllers/users-online.controller';

// Redis
import { RedisService } from '../../common/services/redis.service';

// Database
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MonitoringController, UsersOnlineController],
  providers: [
    // Use Cases
    ObterVisaoServidorUseCase,
    ListarEstatisticasQueryUseCase,
    ListarQueriesAtivasUseCase,
    ListarEstatisticasEsperaUseCase,
    ListarSessoesUseCase,

    // Single adapter implementing all ports
    MonitoramentoAdapter,

    // Port bindings
    {
      provide: PROVEDOR_ESTATISTICAS_QUERY,
      useExisting: MonitoramentoAdapter,
    },
    {
      provide: PROVEDOR_QUERIES_ATIVAS,
      useExisting: MonitoramentoAdapter,
    },
    {
      provide: PROVEDOR_ESTATISTICAS_ESPERA,
      useExisting: MonitoramentoAdapter,
    },
    {
      provide: PROVEDOR_SESSOES,
      useExisting: MonitoramentoAdapter,
    },
    {
      provide: PROVEDOR_VISAO_SERVIDOR,
      useExisting: MonitoramentoAdapter,
    },

    // Redis
    RedisService,
  ],
  exports: [
    ObterVisaoServidorUseCase,
    ListarEstatisticasQueryUseCase,
    ListarQueriesAtivasUseCase,
    ListarEstatisticasEsperaUseCase,
    ListarSessoesUseCase,
  ],
})
export class MonitoringModule {}
