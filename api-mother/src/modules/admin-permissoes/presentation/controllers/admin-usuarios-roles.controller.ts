import {
  Controller,
  Get,
  Post,
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
import { AssociarUsuarioRoleUseCase } from '../../application/use-cases/usuario-role/associar-usuario-role';
import { DesassociarUsuarioRoleUseCase } from '../../application/use-cases/usuario-role/desassociar-usuario-role';
import { ListarUsuariosRoleUseCase } from '../../application/use-cases/usuario-role/listar-usuarios-role';

// DTOs
import { AssociarUsuarioRoleDto, ListarUsuariosRoleRespostaDto, AssociacaoRespostaDto } from '../dto/usuario-role.dto';
import { OperacaoSucessoRespostaDto } from '../dto/comum.dto';

/**
 * Controller para administracao de associacoes Usuario-Role.
 */
@ApiTags('Admin - Usuarios Roles')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), AdminOnlyGuard)
@Controller('admin/usuarios-roles')
export class AdminUsuariosRolesController {
  constructor(
    private readonly associarUsuarioRole: AssociarUsuarioRoleUseCase,
    private readonly desassociarUsuarioRole: DesassociarUsuarioRoleUseCase,
    private readonly listarUsuariosRole: ListarUsuariosRoleUseCase,
  ) {}

  @Get()
  @AdminOnly()
  @ApiOperation({ summary: 'Listar associacoes entre usuarios e roles' })
  @ApiResponse({ status: 200, type: ListarUsuariosRoleRespostaDto })
  @ApiQuery({ name: 'codRole', required: false, type: Number, description: 'Filtrar por role' })
  @ApiQuery({ name: 'codUsuario', required: false, type: Number, description: 'Filtrar por usuario' })
  async listar(
    @Query('codRole') codRole?: number,
    @Query('codUsuario') codUsuario?: number,
  ): Promise<ListarUsuariosRoleRespostaDto> {
    return this.listarUsuariosRole.executar({
      codRole: codRole ? Number(codRole) : undefined,
      codUsuario: codUsuario ? Number(codUsuario) : undefined,
    });
  }

  @Get('role/:codRole')
  @AdminOnly()
  @ApiOperation({ summary: 'Listar usuarios de uma role especifica' })
  @ApiParam({ name: 'codRole', type: Number, description: 'Codigo da role' })
  @ApiResponse({ status: 200, type: ListarUsuariosRoleRespostaDto })
  async listarPorRole(@Param('codRole', ParseIntPipe) codRole: number): Promise<ListarUsuariosRoleRespostaDto> {
    return this.listarUsuariosRole.executar({ codRole });
  }

  @Get('usuario/:codUsuario')
  @AdminOnly()
  @ApiOperation({ summary: 'Listar roles de um usuario especifico' })
  @ApiParam({ name: 'codUsuario', type: Number, description: 'Codigo do usuario' })
  @ApiResponse({ status: 200, type: ListarUsuariosRoleRespostaDto })
  async listarPorUsuario(
    @Param('codUsuario', ParseIntPipe) codUsuario: number,
  ): Promise<ListarUsuariosRoleRespostaDto> {
    return this.listarUsuariosRole.executar({ codUsuario });
  }

  @Post()
  @AdminOnly()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Associar usuario a uma role' })
  @ApiResponse({ status: 201, type: AssociacaoRespostaDto })
  @ApiResponse({ status: 404, description: 'Role nao encontrada' })
  @ApiResponse({ status: 409, description: 'Associacao ja existe' })
  async associar(@Body() dto: AssociarUsuarioRoleDto): Promise<AssociacaoRespostaDto> {
    return this.associarUsuarioRole.executar(dto);
  }

  @Delete(':codUsuario/:codRole')
  @AdminOnly()
  @ApiOperation({ summary: 'Desassociar usuario de uma role' })
  @ApiParam({ name: 'codUsuario', type: Number, description: 'Codigo do usuario' })
  @ApiParam({ name: 'codRole', type: Number, description: 'Codigo da role' })
  @ApiResponse({ status: 200, type: OperacaoSucessoRespostaDto })
  @ApiResponse({ status: 404, description: 'Associacao nao encontrada' })
  async desassociar(
    @Param('codUsuario', ParseIntPipe) codUsuario: number,
    @Param('codRole', ParseIntPipe) codRole: number,
  ): Promise<OperacaoSucessoRespostaDto> {
    return this.desassociarUsuarioRole.executar({ codUsuario, codRole });
  }
}
