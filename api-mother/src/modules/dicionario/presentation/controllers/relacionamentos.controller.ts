/**
 * D4-T11: Controller para Relacionamentos
 *
 * Endpoints para consulta de relacionamentos do dicionário de dados Sankhya.
 * Rota base: /dicionario/relacionamentos
 */
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

// Use Cases
import { ListarRelacionamentosUseCase } from '../../application/use-cases/listar-relacionamentos';
import { ObterCamposRelacionamentoUseCase } from '../../application/use-cases/obter-campos-relacionamento';
import { ObterTabelasRelacionadasUseCase } from '../../application/use-cases/obter-tabelas-relacionadas';

// DTOs
import { RelacionamentosTabelaRespostaDto } from '../dto/relacionamentos-tabela-resposta.dto';
import { CamposRelacionamentoRespostaDto } from '../dto/link-campo-resposta.dto';
import { GrafoTabelasRespostaDto } from '../dto/grafo-tabelas-resposta.dto';

@ApiTags('Relacionamentos')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('dicionario/relacionamentos')
export class RelacionamentosController {
  constructor(
    private readonly listarRelacionamentosUseCase: ListarRelacionamentosUseCase,
    private readonly obterCamposRelacionamentoUseCase: ObterCamposRelacionamentoUseCase,
    private readonly obterTabelasRelacionadasUseCase: ObterTabelasRelacionadasUseCase,
  ) {}

  // ==================== LISTAR RELACIONAMENTOS POR TABELA ====================

  @Get('tabela/:nomeTabela')
  @ApiOperation({
    summary: 'Listar relacionamentos de uma tabela',
    description: 'Retorna todos os relacionamentos onde a tabela participa (como pai ou filho).',
  })
  @ApiParam({
    name: 'nomeTabela',
    description: 'Nome da tabela',
    example: 'TGFPAR',
  })
  @ApiQuery({
    name: 'apenasAtivos',
    description: 'Filtrar apenas relacionamentos ativos',
    required: false,
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Relacionamentos da tabela categorizados',
    type: RelacionamentosTabelaRespostaDto,
  })
  async listarRelacionamentosTabela(
    @Param('nomeTabela') nomeTabela: string,
    @Query('apenasAtivos', new DefaultValuePipe(true), ParseBoolPipe) apenasAtivos: boolean,
    @Request() req,
  ): Promise<RelacionamentosTabelaRespostaDto> {
    const tokenUsuario = this.extrairToken(req);

    const resultado = await this.listarRelacionamentosUseCase.executar({
      nomeTabela,
      tokenUsuario,
      apenasAtivos,
    });

    return {
      relacionamentosPai: resultado.relacionamentosPai,
      relacionamentosFilho: resultado.relacionamentosFilho,
      relacionamentos: resultado.relacionamentos,
      total: resultado.total,
      totalComoPai: resultado.totalComoPai,
      totalComoFilho: resultado.totalComoFilho,
    };
  }

  // ==================== OBTER CAMPOS DE LIGAÇÃO ====================

  @Get('campos/:nomeInstanciaPai/:nomeInstanciaFilho')
  @ApiOperation({
    summary: 'Obter campos de ligação de um relacionamento',
    description: 'Retorna os campos que conectam duas instâncias (tabela TDDLGC). Define os JOINs entre tabelas.',
  })
  @ApiParam({
    name: 'nomeInstanciaPai',
    description: 'Nome da instância pai (origem)',
    example: 'Parceiro',
  })
  @ApiParam({
    name: 'nomeInstanciaFilho',
    description: 'Nome da instância filha (destino)',
    example: 'Contato',
  })
  @ApiResponse({
    status: 200,
    description: 'Campos de ligação do relacionamento',
    type: CamposRelacionamentoRespostaDto,
  })
  async obterCamposRelacionamento(
    @Param('nomeInstanciaPai') nomeInstanciaPai: string,
    @Param('nomeInstanciaFilho') nomeInstanciaFilho: string,
    @Request() req,
  ): Promise<CamposRelacionamentoRespostaDto> {
    const tokenUsuario = this.extrairToken(req);

    const resultado = await this.obterCamposRelacionamentoUseCase.executar({
      nomeInstanciaPai,
      nomeInstanciaFilho,
      tokenUsuario,
    });

    return {
      relacionamento: resultado.relacionamento,
      camposLigacao: resultado.camposLigacao,
      expressaoJoin: resultado.expressaoJoin,
      total: resultado.total,
    };
  }

  // ==================== OBTER GRAFO DE TABELAS RELACIONADAS ====================

  @Get('grafo/:nomeTabela')
  @ApiOperation({
    summary: 'Obter grafo de tabelas relacionadas',
    description: 'Retorna um grafo mostrando as tabelas conectadas a partir de uma tabela central.',
  })
  @ApiParam({
    name: 'nomeTabela',
    description: 'Nome da tabela central do grafo',
    example: 'TGFPAR',
  })
  @ApiQuery({
    name: 'profundidade',
    description: 'Profundidade máxima do grafo (1-3)',
    required: false,
    example: 2,
  })
  @ApiResponse({
    status: 200,
    description: 'Grafo de tabelas relacionadas',
    type: GrafoTabelasRespostaDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tabela não encontrada',
  })
  async obterGrafoTabelas(
    @Param('nomeTabela') nomeTabela: string,
    @Query('profundidade', new DefaultValuePipe(2), ParseIntPipe) profundidade: number,
    @Request() req,
  ): Promise<GrafoTabelasRespostaDto> {
    const tokenUsuario = this.extrairToken(req);

    const resultado = await this.obterTabelasRelacionadasUseCase.executar({
      nomeTabela,
      tokenUsuario,
      profundidadeMaxima: profundidade,
    });

    return {
      tabelaCentral: resultado.tabelaCentral,
      nodos: resultado.nodos,
      arestas: resultado.arestas,
      totalTabelas: resultado.totalTabelas,
      totalRelacionamentos: resultado.totalRelacionamentos,
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
