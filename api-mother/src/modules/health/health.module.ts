import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './controllers/health.controller';
import { SqlServerHealthIndicator } from './indicators/sqlserver.health';
import { SystemHealthIndicator } from './indicators/system.health';
import { DatabasePoolHealthIndicator } from './indicators/database-pool.health';
import { LatencySLAHealthIndicator } from './indicators/latency-sla.health';
import { ShutdownStateService } from '../../common/services/shutdown-state.service';

@Module({
  imports: [TerminusModule, ConfigModule],
  controllers: [HealthController],
  providers: [
    SqlServerHealthIndicator,
    SystemHealthIndicator,
    DatabasePoolHealthIndicator,
    LatencySLAHealthIndicator,
    ShutdownStateService,
  ],
})
export class HealthModule {}
