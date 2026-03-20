import { Controller, Get, Query, Param, BadRequestException, HttpException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { DictionaryService } from '../services/dictionary.service';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';
import { PaginationQueryDto } from '../dto/dictionary.dto';
import {
  SankhyaTablePermissionGuard,
  SankhyaTablePermission,
} from '../../../common/guards/sankhya-table-permission.guard';

@ApiTags('Dictionary - Fields')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), SankhyaTablePermissionGuard)
@Controller('dictionary')
export class DictionaryFieldsController {
  constructor(
    private readonly dictionaryService: DictionaryService,
    private readonly logger: StructuredLogger,
  ) {}

  @Get('tables/:tableName/fields')
  @SankhyaTablePermission('CONSULTAR')
  @ApiOperation({
    summary: 'Listar campos de uma tabela',
    description: 'Retorna todos os campos cadastrados para uma tabela (TDDCAM)',
  })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela', example: 'TGFTOP' })
  @ApiQuery({ name: 'limit', required: false, example: 100 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiResponse({ status: 200, description: 'Lista de campos da tabela' })
  async getTableFields(@Param('tableName') tableName: string, @Query() pagination: PaginationQueryDto) {
    try {
      const result = await this.dictionaryService.getTableFields(tableName, pagination);
      this.logger.info('Table fields retrieved', { tableName });
      return result;
    } catch (error: any) {
      this.logger.error('Failed to retrieve table fields', error as Error, {
        tableName,
        errorMessage: error?.message,
        errorStack: error?.stack?.substring(0, 500),
      });
      if (error instanceof HttpException) throw error;
      throw new BadRequestException({
        message: 'Failed to retrieve table fields',
        details: error?.message || 'Unknown error',
        tableName,
      });
    }
  }

  @Get('tables/:tableName/fields/:fieldName')
  @SankhyaTablePermission('CONSULTAR')
  @ApiOperation({
    summary: 'Detalhes de um campo',
    description: 'Retorna informacoes detalhadas de um campo, incluindo opcoes e propriedades',
  })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela', example: 'TGFTOP' })
  @ApiParam({ name: 'fieldName', description: 'Nome do campo', example: 'ATUALEST' })
  @ApiResponse({ status: 200, description: 'Informacoes do campo com opcoes e propriedades' })
  async getFieldDetails(@Param('tableName') tableName: string, @Param('fieldName') fieldName: string) {
    try {
      const result = await this.dictionaryService.getFieldDetails(tableName, fieldName);
      this.logger.info('Field details retrieved', { tableName, fieldName });
      return result;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to retrieve field details', error as Error, {
        tableName,
        fieldName,
        errorMessage: error?.message,
      });
      throw new BadRequestException({
        message: 'Failed to retrieve field details',
        details: error?.message || 'Unknown error',
        tableName,
        fieldName,
      });
    }
  }

  @Get('tables/:tableName/fields/:fieldName/options')
  @SankhyaTablePermission('CONSULTAR')
  @ApiOperation({
    summary: 'Opcoes de um campo',
    description: 'Retorna as opcoes/valores possiveis de um campo (TDDOPC)',
  })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela', example: 'TGFTOP' })
  @ApiParam({ name: 'fieldName', description: 'Nome do campo', example: 'ATUALEST' })
  @ApiResponse({ status: 200, description: 'Opcoes do campo' })
  async getFieldOptions(@Param('tableName') tableName: string, @Param('fieldName') fieldName: string) {
    try {
      const result = await this.dictionaryService.getFieldOptions(tableName, fieldName);
      this.logger.info('Field options retrieved', { tableName, fieldName });
      return result;
    } catch (error) {
      this.logger.error('Failed to retrieve field options', error as Error, {
        tableName,
        fieldName,
      });
      throw new BadRequestException('Failed to retrieve field options');
    }
  }

  @Get('tables/:tableName/fields/:fieldName/properties')
  @SankhyaTablePermission('CONSULTAR')
  @ApiOperation({
    summary: 'Propriedades de um campo',
    description: 'Retorna as propriedades de um campo (TDDPCO): requerido, readOnly, visivel, etc.',
  })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela', example: 'TGFPAR' })
  @ApiParam({ name: 'fieldName', description: 'Nome do campo', example: 'CODPARC' })
  @ApiResponse({ status: 200, description: 'Propriedades do campo' })
  async getFieldProperties(@Param('tableName') tableName: string, @Param('fieldName') fieldName: string) {
    try {
      const result = await this.dictionaryService.getFieldProperties(tableName, fieldName);
      this.logger.info('Field properties retrieved', { tableName, fieldName });
      return result;
    } catch (error) {
      this.logger.error('Failed to retrieve field properties', error as Error, {
        tableName,
        fieldName,
      });
      throw new BadRequestException('Failed to retrieve field properties');
    }
  }

  @Get('fields/search/:term')
  @ApiOperation({
    summary: 'Buscar campos em todas as tabelas',
    description: 'Pesquisa campos pelo nome ou descricao em todas as tabelas do dicionario',
  })
  @ApiParam({ name: 'term', description: 'Termo de busca', example: 'CODPARC' })
  @ApiQuery({ name: 'limit', required: false, example: 100 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiResponse({ status: 200, description: 'Campos encontrados' })
  async searchFields(@Param('term') term: string, @Query() pagination: PaginationQueryDto) {
    try {
      const result = await this.dictionaryService.searchFields(term, pagination);
      this.logger.info('Field search completed', { term });
      return result;
    } catch (error) {
      this.logger.error('Failed to search fields', error as Error, { term });
      throw new BadRequestException('Failed to search fields');
    }
  }

  @Get('options/by-nucampo/:nucampo')
  @ApiOperation({
    summary: 'Opcoes por NUCAMPO',
    description: 'Retorna as opcoes de um campo diretamente pelo NUCAMPO',
  })
  @ApiParam({ name: 'nucampo', description: 'NUCAMPO do campo', example: 123 })
  @ApiResponse({ status: 200, description: 'Opcoes do campo' })
  async getOptionsByNucampo(@Param('nucampo') nucampo: string) {
    try {
      const result = await this.dictionaryService.getOptionsByNucampo(parseInt(nucampo, 10));
      this.logger.info('Options by NUCAMPO retrieved', { nucampo });
      return result;
    } catch (error) {
      this.logger.error('Failed to retrieve options by NUCAMPO', error as Error, { nucampo });
      throw new BadRequestException('Failed to retrieve options');
    }
  }
}
