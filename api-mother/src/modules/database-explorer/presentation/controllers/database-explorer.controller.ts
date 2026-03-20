/**
 * Controller: Database Explorer
 *
 * Endpoints para exploração do banco de dados.
 */
import { Controller, Get, Post, Query, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { StructuredLogger } from '../../../../common/logging/structured-logger.service';
import {
  ObterResumoDatabaseUseCase,
  ListarViewsUseCase,
  ObterDetalheViewUseCase,
  ListarTriggersUseCase,
  ObterDetalheTriggerUseCase,
  ListarProceduresUseCase,
  ObterDetalheProcedureUseCase,
  ListarRelacionamentosUseCase,
  LimparCacheUseCase,
  ObterEstatisticasCacheUseCase,
} from '../../application/use-cases';
import {
  PaginacaoQueryDto,
  ResumoDatabaseResponseDto,
  ViewResponseDto,
  ViewDetalheResponseDto,
  TriggerResponseDto,
  TriggerDetalheResponseDto,
  ProcedureResponseDto,
  ProcedureDetalheResponseDto,
  RelacionamentoResponseDto,
  EstatisticasCacheResponseDto,
} from '../dto';

@ApiTags('Database Explorer')
@ApiBearerAuth()
@SkipThrottle()
@UseGuards(AuthGuard('jwt'))
@Controller('database')
export class DatabaseExplorerController {
  constructor(
    private readonly obterResumoDatabaseUseCase: ObterResumoDatabaseUseCase,
    private readonly listarViewsUseCase: ListarViewsUseCase,
    private readonly obterDetalheViewUseCase: ObterDetalheViewUseCase,
    private readonly listarTriggersUseCase: ListarTriggersUseCase,
    private readonly obterDetalheTriggerUseCase: ObterDetalheTriggerUseCase,
    private readonly listarProceduresUseCase: ListarProceduresUseCase,
    private readonly obterDetalheProcedureUseCase: ObterDetalheProcedureUseCase,
    private readonly listarRelacionamentosUseCase: ListarRelacionamentosUseCase,
    private readonly limparCacheUseCase: LimparCacheUseCase,
    private readonly obterEstatisticasCacheUseCase: ObterEstatisticasCacheUseCase,
    private readonly logger: StructuredLogger,
  ) {}

  @Get('resumo')
  @ApiOperation({
    summary: 'Resumo do banco de dados',
    description:
      'Retorna estatísticas resumidas sobre o banco incluindo quantidade de tabelas, views, triggers, procedures e tamanho total',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumo obtido com sucesso',
    type: ResumoDatabaseResponseDto,
  })
  async obterResumo() {
    const inicio = Date.now();
    try {
      const resumo = await this.obterResumoDatabaseUseCase.executar();
      const tempoExecucao = Date.now() - inicio;

      this.logger.info('Resumo do banco obtido com sucesso');
      return {
        __payload: {
          totalTabelas: resumo.totalTabelas,
          totalViews: resumo.totalViews,
          totalTriggers: resumo.totalTriggers,
          totalProcedures: resumo.totalProcedures,
          tamanhoTotalMb: resumo.tamanhoTotalMb,
          tamanhoDadosMb: resumo.tamanhoDadosMb,
          tamanhoIndicesMb: resumo.tamanhoIndicesMb,
          tamanhoNaoUsadoMb: resumo.tamanhoNaoUsadoMb,
        },
        __meta: { executionTimeMs: tempoExecucao },
      };
    } catch (error) {
      this.logger.error('Falha ao obter resumo do banco', error as Error);
      throw new BadRequestException('Falha ao obter resumo do banco de dados');
    }
  }

  @Get('views')
  @ApiOperation({
    summary: 'Listar todas as views do banco',
    description:
      'Retorna uma lista paginada de todas as views (visões) do banco de dados com filtro opcional por schema',
  })
  @ApiQuery({ name: 'schema', required: false, description: 'Filtrar por nome do schema', example: 'SANKHYA' })
  @ApiQuery({ name: 'limite', required: false, description: 'Quantidade máxima de resultados', example: 100 })
  @ApiQuery({ name: 'offset', required: false, description: 'Número de registros a pular', example: 0 })
  @ApiQuery({ name: 'truncar', required: false, description: 'Truncar definições longas', example: false })
  @ApiQuery({ name: 'incluirDefinicao', required: false, description: 'Incluir código SQL', example: true })
  @ApiResponse({
    status: 200,
    description: 'Lista de views obtida com sucesso',
    type: [ViewResponseDto],
  })
  async listarViews(@Query() query: PaginacaoQueryDto) {
    const inicio = Date.now();
    try {
      const views = await this.listarViewsUseCase.executar({
        schema: query.schema,
        limite: query.limite,
        offset: query.offset,
        truncar: query.truncar,
        incluirDefinicao: query.incluirDefinicao,
      });
      const tempoExecucao = Date.now() - inicio;

      this.logger.info('Lista de views obtida', { count: views.length });
      return {
        __payload: views.map((v) => ({
          schema: v.schema,
          nome: v.nome,
          definicao: v.definicao,
        })),
        __meta: {
          count: views.length,
          limite: query.limite || 100,
          offset: query.offset || 0,
          executionTimeMs: tempoExecucao,
        },
      };
    } catch (error) {
      this.logger.error('Falha ao listar views', error as Error);
      throw new BadRequestException('Falha ao listar views');
    }
  }

  @Get('views/:schema/:nome')
  @ApiOperation({
    summary: 'Detalhes de uma view específica',
    description: 'Retorna informações detalhadas sobre uma view incluindo lista de colunas e definição SQL',
  })
  @ApiParam({ name: 'schema', description: 'Nome do schema', example: 'dbo' })
  @ApiParam({ name: 'nome', description: 'Nome da view', example: 'vw_Veiculos' })
  @ApiQuery({ name: 'truncar', required: false, description: 'Truncar definição longa', example: false })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da view obtidos com sucesso',
    type: ViewDetalheResponseDto,
  })
  async obterDetalheView(
    @Param('schema') schema: string,
    @Param('nome') nome: string,
    @Query('truncar') truncar?: boolean,
  ) {
    const inicio = Date.now();
    try {
      const detalhe = await this.obterDetalheViewUseCase.executar(schema, nome, truncar);
      const tempoExecucao = Date.now() - inicio;

      this.logger.info('Detalhe da view obtido', { schema, nome });
      return {
        __payload: {
          schema: detalhe.schema,
          nome: detalhe.nome,
          definicao: detalhe.definicao,
          colunas: detalhe.colunas.map((c) => ({
            nome: c.nome,
            tipo: c.tipo,
            nulo: c.nulo,
            posicao: c.posicao,
            tamanhoMaximo: c.tamanhoMaximo,
            precisao: c.precisao,
            escala: c.escala,
          })),
        },
        __meta: { executionTimeMs: tempoExecucao },
      };
    } catch (error) {
      this.logger.error('Falha ao obter detalhe da view', error as Error, { schema, nome });
      throw error instanceof BadRequestException ? error : new BadRequestException('Falha ao obter detalhe da view');
    }
  }

  @Get('triggers')
  @ApiOperation({
    summary: 'Listar todos os triggers do banco',
    description: 'Retorna uma lista paginada de todos os triggers do banco de dados com filtro opcional por schema',
  })
  @ApiQuery({ name: 'schema', required: false, description: 'Filtrar por nome do schema', example: 'SANKHYA' })
  @ApiQuery({ name: 'limite', required: false, description: 'Quantidade máxima de resultados', example: 100 })
  @ApiQuery({ name: 'offset', required: false, description: 'Número de registros a pular', example: 0 })
  @ApiQuery({ name: 'truncar', required: false, description: 'Truncar definições longas', example: false })
  @ApiQuery({ name: 'incluirDefinicao', required: false, description: 'Incluir código SQL', example: true })
  @ApiResponse({
    status: 200,
    description: 'Lista de triggers obtida com sucesso',
    type: [TriggerResponseDto],
  })
  async listarTriggers(@Query() query: PaginacaoQueryDto) {
    const inicio = Date.now();
    try {
      const triggers = await this.listarTriggersUseCase.executar({
        schema: query.schema,
        limite: query.limite,
        offset: query.offset,
        truncar: query.truncar,
        incluirDefinicao: query.incluirDefinicao,
      });
      const tempoExecucao = Date.now() - inicio;

      this.logger.info('Lista de triggers obtida', { count: triggers.length });
      return {
        __payload: triggers.map((t) => ({
          schema: t.schema,
          nome: t.nome,
          tabela: t.tabela,
          tipoDescricao: t.tipoDescricao,
          desabilitado: t.desabilitado,
          definicao: t.definicao,
        })),
        __meta: {
          count: triggers.length,
          limite: query.limite || 100,
          offset: query.offset || 0,
          executionTimeMs: tempoExecucao,
        },
      };
    } catch (error) {
      this.logger.error('Falha ao listar triggers', error as Error);
      throw new BadRequestException('Falha ao listar triggers');
    }
  }

  @Get('triggers/:schema/:nome')
  @ApiOperation({
    summary: 'Detalhes de um trigger específico',
    description: 'Retorna informações detalhadas sobre um trigger incluindo eventos que o disparam e definição SQL',
  })
  @ApiParam({ name: 'schema', description: 'Nome do schema', example: 'dbo' })
  @ApiParam({ name: 'nome', description: 'Nome do trigger', example: 'tr_Audit_Veiculo' })
  @ApiQuery({ name: 'truncar', required: false, description: 'Truncar definição longa', example: false })
  @ApiResponse({
    status: 200,
    description: 'Detalhes do trigger obtidos com sucesso',
    type: TriggerDetalheResponseDto,
  })
  async obterDetalheTrigger(
    @Param('schema') schema: string,
    @Param('nome') nome: string,
    @Query('truncar') truncar?: boolean,
  ) {
    const inicio = Date.now();
    try {
      const detalhe = await this.obterDetalheTriggerUseCase.executar(schema, nome, truncar);
      const tempoExecucao = Date.now() - inicio;

      this.logger.info('Detalhe do trigger obtido', { schema, nome });
      return {
        __payload: {
          schema: detalhe.schema,
          nome: detalhe.nome,
          tabela: detalhe.tabela,
          tipoDescricao: detalhe.tipoDescricao,
          desabilitado: detalhe.desabilitado,
          definicao: detalhe.definicao,
          eventos: detalhe.eventos,
        },
        __meta: { executionTimeMs: tempoExecucao },
      };
    } catch (error) {
      this.logger.error('Falha ao obter detalhe do trigger', error as Error, { schema, nome });
      throw error instanceof BadRequestException ? error : new BadRequestException('Falha ao obter detalhe do trigger');
    }
  }

  @Get('procedures')
  @ApiOperation({
    summary: 'Listar todas as stored procedures',
    description:
      'Retorna uma lista paginada de todas as stored procedures do banco de dados com filtro opcional por schema',
  })
  @ApiQuery({ name: 'schema', required: false, description: 'Filtrar por nome do schema', example: 'SANKHYA' })
  @ApiQuery({ name: 'limite', required: false, description: 'Quantidade máxima de resultados', example: 100 })
  @ApiQuery({ name: 'offset', required: false, description: 'Número de registros a pular', example: 0 })
  @ApiQuery({ name: 'truncar', required: false, description: 'Truncar definições longas', example: false })
  @ApiQuery({ name: 'incluirDefinicao', required: false, description: 'Incluir código SQL', example: true })
  @ApiResponse({
    status: 200,
    description: 'Lista de procedures obtida com sucesso',
    type: [ProcedureResponseDto],
  })
  async listarProcedures(@Query() query: PaginacaoQueryDto) {
    const inicio = Date.now();
    try {
      const procedures = await this.listarProceduresUseCase.executar({
        schema: query.schema,
        limite: query.limite,
        offset: query.offset,
        truncar: query.truncar,
        incluirDefinicao: query.incluirDefinicao,
      });
      const tempoExecucao = Date.now() - inicio;

      this.logger.info('Lista de procedures obtida', { count: procedures.length });
      return {
        __payload: procedures.map((p) => ({
          schema: p.schema,
          nome: p.nome,
          tipoDescricao: p.tipoDescricao,
          dataCriacao: p.dataCriacao,
          dataModificacao: p.dataModificacao,
          definicao: p.definicao,
        })),
        __meta: {
          count: procedures.length,
          limite: query.limite || 100,
          offset: query.offset || 0,
          executionTimeMs: tempoExecucao,
        },
      };
    } catch (error) {
      this.logger.error('Falha ao listar procedures', error as Error);
      throw new BadRequestException('Falha ao listar procedures');
    }
  }

  @Get('procedures/:schema/:nome')
  @ApiOperation({
    summary: 'Detalhes de uma stored procedure específica',
    description: 'Retorna informações detalhadas sobre uma stored procedure incluindo parâmetros e definição SQL',
  })
  @ApiParam({ name: 'schema', description: 'Nome do schema', example: 'dbo' })
  @ApiParam({ name: 'nome', description: 'Nome da procedure', example: 'sp_BuscarVeiculo' })
  @ApiQuery({ name: 'truncar', required: false, description: 'Truncar definição longa', example: false })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da procedure obtidos com sucesso',
    type: ProcedureDetalheResponseDto,
  })
  async obterDetalheProcedure(
    @Param('schema') schema: string,
    @Param('nome') nome: string,
    @Query('truncar') truncar?: boolean,
  ) {
    const inicio = Date.now();
    try {
      const detalhe = await this.obterDetalheProcedureUseCase.executar(schema, nome, truncar);
      const tempoExecucao = Date.now() - inicio;

      this.logger.info('Detalhe da procedure obtido', { schema, nome });
      return {
        __payload: {
          schema: detalhe.schema,
          nome: detalhe.nome,
          tipoDescricao: detalhe.tipoDescricao,
          dataCriacao: detalhe.dataCriacao,
          dataModificacao: detalhe.dataModificacao,
          definicao: detalhe.definicao,
          parametros: detalhe.parametros.map((p) => ({
            nome: p.nome,
            tipo: p.tipo,
            tamanhoMaximo: p.tamanhoMaximo,
            precisao: p.precisao,
            escala: p.escala,
            saida: p.saida,
          })),
        },
        __meta: { executionTimeMs: tempoExecucao },
      };
    } catch (error) {
      this.logger.error('Falha ao obter detalhe da procedure', error as Error, { schema, nome });
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException('Falha ao obter detalhe da procedure');
    }
  }

  @Get('relacionamentos')
  @ApiOperation({
    summary: 'Listar todos os relacionamentos (chaves estrangeiras)',
    description:
      'Retorna uma lista paginada de todos os relacionamentos de chave estrangeira entre tabelas do banco de dados',
  })
  @ApiQuery({ name: 'schema', required: false, description: 'Filtrar por nome do schema', example: 'SANKHYA' })
  @ApiQuery({ name: 'limite', required: false, description: 'Quantidade máxima de resultados', example: 100 })
  @ApiQuery({ name: 'offset', required: false, description: 'Número de registros a pular', example: 0 })
  @ApiResponse({
    status: 200,
    description: 'Lista de relacionamentos obtida com sucesso',
    type: [RelacionamentoResponseDto],
  })
  async listarRelacionamentos(@Query() query: PaginacaoQueryDto) {
    const inicio = Date.now();
    try {
      const relacionamentos = await this.listarRelacionamentosUseCase.executar({
        schema: query.schema,
        limite: query.limite,
        offset: query.offset,
      });
      const tempoExecucao = Date.now() - inicio;

      this.logger.info('Lista de relacionamentos obtida', { count: relacionamentos.length });
      return {
        __payload: relacionamentos.map((r) => ({
          nomeConstraint: r.nomeConstraint,
          schemaPai: r.schemaPai,
          tabelaPai: r.tabelaPai,
          colunaPai: r.colunaPai,
          schemaReferenciado: r.schemaReferenciado,
          tabelaReferenciada: r.tabelaReferenciada,
          colunaReferenciada: r.colunaReferenciada,
          regraDelete: r.regraDelete,
          regraUpdate: r.regraUpdate,
        })),
        __meta: {
          count: relacionamentos.length,
          limite: query.limite || 100,
          offset: query.offset || 0,
          executionTimeMs: tempoExecucao,
        },
      };
    } catch (error) {
      this.logger.error('Falha ao listar relacionamentos', error as Error);
      throw new BadRequestException('Falha ao listar relacionamentos');
    }
  }

  @Post('cache/limpar')
  @ApiOperation({
    summary: 'Limpar cache',
    description: 'Limpa todos os dados em cache do serviço de exploração do banco de dados',
  })
  @ApiResponse({
    status: 200,
    description: 'Cache limpo com sucesso',
  })
  async limparCache() {
    try {
      await this.limparCacheUseCase.executar();
      this.logger.info('Cache limpo com sucesso');
      return { mensagem: 'Cache limpo com sucesso' };
    } catch (error) {
      this.logger.error('Falha ao limpar cache', error as Error);
      throw new BadRequestException('Falha ao limpar cache');
    }
  }

  @Get('cache/estatisticas')
  @ApiOperation({
    summary: 'Estatísticas do cache',
    description: 'Retorna estatísticas sobre o cache incluindo taxa de acerto e uso de memória',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas do cache obtidas com sucesso',
    type: EstatisticasCacheResponseDto,
  })
  async obterEstatisticasCache() {
    try {
      const stats = await this.obterEstatisticasCacheUseCase.executar();
      this.logger.info('Estatísticas do cache obtidas', stats.obterResumo());
      return {
        acertos: stats.acertos,
        erros: stats.erros,
        chaves: stats.chaves,
        tamanhoChaves: stats.tamanhoChaves,
        tamanhoValores: stats.tamanhoValores,
        taxaAcerto: stats.obterTaxaAcerto(),
        tamanhoFormatado: stats.obterTamanhoFormatado(),
      };
    } catch (error) {
      this.logger.error('Falha ao obter estatísticas do cache', error as Error);
      throw new BadRequestException('Falha ao obter estatísticas do cache');
    }
  }
}
