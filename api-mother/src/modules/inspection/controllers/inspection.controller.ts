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
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { InspectionService } from '../services/inspection.service';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';
import { QueryRequestDto } from '../dto/query.dto';
import { DatabaseWriteGuard } from '../../../security/database-write.guard';
import { TableWritePermissionGuard } from '../../../security/table-write-permission.guard';

@ApiTags('Inspeção do Banco')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('inspection')
export class InspectionController {
  constructor(
    private readonly inspectionService: InspectionService,
    private readonly logger: StructuredLogger,
  ) {}

  @Get('tables')
  @ApiOperation({
    summary: 'Listar todas as tabelas do banco de dados',
    description: `
# 🗄️ Lista de Tabelas do Banco

Este endpoint retorna a lista de **todas as tabelas físicas** existentes no banco de dados conectado.

## Diferença entre "Inspection" e "Dicionário de Dados":

| Inspection | Dicionário de Dados |
|------------|---------------------|
| Estrutura real do banco | Metadados do Sankhya |
| Tablespaces, índices, constraints | Campos, tipos, relacionamentos |
| Para DBAs e infraestrutura | Para desenvolvedores e analistas |

## Observação:
Este endpoint lista **todas** as tabelas do banco, incluindo tabelas de sistema, tabelas do fluxo de trabalho (Activiti), e tabelas customizadas.

Consulte o **Dicionário de Dados** (/dictionary) para uma visão mais amigável e documentada das tabelas do Sankhya.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tabelas retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        tables: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              TABLE_NAME: { type: 'string', description: 'Nome da tabela' },
              TABLE_TYPE: { type: 'string', description: 'Tipo (BASE TABLE, VIEW, etc.)' },
            },
          },
        },
        totalTables: { type: 'number', description: 'Total de tabelas' },
      },
    },
  })
  async getTables() {
    try {
      const result = await this.inspectionService.getTables();
      this.logger.info('Tables list retrieved successfully');
      return result;
    } catch (error) {
      this.logger.error('Failed to retrieve tables list', error as Error);
      throw new BadRequestException('Failed to retrieve tables list');
    }
  }

  @Get('table-schema')
  @ApiOperation({
    summary: 'Obter estrutura/colunas de uma tabela',
    description: `
# 📊 Estrutura de uma Tabela

Este endpoint retorna a **estrutura real** de uma tabela no banco de dados, incluindo:

| Informação | Descrição |
|------------|-----------|
| COLUMN_NAME | Nome da coluna |
| DATA_TYPE | Tipo de dados SQL |
| IS_NULLABLE | Se aceita valores nulos (YES/NO) |
| ORDINAL_POSITION | Posição da coluna |
| COLUMN_DEFAULT | Valor padrão (se houver) |

## Diferença do Dicionário de Dados:

O Dicionário de Dados mostra os **metadados de negócio** (DESCRCAMPO, TIPOCAMPO, etc.)
Este endpoint mostra a **estrutura técnica real** do banco (DATA_TYPE, IS_NULLABLE, etc.)

## Exemplo de uso:
Útil para:
- Validar tipos de dados em integrações
- Escrever queries com CAST/CONVERT corretos
- Entender a estrutura real das tabelas
    `,
  })
  @ApiQuery({
    name: 'tableName',
    required: true,
    description: 'Nome da tabela a ser inspecionada',
    example: 'TFPFUN',
  })
  @ApiResponse({
    status: 200,
    description: 'Estrutura da tabela retornada com sucesso',
  })
  @ApiResponse({
    status: 403,
    description: 'Você não tem permissão para acessar esta tabela',
  })
  async getTableSchema(@Query('tableName') tableName: string) {
    try {
      const result = await this.inspectionService.getTableSchema(tableName);
      this.logger.info('Table schema retrieved', { tableName });
      return result;
    } catch (error) {
      this.logger.error('Failed to retrieve table schema', error as Error, { tableName });
      throw new BadRequestException('Failed to retrieve table schema');
    }
  }

  @Get('table-relations')
  @ApiOperation({
    summary: 'Obter relacionamentos de chaves estrangeiras',
    description: `
# 🔗 Relacionamentos (Foreign Keys)

Este endpoint retorna os **relacionamentos de chave estrangeira** de uma tabela, ou seja, quais tabelas ela referencia e quais a referenciam.

## O que você encontra:

| Campo | Descrição |
|-------|-----------|
| ForeignKeyName | Nome da constraint de FK |
| ParentTable | Tabela que contém a FK |
| ParentColumn | Coluna que é FK |
| ReferencedTable | Tabela referenciada |
| ReferencedColumn | Coluna referenciada |
| DeleteAction | Ação ao deletar (NO_ACTION, CASCADE, etc.) |

## Exemplo prático:
Se TGFPAR.CODEND referencia TGFEND.CODEND, você verá:
- ParentTable: TGFPAR
- ParentColumn: CODEND
- ReferencedTable: TGFEND
- ReferencedColumn: CODEND
    `,
  })
  @ApiQuery({
    name: 'tableName',
    required: true,
    description: 'Nome da tabela para obter relacionamentos',
    example: 'TFPFUN',
  })
  @ApiResponse({
    status: 200,
    description: 'Relacionamentos da tabela retornados com sucesso',
  })
  async getTableRelations(@Query('tableName') tableName: string) {
    try {
      const result = await this.inspectionService.getTableRelations(tableName);
      this.logger.info('Table relations retrieved', { tableName });
      return result;
    } catch (error) {
      this.logger.error('Failed to retrieve table relations', error as Error, { tableName });
      throw new BadRequestException('Failed to retrieve table relations');
    }
  }

  @Get('primary-keys/:tableName')
  @ApiOperation({
    summary: 'Obter chaves primárias de uma tabela',
    description: `
# 🔑 Chaves Primárias

Este endpoint retorna as **chaves primárias** de uma tabela, ou seja, as colunas que identificam exclusivamente cada registro.

## O que você encontra:

| Campo | Descrição |
|-------|-----------|
| TABLE_NAME | Nome da tabela |
| COLUMN_NAME | Nome da coluna que faz parte da PK |
| CONSTRAINT_NAME | Nome da constraint de PK |

## Exemplo:
Para TGFPAR, você verá:
- COLUMN_NAME: CODPARC
- CONSTRAINT_NAME: PK_TGFPAR

## Uso comum:
- Validar uniqueness em integrações
- Entender a chave natural vs. surrogate key
- Escrever JOINs corretos
    `,
  })
  @ApiParam({
    name: 'tableName',
    description: 'Nome da tabela para obter chaves primárias',
    example: 'TFPFUN',
  })
  @ApiResponse({
    status: 200,
    description: 'Chaves primárias retornadas com sucesso',
  })
  async getPrimaryKeys(@Param('tableName') tableName: string) {
    try {
      const result = await this.inspectionService.getPrimaryKeys(tableName);
      this.logger.info('Primary keys retrieved', { tableName });
      return result;
    } catch (error) {
      this.logger.error('Failed to retrieve primary keys', error as Error, { tableName });
      throw new BadRequestException('Failed to retrieve primary keys');
    }
  }

  @Post('query')
  @UseGuards(DatabaseWriteGuard, TableWritePermissionGuard)
  @ApiOperation({
    summary: 'Executar query SQL',
    description: `
# ⚡ Executar Queries SQL

Este endpoint permite executar **queries SQL diretamente** no banco de dados Sankhya.

## ⚠️ Segurança e Permissões:

| Tipo de Operação | Permissão Necessária |
|-----------------|---------------------|
| SELECT (leitura) | Acesso à tabela no dicionário |
| INSERT (criação) | Permissão INSERIR na tabela |
| UPDATE (edição) | Permissão ALTERAR na tabela |
| DELETE (exclusão) | Permissão EXCLUIR na tabela |

## Parâmetros:

\`\`\`json
{
  "query": "SELECT * FROM TGFPAR WHERE CODPARC = ?",
  "params": [1000]
}
\`\`\`

## Datas no Sankhya (Oracle):
O Sankhya usa formato de data Oracle. Sempre use:

\`\`\`sql
WHERE DTREF >= TO_DATE('2025-01-01', 'YYYY-MM-DD')
WHERE DTINS >=5-01- TO_DATE('20201 10:30:00', 'YYYY-MM-DD HH24:MI:SS')
\`\`\`

## 📝 Boas Práticas:
1. Use sempre \`?\` para parâmetros (previne SQL Injection)
2. Limite resultados com \`ROWNUM\` ou \`TOP\`
3. Prefira SELECTs a operações de escrita
4. Consulte o Dicionário de Dados antes de escrever queries
    `,
  })
  @ApiHeader({
    name: 'x-boss-approval',
    description: 'Token de aprovação boss para operações de escrita em tabelas protegidas em ambiente PROD',
    required: false,
    example: 'boss-approval-token-here',
  })
  @ApiBody({ type: QueryRequestDto })
  @ApiResponse({ status: 200, description: 'Query executada com sucesso' })
  @ApiResponse({ status: 400, description: 'Query inválida ou falha na execução' })
  @ApiResponse({ status: 403, description: 'Query bloqueada por política de segurança ou permissões de tabela' })
  async executeQuery(@Body() body: QueryRequestDto) {
    try {
      if (!body?.query?.trim()) {
        this.logger.warn('Query is missing or empty in request');
        throw new BadRequestException('Query is required');
      }

      const result = await this.inspectionService.executeQuery(body);
      this.logger.info('Query executed successfully', { rowCount: result?.rowCount });
      return {
        __payload: result.data,
        __meta: { rows: result.rowCount ?? (result.data?.length ?? 0) },
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        const errorResponse = error.getResponse();
        if (typeof errorResponse === 'object' && 'analysis' in errorResponse) {
          throw error;
        }

        throw new BadRequestException({
          ...(typeof errorResponse === 'object' ? errorResponse : { message: errorResponse }),
          queryComErro: body?.query,
          ajuda:
            'Verifique a sintaxe da sua query. Use o endpoint GET /inspection/tables para ver tabelas disponíveis.',
        });
      }

      this.logger.error('Query execution failed', error as Error, {
        query: body?.query,
        paramCount: body?.params?.length ?? 0,
        errorMessage: error?.message,
      });

      throw new BadRequestException({
        erro: 'Falha na execução da query',
        mensagem: error?.message || 'Erro desconhecido ao executar query',
        queryComErro: body?.query,
        sugestoes: [
          'Verifique se a sintaxe SQL está correta',
          'Confirme se todas as tabelas e colunas existem',
          'Use formato TO_DATE() para datas no Oracle/Sankhya',
          'Consulte o dicionário de dados via GET /dictionary/tables',
        ],
        exemploFormatoData: "WHERE DTREF >= TO_DATE('2025-11-04', 'YYYY-MM-DD')",
        documentacao: 'https://docs.sankhya.com.br',
      });
    }
  }
}
