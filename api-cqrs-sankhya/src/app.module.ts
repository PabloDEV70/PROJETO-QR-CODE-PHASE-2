import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { OsModule } from './modules/os.module';
import { HealthController } from './infrastructure/http/controllers/health.controller';

@Module({
  imports: [
    CqrsModule.forRoot(),
    DatabaseModule,
    AuthModule,
    OsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
