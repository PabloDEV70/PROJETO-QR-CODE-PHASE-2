import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto'; // Import RefreshTokenDto
import { AuthService } from '../services/auth.service';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly appLogger: StructuredLogger,
  ) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 tentativas por minuto para prevenir brute force
  @ApiOperation({
    summary: 'User authentication',
    description:
      'Authenticates user with Sankhya database credentials and returns JWT token. Limited to 5 attempts per minute.',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Authentication successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid credentials or missing input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiTooManyRequestsResponse({ description: 'Too many login attempts (50 per minute). Try again in 1 minute.' })
  async login(@Body() loginDto: LoginDto, @Request() req): Promise<AuthResponseDto> {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown'; // Re-added IP extraction
    this.appLogger.info(`Login attempt for user: ${loginDto.username} from IP: ${ip}`);
    const authResponse = await this.authService.login(loginDto.username, loginDto.password, ip);
    // updateLastLogin removed - API is READ-ONLY, no database modifications allowed
    return authResponse;
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 tentativas por minuto para refresh
  @ApiOperation({
    summary: 'Refresh access and refresh tokens',
    description: 'Uses a refresh token to obtain new access and refresh tokens. Limited to 10 attempts per minute.',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({
    description: 'Tokens refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @ApiTooManyRequestsResponse({ description: 'Too many refresh attempts. Try again in 1 minute.' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto, @Request() req): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken, req.ip || req.connection?.remoteAddress);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Returns current authenticated user information from JWT token',
  })
  @ApiOkResponse({
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        userId: 311,
        username: 'CONVIDADO',
      },
    },
  })
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get detailed user information',
    description:
      'Returns comprehensive information about the logged-in user including personal data, organizational structure, and manager details',
  })
  @ApiOkResponse({
    description: 'User detailed information retrieved successfully',
    schema: {
      example: {
        funcionario: {
          CODFUNC: 292,
          CODEMP: 1,
          NOMEFUNC: 'João Silva',
          funcionarioDataNascimento: '15/01/1985',
          funcionarioIdade: 40,
          funcionarioCPF: '123.456.789-00',
          CELULAR: '11987654321',
          EMAIL: 'joao.silva@empresa.com',
          funcionarioDataAdmissao: '01/03/2020',
          funcionarioDiasEmpresa: 1795,
          SITUACAO: 1,
          funcionarioSituacaoDescricao: 'Ativo',
        },
        usuario: {
          CODUSU: 292,
          NOMEUSU: 'JOAO.SILVA',
          usuarioEmail: 'joao.silva@empresa.com',
          FOTO: null,
          usuarioTelefoneCorp: '11987654321',
        },
        estruturaOrganizacional: {
          cargaHorariaDescricao: '44 horas semanais',
          departamentoDescricao: 'Tecnologia',
          cargoDescricao: 'Desenvolvedor Senior',
          centroResultadoDescricao: 'TI - Desenvolvimento',
        },
        gestor: {
          gestorCodigoUsuario: 150,
          gestorNome: 'Maria Santos',
          gestorEmail: 'maria.santos@empresa.com',
          gestorFormatado: '000150 Maria Santos',
          gestorDataNascimento: '20/06/1978',
          gestorIdade: 47,
          gestorCPF: '987.654.321-00',
          gestorCelular: '11912345678',
          gestorDepartamento: 'Tecnologia',
          gestorCargo: 'Gerente de TI',
          gestorCentroResultado: 'TI - Gestão',
          gestorDataAdmissao: '15/01/2015',
          gestorDiasEmpresa: 3650,
        },
        empresa: {
          CODEMP: 1,
          NOMEFANTASIA: 'Empresa XYZ',
          empresaCNPJ: '12.345.678/0001-90',
          empresaFormatada: '001 Empresa XYZ',
        },
      },
    },
  })
  async getMe(@Request() req) {
    // Retorna todos os dados detalhados do usuário
    return this.authService.getUserDetails(req.user.userId);
  }
}
