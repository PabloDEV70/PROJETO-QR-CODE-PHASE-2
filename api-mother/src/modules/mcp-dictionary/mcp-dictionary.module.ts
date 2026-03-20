import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpDictionaryController } from './controllers/mcp-dictionary.controller';
import { McpDictionaryService } from './services/mcp-dictionary.service';
import { DatabaseModule } from '../../database/database.module';
import { PermissoesModule } from '../permissoes/permissoes.module';
@Module({
  imports: [ConfigModule, DatabaseModule, PermissoesModule],
  controllers: [McpDictionaryController],
  providers: [McpDictionaryService],
  exports: [McpDictionaryService],
})
export class McpDictionaryModule {}
