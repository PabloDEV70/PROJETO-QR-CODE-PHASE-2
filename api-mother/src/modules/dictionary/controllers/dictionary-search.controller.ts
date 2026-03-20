import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Param,
  BadRequestException,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { DictionaryService } from '../services/dictionary.service';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';
import { DictionaryQueryDto, PaginationQueryDto } from '../dto/dictionary.dto';
import { FIELD_TYPES, PRESENTATION_TYPES } from '../constants/dictionary-tables.constant';

@ApiTags('Dictionary - Search')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('dictionary')
export class DictionarySearchController {
  constructor(
    private readonly dictionaryService: DictionaryService,
    private readonly logger: StructuredLogger,
  ) {}

  @Get('search/:term')
  @ApiOperation({
    summary: 'Busca global no dicionario',
    description: 'Pesquisa o termo em tabelas, campos e opcoes simultaneamente',
  })
  @ApiParam({ name: 'term', description: 'Termo de busca', example: 'PARCEIRO' })
  @ApiQuery({ name: 'limit', required: false, example: 50, description: 'Limite por categoria' })
  @ApiResponse({ status: 200, description: 'Resultados da busca global' })
  async globalSearch(@Param('term') term: string, @Query() pagination: PaginationQueryDto) {
    try {
      const result = await this.dictionaryService.globalSearch(term, pagination);
      this.logger.info('Global search completed', { term });
      return result;
    } catch (error) {
      this.logger.error('Failed to perform global search', error as Error, { term });
      throw new BadRequestException('Failed to perform global search');
    }
  }

  @Get('instances/:instanceName/links')
  @ApiOperation({
    summary: 'Links/relacionamentos de uma instancia',
    description: 'Retorna os links de uma instancia com outras instancias (TDDLIG, TDDLGC)',
  })
  @ApiParam({ name: 'instanceName', description: 'Nome da instancia', example: 'Parceiro' })
  @ApiResponse({ status: 200, description: 'Links da instancia' })
  async getInstanceLinks(@Param('instanceName') instanceName: string) {
    try {
      const result = await this.dictionaryService.getInstanceLinks(instanceName);
      this.logger.info('Instance links retrieved', { instanceName });
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to retrieve instance links', error as Error, { instanceName });
      throw new BadRequestException('Failed to retrieve instance links');
    }
  }

  @Post('query')
  @ApiOperation({
    summary: 'Executar query customizada no dicionario',
    description: 'Executa query SQL somente nas tabelas do dicionario de dados (TDD*, TRD*)',
  })
  @ApiBody({
    type: DictionaryQueryDto,
    examples: {
      example1: {
        summary: 'Buscar opcoes de um campo',
        value: {
          query:
            'SELECT * FROM TDDOPC WHERE NUCAMPO = (SELECT NUCAMPO FROM TDDCAM WHERE NOMETAB = @param1 AND NOMECAMPO = @param2)',
          params: ['TGFTOP', 'ATUALEST'],
        },
      },
      example2: {
        summary: 'Listar campos de uma tabela',
        value: {
          query: 'SELECT NOMECAMPO, DESCRCAMPO, TIPCAMPO FROM TDDCAM WHERE NOMETAB = @param1',
          params: ['TGFPAR'],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Resultado da query' })
  @ApiResponse({ status: 403, description: 'Query bloqueada por seguranca' })
  async executeCustomQuery(@Body() queryDto: DictionaryQueryDto) {
    try {
      if (!queryDto.query) {
        throw new BadRequestException('Query is required');
      }

      const result = await this.dictionaryService.executeCustomQuery(queryDto);
      this.logger.info('Custom dictionary query executed');
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Custom dictionary query failed', error as Error, {
        query: queryDto.query,
      });
      throw new BadRequestException('Query execution failed');
    }
  }

  @Get('meta/allowed-tables')
  @ApiOperation({
    summary: 'Listar tabelas permitidas para queries',
    description: 'Retorna a lista de tabelas do dicionario que podem ser consultadas via /query',
  })
  @ApiResponse({ status: 200, description: 'Lista de tabelas permitidas' })
  getAllowedTables() {
    const tables = this.dictionaryService.getDictionaryTablesList();
    return { tables };
  }

  @Get('meta/field-types')
  @ApiOperation({
    summary: 'Tipos de campo do dicionario',
    description: 'Retorna os tipos de dados de campo suportados (TIPCAMPO)',
  })
  @ApiResponse({ status: 200, description: 'Tipos de campo' })
  getFieldTypes() {
    return { types: FIELD_TYPES };
  }

  @Get('meta/presentation-types')
  @ApiOperation({
    summary: 'Tipos de apresentacao do dicionario',
    description: 'Retorna os tipos de apresentacao de campo suportados (TIPOAPRESENTACAO)',
  })
  @ApiResponse({ status: 200, description: 'Tipos de apresentacao' })
  getPresentationTypes() {
    return { types: PRESENTATION_TYPES };
  }
}
