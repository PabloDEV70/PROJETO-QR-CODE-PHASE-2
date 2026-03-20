/**
 * Controller: Auditoria
 *
 * Endpoints para gerenciamento de auditoria e aprovacoes.
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Res,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

// Use Cases
import { RegistrarOperacaoUseCase } from '../../application/use-cases/registrar-operacao';
import { ConsultarHistoricoUseCase } from '../../application/use-cases/consultar-historico';
import { ExportarHistoricoUseCase } from '../../application/use-cases/exportar-historico';
import { SolicitarAprovacaoUseCase } from '../../application/use-cases/solicitar-aprovacao';
import { ProcessarAprovacaoUseCase } from '../../application/use-cases/processar-aprovacao';
import { ListarAprovacoesPendentesUseCase } from '../../application/use-cases/listar-aprovacoes-pendentes';
import { ExpirarAprovacoesUseCase } from '../../application/use-cases/expirar-aprovacoes';

// DTOs
import {
  RegistrarOperacaoDto,
  ConsultarHistoricoQueryDto,
  ExportarHistoricoQueryDto,
  RegistroAuditoriaRespostaDto,
  ListaAuditoriaRespostaDto,
  EstatisticasAuditoriaRespostaDto,
  TipoOperacaoEnum,
  FormatoExportacaoEnum,
} from '../dto/auditoria.dto';
import {
  SolicitarAprovacaoDto,
  ProcessarAprovacaoDto,
  ListarAprovacoesQueryDto,
  AprovacaoRespostaDto,
  ListaAprovacaoRespostaDto,
  SolicitarAprovacaoRespostaDto,
  ProcessarAprovacaoRespostaDto,
  EstatisticasAprovacaoRespostaDto,
  ExpirarAprovacoesRespostaDto,
  TipoOperacaoAprovacaoEnum,
  PrioridadeAprovacaoEnum,
} from '../dto/aprovacao.dto';

@ApiTags('Auditoria')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('auditoria')
export class AuditoriaController {
  constructor(
    private readonly registrarOperacaoUseCase: RegistrarOperacaoUseCase,
    private readonly consultarHistoricoUseCase: ConsultarHistoricoUseCase,
    private readonly exportarHistoricoUseCase: ExportarHistoricoUseCase,
    private readonly solicitarAprovacaoUseCase: SolicitarAprovacaoUseCase,
    private readonly processarAprovacaoUseCase: ProcessarAprovacaoUseCase,
    private readonly listarAprovacoesPendentesUseCase: ListarAprovacoesPendentesUseCase,
    private readonly expirarAprovacoesUseCase: ExpirarAprovacoesUseCase,
  ) {}

  // =====================================================
  // ENDPOINTS DE AUDITORIA (HISTORICO)
  // =====================================================

  @Post('registrar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar operacao no historico de auditoria' })
  @ApiResponse({ status: 201, description: 'Operacao registrada com sucesso' })
  async registrarOperacao(
    @Body() dto: RegistrarOperacaoDto,
    @Request() req,
  ): Promise<{ auditoriaId: number; registrado: boolean; dataHora: Date }> {
    const ip = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.registrarOperacaoUseCase.executar({
      codUsuario: dto.codUsuario,
      tabela: dto.tabela,
      operacao: dto.operacao as TipoOperacaoEnum,
      dadosAntigos: dto.dadosAntigos,
      dadosNovos: dto.dadosNovos,
      chaveRegistro: dto.chaveRegistro,
      observacao: dto.observacao,
      sucesso: dto.sucesso,
      mensagemErro: dto.mensagemErro,
      ip,
      userAgent,
    });
  }

  @Get('historico')
  @ApiOperation({ summary: 'Consultar historico de auditoria' })
  @ApiResponse({ status: 200, type: ListaAuditoriaRespostaDto })
  async consultarHistorico(@Query() query: ConsultarHistoricoQueryDto): Promise<ListaAuditoriaRespostaDto> {
    return this.consultarHistoricoUseCase.executar({
      codUsuario: query.codUsuario,
      tabela: query.tabela,
      operacao: query.operacao as TipoOperacaoEnum,
      dataInicio: query.dataInicio,
      dataFim: query.dataFim,
      sucesso: query.sucesso,
      chaveRegistro: query.chaveRegistro,
      pagina: query.pagina,
      limite: query.limite,
    });
  }

  @Get('historico/:id')
  @ApiOperation({ summary: 'Buscar registro de auditoria por ID' })
  @ApiParam({ name: 'id', description: 'ID do registro de auditoria' })
  @ApiResponse({ status: 200, type: RegistroAuditoriaRespostaDto })
  async buscarHistoricoPorId(@Param('id', ParseIntPipe) id: number): Promise<RegistroAuditoriaRespostaDto | null> {
    return this.consultarHistoricoUseCase.buscarPorId(id);
  }

  @Get('historico/registro/:tabela/:chave')
  @ApiOperation({ summary: 'Buscar historico de um registro especifico' })
  @ApiParam({ name: 'tabela', description: 'Nome da tabela' })
  @ApiParam({ name: 'chave', description: 'Chave do registro (ex: ID=123)' })
  @ApiResponse({ status: 200, type: [RegistroAuditoriaRespostaDto] })
  async buscarHistoricoRegistro(
    @Param('tabela') tabela: string,
    @Param('chave') chave: string,
  ): Promise<RegistroAuditoriaRespostaDto[]> {
    return this.consultarHistoricoUseCase.buscarHistoricoRegistro(tabela, chave);
  }

  @Get('estatisticas')
  @ApiOperation({ summary: 'Buscar estatisticas de auditoria' })
  @ApiQuery({ name: 'tabela', required: false })
  @ApiQuery({ name: 'dataInicio', required: false })
  @ApiQuery({ name: 'dataFim', required: false })
  @ApiResponse({ status: 200, type: EstatisticasAuditoriaRespostaDto })
  async buscarEstatisticas(
    @Query('tabela') tabela?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ): Promise<EstatisticasAuditoriaRespostaDto> {
    return this.consultarHistoricoUseCase.buscarEstatisticas({
      tabela,
      dataInicio,
      dataFim,
    });
  }

  @Get('exportar')
  @ApiOperation({ summary: 'Exportar historico de auditoria' })
  @ApiResponse({ status: 200, description: 'Arquivo exportado' })
  async exportarHistorico(@Query() query: ExportarHistoricoQueryDto, @Res() res: Response): Promise<void> {
    const resultado = await this.exportarHistoricoUseCase.executar({
      tabela: query.tabela,
      operacao: query.operacao as TipoOperacaoEnum,
      dataInicio: query.dataInicio,
      dataFim: query.dataFim,
      formato: query.formato as FormatoExportacaoEnum,
      limite: query.limite,
    });

    res.setHeader('Content-Type', resultado.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${resultado.nomeArquivo}"`);
    res.send(resultado.conteudo);
  }

  // =====================================================
  // ENDPOINTS DE APROVACOES
  // =====================================================

  @Post('aprovacoes/solicitar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Solicitar aprovacao para uma operacao' })
  @ApiResponse({ status: 201, type: SolicitarAprovacaoRespostaDto })
  async solicitarAprovacao(@Body() dto: SolicitarAprovacaoDto, @Request() req): Promise<SolicitarAprovacaoRespostaDto> {
    const ip = req.ip || req.connection?.remoteAddress;

    return this.solicitarAprovacaoUseCase.executar({
      codUsuario: dto.codUsuario,
      codAprovador: dto.codAprovador,
      tabela: dto.tabela,
      operacao: dto.operacao as TipoOperacaoAprovacaoEnum,
      dados: dto.dados,
      chaveRegistro: dto.chaveRegistro,
      observacao: dto.observacao,
      ip,
      prioridade: dto.prioridade as PrioridadeAprovacaoEnum,
      diasParaExpirar: dto.diasParaExpirar,
    });
  }

  @Get('aprovacoes')
  @ApiOperation({ summary: 'Listar aprovacoes' })
  @ApiResponse({ status: 200, type: ListaAprovacaoRespostaDto })
  async listarAprovacoes(@Query() query: ListarAprovacoesQueryDto): Promise<ListaAprovacaoRespostaDto> {
    return this.listarAprovacoesPendentesUseCase.executar({
      codAprovador: query.codAprovador,
      tabela: query.tabela,
      operacao: query.operacao as TipoOperacaoAprovacaoEnum,
      status: query.status,
      pagina: query.pagina,
      limite: query.limite,
    });
  }

  @Get('aprovacoes/pendentes')
  @ApiOperation({ summary: 'Listar apenas aprovacoes pendentes' })
  @ApiQuery({ name: 'codAprovador', required: false })
  @ApiResponse({ status: 200, type: ListaAprovacaoRespostaDto })
  async listarPendentes(@Query('codAprovador') codAprovador?: number): Promise<ListaAprovacaoRespostaDto> {
    return this.listarAprovacoesPendentesUseCase.executar({
      codAprovador: codAprovador ? Number(codAprovador) : undefined,
      status: 'P',
    });
  }

  @Get('aprovacoes/proximas-expirar')
  @ApiOperation({ summary: 'Listar aprovacoes proximas de expirar' })
  @ApiQuery({ name: 'horasRestantes', description: 'Horas restantes ate expirar', example: 24 })
  @ApiResponse({ status: 200, type: [AprovacaoRespostaDto] })
  async listarProximasDeExpirar(
    @Query('horasRestantes', ParseIntPipe) horasRestantes: number,
  ): Promise<AprovacaoRespostaDto[]> {
    return this.listarAprovacoesPendentesUseCase.buscarProximasDeExpirar(horasRestantes);
  }

  @Get('aprovacoes/contagem')
  @ApiOperation({ summary: 'Contar aprovacoes pendentes' })
  @ApiQuery({ name: 'codAprovador', required: false })
  @ApiResponse({ status: 200 })
  async contarPendentes(@Query('codAprovador') codAprovador?: number): Promise<{ total: number }> {
    const total = await this.listarAprovacoesPendentesUseCase.contarPendentes(
      codAprovador ? Number(codAprovador) : undefined,
    );
    return { total };
  }

  @Get('aprovacoes/estatisticas')
  @ApiOperation({ summary: 'Buscar estatisticas de aprovacoes' })
  @ApiResponse({ status: 200, type: EstatisticasAprovacaoRespostaDto })
  async buscarEstatisticasAprovacoes(): Promise<EstatisticasAprovacaoRespostaDto> {
    return this.expirarAprovacoesUseCase.buscarEstatisticas();
  }

  @Get('aprovacoes/:id')
  @ApiOperation({ summary: 'Buscar aprovacao por ID' })
  @ApiParam({ name: 'id', description: 'ID da aprovacao' })
  @ApiResponse({ status: 200, type: AprovacaoRespostaDto })
  async buscarAprovacaoPorId(@Param('id', ParseIntPipe) id: number): Promise<AprovacaoRespostaDto | null> {
    return this.listarAprovacoesPendentesUseCase.buscarPorId(id);
  }

  @Post('aprovacoes/:id/aprovar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aprovar uma solicitacao' })
  @ApiParam({ name: 'id', description: 'ID da aprovacao' })
  @ApiResponse({ status: 200, type: ProcessarAprovacaoRespostaDto })
  async aprovar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ProcessarAprovacaoDto,
  ): Promise<ProcessarAprovacaoRespostaDto> {
    return this.processarAprovacaoUseCase.aprovar(id, dto.codAprovador, dto.observacao);
  }

  @Post('aprovacoes/:id/rejeitar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rejeitar uma solicitacao' })
  @ApiParam({ name: 'id', description: 'ID da aprovacao' })
  @ApiResponse({ status: 200, type: ProcessarAprovacaoRespostaDto })
  async rejeitar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ProcessarAprovacaoDto,
  ): Promise<ProcessarAprovacaoRespostaDto> {
    if (!dto.motivoRejeicao) {
      throw new Error('Motivo de rejeicao e obrigatorio');
    }
    return this.processarAprovacaoUseCase.rejeitar(id, dto.codAprovador, dto.motivoRejeicao, dto.observacao);
  }

  @Post('aprovacoes/expirar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar aprovacoes expiradas' })
  @ApiResponse({ status: 200, type: ExpirarAprovacoesRespostaDto })
  async expirarAprovacoes(): Promise<ExpirarAprovacoesRespostaDto> {
    return this.expirarAprovacoesUseCase.executar();
  }
}
