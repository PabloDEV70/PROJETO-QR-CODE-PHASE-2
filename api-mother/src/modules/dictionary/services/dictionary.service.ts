import { Injectable } from '@nestjs/common';
import { DictionaryTablesService } from './dictionary-tables.service';
import { DictionaryFieldsService } from './dictionary-fields.service';
import { DictionaryOptionsService } from './dictionary-options.service';
import { DictionaryInstancesService } from './dictionary-instances.service';
import { DictionarySearchService } from './dictionary-search.service';
import { DictionaryQueryService } from './dictionary-query.service';
import { DictionaryRelationshipsService } from './dictionary-relationships.service';
import { DictionaryQueryDto, PaginationQueryDto } from '../dto/dictionary.dto';
import { FIELD_TYPES, PRESENTATION_TYPES } from '../constants/dictionary-tables.constant';

@Injectable()
export class DictionaryService {
  constructor(
    private readonly tablesService: DictionaryTablesService,
    private readonly fieldsService: DictionaryFieldsService,
    private readonly optionsService: DictionaryOptionsService,
    private readonly instancesService: DictionaryInstancesService,
    private readonly searchService: DictionarySearchService,
    private readonly queryService: DictionaryQueryService,
    private readonly relationshipsService: DictionaryRelationshipsService,
  ) {}

  // Tables
  getTables(pagination: PaginationQueryDto, codUsuario?: number) {
    return this.tablesService.getTables(pagination, codUsuario);
  }

  getTableByName(tableName: string) {
    return this.tablesService.getTableByName(tableName);
  }

  searchTables(term: string, pagination: PaginationQueryDto, codUsuario?: number) {
    return this.tablesService.searchTables(term, pagination, codUsuario);
  }

  // Fields
  getTableFields(tableName: string, pagination: PaginationQueryDto) {
    return this.fieldsService.getTableFields(tableName, pagination);
  }

  getFieldDetails(tableName: string, fieldName: string) {
    return this.fieldsService.getFieldDetails(tableName, fieldName);
  }

  searchFields(term: string, pagination: PaginationQueryDto) {
    return this.fieldsService.searchFields(term, pagination);
  }

  // Options & Properties
  getFieldOptions(tableName: string, fieldName: string) {
    return this.optionsService.getFieldOptions(tableName, fieldName);
  }

  getOptionsByNucampo(nucampo: number) {
    return this.optionsService.getOptionsByNucampo(nucampo);
  }

  getFieldProperties(tableName: string, fieldName: string) {
    return this.optionsService.getFieldProperties(tableName, fieldName);
  }

  // Instances
  getTableInstances(tableName: string) {
    return this.instancesService.getTableInstances(tableName);
  }

  getInstanceLinks(instanceName: string) {
    return this.instancesService.getInstanceLinks(instanceName);
  }

  // Search
  globalSearch(term: string, pagination: PaginationQueryDto) {
    return this.searchService.globalSearch(term, pagination);
  }

  // Custom Query
  executeCustomQuery(queryDto: DictionaryQueryDto) {
    return this.queryService.executeCustomQuery(queryDto);
  }

  getDictionaryTablesList(): string[] {
    return this.queryService.getDictionaryTablesList();
  }

  // Utilities
  getFieldTypeDescription(typeCode: string): string {
    return FIELD_TYPES[typeCode?.toUpperCase()] || 'Desconhecido';
  }

  getPresentationTypeDescription(typeCode: string): string {
    return PRESENTATION_TYPES[typeCode?.toUpperCase()] || 'Padrao';
  }

  // Relationships
  getTableRelationships(tableName: string) {
    return this.relationshipsService.getTableRelationships(tableName);
  }

  getRelationshipFields(originInstance: number, destInstance: number) {
    return this.relationshipsService.getRelationshipFields(originInstance, destInstance);
  }

  getInstancesForTable(tableName: string) {
    return this.relationshipsService.getTableInstances(tableName);
  }
}
