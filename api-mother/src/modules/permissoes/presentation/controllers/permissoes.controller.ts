import { Controller, Get, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ObterPermissoesTelaUseCase } from '../../application/use-cases/obter-permissoes-tela';
import { VerificarAcessoControleUseCase } from '../../application/use-cases/verificar-acesso-controle';
import { ObterParametrosUsuarioUseCase } from '../../application/use-cases/obter-parametros-usuario';
import { PermissoesTelaRespostaDto, ParametrosUsuarioRespostaDto, VerificarAcessoRespostaDto } from '../dto';

@ApiTags('Permissões')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('permissoes')
export class PermissoesController {
  constructor(
    private readonly obterPermissoesTela: ObterPermissoesTelaUseCase,
    private readonly verificarAcessoControle: VerificarAcessoControleUseCase,
    private readonly obterParametrosUsuario: ObterParametrosUsuarioUseCase,
  ) {}

  @Get('tela/:codUsuario/:codTela')
  @ApiOperation({ summary: 'Obter permissões de controles de uma tela para um usuário' })
  @ApiResponse({ status: 200, type: PermissoesTelaRespostaDto })
  async obterPermissoesDeTela(
    @Param('codUsuario', ParseIntPipe) codUsuario: number,
    @Param('codTela', ParseIntPipe) codTela: number,
  ): Promise<PermissoesTelaRespostaDto> {
    return this.obterPermissoesTela.executar({
      codUsuario,
      codTela,
      tokenUsuario: '',
    });
  }

  @Get('verificar/:codUsuario/:codTela/:nomeControle')
  @ApiOperation({ summary: 'Verificar se usuário tem acesso a um controle específico' })
  @ApiResponse({ status: 200, type: VerificarAcessoRespostaDto })
  async verificarAcesso(
    @Param('codUsuario', ParseIntPipe) codUsuario: number,
    @Param('codTela', ParseIntPipe) codTela: number,
    @Param('nomeControle') nomeControle: string,
  ): Promise<VerificarAcessoRespostaDto> {
    return this.verificarAcessoControle.executar({
      codUsuario,
      codTela,
      nomeControle,
      tokenUsuario: '',
    });
  }

  @Get('parametros/:codUsuario')
  @ApiOperation({ summary: 'Obter parâmetros de configuração do usuário' })
  @ApiResponse({ status: 200, type: ParametrosUsuarioRespostaDto })
  @ApiQuery({ name: 'apenasAtivos', required: false, type: Boolean })
  async obterParametros(
    @Param('codUsuario', ParseIntPipe) codUsuario: number,
    @Query('apenasAtivos') apenasAtivos?: boolean,
  ): Promise<ParametrosUsuarioRespostaDto> {
    return this.obterParametrosUsuario.executar({
      codUsuario,
      tokenUsuario: '',
      apenasAtivos: apenasAtivos === true,
    });
  }
}
