import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
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
import { McpServerService } from '../services/mcp-server.service';
import { DatabaseContextService } from '../../../database/database-context.service';
import { DatabaseKey } from '../../../config/database.config';
import {
  McpQueryDto,
  McpListTablesDto,
  McpTableSchemaDto,
  McpSearchTablesDto,
  McpSearchFieldsDto,
  McpDictionaryListDto,
  McpDictionaryTableDto,
  McpDictionaryFieldDto,
  McpDictionarySearchDto,
  McpDictionaryFieldSearchDto,
  McpDictionaryFieldsQueryDto,
} from '../dto/mcp.dto';

@ApiTags('MCP Server')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('mcp')
export class McpController {
  constructor(
    private readonly mcpServer: McpServerService,
    private readonly databaseContext: DatabaseContextService,
  ) {}

  private getDatabaseFromRequest(request: any): DatabaseKey {
    const dbFromHeader = request?.headers?.['x-database'];
    if (dbFromHeader && ['TREINA', 'TESTE', 'PROD'].includes(String(dbFromHeader).toUpperCase())) {
      return String(dbFromHeader).toUpperCase() as DatabaseKey;
    }
    return 'TREINA';
  }

  private withDatabaseContext<T>(request: any, callback: () => T): T {
    const dbKey = this.getDatabaseFromRequest(request);
    return this.databaseContext.run(dbKey, callback);
  }

  @Get('tools')
  @ApiOperation({
    summary: 'Listar ferramentas MCP disponíveis',
    description: 'Retorna a lista de todas as ferramentas disponíveis no servidor MCP SQL Server read-only',
  })
  @ApiResponse({ status: 200, description: 'Lista de ferramentas retornada com sucesso' })
  getTools() {
    return {
      tools: this.mcpServer.getToolDefinitions(),
      version: '1.0.0',
      description: 'MCP SQL Server Read-Only Server',
    };
  }

  @Post('query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Executar query SQL (read-only)',
    description: `
# 🔐 Query SQL Read-Only

Este endpoint executa queries SQL **apenas SELECT** no banco SQL Server Sankhya.

## ⚠️ Segurança:
- ✅ Apenas SELECT é permitido
- ✅ Parâmetros protegidos contra SQL injection
- ✅ Limite de 10000 registros por query
- ✅ Rate limiting ativo
- ✅ Usa banco TREINA por padrão (para segurança)

## 📝 Exemplo:
\`\`\`json
{
  "query": "SELECT TOP 10 CODPARC, NOMEPARC FROM TGFPAR WHERE CODTIPPAR = ?",
  "params": [1],
  "limit": 10
}
\`\`\`
    `,
  })
  @ApiHeader({
    name: 'x-database',
    description: 'Banco de dados a usar (TREINA, TESTE, PROD). Padrão: TREINA',
    required: false,
    example: 'TREINA',
  })
  @ApiBody({ type: McpQueryDto })
  @ApiResponse({ status: 200, description: 'Query executada com sucesso' })
  @ApiResponse({ status: 400, description: 'Query inválida' })
  @ApiResponse({ status: 403, description: 'Operação bloqueada (não-SELECT) ou sem permissão' })
  async executeQuery(@Body() dto: McpQueryDto, @Request() req) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.withDatabaseContext(req, () => this.mcpServer.executeQuery(dto, codUsuario));
  }

  @Get('tables')
  @ApiOperation({
    summary: 'Listar tabelas disponíveis',
    description: 'Retorna a lista de tabelas que o usuário tem permissão para acessar. Usa banco TREINA por padrão.',
  })
  @ApiHeader({
    name: 'x-database',
    description: 'Banco de dados a usar (TREINA, TESTE, PROD). Padrão: TREINA',
    required: false,
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de resultados' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset para paginação' })
  @ApiResponse({ status: 200, description: 'Lista de tabelas retornada com sucesso' })
  async listTables(@Query() dto: McpListTablesDto, @Request() req) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.withDatabaseContext(req, () => this.mcpServer.listTables(dto, codUsuario));
  }

  @Get('tables/:tableName/schema')
  @ApiOperation({
    summary: 'Obter estrutura de uma tabela',
    description: 'Retorna as colunas, tipos de dados e chaves primárias de uma tabela',
  })
  @ApiHeader({
    name: 'x-database',
    description: 'Banco de dados a usar (TREINA, TESTE, PROD). Padrão: TREINA',
    required: false,
  })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela' })
  @ApiResponse({ status: 200, description: 'Schema da tabela retornado com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão para acessar a tabela' })
  async getTableSchema(@Param('tableName') tableName: string, @Request() req) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.withDatabaseContext(req, () => this.mcpServer.getTableSchema({ tableName }, codUsuario));
  }

  @Get('tables/search')
  @ApiOperation({
    summary: 'Buscar tabelas por termo',
    description: 'Busca tabelas no dicionário de dados por nome ou descrição',
  })
  @ApiHeader({
    name: 'x-database',
    description: 'Banco de dados a usar (TREINA, TESTE, PROD). Padrão: TREINA',
    required: false,
  })
  @ApiQuery({ name: 'term', required: true, description: 'Termo de busca' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de resultados' })
  @ApiResponse({ status: 200, description: 'Resultados da busca retornados com sucesso' })
  async searchTables(@Query() dto: McpSearchTablesDto, @Request() req) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.withDatabaseContext(req, () => this.mcpServer.searchTables(dto, codUsuario));
  }

  @Get('fields/search')
  @ApiOperation({
    summary: 'Buscar campos por termo',
    description: 'Busca campos em todas as tabelas do dicionário',
  })
  @ApiHeader({
    name: 'x-database',
    description: 'Banco de dados a usar (TREINA, TESTE, PROD). Padrão: TREINA',
    required: false,
  })
  @ApiQuery({ name: 'term', required: true, description: 'Termo de busca' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de resultados' })
  @ApiResponse({ status: 200, description: 'Resultados da busca retornados com sucesso' })
  async searchFields(@Query() dto: McpSearchFieldsDto, @Request() req) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.withDatabaseContext(req, () => this.mcpServer.searchFields(dto, codUsuario));
  }

  @Get('tables/:tableName/relationships')
  @ApiOperation({
    summary: 'Obter relacionamentos de uma tabela',
    description: 'Retorna as chaves estrangeiras de uma tabela',
  })
  @ApiHeader({
    name: 'x-database',
    description: 'Banco de dados a usar (TREINA, TESTE, PROD). Padrão: TREINA',
    required: false,
  })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela' })
  @ApiResponse({ status: 200, description: 'Relacionamentos retornados com sucesso' })
  async getTableRelationships(@Param('tableName') tableName: string, @Request() req) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.withDatabaseContext(req, () => this.mcpServer.getTableRelationships(tableName, codUsuario));
  }

  @Get('tables/:tableName/primary-keys')
  @ApiOperation({
    summary: 'Obter chaves primárias de uma tabela',
    description: 'Retorna as chaves primárias de uma tabela',
  })
  @ApiHeader({
    name: 'x-database',
    description: 'Banco de dados a usar (TREINA, TESTE, PROD). Padrão: TREINA',
    required: false,
  })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela' })
  @ApiResponse({ status: 200, description: 'Chaves primárias retornadas com sucesso' })
  async getTablePrimaryKeys(@Param('tableName') tableName: string, @Request() req) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.withDatabaseContext(req, () => this.mcpServer.getTablePrimaryKeys(tableName, codUsuario));
  }

  @Get('health')
  @ApiOperation({
    summary: 'Verificar saúde do servidor MCP',
    description: 'Retorna o status de saúde do servidor MCP',
  })
  @ApiResponse({ status: 200, description: 'Servidor saudável' })
  health() {
    return {
      status: 'healthy',
      version: '1.0.0',
      service: 'mcp-sqlserver-readonly',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('dictionary/tables')
  @ApiOperation({
    summary: 'Listar tabelas do dicionário de dados',
    description: 'Lista todas as tabelas do dicionário de dados Sankhya que o usuário tem acesso.',
  })
  @ApiHeader({ name: 'x-database', description: 'Banco (TREINA, TESTE, PROD). Padrão: TREINA', required: false })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de resultados' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset para paginação' })
  @ApiResponse({ status: 200, description: 'Lista de tabelas retornada com sucesso' })
  async dictionaryListTables(@Query() dto: McpDictionaryListDto, @Request() req) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.withDatabaseContext(req, () => this.mcpServer.dictionaryListTables(dto, codUsuario, req));
  }

  @Get('dictionary/tables/:tableName')
  @ApiOperation({
    summary: 'Obter detalhes de uma tabela do dicionário',
    description: 'Retorna informações detalhadas de uma tabela específica do dicionário de dados.',
  })
  @ApiHeader({ name: 'x-database', description: 'Banco (TREINA, TESTE, PROD). Padrão: TREINA', required: false })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela' })
  @ApiResponse({ status: 200, description: 'Detalhes da tabela retornados com sucesso' })
  async dictionaryGetTableDetails(@Param('tableName') tableName: string, @Request() req) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.withDatabaseContext(req, () => this.mcpServer.dictionaryGetTableDetails(tableName, codUsuario, req));
  }

  @Get('dictionary/tables/:tableName/fields')
  @ApiOperation({
    summary: 'Listar campos de uma tabela do dicionário',
    description: 'Retorna todos os campos de uma tabela do dicionário de dados.',
  })
  @ApiHeader({ name: 'x-database', description: 'Banco (TREINA, TESTE, PROD). Padrão: TREINA', required: false })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de campos' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset para paginação' })
  @ApiResponse({ status: 200, description: 'Lista de campos retornada com sucesso' })
  async dictionaryListFields(
    @Param('tableName') tableName: string,
    @Query() query: McpDictionaryFieldsQueryDto,
    @Request() req,
  ) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.withDatabaseContext(req, () =>
      this.mcpServer.dictionaryListFields({ ...query, tableName }, codUsuario, req),
    );
  }

  @Get('dictionary/tables/:tableName/fields/:fieldName')
  @ApiOperation({
    summary: 'Obter detalhes de um campo do dicionário',
    description: 'Retorna informações detalhadas de um campo específico do dicionário de dados.',
  })
  @ApiHeader({ name: 'x-database', description: 'Banco (TREINA, TESTE, PROD). Padrão: TREINA', required: false })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela' })
  @ApiParam({ name: 'fieldName', description: 'Nome do campo' })
  @ApiResponse({ status: 200, description: 'Detalhes do campo retornados com sucesso' })
  async dictionaryGetFieldDetails(
    @Param('tableName') tableName: string,
    @Param('fieldName') fieldName: string,
    @Request() req,
  ) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.withDatabaseContext(req, () =>
      this.mcpServer.dictionaryGetFieldDetails({ tableName, fieldName }, codUsuario, req),
    );
  }

  @Get('dictionary/tables/:tableName/fields/:fieldName/options')
  @ApiOperation({
    summary: 'Obter opções de um campo do dicionário',
    description: 'Retorna as opções/valores possíveis de um campo (tipos enumerados).',
  })
  @ApiHeader({ name: 'x-database', description: 'Banco (TREINA, TESTE, PROD). Padrão: TREINA', required: false })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela' })
  @ApiParam({ name: 'fieldName', description: 'Nome do campo' })
  @ApiResponse({ status: 200, description: 'Opções do campo retornadas com sucesso' })
  async dictionaryGetFieldOptions(
    @Param('tableName') tableName: string,
    @Param('fieldName') fieldName: string,
    @Request() req,
  ) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.withDatabaseContext(req, () =>
      this.mcpServer.dictionaryGetFieldOptions({ tableName, fieldName }, codUsuario, req),
    );
  }

  @Get('dictionary/tables/:tableName/fields/:fieldName/properties')
  @ApiOperation({
    summary: 'Obter propriedades de interface de um campo',
    description: 'Retorna as propriedades de interface (obrigatório, somente leitura, visível, etc.) de um campo.',
  })
  @ApiHeader({ name: 'x-database', description: 'Banco (TREINA, TESTE, PROD). Padrão: TREINA', required: false })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela' })
  @ApiParam({ name: 'fieldName', description: 'Nome do campo' })
  @ApiResponse({ status: 200, description: 'Propriedades do campo retornadas com sucesso' })
  async dictionaryGetFieldProperties(
    @Param('tableName') tableName: string,
    @Param('fieldName') fieldName: string,
    @Request() req,
  ) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.withDatabaseContext(req, () =>
      this.mcpServer.dictionaryGetFieldProperties({ tableName, fieldName }, codUsuario, req),
    );
  }

  @Get('dictionary/tables/:tableName/instances')
  @ApiOperation({
    summary: 'Obter instâncias de uma tabela do dicionário',
    description: 'Retorna as instâncias (agrupamentos lógicos) de uma tabela do dicionário.',
  })
  @ApiHeader({ name: 'x-database', description: 'Banco (TREINA, TESTE, PROD). Padrão: TREINA', required: false })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela' })
  @ApiResponse({ status: 200, description: 'Instâncias da tabela retornadas com sucesso' })
  async dictionaryGetTableInstances(@Param('tableName') tableName: string, @Request() req) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.withDatabaseContext(req, () => this.mcpServer.dictionaryGetTableInstances(tableName, codUsuario, req));
  }

  @Get('dictionary/tables/:tableName/relationships')
  @ApiOperation({
    summary: 'Obter relacionamentos de uma tabela do dicionário',
    description: 'Retorna os relacionamentos (foreign keys) de uma tabela no dicionário de dados.',
  })
  @ApiHeader({ name: 'x-database', description: 'Banco (TREINA, TESTE, PROD). Padrão: TREINA', required: false })
  @ApiParam({ name: 'tableName', description: 'Nome da tabela' })
  @ApiResponse({ status: 200, description: 'Relacionamentos da tabela retornados com sucesso' })
  async dictionaryGetTableRelationships(@Param('tableName') tableName: string, @Request() req) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.withDatabaseContext(req, () =>
      this.mcpServer.dictionaryGetTableRelationships(tableName, codUsuario, req),
    );
  }

  @Get('dictionary/tables/search')
  @ApiOperation({
    summary: 'Buscar tabelas no dicionário',
    description: 'Busca tabelas por nome ou descrição no dicionário de dados Sankhya.',
  })
  @ApiHeader({ name: 'x-database', description: 'Banco (TREINA, TESTE, PROD). Padrão: TREINA', required: false })
  @ApiQuery({ name: 'term', required: true, description: 'Termo de busca' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de resultados' })
  @ApiResponse({ status: 200, description: 'Resultados da busca retornados com sucesso' })
  async dictionarySearchTables(@Query() dto: McpDictionarySearchDto, @Request() req) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.withDatabaseContext(req, () => this.mcpServer.dictionarySearchTables(dto, codUsuario, req));
  }

  @Get('dictionary/fields/search')
  @ApiOperation({
    summary: 'Buscar campos no dicionário',
    description: 'Busca campos por nome ou descrição em todas as tabelas do dicionário.',
  })
  @ApiHeader({ name: 'x-database', description: 'Banco (TREINA, TESTE, PROD). Padrão: TREINA', required: false })
  @ApiQuery({ name: 'term', required: true, description: 'Termo de busca' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de resultados' })
  @ApiResponse({ status: 200, description: 'Resultados da busca retornados com sucesso' })
  async dictionarySearchFields(@Query() dto: McpDictionaryFieldSearchDto, @Request() req) {
    const codUsuario = req.user?.userId || req.user?.sub;
    return this.withDatabaseContext(req, () => this.mcpServer.dictionarySearchFields(dto, codUsuario, req));
  }
}
