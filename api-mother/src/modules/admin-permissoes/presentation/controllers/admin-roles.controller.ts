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
import { CriarRoleUseCase } from '../../application/use-cases/roles/criar-role';
import { AtualizarRoleUseCase } from '../../application/use-cases/roles/atualizar-role';
import { RemoverRoleUseCase } from '../../application/use-cases/roles/remover-role';
import { ListarRolesUseCase } from '../../application/use-cases/roles/listar-roles';

// DTOs
import { CriarRoleDto, AtualizarRoleDto, RoleRespostaDto, ListarRolesRespostaDto } from '../dto/role.dto';
import { OperacaoSucessoRespostaDto } from '../dto/comum.dto';

/**
 * Controller para administracao de Roles.
 */
@ApiTags('Admin - Roles')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), AdminOnlyGuard)
@Controller('admin/roles')
export class AdminRolesController {
  constructor(
    private readonly criarRole: CriarRoleUseCase,
    private readonly atualizarRole: AtualizarRoleUseCase,
    private readonly removerRole: RemoverRoleUseCase,
    private readonly listarRoles: ListarRolesUseCase,
  ) {}

  @Get()
  @AdminOnly()
  @ApiOperation({ summary: 'Listar todas as roles' })
  @ApiResponse({ status: 200, type: ListarRolesRespostaDto })
  @ApiQuery({ name: 'apenasAtivas', required: false, type: Boolean, description: 'Filtrar apenas roles ativas' })
  async listar(@Query('apenasAtivas') apenasAtivas?: boolean): Promise<ListarRolesRespostaDto> {
    return this.listarRoles.executar({
      apenasAtivas: apenasAtivas === true,
    });
  }

  @Post()
  @AdminOnly()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar uma nova role' })
  @ApiResponse({ status: 201, type: RoleRespostaDto })
  @ApiResponse({ status: 400, description: 'Dados invalidos' })
  @ApiResponse({ status: 409, description: 'Role ja existe' })
  async criar(@Body() dto: CriarRoleDto): Promise<RoleRespostaDto> {
    return this.criarRole.executar(dto);
  }

  @Put(':codRole')
  @AdminOnly()
  @ApiOperation({ summary: 'Atualizar uma role existente' })
  @ApiParam({ name: 'codRole', type: Number, description: 'Codigo da role' })
  @ApiResponse({ status: 200, type: RoleRespostaDto })
  @ApiResponse({ status: 404, description: 'Role nao encontrada' })
  @ApiResponse({ status: 409, description: 'Nome ja existe' })
  async atualizar(
    @Param('codRole', ParseIntPipe) codRole: number,
    @Body() dto: AtualizarRoleDto,
  ): Promise<RoleRespostaDto> {
    return this.atualizarRole.executar({
      codRole,
      ...dto,
    });
  }

  @Delete(':codRole')
  @AdminOnly()
  @ApiOperation({ summary: 'Remover (desativar) uma role' })
  @ApiParam({ name: 'codRole', type: Number, description: 'Codigo da role' })
  @ApiResponse({ status: 200, type: OperacaoSucessoRespostaDto })
  @ApiResponse({ status: 404, description: 'Role nao encontrada' })
  async remover(@Param('codRole', ParseIntPipe) codRole: number): Promise<OperacaoSucessoRespostaDto> {
    return this.removerRole.executar({ codRole });
  }
}
