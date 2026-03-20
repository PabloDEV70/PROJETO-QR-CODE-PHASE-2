/**
 * CachePermissoesController - Controller para gerenciamento de cache.
 *
 * Expoe endpoints para:
 * - Consulta de metricas
 * - Invalidacao de cache
 * - Configuracao de jobs
 * - Monitoramento de saude
 *
 * @module M6 - Cache de Permissoes
 */

import { Controller, Get, Post, Delete, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CacheInvalidationService } from '../../application/services/cache-invalidation.service';
import { CacheMetricsService } from '../../application/services/cache-metrics.service';
import { LimparCacheJob } from '../../jobs/limpar-cache.job';
import { MonitorarInvalidacaoJob } from '../../jobs/monitorar-invalidacao.job';
import {
  InvalidarCacheUsuarioDto,
  InvalidarCacheTelaDto,
  InvalidarCacheGrupoDto,
  InvalidarCacheGlobalDto,
  AtualizarConfigLimpezaDto,
  MetricasCacheRespostaDto,
  ResultadoInvalidacaoRespostaDto,
  SaudeCacheRespostaDto,
  TendenciasCacheRespostaDto,
  ConfiguracaoLimpezaRespostaDto,
  ResultadoLimpezaRespostaDto,
  EstatisticasMonitoramentoRespostaDto,
} from '../dto/cache-permissoes.dto';

@ApiTags('Cache Permissoes')
@ApiBearerAuth('JWT-auth')
@Controller('cache-permissoes')
@UseGuards(AuthGuard('jwt'))
export class CachePermissoesController {
  constructor(
    private readonly cacheInvalidationService: CacheInvalidationService,
    private readonly cacheMetricsService: CacheMetricsService,
    private readonly limparCacheJob: LimparCacheJob,
    private readonly monitorarInvalidacaoJob: MonitorarInvalidacaoJob,
  ) {}

  // ==================== METRICAS ====================

  @Get('metricas')
  @ApiOperation({ summary: 'Obter metricas completas do cache' })
  @ApiResponse({ status: 200, type: MetricasCacheRespostaDto })
  async obterMetricas(): Promise<MetricasCacheRespostaDto> {
    return this.cacheMetricsService.obterMetricasCompletas();
  }

  @Get('metricas/simplificadas')
  @ApiOperation({ summary: 'Obter metricas simplificadas (hit/miss)' })
  @ApiResponse({ status: 200 })
  async obterMetricasSimplificadas(): Promise<{
    taxaHit: number;
    taxaMiss: number;
    totalRequisicoes: number;
    tamanhoCache: number;
  }> {
    return this.cacheMetricsService.obterMetricasSimplificadas();
  }

  @Get('saude')
  @ApiOperation({ summary: 'Verificar saude do cache' })
  @ApiResponse({ status: 200, type: SaudeCacheRespostaDto })
  async verificarSaude(): Promise<SaudeCacheRespostaDto> {
    return this.cacheMetricsService.verificarSaude();
  }

  @Get('tendencias')
  @ApiOperation({ summary: 'Obter tendencias de hit rate' })
  @ApiResponse({ status: 200, type: TendenciasCacheRespostaDto })
  async obterTendencias(): Promise<TendenciasCacheRespostaDto> {
    return this.cacheMetricsService.calcularTendencias();
  }

  // ==================== INVALIDACAO ====================

  @Post('invalidar/usuario')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invalidar cache de um usuario' })
  @ApiResponse({ status: 200, type: ResultadoInvalidacaoRespostaDto })
  async invalidarPorUsuario(@Body() dto: InvalidarCacheUsuarioDto): Promise<ResultadoInvalidacaoRespostaDto> {
    return this.cacheInvalidationService.invalidarPorUsuario(dto.codUsuario, dto.motivo);
  }

  @Post('invalidar/tela')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invalidar cache de uma tela' })
  @ApiResponse({ status: 200, type: ResultadoInvalidacaoRespostaDto })
  async invalidarPorTela(@Body() dto: InvalidarCacheTelaDto): Promise<ResultadoInvalidacaoRespostaDto> {
    return this.cacheInvalidationService.invalidarPorTela(dto.codTela, dto.motivo);
  }

  @Post('invalidar/grupo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invalidar cache de um grupo' })
  @ApiResponse({ status: 200, type: ResultadoInvalidacaoRespostaDto })
  async invalidarPorGrupo(@Body() dto: InvalidarCacheGrupoDto): Promise<ResultadoInvalidacaoRespostaDto> {
    return this.cacheInvalidationService.invalidarPorGrupo(dto.codGrupo, dto.motivo);
  }

  @Delete('invalidar/global')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invalidar todo o cache (CUIDADO!)' })
  @ApiResponse({ status: 200, type: ResultadoInvalidacaoRespostaDto })
  async invalidarGlobal(@Body() dto: InvalidarCacheGlobalDto): Promise<ResultadoInvalidacaoRespostaDto> {
    if (!dto.confirmar) {
      return {
        tipo: 'global',
        entradasRemovidas: 0,
        duracaoMs: 0,
        sucesso: false,
        erro: 'Confirmacao necessaria para invalidacao global',
      };
    }

    return this.cacheInvalidationService.invalidarGlobal(dto.motivo);
  }

  @Get('invalidacoes/historico')
  @ApiOperation({ summary: 'Obter historico de invalidacoes' })
  @ApiResponse({ status: 200 })
  async obterHistoricoInvalidacoes(): Promise<{
    eventos: Array<{
      tipo: string;
      identificador?: number | string;
      motivo?: string;
      timestamp: Date;
    }>;
    estatisticas: {
      totalInvalidacoes: number;
      porTipo: Record<string, number>;
    };
  }> {
    const eventos = this.cacheInvalidationService.obterHistoricoInvalidacoes();
    const estatisticas = this.cacheInvalidationService.obterEstatisticas();

    return {
      eventos,
      estatisticas: {
        totalInvalidacoes: estatisticas.totalInvalidacoes,
        porTipo: estatisticas.porTipo,
      },
    };
  }

  // ==================== JOBS ====================

  @Get('limpeza/configuracao')
  @ApiOperation({ summary: 'Obter configuracao do job de limpeza' })
  @ApiResponse({ status: 200, type: ConfiguracaoLimpezaRespostaDto })
  obterConfiguracaoLimpeza(): ConfiguracaoLimpezaRespostaDto {
    return this.limparCacheJob.obterConfiguracao();
  }

  @Post('limpeza/configuracao')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar configuracao do job de limpeza' })
  @ApiResponse({ status: 200, type: ConfiguracaoLimpezaRespostaDto })
  atualizarConfiguracaoLimpeza(@Body() dto: AtualizarConfigLimpezaDto): ConfiguracaoLimpezaRespostaDto {
    this.limparCacheJob.atualizarConfiguracao(dto);
    return this.limparCacheJob.obterConfiguracao();
  }

  @Post('limpeza/executar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Executar limpeza manualmente' })
  @ApiResponse({ status: 200, type: ResultadoLimpezaRespostaDto })
  async executarLimpeza(): Promise<ResultadoLimpezaRespostaDto> {
    return this.limparCacheJob.executar('manual');
  }

  @Get('limpeza/historico')
  @ApiOperation({ summary: 'Obter historico de limpezas' })
  @ApiResponse({ status: 200, type: [ResultadoLimpezaRespostaDto] })
  obterHistoricoLimpeza(): ResultadoLimpezaRespostaDto[] {
    return this.limparCacheJob.obterHistorico();
  }

  @Get('limpeza/status')
  @ApiOperation({ summary: 'Verificar status do job de limpeza' })
  @ApiResponse({ status: 200 })
  obterStatusLimpeza(): {
    emExecucao: boolean;
    ultimoResultado: ResultadoLimpezaRespostaDto | null;
    configuracao: ConfiguracaoLimpezaRespostaDto;
  } {
    return {
      emExecucao: this.limparCacheJob.estaEmExecucao(),
      ultimoResultado: this.limparCacheJob.obterUltimoResultado(),
      configuracao: this.limparCacheJob.obterConfiguracao(),
    };
  }

  // ==================== MONITORAMENTO ====================

  @Get('monitoramento/estatisticas')
  @ApiOperation({ summary: 'Obter estatisticas de monitoramento' })
  @ApiResponse({ status: 200, type: EstatisticasMonitoramentoRespostaDto })
  obterEstatisticasMonitoramento(): EstatisticasMonitoramentoRespostaDto {
    return this.monitorarInvalidacaoJob.obterEstatisticas();
  }

  @Get('monitoramento/eventos')
  @ApiOperation({ summary: 'Obter eventos recentes de alteracao' })
  @ApiResponse({ status: 200 })
  @ApiQuery({ name: 'ultimos', required: false, description: 'Quantidade de eventos' })
  obterEventosMonitoramento(): Array<{
    tabela: string;
    tipoOperacao: string;
    codUsuario?: number;
    codTela?: number;
    timestamp: Date;
  }> {
    return this.monitorarInvalidacaoJob.obterEventos(50);
  }

  @Post('monitoramento/iniciar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar monitoramento de alteracoes' })
  @ApiResponse({ status: 200 })
  iniciarMonitoramento(): { mensagem: string; estaAtivo: boolean } {
    this.monitorarInvalidacaoJob.iniciar();
    return {
      mensagem: 'Monitoramento iniciado',
      estaAtivo: this.monitorarInvalidacaoJob.obterEstatisticas().estaAtivo,
    };
  }

  @Post('monitoramento/parar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Parar monitoramento de alteracoes' })
  @ApiResponse({ status: 200 })
  pararMonitoramento(): { mensagem: string; estaAtivo: boolean } {
    this.monitorarInvalidacaoJob.parar();
    return {
      mensagem: 'Monitoramento parado',
      estaAtivo: this.monitorarInvalidacaoJob.obterEstatisticas().estaAtivo,
    };
  }
}
