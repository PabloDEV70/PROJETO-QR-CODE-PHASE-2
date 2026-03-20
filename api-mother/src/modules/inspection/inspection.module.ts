import { Module } from '@nestjs/common';
import { InspectionController } from './controllers/inspection.controller';
import { InspectionService } from './services/inspection.service';
import { SecurityModule } from '../../security/security.module';
import { PermissoesModule } from '../permissoes/permissoes.module';
import { SqlErrorAnalyzerService } from '../../common/services/sql-error-analyzer.service';
import { InspectionCacheService } from './infrastructure/adapters/inspection-cache.service';

@Module({
  imports: [SecurityModule, PermissoesModule],
  controllers: [InspectionController],
  providers: [InspectionService, SqlErrorAnalyzerService, InspectionCacheService],
  exports: [InspectionService, InspectionCacheService],
})
export class InspectionModule {}
