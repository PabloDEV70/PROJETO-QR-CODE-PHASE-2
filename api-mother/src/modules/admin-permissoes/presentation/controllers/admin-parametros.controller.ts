import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminOnlyGuard, AdminOnly } from '../guards/admin-only.guard';

// Use Cases
import { CriarParametroUseCase } from '../../application/use-cases/parametros/criar-parametro';
import { AtualizarParametroUseCase } from '../../application/use-cases/parametros/atualizar-parametro';
import { ListarParametrosUseCase } from '../../application/use-cases/parametros/listar-parametros';

// DTOs
import {
  CriarParametroDto,
  AtualizarParametroDto,
  ParametroRespostaDto,
  ListarParametrosRespostaDto,
} from '../dto/parametro.dto';

/**
 * Controller para administracao de Parametros do Sistema.
 */
@ApiTags('Admin - Parametros')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), AdminOnlyGuard)
@Controller('admin/parametros')
export class AdminParametrosController {
  constructor(
    private readonly criarParametro: CriarParametroUseCase,
    private readonly atualizarParametro: AtualizarParametroUseCase,
    private readonly listarParametros: ListarParametrosUseCase,
  ) {}

  @Get()
  @AdminOnly()
  @ApiOperation({ summary: 'Listar todos os parametros do sistema' })
  @ApiResponse({ status: 200, type: ListarParametrosRespostaDto })
  @ApiQuery({
    name: 'apenasAtivos',
    required: false,
    type: Boolean,
    description: 'Filtrar apenas parametros ativos',
  })
  async listar(@Query('apenasAtivos') apenasAtivos?: boolean): Promise<ListarParametrosRespostaDto> {
    return this.listarParametros.executar({
      apenasAtivos: apenasAtivos === true,
    });
  }

  @Post()
  @AdminOnly()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar um novo parametro do sistema' })
  @ApiResponse({ status: 201, type: ParametroRespostaDto })
  @ApiResponse({ status: 400, description: 'Dados invalidos' })
  @ApiResponse({ status: 409, description: 'Parametro ja existe' })
  async criar(@Body() dto: CriarParametroDto): Promise<ParametroRespostaDto> {
    return this.criarParametro.executar(dto);
  }

  @Put(':codParametro')
  @AdminOnly()
  @ApiOperation({ summary: 'Atualizar um parametro do sistema existente' })
  @ApiParam({ name: 'codParametro', type: Number, description: 'Codigo do parametro' })
  @ApiResponse({ status: 200, type: ParametroRespostaDto })
  @ApiResponse({ status: 404, description: 'Parametro nao encontrado' })
  @ApiResponse({ status: 409, description: 'Chave ja existe' })
  async atualizar(
    @Param('codParametro', ParseIntPipe) codParametro: number,
    @Body() dto: AtualizarParametroDto,
  ): Promise<ParametroRespostaDto> {
    return this.atualizarParametro.executar({
      codParametro,
      ...dto,
    });
  }
}
