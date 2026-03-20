import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpServerService } from './services/mcp-server.service';
import { SqlAnalyzerService } from './services/sql-analyzer.service';
import { McpController } from './controllers/mcp.controller';
import { DatabaseModule } from '../../database/database.module';
import { PermissoesModule } from '../permissoes/permissoes.module';
import { McpDictionaryModule } from '../mcp-dictionary/mcp-dictionary.module';
@Module({
  imports: [ConfigModule, DatabaseModule, PermissoesModule, McpDictionaryModule],
  controllers: [McpController],
  providers: [McpServerService, SqlAnalyzerService],
  exports: [McpServerService],
})
export class McpServerModule {}
