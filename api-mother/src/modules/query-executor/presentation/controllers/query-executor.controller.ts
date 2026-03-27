import { Controller, Post, Body, HttpCode, HttpStatus, Logger, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExecutarQueryUseCase } from '../../application/use-cases';
import { QueryRequestDto, QueryResponseDto } from '../dto';

/**
 * Controller para execução de queries SQL SELECT
 */
@ApiTags('Query Executor')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('query-executor')
export class QueryExecutorController {
  private readonly logger = new Logger(QueryExecutorController.name);

  constructor(private readonly executarQueryUseCase: ExecutarQueryUseCase) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Executa query SQL SELECT',
    description:
      'Executa uma query SELECT no banco de dados. ' +
      'IMPORTANTE: Apenas queries SELECT são permitidas por motivos de segurança. ' +
      'Comandos como INSERT, UPDATE, DELETE, DROP, etc são bloqueados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Query executada com sucesso',
    type: QueryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Query inválida ou contém comandos não permitidos',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro ao executar query',
  })
  async executarQuery(@Body() dto: QueryRequestDto) {
    this.logger.log(`Recebida requisição para executar query`);

    const resultado = await this.executarQueryUseCase.executar({
      query: dto.query,
      database: dto.database,
      maxRows: dto.maxRows,
    });

    return {
      __payload: resultado.obterLinhas(),
      __meta: {
        rows: resultado.obterQuantidadeLinhas(),
        executionTimeMs: resultado.obterTempoExecucao(),
        columns: resultado.obterColunas(),
        hasResults: resultado.possuiResultados(),
      },
    };
  }
}
