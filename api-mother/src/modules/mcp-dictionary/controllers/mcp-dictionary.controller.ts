import { Controller, Get, Post, Body, Query, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiHeader,
} from '@nestjs/swagger';
import { McpDictionaryService } from '../services/mcp-dictionary.service';
import {
  McpDictionaryListDto,
  McpDictionaryTableDto,
  McpDictionaryFieldDto,
  McpDictionarySearchDto,
  McpDictionaryFieldSearchDto,
} from '../dto/mcp-dictionary.dto';
import { DatabaseKey } from '../../../config/database.config';

@ApiTags('MCP Dicionário Sankhya')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('mcp-dictionary')
export class McpDictionaryController {
  constructor(private readonly mcpDictionary: McpDictionaryService) {}

  private getDatabaseFromRequest(request: any): DatabaseKey {
    const dbFromHeader = request?.headers?.['x-database'];
    if (dbFromHeader && ['TREINA', 'TESTE', 'PROD'].includes(String(dbFromHeader).toUpperCase())) {
      return String(dbFromHeader).toUpperCase() as DatabaseKey;
    }
    return 'TREINA';
  }

  @Get('tools')
  @ApiOperation({
    summary: 'Listar ferramentas do MCP Dicionário Sankhya',
    description: 'Retorna a lista de todas as ferramentas disponíveis para explorar o dicionário de dados Sankhya',
  })
  @ApiResponse({ status: 200, description: 'Lista de ferramentas retornada com sucesso' })
  getTools() {
    return {
      tools: this.mcpDictionary.getToolDefinitions(),
      version: '1.0.0',
      description: 'MCP Dicionário de Dados Sankhya - Ferramentas para explorar metadados do sistema',
      databaseDefault: 'TREINA',
    };
  }

  @Get('tables')
  @ApiOperation({
    summary: 'Listar tabelas do dicionário',
    description: 'Lista todas as tabelas do dicionário de dados que você tem acesso. Usa banco TREINA por padrão.',
  })
  @ApiHeader({ name: 'x-database', description: 'Banco (TREINA, TESTE, PROD). Padrão: TREINA', required: false })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de resultados' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset para paginação' })
  @ApiResponse({ status: 200, description: 'Lista de tabelas retornada com sucesso' })
  async listTables(@Query() dto: McpDictionaryListDto, @Request() req) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.mcpDictionary.listTables(dto, codUsuario, req);
  }

  @Get('tables/:tableName')
  @ApiOperation({
    summary: 'Obter detalhes de uma tabela',
    description: 'Retorna informações detalhadas de uma tabela específica do dicionário',
  })
  @ApiHeader({ name: 'x-database', description: 'Banco (TREINA, TESTE, PROD). Padrão: TREINA', required: false })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela' })
  @ApiResponse({ status: 200, description: 'Detalhes da tabela retornados com sucesso' })
  @ApiResponse({ status: 404, description: 'Tabela não encontrada' })
  async getTableDetails(@Param('tableName') tableName: string, @Request() req) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.mcpDictionary.getTableDetails(tableName, codUsuario, req);
  }

  @Get('tables/:tableName/fields')
  @ApiOperation({
    summary: 'Listar campos de uma tabela',
    description: 'Retorna todos os campos de uma tabela do dicionário',
  })
  @ApiHeader({ name: 'x-database', description: 'Banco (TREINA, TESTE, PROD). Padrão: TREINA', required: false })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de campos' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset para paginação' })
  @ApiResponse({ status: 200, description: 'Lista de campos retornada com sucesso' })
  async listTableFields(@Param('tableName') tableName: string, @Query() query: McpDictionaryTableDto, @Request() req) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.mcpDictionary.listTableFields({ ...query, tableName }, codUsuario, req);
  }

  @Get('tables/:tableName/fields/:fieldName')
  @ApiOperation({
    summary: 'Obter detalhes de um campo',
    description: 'Retorna informações detalhadas de um campo específico',
  })
  @ApiHeader({ name: 'x-database', description: 'Banco (TREINA, TESTE, PROD). Padrão: TREINA', required: false })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela' })
  @ApiParam({ name: 'fieldName', description: 'Nome do campo' })
  @ApiResponse({ status: 200, description: 'Detalhes do campo retornados com sucesso' })
  async getFieldDetails(@Param('tableName') tableName: string, @Param('fieldName') fieldName: string, @Request() req) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.mcpDictionary.getFieldDetails({ tableName, fieldName }, codUsuario, req);
  }

  @Get('tables/:tableName/fields/:fieldName/options')
  @ApiOperation({
    summary: 'Obter opções de um campo',
    description: 'Retorna as opções/valores possíveis de um campo (tipos enumerados)',
  })
  @ApiHeader({ name: 'x-database', description: 'Banco (TREINA, TESTE, PROD). Padrão: TREINA', required: false })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela' })
  @ApiParam({ name: 'fieldName', description: 'Nome do campo' })
  @ApiResponse({ status: 200, description: 'Opções do campo retornadas com sucesso' })
  async getFieldOptions(@Param('tableName') tableName: string, @Param('fieldName') fieldName: string, @Request() req) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.mcpDictionary.getFieldOptions({ tableName, fieldName }, codUsuario, req);
  }

  @Get('tables/:tableName/fields/:fieldName/properties')
  @ApiOperation({
    summary: 'Obter propriedades de interface de um campo',
    description: 'Retorna as propriedades de interface (obrigatório, somente leitura, visível, etc.)',
  })
  @ApiHeader({ name: 'x-database', description: 'Banco (TREINA, TESTE, PROD). Padrão: TREINA', required: false })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela' })
  @ApiParam({ name: 'fieldName', description: 'Nome do campo' })
  @ApiResponse({ status: 200, description: 'Propriedades do campo retornadas com sucesso' })
  async getFieldProperties(
    @Param('tableName') tableName: string,
    @Param('fieldName') fieldName: string,
    @Request() req,
  ) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.mcpDictionary.getFieldProperties({ tableName, fieldName }, codUsuario, req);
  }

  @Get('tables/:tableName/instances')
  @ApiOperation({
    summary: 'Obter instâncias de uma tabela',
    description: 'Retorna as instâncias (agrupamentos lógicos) de uma tabela',
  })
  @ApiHeader({ name: 'x-database', description: 'Banco (TREINA, TESTE, PROD). Padrão: TREINA', required: false })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela' })
  @ApiResponse({ status: 200, description: 'Instâncias da tabela retornadas com sucesso' })
  async getTableInstances(@Param('tableName') tableName: string, @Request() req) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.mcpDictionary.getTableInstances(tableName, codUsuario, req);
  }

  @Get('tables/:tableName/relationships')
  @ApiOperation({
    summary: 'Obter relacionamentos de uma tabela',
    description: 'Retorna os relacionamentos (foreign keys) de uma tabela no dicionário',
  })
  @ApiHeader({ name: 'x-database', description: 'Banco (TREINA, TESTE, PROD). Padrão: TREINA', required: false })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela' })
  @ApiResponse({ status: 200, description: 'Relacionamentos da tabela retornados com sucesso' })
  async getTableRelationships(@Param('tableName') tableName: string, @Request() req) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.mcpDictionary.getTableRelationships(tableName, codUsuario, req);
  }

  @Get('tables/search')
  @ApiOperation({
    summary: 'Buscar tabelas no dicionário',
    description: 'Busca tabelas por nome ou descrição no dicionário de dados',
  })
  @ApiHeader({ name: 'x-database', description: 'Banco (TREINA, TESTE, PROD). Padrão: TREINA', required: false })
  @ApiQuery({ name: 'term', required: true, description: 'Termo de busca' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de resultados' })
  @ApiResponse({ status: 200, description: 'Resultados da busca retornados com sucesso' })
  async searchTables(@Query() dto: McpDictionarySearchDto, @Request() req) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.mcpDictionary.searchTables(dto, codUsuario, req);
  }

  @Get('fields/search')
  @ApiOperation({
    summary: 'Buscar campos no dicionário',
    description: 'Busca campos por nome ou descrição em todas as tabelas',
  })
  @ApiHeader({ name: 'x-database', description: 'Banco (TREINA, TESTE, PROD). Padrão: TREINA', required: false })
  @ApiQuery({ name: 'term', required: true, description: 'Termo de busca' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de resultados' })
  @ApiResponse({ status: 200, description: 'Resultados da busca retornados com sucesso' })
  async searchFields(@Query() dto: McpDictionaryFieldSearchDto, @Request() req) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.mcpDictionary.searchFields(dto, codUsuario, req);
  }

  @Get('health')
  @ApiOperation({
    summary: 'Verificar saúde do serviço',
    description: 'Retorna o status de saúde do MCP Dicionário Sankhya',
  })
  @ApiResponse({ status: 200, description: 'Servidor saudável' })
  health() {
    return {
      status: 'healthy',
      version: '1.0.0',
      service: 'mcp-sankhya-dictionary',
      databaseDefault: 'TREINA',
      timestamp: new Date().toISOString(),
    };
  }
}
