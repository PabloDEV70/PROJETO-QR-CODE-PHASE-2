import { Module } from '@nestjs/common';
import { PermissoesModule } from '../permissoes/permissoes.module';

// Controllers
import { DictionaryTablesController } from './controllers/dictionary-tables.controller';
import { DictionaryFieldsController } from './controllers/dictionary-fields.controller';
import { DictionarySearchController } from './controllers/dictionary-search.controller';

// Services
import { DictionaryService } from './services/dictionary.service';
import { DictionaryTablesService } from './services/dictionary-tables.service';
import { DictionaryFieldsService } from './services/dictionary-fields.service';
import { DictionaryOptionsService } from './services/dictionary-options.service';
import { DictionaryInstancesService } from './services/dictionary-instances.service';
import { DictionarySearchService } from './services/dictionary-search.service';
import { DictionaryQueryService } from './services/dictionary-query.service';
import { DictionaryRelationshipsService } from './services/dictionary-relationships.service';

@Module({
  imports: [PermissoesModule],
  controllers: [DictionaryTablesController, DictionaryFieldsController, DictionarySearchController],
  providers: [
    DictionaryService,
    DictionaryTablesService,
    DictionaryFieldsService,
    DictionaryOptionsService,
    DictionaryInstancesService,
    DictionarySearchService,
    DictionaryQueryService,
    DictionaryRelationshipsService,
  ],
  exports: [DictionaryService],
})
export class DictionaryModule {}
