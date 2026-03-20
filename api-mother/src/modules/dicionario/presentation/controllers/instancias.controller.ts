/**
 * D4-T10: Controller para Instâncias
 *
 * Endpoints para consulta de instâncias do dicionário de dados Sankhya.
 * Rota base: /dicionario/instancias
 */
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  NotFoundException,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

// Use Cases
import { ListarInstanciasTabelaUseCase } from '../../application/use-cases/listar-instancias-tabela';
import { ObterInstanciaUseCase } from '../../application/use-cases/obter-instancia';
import { ObterInstanciaCompletaUseCase } from '../../application/use-cases/obter-instancia-completa';
import { ObterHierarquiaInstanciasUseCase } from '../../application/use-cases/obter-hierarquia-instancias';

// DTOs
import { InstanciaRespostaDto, ListaInstanciasRespostaDto } from '../dto/instancia-resposta.dto';
import { InstanciaCompletaRespostaDto } from '../dto/instancia-completa-resposta.dto';
import { HierarquiaInstanciasRespostaDto } from '../dto/hierarquia-instancias-resposta.dto';

@ApiTags('Instâncias')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('dicionario/instancias')
export class InstanciasController {
  constructor(
    private readonly listarInstanciasTabelaUseCase: ListarInstanciasTabelaUseCase,
    private readonly obterInstanciaUseCase: ObterInstanciaUseCase,
    private readonly obterInstanciaCompletaUseCase: ObterInstanciaCompletaUseCase,
    private readonly obterHierarquiaInstanciasUseCase: ObterHierarquiaInstanciasUseCase,
  ) {}

  // ==================== LISTAR INSTÂNCIAS POR TABELA ====================

  @Get('tabela/:nomeTabela')
  @ApiOperation({
    summary: 'Listar instâncias de uma tabela',
    description: 'Retorna todas as instâncias associadas a uma tabela específica (TDDINS).',
  })
  @ApiParam({
    name: 'nomeTabela',
    description: 'Nome da tabela',
    example: 'TGFPAR',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de instâncias da tabela',
    type: ListaInstanciasRespostaDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tabela não encontrada',
  })
  async listarInstanciasTabela(
    @Param('nomeTabela') nomeTabela: string,
    @Request() req,
  ): Promise<ListaInstanciasRespostaDto> {
    const tokenUsuario = this.extrairToken(req);

    const resultado = await this.listarInstanciasTabelaUseCase.executar({
      nomeTabela,
      tokenUsuario,
    });

    return {
      instancias: resultado.instancias.map((i) => ({
        nomeInstancia: i.nomeInstancia,
        nomeTabela: i.nomeTabela,
        descricao: i.descricao,
        ordem: i.ordem,
        ativa: i.ativa,
      })),
      total: resultado.total,
    };
  }

  // ==================== OBTER INSTÂNCIA POR NOME ====================

  @Get(':nomeInstancia')
  @ApiOperation({
    summary: 'Obter instância por nome',
    description: 'Retorna detalhes de uma instância específica.',
  })
  @ApiParam({
    name: 'nomeInstancia',
    description: 'Nome da instância',
    example: 'Parceiro',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da instância',
    type: InstanciaRespostaDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Instância não encontrada',
  })
  async obterInstancia(@Param('nomeInstancia') nomeInstancia: string, @Request() req): Promise<InstanciaRespostaDto> {
    const tokenUsuario = this.extrairToken(req);

    const resultado = await this.obterInstanciaUseCase.executar({
      nomeInstancia,
      tokenUsuario,
    });

    if (!resultado.instancia) {
      throw new NotFoundException(`Instância '${nomeInstancia}' não encontrada`);
    }

    return {
      nomeInstancia: resultado.instancia.nomeInstancia,
      nomeTabela: resultado.instancia.nomeTabela,
      descricao: resultado.instancia.descricao,
      ordem: resultado.instancia.ordem,
      ativa: resultado.instancia.ativa,
    };
  }

  // ==================== OBTER INSTÂNCIA COMPLETA ====================

  @Get(':nomeInstancia/completa')
  @ApiOperation({
    summary: 'Obter instância com relacionamentos',
    description: 'Retorna instância com todos os seus relacionamentos (pai e filho).',
  })
  @ApiParam({
    name: 'nomeInstancia',
    description: 'Nome da instância',
    example: 'Parceiro',
  })
  @ApiResponse({
    status: 200,
    description: 'Instância completa com relacionamentos',
    type: InstanciaCompletaRespostaDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Instância não encontrada',
  })
  async obterInstanciaCompleta(
    @Param('nomeInstancia') nomeInstancia: string,
    @Request() req,
  ): Promise<InstanciaCompletaRespostaDto> {
    const tokenUsuario = this.extrairToken(req);

    const resultado = await this.obterInstanciaCompletaUseCase.executar({
      nomeInstancia,
      tokenUsuario,
    });

    if (!resultado.instancia) {
      throw new NotFoundException(`Instância '${nomeInstancia}' não encontrada`);
    }

    return {
      nomeInstancia: resultado.instancia.nomeInstancia,
      nomeTabela: resultado.instancia.nomeTabela,
      descricao: resultado.instancia.descricao,
      ordem: resultado.instancia.ordem,
      ativa: resultado.instancia.ativa,
      relacionamentosPai: resultado.instancia.relacionamentosPai,
      relacionamentosFilho: resultado.instancia.relacionamentosFilho,
      totalRelacionamentos: resultado.instancia.totalRelacionamentos,
    };
  }

  // ==================== OBTER HIERARQUIA DE INSTÂNCIAS ====================

  @Get(':nomeInstancia/hierarquia')
  @ApiOperation({
    summary: 'Obter hierarquia de instâncias',
    description: 'Retorna árvore de instâncias relacionadas a partir de uma instância raiz.',
  })
  @ApiParam({
    name: 'nomeInstancia',
    description: 'Nome da instância raiz',
    example: 'Parceiro',
  })
  @ApiQuery({
    name: 'profundidade',
    description: 'Profundidade máxima da árvore (1-5)',
    required: false,
    example: 3,
  })
  @ApiResponse({
    status: 200,
    description: 'Hierarquia de instâncias',
    type: HierarquiaInstanciasRespostaDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Instância não encontrada',
  })
  async obterHierarquiaInstancias(
    @Param('nomeInstancia') nomeInstancia: string,
    @Query('profundidade', new DefaultValuePipe(3), ParseIntPipe) profundidade: number,
    @Request() req,
  ): Promise<HierarquiaInstanciasRespostaDto> {
    const tokenUsuario = this.extrairToken(req);

    const resultado = await this.obterHierarquiaInstanciasUseCase.executar({
      nomeInstancia,
      tokenUsuario,
      profundidadeMaxima: profundidade,
    });

    if (!resultado.hierarquia) {
      throw new NotFoundException(`Instância '${nomeInstancia}' não encontrada`);
    }

    return {
      hierarquia: resultado.hierarquia,
      totalInstancias: resultado.totalInstancias,
      profundidade: resultado.profundidade,
    };
  }

  // ==================== MÉTODOS AUXILIARES ====================

  private extrairToken(req: any): string {
    const authHeader = req.headers?.authorization;
    if (!authHeader) {
      return '';
    }
    return authHeader.replace('Bearer ', '');
  }
}
