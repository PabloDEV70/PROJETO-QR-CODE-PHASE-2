import { Body, Controller, Get, Headers, Post, Request, UseGuards } from '@nestjs/common';
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
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthService } from '../services/auth.service';
import { TokenRevocationService } from '../services/token-revocation.service';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenRevocationService: TokenRevocationService,
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
        CODUSU: 292,
        NOMEUSU: 'JOAO.SILVA',
        EMAIL: 'j***@empresa.com',
        CODFUNC: 292,
        NOMEFUNC: 'João Silva',
        CODEMP: 1,
      },
    },
  })
  async getMe(@Request() req) {
    // Retorna todos os dados detalhados do usuário
    return this.authService.getUserDetails(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout',
    description: 'Revoga o token de acesso atual, invalidando-o para uso futuro',
  })
  @ApiOkResponse({
    description: 'Logout realizado com sucesso',
    schema: { example: { success: true, message: 'Logout realizado com sucesso' } },
  })
  async logout(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (token) {
      await this.tokenRevocationService.revoke(token);
    }
    return { success: true, message: 'Logout realizado com sucesso' };
  }
}
