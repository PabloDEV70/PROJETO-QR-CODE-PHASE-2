import { Controller, Post, Body, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InvalidarCacheUseCase } from '../../application/use-cases/invalidar-cache';
import { DictionaryCacheService } from '../../cache/services';
import { InvalidarCacheDto } from '../dto/invalidar-cache.dto';

/**
 * Controller para administração de cache do dicionário.
 *
 * Endpoints restritos a administradores.
 *
 * @module Dicionario/Presentation
 */
@Controller('dicionario/admin/cache')
@ApiTags('Dicionário - Admin')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class CacheAdminController {
  constructor(
    private readonly invalidarCacheUseCase: InvalidarCacheUseCase,
    private readonly dictionaryCacheService: DictionaryCacheService,
  ) {}

  /**
   * POST /dicionario/admin/cache/invalidar
   *
   * Invalida cache do dicionário.
   */
  @Post('invalidar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invalidar cache do dicionário' })
  @ApiResponse({ status: 200, description: 'Cache invalidado com sucesso' })
  async invalidarCache(@Body() body: InvalidarCacheDto) {
    const resultado = await this.invalidarCacheUseCase.executar({
      tokenUsuario: body.tokenUsuario || ''
      tipo: body.tipo,
      nomeTabela: body.nomeTabela,
      nomeCampo: body.nomeCampo,
    });

    return resultado;
  }

  /**
   * GET /dicionario/admin/cache/estatisticas
   *
   * Obtém estatísticas do cache.
   */
  @Get('estatisticas')
  @ApiOperation({ summary: 'Obter estatísticas do cache' })
  @ApiResponse({ status: 200, description: 'Estatísticas do cache' })
  async obterEstatisticas() {
    const estatisticas = await this.dictionaryCacheService.obterEstatisticas();

    return {
      ...estatisticas,
      consultadoEm: new Date(),
    };
  }
}
