/**
 * Controller: MonitoringController
 *
 * Endpoints para monitoramento do SQL Server (Clean Architecture V3).
 * Todos os endpoints requerem autenticação JWT.
 */
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import {
  ObterVisaoServidorUseCase,
  ListarEstatisticasQueryUseCase,
  ListarQueriesAtivasUseCase,
  ListarEstatisticasEsperaUseCase,
  ListarSessoesUseCase,
} from '../../application/use-cases';
import {
  PermissoesResponseDto,
  VisaoServidorResponseDto,
  EstatisticasQueryResponseDto,
  QueryAtivaResponseDto,
  EstatisticaEsperaResponseDto,
  SessaoAtivaResponseDto,
} from '../dto';

@ApiTags('Monitoring')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('monitoring')
export class MonitoringController {
  constructor(
    private readonly obterVisaoServidorUseCase: ObterVisaoServidorUseCase,
    private readonly listarEstatisticasQueryUseCase: ListarEstatisticasQueryUseCase,
    private readonly listarQueriesAtivasUseCase: ListarQueriesAtivasUseCase,
    private readonly listarEstatisticasEsperaUseCase: ListarEstatisticasEsperaUseCase,
    private readonly listarSessoesUseCase: ListarSessoesUseCase,
  ) {}

  @Get('permissoes')
  @ApiOperation({ summary: 'Verificar permissões de monitoramento' })
  @ApiResponse({ status: 200, type: PermissoesResponseDto })
  async verificarPermissoes(): Promise<PermissoesResponseDto> {
    const permissoes = await this.obterVisaoServidorUseCase.verificarPermissoes();
    return permissoes;
  }

  @Get('visao-servidor')
  @ApiOperation({ summary: 'Obter visão geral do servidor' })
  @ApiResponse({ status: 200, type: VisaoServidorResponseDto })
  async obterVisaoServidor() {
    const startTime = Date.now();
    const visao = await this.obterVisaoServidorUseCase.executar();

    return {
      __payload: {
        versaoSql: visao.versaoSql,
        nomeServidor: visao.nomeServidor,
        bancoAtual: visao.bancoAtual,
        sessoesUsuarioAtivas: visao.sessoesUsuarioAtivas,
        requisicaosAtivas: visao.requisicaosAtivas,
        conexoesUsuario: visao.conexoesUsuario,
        horaServidor: visao.horaServidor,
      },
      __meta: {
        count: 1,
        executionTimeMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('estatisticas-query')
  @ApiOperation({ summary: 'Listar estatísticas de queries' })
  @ApiQuery({ name: 'limite', required: false, type: Number })
  @ApiResponse({ status: 200, type: [EstatisticasQueryResponseDto] })
  async listarEstatisticasQuery(@Query('limite') limite?: string) {
    const startTime = Date.now();
    const limiteNum = Math.min(parseInt(limite || '50', 10) || 50, 200);
    const estatisticas = await this.listarEstatisticasQueryUseCase.executar(limiteNum);

    return {
      __payload: estatisticas.map((e) => ({
        contagemExecucoes: e.contagemExecucoes,
        cpuTotalMs: e.cpuTotalMs,
        cpuMedioMs: e.cpuMedioMs,
        duracaoTotalMs: e.duracaoTotalMs,
        duracaoMediaMs: e.duracaoMediaMs,
        leiturasLogicasTotais: e.leiturasLogicasTotais,
        textoQuery: e.textoQuery,
        nomeBancoDados: e.nomeBancoDados,
        fonteQuery: e.fonteQuery,
        pontuacaoCusto: e.pontuacaoCusto,
      })),
      __meta: {
        count: estatisticas.length,
        limit: limiteNum,
        executionTimeMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('queries-ativas')
  @ApiOperation({ summary: 'Listar queries em execução' })
  @ApiResponse({ status: 200, type: [QueryAtivaResponseDto] })
  async listarQueriesAtivas() {
    const startTime = Date.now();
    const queries = await this.listarQueriesAtivasUseCase.executar();

    return {
      __payload: queries.map((q) => ({
        idSessao: q.idSessao,
        status: q.status,
        comando: q.comando,
        tempoCpu: q.tempoCpu,
        tempoTotalDecorrido: q.tempoTotalDecorrido,
        tipoEspera: q.tipoEspera,
        idSessaoBloqueadora: q.idSessaoBloqueadora,
        nomeBancoDados: q.nomeBancoDados,
        textoQuery: q.textoQuery,
      })),
      __meta: {
        count: queries.length,
        executionTimeMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('estatisticas-espera')
  @ApiOperation({ summary: 'Listar estatísticas de espera' })
  @ApiQuery({ name: 'limite', required: false, type: Number })
  @ApiResponse({ status: 200, type: [EstatisticaEsperaResponseDto] })
  async listarEstatisticasEspera(@Query('limite') limite?: string) {
    const startTime = Date.now();
    const limiteNum = Math.min(parseInt(limite || '20', 10) || 20, 100);
    const estatisticas = await this.listarEstatisticasEsperaUseCase.executar(limiteNum);

    return {
      __payload: estatisticas.map((e) => ({
        tipoEspera: e.tipoEspera,
        contagemTarefasEsperando: e.contagemTarefasEsperando,
        tempoEsperaMs: e.tempoEsperaMs,
        tempoMaximoEsperaMs: e.tempoMaximoEsperaMs,
        tempoMedioEsperaMs: e.tempoMedioEsperaMs,
      })),
      __meta: {
        count: estatisticas.length,
        limit: limiteNum,
        executionTimeMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('sessoes')
  @ApiOperation({ summary: 'Listar sessões ativas' })
  @ApiResponse({ status: 200, type: [SessaoAtivaResponseDto] })
  async listarSessoes() {
    const startTime = Date.now();
    const sessoes = await this.listarSessoesUseCase.executar();

    return {
      __payload: sessoes.map((s) => ({
        idSessao: s.idSessao,
        horaLogin: s.horaLogin,
        nomeHost: s.nomeHost,
        nomePrograma: s.nomePrograma,
        nomeLogin: s.nomeLogin,
        status: s.status,
        tempoCpu: s.tempoCpu,
        leiturasLogicas: s.leiturasLogicas,
        enderecoClienteRede: s.enderecoClienteRede,
      })),
      __meta: {
        count: sessoes.length,
        executionTimeMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('queries-pesadas')
  @ApiOperation({ summary: 'Listar queries pesadas com severidade' })
  @ApiQuery({ name: 'limite', required: false, type: Number })
  @ApiQuery({ name: 'cpuMinimo', required: false, type: Number })
  @ApiResponse({ status: 200, type: [EstatisticasQueryResponseDto] })
  async listarQueriesPesadas(
    @Query('limite') limite?: string,
    @Query('cpuMinimo') cpuMinimo?: string,
  ) {
    const startTime = Date.now();
    const limiteNum = Math.min(parseInt(limite || '50', 10) || 50, 200);
    const cpuMinimoMs = parseInt(cpuMinimo || '1000', 10) || 1000;

    const queries = await this.listarEstatisticasQueryUseCase.obterPesadas(limiteNum, cpuMinimoMs);

    return {
      __payload: queries.map((e) => ({
        contagemExecucoes: e.contagemExecucoes,
        cpuTotalMs: e.cpuTotalMs,
        cpuMedioMs: e.cpuMedioMs,
        duracaoTotalMs: e.duracaoTotalMs,
        duracaoMediaMs: e.duracaoMediaMs,
        leiturasLogicasTotais: e.leiturasLogicasTotais,
        textoQuery: e.textoQuery,
        nomeBancoDados: e.nomeBancoDados,
        fonteQuery: e.fonteQuery,
        pontuacaoCusto: e.pontuacaoCusto,
      })),
      __meta: {
        count: queries.length,
        limit: limiteNum,
        cpuMinimoMs,
        executionTimeMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check do módulo monitoring' })
  async health() {
    return {
      service: 'MonitoringModule',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
