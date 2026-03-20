import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { CriarPermissaoTabelaUseCase } from '../../application/use-cases/permissoes-tabela/criar-permissao-tabela';
import { AtualizarPermissaoTabelaUseCase } from '../../application/use-cases/permissoes-tabela/atualizar-permissao-tabela';
import { RemoverPermissaoTabelaUseCase } from '../../application/use-cases/permissoes-tabela/remover-permissao-tabela';
import { ListarPermissoesTabelaUseCase } from '../../application/use-cases/permissoes-tabela/listar-permissoes-tabela';

// DTOs
import {
  CriarPermissaoTabelaDto,
  AtualizarPermissaoTabelaDto,
  PermissaoTabelaRespostaDto,
  ListarPermissoesTabelaRespostaDto,
} from '../dto/permissao-tabela.dto';
import { OperacaoSucessoRespostaDto } from '../dto/comum.dto';

/**
 * Controller para administracao de Permissoes de Tabela.
 */
@ApiTags('Admin - Permissoes de Tabela')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), AdminOnlyGuard)
@Controller('admin/permissoes')
export class AdminPermissoesController {
  constructor(
    private readonly criarPermissao: CriarPermissaoTabelaUseCase,
    private readonly atualizarPermissao: AtualizarPermissaoTabelaUseCase,
    private readonly removerPermissao: RemoverPermissaoTabelaUseCase,
    private readonly listarPermissoes: ListarPermissoesTabelaUseCase,
  ) {}

  @Get()
  @AdminOnly()
  @ApiOperation({ summary: 'Listar todas as permissoes de tabela' })
  @ApiResponse({ status: 200, type: ListarPermissoesTabelaRespostaDto })
  @ApiQuery({ name: 'codRole', required: false, type: Number, description: 'Filtrar por role' })
  @ApiQuery({ name: 'nomeTabela', required: false, type: String, description: 'Filtrar por tabela' })
  async listar(
    @Query('codRole') codRole?: number,
    @Query('nomeTabela') nomeTabela?: string,
  ): Promise<ListarPermissoesTabelaRespostaDto> {
    return this.listarPermissoes.executar({
      codRole: codRole ? Number(codRole) : undefined,
      nomeTabela,
    });
  }

  @Get('role/:codRole')
  @AdminOnly()
  @ApiOperation({ summary: 'Listar permissoes de uma role especifica' })
  @ApiParam({ name: 'codRole', type: Number, description: 'Codigo da role' })
  @ApiResponse({ status: 200, type: ListarPermissoesTabelaRespostaDto })
  async listarPorRole(@Param('codRole', ParseIntPipe) codRole: number): Promise<ListarPermissoesTabelaRespostaDto> {
    return this.listarPermissoes.executar({ codRole });
  }

  @Get('tabela/:nomeTabela')
  @AdminOnly()
  @ApiOperation({ summary: 'Listar permissoes de uma tabela especifica' })
  @ApiParam({ name: 'nomeTabela', type: String, description: 'Nome da tabela' })
  @ApiResponse({ status: 200, type: ListarPermissoesTabelaRespostaDto })
  async listarPorTabela(@Param('nomeTabela') nomeTabela: string): Promise<ListarPermissoesTabelaRespostaDto> {
    return this.listarPermissoes.executar({ nomeTabela });
  }

  @Post()
  @AdminOnly()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar uma nova permissao de tabela' })
  @ApiResponse({ status: 201, type: PermissaoTabelaRespostaDto })
  @ApiResponse({ status: 400, description: 'Dados invalidos' })
  @ApiResponse({ status: 404, description: 'Role nao encontrada' })
  @ApiResponse({ status: 409, description: 'Permissao ja existe' })
  async criar(@Body() dto: CriarPermissaoTabelaDto): Promise<PermissaoTabelaRespostaDto> {
    return this.criarPermissao.executar(dto);
  }

  @Put(':codPermissao')
  @AdminOnly()
  @ApiOperation({ summary: 'Atualizar uma permissao de tabela existente' })
  @ApiParam({ name: 'codPermissao', type: Number, description: 'Codigo da permissao' })
  @ApiResponse({ status: 200, type: PermissaoTabelaRespostaDto })
  @ApiResponse({ status: 404, description: 'Permissao nao encontrada' })
  @ApiResponse({ status: 409, description: 'Permissao duplicada' })
  async atualizar(
    @Param('codPermissao', ParseIntPipe) codPermissao: number,
    @Body() dto: AtualizarPermissaoTabelaDto,
  ): Promise<PermissaoTabelaRespostaDto> {
    return this.atualizarPermissao.executar({
      codPermissao,
      ...dto,
    });
  }

  @Delete(':codPermissao')
  @AdminOnly()
  @ApiOperation({ summary: 'Remover uma permissao de tabela' })
  @ApiParam({ name: 'codPermissao', type: Number, description: 'Codigo da permissao' })
  @ApiResponse({ status: 200, type: OperacaoSucessoRespostaDto })
  @ApiResponse({ status: 404, description: 'Permissao nao encontrada' })
  async remover(@Param('codPermissao', ParseIntPipe) codPermissao: number): Promise<OperacaoSucessoRespostaDto> {
    return this.removerPermissao.executar({ codPermissao });
  }
}
