/**
 * Controller: Inspection
 *
 * Endpoints para inspeção do banco de dados.
 */
import { Controller, Get, Post, Param, Body, UseGuards, BadRequestException, HttpException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { StructuredLogger } from '../../../../common/logging/structured-logger.service';
import { DatabaseWriteGuard } from '../../../../security/database-write.guard';
import {
  ListarTabelasUseCase,
  ObterSchemaTabelaUseCase,
  ObterRelacoesTabelaUseCase,
  ObterChavesPrimariasUseCase,
  ExecutarQueryUseCase,
} from '../../application/use-cases';
import {
  QueryRequestDto,
  ListaTabelasResponseDto,
  ColunaTabelaResponseDto,
  RelacoesResponseDto,
  ChavesPrimariasResponseDto,
  ResultadoQueryResponseDto,
  ApiResponseWrapperDto,
} from '../dto';

@ApiTags('Inspection')
@ApiBearerAuth()
@SkipThrottle()
@UseGuards(AuthGuard('jwt'))
@Controller('inspection')
export class InspectionController {
  constructor(
    private readonly listarTabelasUseCase: ListarTabelasUseCase,
    private readonly obterSchemaTabelaUseCase: ObterSchemaTabelaUseCase,
    private readonly obterRelacoesTabelaUseCase: ObterRelacoesTabelaUseCase,
    private readonly obterChavesPrimariasUseCase: ObterChavesPrimariasUseCase,
    private readonly executarQueryUseCase: ExecutarQueryUseCase,
    private readonly logger: StructuredLogger,
  ) {}

  @Get('tabelas')
  @ApiOperation({
    summary: 'Listar todas as tabelas do banco',
    description: 'Retorna uma lista de todas as tabelas disponíveis no banco de dados',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tabelas obtida com sucesso',
    type: ListaTabelasResponseDto,
  })
  async listarTabelas(): Promise<ApiResponseWrapperDto<ListaTabelasResponseDto>> {
    const inicio = Date.now();
    try {
      const resultado = await this.listarTabelasUseCase.executar();
      const tempoExecucao = Date.now() - inicio;

      this.logger.info('Lista de tabelas obtida com sucesso', { total: resultado.total });
      return {
        sucesso: true,
        dados: {
          tabelas: resultado.tabelas.map((t) => ({
            nome: t.nome,
            tipo: t.tipo,
          })),
          total: resultado.total,
        },
        tempoExecucao,
      };
    } catch (error) {
      this.logger.error('Falha ao listar tabelas', error as Error);
      throw new BadRequestException('Falha ao listar tabelas');
    }
  }

  @Get('tabelas/:nomeTabela/schema')
  @ApiOperation({
    summary: 'Obter schema de uma tabela',
    description:
      'Retorna informações detalhadas sobre as colunas de uma tabela incluindo tipos de dados, nullabilidade e constraints',
  })
  @ApiParam({
    name: 'nomeTabela',
    description: 'Nome da tabela a inspecionar',
    example: 'TGFVEI',
  })
  @ApiResponse({
    status: 200,
    description: 'Schema da tabela obtido com sucesso',
    type: [ColunaTabelaResponseDto],
  })
  async obterSchemaTabela(
    @Param('nomeTabela') nomeTabela: string,
  ): Promise<ApiResponseWrapperDto<ColunaTabelaResponseDto[]>> {
    const inicio = Date.now();
    try {
      const colunas = await this.obterSchemaTabelaUseCase.executar(nomeTabela);
      const tempoExecucao = Date.now() - inicio;

      this.logger.info('Schema da tabela obtido', { nomeTabela, totalColunas: colunas.length });
      return {
        sucesso: true,
        dados: colunas.map((c) => ({
          nome: c.nome,
          tipo: c.tipo,
          nulo: c.nulo,
          posicao: c.posicao,
          tamanhoMaximo: c.tamanhoMaximo || undefined,
          precisao: c.precisao || undefined,
          escala: c.escala || undefined,
          tipoFormatado: c.obterTipoFormatado(),
        })),
        tempoExecucao,
      };
    } catch (error) {
      this.logger.error('Falha ao obter schema da tabela', error as Error, { nomeTabela });
      throw new BadRequestException('Falha ao obter schema da tabela');
    }
  }

  @Get('tabelas/:nomeTabela/relacoes')
  @ApiOperation({
    summary: 'Obter relacionamentos de uma tabela',
    description: 'Retorna todos os relacionamentos de chave estrangeira de uma tabela',
  })
  @ApiParam({
    name: 'nomeTabela',
    description: 'Nome da tabela para obter relações',
    example: 'TGFVEI',
  })
  @ApiResponse({
    status: 200,
    description: 'Relações da tabela obtidas com sucesso',
    type: RelacoesResponseDto,
  })
  async obterRelacoes(@Param('nomeTabela') nomeTabela: string): Promise<ApiResponseWrapperDto<RelacoesResponseDto>> {
    const inicio = Date.now();
    try {
      const resultado = await this.obterRelacoesTabelaUseCase.executar(nomeTabela);
      const tempoExecucao = Date.now() - inicio;

      this.logger.info('Relações da tabela obtidas', { nomeTabela, totalRelacoes: resultado.total });
      return {
        sucesso: true,
        dados: {
          nomeTabela: resultado.nomeTabela,
          relacoes: resultado.relacoes.map((r) => ({
            nomeForeignKey: r.nomeForeignKey,
            tabelaPai: r.tabelaPai,
            colunaPai: r.colunaPai,
            tabelaReferenciada: r.tabelaReferenciada,
            colunaReferenciada: r.colunaReferenciada,
            acaoDelete: r.acaoDelete,
            acaoUpdate: r.acaoUpdate,
          })),
          total: resultado.total,
        },
        tempoExecucao,
      };
    } catch (error) {
      this.logger.error('Falha ao obter relações da tabela', error as Error, { nomeTabela });
      throw new BadRequestException('Falha ao obter relações da tabela');
    }
  }

  @Get('tabelas/:nomeTabela/chaves-primarias')
  @ApiOperation({
    summary: 'Obter chaves primárias de uma tabela',
    description: 'Retorna todas as chaves primárias constraints de uma tabela',
  })
  @ApiParam({
    name: 'nomeTabela',
    description: 'Nome da tabela para obter chaves primárias',
    example: 'TGFVEI',
  })
  @ApiResponse({
    status: 200,
    description: 'Chaves primárias obtidas com sucesso',
    type: ChavesPrimariasResponseDto,
  })
  async obterChavesPrimarias(
    @Param('nomeTabela') nomeTabela: string,
  ): Promise<ApiResponseWrapperDto<ChavesPrimariasResponseDto>> {
    const inicio = Date.now();
    try {
      const resultado = await this.obterChavesPrimariasUseCase.executar(nomeTabela);
      const tempoExecucao = Date.now() - inicio;

      this.logger.info('Chaves primárias obtidas', { nomeTabela, totalChaves: resultado.total });
      return {
        sucesso: true,
        dados: {
          nomeTabela: resultado.nomeTabela,
          chaves: resultado.chaves.map((c) => ({
            tabela: c.tabela,
            coluna: c.coluna,
            nomeConstraint: c.nomeConstraint,
          })),
          total: resultado.total,
        },
        tempoExecucao,
      };
    } catch (error) {
      this.logger.error('Falha ao obter chaves primárias', error as Error, { nomeTabela });
      throw new BadRequestException('Falha ao obter chaves primárias');
    }
  }

  @Post('query')
  @UseGuards(DatabaseWriteGuard)
  @ApiOperation({
    summary: 'Executar query SQL',
    description: 'Executa uma query SQL de leitura (apenas SELECT) no banco de dados',
  })
  @ApiBody({ type: QueryRequestDto })
  @ApiResponse({ status: 200, description: 'Query executada com sucesso', type: ResultadoQueryResponseDto })
  @ApiResponse({ status: 400, description: 'Query inválida ou falha na execução' })
  @ApiResponse({ status: 403, description: 'Query bloqueada por política de segurança' })
  async executarQuery(@Body() body: QueryRequestDto): Promise<ApiResponseWrapperDto<ResultadoQueryResponseDto>> {
    try {
      if (!body?.query?.trim()) {
        this.logger.warn('Query vazia ou ausente na requisição');
        throw new BadRequestException('Query é obrigatória');
      }

      const resultado = await this.executarQueryUseCase.executar({
        query: body.query,
        params: body.params || [],
      });

      this.logger.info('Query executada com sucesso', { rowCount: resultado.quantidadeLinhas });
      return {
        sucesso: true,
        dados: {
          query: resultado.query,
          parametros: resultado.parametros,
          dados: resultado.dados,
          quantidadeLinhas: resultado.quantidadeLinhas,
          tempoExecucao: resultado.tempoExecucao || undefined,
        },
        tempoExecucao: resultado.tempoExecucao || undefined,
      };
    } catch (error: unknown) {
      // Re-throw HTTP exceptions (incluindo ForbiddenException de segurança)
      if (error instanceof HttpException) {
        throw error;
      }

      const err = error as Error & { message?: string };
      this.logger.error('Falha na execução da query', error as Error, {
        query: body?.query,
        paramCount: body?.params?.length ?? 0,
        errorMessage: err?.message,
      });
      throw new BadRequestException({
        message: 'Falha na execução da query',
        details: err?.message || 'Erro desconhecido',
      });
    }
  }
}
