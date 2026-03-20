import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import {
  UserDetailDto,
  UserListDto,
  UserStatsDto,
  UserCompleteDto,
  PartnerCompleteDto,
  EmployeeDto,
  EmployeeListDto,
  AccessInfoDto,
  CompanyDto,
  AccessGroupDto,
} from './dto/user-detail.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista todos os usuários',
    description:
      'Retorna lista completa de usuários com dados de parceiro e funcionário (se ativo). Utiliza LEFT JOIN com TFPFUN filtrando apenas funcionários ativos (DTDEM IS NULL).',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    type: UserListDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findAll(): Promise<UserListDto> {
    return this.usersService.findAll();
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Estatísticas gerais dos usuários',
    description:
      'Retorna estatísticas agregadas: total de usuários, funcionários ativos, distribuição por empresa e grupo, usuários com/sem email.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas retornadas com sucesso',
    type: UserStatsDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getStats(): Promise<UserStatsDto> {
    return this.usersService.getStats();
  }

  @Get('active-employees')
  @ApiOperation({
    summary: 'Lista usuários com funcionários ativos',
    description:
      'Retorna apenas usuários que possuem vínculo ativo de funcionário (INNER JOIN com TFPFUN WHERE DTDEM IS NULL).',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários com funcionários ativos',
    type: UserListDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findActiveEmployees(): Promise<UserListDto> {
    return this.usersService.findActiveEmployees();
  }

  @Get('by-company/:codemp')
  @ApiOperation({
    summary: 'Lista usuários por empresa',
    description: 'Retorna usuários que são funcionários ativos de uma empresa específica (filtra por TFPFUN.CODEMP).',
  })
  @ApiParam({
    name: 'codemp',
    description: 'Código da empresa',
    example: 3,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários da empresa',
    type: UserListDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findByCompany(@Param('codemp', ParseIntPipe) codemp: number): Promise<UserListDto> {
    return this.usersService.findByCompany(codemp);
  }

  @Get('by-group/:codgrupo')
  @ApiOperation({
    summary: 'Lista usuários por grupo de acesso',
    description: 'Retorna usuários pertencentes a um grupo de acesso específico (TSIUSU.CODGRUPO).',
  })
  @ApiParam({
    name: 'codgrupo',
    description: 'Código do grupo de acesso',
    example: 7,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários do grupo',
    type: UserListDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findByGroup(@Param('codgrupo', ParseIntPipe) codgrupo: number): Promise<UserListDto> {
    return this.usersService.findByGroup(codgrupo);
  }

  @Get(':codusu/complete')
  @ApiOperation({
    summary: 'Busca dados completos do usuário com todos os relacionamentos',
    description:
      'Retorna todos os dados do usuário incluindo parceiro completo, funcionário, empresa, grupo de acesso e informações de acesso em uma única chamada.',
  })
  @ApiParam({
    name: 'codusu',
    description: 'Código do usuário (TSIUSU.CODUSU)',
    example: 460,
  })
  @ApiResponse({
    status: 200,
    description: 'Dados completos retornados',
    type: UserCompleteDto,
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findOneComplete(@Param('codusu', ParseIntPipe) codusu: number): Promise<UserCompleteDto> {
    return this.usersService.findOneComplete(codusu);
  }

  @Get(':codusu/partner')
  @ApiOperation({
    summary: 'Busca dados completos do parceiro vinculado ao usuário',
    description:
      'Retorna todos os dados do parceiro (TGFPAR) vinculado ao usuário, incluindo endereço e informações fiscais.',
  })
  @ApiParam({
    name: 'codusu',
    description: 'Código do usuário (TSIUSU.CODUSU)',
    example: 460,
  })
  @ApiResponse({
    status: 200,
    description: 'Dados completos do parceiro',
    type: PartnerCompleteDto,
  })
  @ApiResponse({ status: 404, description: 'Usuário ou parceiro não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findPartner(@Param('codusu', ParseIntPipe) codusu: number): Promise<PartnerCompleteDto> {
    return this.usersService.findPartner(codusu);
  }

  @Get(':codusu/employee')
  @ApiOperation({
    summary: 'Busca dados do funcionário ativo do usuário',
    description: 'Retorna dados do funcionário ativo (TFPFUN com DTDEM IS NULL) vinculado ao usuário.',
  })
  @ApiParam({
    name: 'codusu',
    description: 'Código do usuário (TSIUSU.CODUSU)',
    example: 460,
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do funcionário ativo',
    type: EmployeeDto,
  })
  @ApiResponse({ status: 404, description: 'Usuário ou funcionário ativo não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findEmployee(@Param('codusu', ParseIntPipe) codusu: number): Promise<EmployeeDto> {
    return this.usersService.findEmployee(codusu);
  }

  @Get(':codusu/employees')
  @ApiOperation({
    summary: 'Busca todos os registros de funcionário do usuário (histórico)',
    description:
      'Retorna todos os registros de funcionário (TFPFUN) vinculados ao usuário, incluindo histórico de demissões.',
  })
  @ApiParam({
    name: 'codusu',
    description: 'Código do usuário (TSIUSU.CODUSU)',
    example: 460,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros de funcionário',
    type: EmployeeListDto,
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findEmployees(@Param('codusu', ParseIntPipe) codusu: number): Promise<EmployeeListDto> {
    return this.usersService.findEmployees(codusu);
  }

  @Get(':codusu/access-info')
  @ApiOperation({
    summary: 'Busca informações de acesso do usuário',
    description: 'Retorna informações específicas de acesso: grupo, email, data limite e status de acesso.',
  })
  @ApiParam({
    name: 'codusu',
    description: 'Código do usuário (TSIUSU.CODUSU)',
    example: 460,
  })
  @ApiResponse({
    status: 200,
    description: 'Informações de acesso',
    type: AccessInfoDto,
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findAccessInfo(@Param('codusu', ParseIntPipe) codusu: number): Promise<AccessInfoDto> {
    return this.usersService.findAccessInfo(codusu);
  }

  @Get(':codusu/company')
  @ApiOperation({
    summary: 'Busca dados da empresa através do vínculo de funcionário',
    description: 'Retorna dados da empresa (TSIEMP) do funcionário ativo vinculado ao usuário.',
  })
  @ApiParam({
    name: 'codusu',
    description: 'Código do usuário (TSIUSU.CODUSU)',
    example: 460,
  })
  @ApiResponse({
    status: 200,
    description: 'Dados da empresa',
    type: CompanyDto,
  })
  @ApiResponse({ status: 404, description: 'Usuário, funcionário ou empresa não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findCompany(@Param('codusu', ParseIntPipe) codusu: number): Promise<CompanyDto> {
    return this.usersService.findCompany(codusu);
  }

  @Get(':codusu/access-group')
  @ApiOperation({
    summary: 'Busca dados do grupo de acesso do usuário',
    description: 'Retorna dados do grupo de acesso (TSIGRUPO) vinculado ao usuário.',
  })
  @ApiParam({
    name: 'codusu',
    description: 'Código do usuário (TSIUSU.CODUSU)',
    example: 460,
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do grupo de acesso',
    type: AccessGroupDto,
  })
  @ApiResponse({ status: 404, description: 'Usuário ou grupo não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findAccessGroup(@Param('codusu', ParseIntPipe) codusu: number): Promise<AccessGroupDto> {
    return this.usersService.findAccessGroup(codusu);
  }

  @Get(':codusu')
  @ApiOperation({
    summary: 'Busca usuário por CODUSU',
    description: 'Retorna dados completos de um usuário específico incluindo parceiro e funcionário (se ativo).',
  })
  @ApiParam({
    name: 'codusu',
    description: 'Código do usuário (TSIUSU.CODUSU)',
    example: 460,
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário',
    type: UserDetailDto,
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findOne(@Param('codusu', ParseIntPipe) codusu: number): Promise<UserDetailDto> {
    return this.usersService.findOne(codusu);
  }
}
