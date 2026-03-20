import { Controller, Get, Param, Query, ParseIntPipe, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  VerificarPermissaoEscritaUseCase,
  VerificarPermissaoEscritaSaida,
} from '../../application/use-cases/verificar-permissao-escrita';
import {
  ObterPermissoesUsuarioUseCase,
  ObterPermissoesUsuarioSaida,
} from '../../application/use-cases/obter-permissoes-usuario';
import { TipoOperacaoSigla } from '../../domain/value-objects/tipo-operacao.vo';
import { VerificarPermissaoRespostaDto, PermissoesUsuarioRespostaDto, VerificarMultiplasPermissoesDto } from '../dto';

const OPERACOES_VALIDAS: TipoOperacaoSigla[] = ['I', 'U', 'D', 'S'];

/**
 * Controller para gerenciar permissões de escrita (CRUD) em tabelas.
 *
 * Endpoints:
 * - GET /permissoes-escrita/verificar/:codUsuario/:tabela/:operacao - Verificar permissão específica
 * - GET /permissoes-escrita/usuario/:codUsuario - Listar todas as permissões do usuário
 * - GET /permissoes-escrita/usuario/:codUsuario/tabela/:tabela - Permissões do usuário para uma tabela
 */
@ApiTags('Permissões de Escrita')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('permissoes-escrita')
export class PermissoesEscritaController {
  constructor(
    private readonly verificarPermissaoUseCase: VerificarPermissaoEscritaUseCase,
    private readonly obterPermissoesUsuarioUseCase: ObterPermissoesUsuarioUseCase,
  ) {}

  /**
   * Verifica se um usuário tem permissão para uma operação específica em uma tabela.
   */
  @Get('verificar/:codUsuario/:tabela/:operacao')
  @ApiOperation({
    summary: 'Verificar permissão de escrita',
    description: 'Verifica se o usuário tem permissão para executar uma operação (I, U, D, S) em uma tabela',
  })
  @ApiParam({ name: 'codUsuario', description: 'Código do usuário', type: Number })
  @ApiParam({ name: 'tabela', description: 'Nome da tabela (ex: TGFVEI, AD_RDOAPONTAMENTOS)' })
  @ApiParam({
    name: 'operacao',
    description: 'Tipo de operação: I=Insert, U=Update, D=Delete, S=Select',
    enum: ['I', 'U', 'D', 'S'],
  })
  @ApiResponse({ status: 200, type: VerificarPermissaoRespostaDto })
  @ApiResponse({ status: 400, description: 'Operação inválida' })
  async verificarPermissao(
    @Param('codUsuario', ParseIntPipe) codUsuario: number,
    @Param('tabela') tabela: string,
    @Param('operacao') operacao: string,
  ): Promise<VerificarPermissaoEscritaSaida> {
    const operacaoUpper = operacao.toUpperCase() as TipoOperacaoSigla;

    if (!OPERACOES_VALIDAS.includes(operacaoUpper)) {
      throw new BadRequestException(
        `Operação inválida: ${operacao}. Valores permitidos: ${OPERACOES_VALIDAS.join(', ')}`,
      );
    }

    return this.verificarPermissaoUseCase.executar({
      codUsuario,
      tabela,
      operacao: operacaoUpper,
    });
  }

  /**
   * Verifica múltiplas permissões de uma vez.
   */
  @Get('verificar-multiplas/:codUsuario')
  @ApiOperation({
    summary: 'Verificar múltiplas permissões',
    description: 'Verifica permissões para múltiplas combinações de tabela/operação',
  })
  @ApiParam({ name: 'codUsuario', description: 'Código do usuário', type: Number })
  @ApiQuery({
    name: 'verificacoes',
    description: 'Lista de verificações no formato tabela:operacao (ex: TGFVEI:I,TGFVEI:U)',
    required: true,
  })
  @ApiResponse({ status: 200, type: VerificarMultiplasPermissoesDto })
  async verificarMultiplas(
    @Param('codUsuario', ParseIntPipe) codUsuario: number,
    @Query('verificacoes') verificacoes: string,
  ): Promise<VerificarMultiplasPermissoesDto> {
    if (!verificacoes) {
      throw new BadRequestException('Parâmetro verificacoes é obrigatório');
    }

    const pares = verificacoes.split(',').map((v) => v.trim());
    const resultados: VerificarPermissaoEscritaSaida[] = [];

    for (const par of pares) {
      const [tabela, operacao] = par.split(':');

      if (!tabela || !operacao) {
        throw new BadRequestException(`Formato inválido: ${par}. Use tabela:operacao`);
      }

      const operacaoUpper = operacao.toUpperCase() as TipoOperacaoSigla;

      if (!OPERACOES_VALIDAS.includes(operacaoUpper)) {
        throw new BadRequestException(`Operação inválida: ${operacao}`);
      }

      const resultado = await this.verificarPermissaoUseCase.executar({
        codUsuario,
        tabela,
        operacao: operacaoUpper,
      });

      resultados.push(resultado);
    }

    const totalPermitidas = resultados.filter((r) => r.permitido).length;

    return {
      verificacoes: resultados,
      total: resultados.length,
      totalPermitidas,
      totalNegadas: resultados.length - totalPermitidas,
    };
  }

  /**
   * Lista todas as permissões de escrita de um usuário.
   */
  @Get('usuario/:codUsuario')
  @ApiOperation({
    summary: 'Listar permissões do usuário',
    description: 'Retorna todas as permissões de escrita do usuário (diretas e via roles)',
  })
  @ApiParam({ name: 'codUsuario', description: 'Código do usuário', type: Number })
  @ApiResponse({ status: 200, type: PermissoesUsuarioRespostaDto })
  async listarPermissoesUsuario(
    @Param('codUsuario', ParseIntPipe) codUsuario: number,
  ): Promise<ObterPermissoesUsuarioSaida> {
    return this.obterPermissoesUsuarioUseCase.executar({
      codUsuario,
    });
  }

  /**
   * Lista permissões de um usuário para uma tabela específica.
   */
  @Get('usuario/:codUsuario/tabela/:tabela')
  @ApiOperation({
    summary: 'Listar permissões do usuário para uma tabela',
    description: 'Retorna as permissões de escrita do usuário para uma tabela específica',
  })
  @ApiParam({ name: 'codUsuario', description: 'Código do usuário', type: Number })
  @ApiParam({ name: 'tabela', description: 'Nome da tabela' })
  @ApiResponse({ status: 200, type: PermissoesUsuarioRespostaDto })
  async listarPermissoesUsuarioTabela(
    @Param('codUsuario', ParseIntPipe) codUsuario: number,
    @Param('tabela') tabela: string,
  ): Promise<ObterPermissoesUsuarioSaida> {
    return this.obterPermissoesUsuarioUseCase.executar({
      codUsuario,
      tabela,
    });
  }
}
