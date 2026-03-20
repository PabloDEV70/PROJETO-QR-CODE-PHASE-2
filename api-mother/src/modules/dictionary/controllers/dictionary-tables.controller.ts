import { Controller, Get, Query, Param, BadRequestException, HttpException, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { DictionaryService } from '../services/dictionary.service';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';
import { PaginationQueryDto } from '../dto/dictionary.dto';
import {
  SankhyaTablePermissionGuard,
  SankhyaTablePermission,
} from '../../../common/guards/sankhya-table-permission.guard';

@ApiTags('Dictionary - Tables')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), SankhyaTablePermissionGuard)
@Controller('dictionary')
export class DictionaryTablesController {
  constructor(
    private readonly dictionaryService: DictionaryService,
    private readonly logger: StructuredLogger,
  ) {}

  @Get('tables')
  @ApiOperation({
    summary: 'Listar tabelas do dicionario de dados',
    description:
      'Retorna tabelas do dicionario filtradas por permissoes do usuario. Se usuario tem acesso a tela DicionarioDados, ve todas as tabelas. Caso contrario, ve apenas tabelas das telas permitidas.',
  })
  @ApiQuery({ name: 'limit', required: false, example: 100, description: 'Limite de registros' })
  @ApiQuery({ name: 'offset', required: false, example: 0, description: 'Offset para paginacao' })
  @ApiResponse({ status: 200, description: 'Lista de tabelas do dicionario' })
  async getTables(@Query() pagination: PaginationQueryDto, @Request() req) {
    try {
      const codUsuario = req.user?.userId || req.user?.sub;
      const result = await this.dictionaryService.getTables(pagination, codUsuario);
      this.logger.info('Dictionary tables retrieved successfully', {
        count: result.data?.length || 0,
        codUsuario,
      });
      return result;
    } catch (error: any) {
      this.logger.error('Failed to retrieve dictionary tables', error as Error, {
        errorMessage: error?.message,
        pagination,
      });
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Failed to retrieve dictionary tables',
        details: error?.message || 'Unknown error occurred',
      });
    }
  }

  @Get('tables/search/:term')
  @ApiOperation({
    summary: 'Buscar tabelas por nome ou descricao',
    description: 'Pesquisa tabelas no dicionario pelo nome ou descricao, filtradas por permissoes do usuario',
  })
  @ApiParam({ name: 'term', description: 'Termo de busca', example: 'PARCEIRO' })
  @ApiQuery({ name: 'limit', required: false, example: 100 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiResponse({ status: 200, description: 'Tabelas encontradas' })
  async searchTables(@Param('term') term: string, @Query() pagination: PaginationQueryDto, @Request() req) {
    try {
      const codUsuario = req.user?.userId || req.user?.sub;
      const result = await this.dictionaryService.searchTables(term, pagination, codUsuario);
      this.logger.info('Table search completed', { term, codUsuario });
      return result;
    } catch (error) {
      this.logger.error('Failed to search tables', error as Error, { term });
      throw new BadRequestException('Failed to search tables');
    }
  }

  @Get('tables/:tableName')
  @SankhyaTablePermission('CONSULTAR')
  @ApiOperation({
    summary: 'Detalhes de uma tabela',
    description: 'Retorna informacoes detalhadas de uma tabela do dicionario',
  })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela', example: 'TGFTOP' })
  @ApiResponse({ status: 200, description: 'Informacoes da tabela' })
  async getTableByName(@Param('tableName') tableName: string) {
    try {
      const result = await this.dictionaryService.getTableByName(tableName);
      this.logger.info('Table info retrieved', { tableName });
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to retrieve table info', error as Error, { tableName });
      throw new BadRequestException('Failed to retrieve table info');
    }
  }

  @Get('tables/:tableName/instances')
  @SankhyaTablePermission('CONSULTAR')
  @ApiOperation({
    summary: 'Instancias de uma tabela',
    description: 'Retorna as instancias cadastradas para uma tabela (TDDINS)',
  })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela', example: 'TGFPAR' })
  @ApiResponse({ status: 200, description: 'Instancias da tabela' })
  async getTableInstances(@Param('tableName') tableName: string) {
    try {
      const result = await this.dictionaryService.getTableInstances(tableName);
      this.logger.info('Table instances retrieved', { tableName });
      return result;
    } catch (error) {
      this.logger.error('Failed to retrieve table instances', error as Error, { tableName });
      throw new BadRequestException('Failed to retrieve table instances');
    }
  }

  @Get('tables/:tableName/relationships')
  @SankhyaTablePermission('CONSULTAR')
  @ApiOperation({
    summary: 'Relacionamentos de uma tabela',
    description: 'Retorna os relacionamentos (foreign keys) de uma tabela através de TDDLIG e TDDLGC',
  })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela', example: 'TCSOSE' })
  @ApiResponse({ status: 200, description: 'Relacionamentos da tabela' })
  async getTableRelationships(@Param('tableName') tableName: string) {
    try {
      const result = await this.dictionaryService.getTableRelationships(tableName);
      this.logger.info('Table relationships retrieved', { tableName });
      return result;
    } catch (error) {
      this.logger.error('Failed to retrieve table relationships', error as Error, { tableName });
      throw new BadRequestException('Failed to retrieve table relationships');
    }
  }
}
