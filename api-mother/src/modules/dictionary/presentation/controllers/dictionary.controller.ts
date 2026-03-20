import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  ListarTabelasUseCase,
  ObterTabelaUseCase,
  ListarCamposUseCase,
  ObterCampoUseCase,
  BuscarTabelasUseCase,
} from '../../application/use-cases';
import {
  QueryPaginacaoDto,
  QueryBuscaDto,
  TabelaResponseDto,
  CampoResponseDto,
  ListaTabelasResponseDto,
  ListaCamposResponseDto,
} from '../dto';
import { Tabela, Campo } from '../../domain/entities';

/**
 * Controller: DictionaryController
 *
 * Endpoints V3 para consulta do dicionário de dados Sankhya.
 * Apenas operações READ - consulta TDDTAB, TDDCAM, TDDOPC.
 */
@ApiTags('Dictionary')
@Controller('dictionary')
export class DictionaryController {
  constructor(
    private readonly listarTabelasUseCase: ListarTabelasUseCase,
    private readonly obterTabelaUseCase: ObterTabelaUseCase,
    private readonly listarCamposUseCase: ListarCamposUseCase,
    private readonly obterCampoUseCase: ObterCampoUseCase,
    private readonly buscarTabelasUseCase: BuscarTabelasUseCase,
  ) {}

  @Get('tabelas')
  @ApiOperation({
    summary: 'Listar todas as tabelas do dicionário',
    description: 'Retorna lista paginada de tabelas do TDDTAB.',
  })
  @ApiResponse({ status: 200, type: ListaTabelasResponseDto })
  async listarTabelas(@Query() query: QueryPaginacaoDto): Promise<ListaTabelasResponseDto> {
    const resultado = await this.listarTabelasUseCase.executar({
      limite: query.limite,
      offset: query.offset,
    });

    return {
      dados: resultado.dados.map(this.mapearTabela),
      paginacao: resultado.paginacao,
    };
  }

  @Get('tabelas/buscar')
  @ApiOperation({
    summary: 'Buscar tabelas por termo',
    description: 'Busca tabelas pelo nome ou descrição.',
  })
  @ApiResponse({ status: 200, type: ListaTabelasResponseDto })
  async buscarTabelas(@Query() query: QueryBuscaDto): Promise<ListaTabelasResponseDto> {
    const resultado = await this.buscarTabelasUseCase.executar(query.termo, {
      limite: query.limite,
      offset: query.offset,
    });

    return {
      dados: resultado.dados.map(this.mapearTabela),
      paginacao: resultado.paginacao,
    };
  }

  @Get('tabelas/:nome')
  @ApiOperation({
    summary: 'Obter tabela por nome',
    description: 'Retorna detalhes de uma tabela específica.',
  })
  @ApiParam({ name: 'nome', example: 'TGFPAR' })
  @ApiResponse({ status: 200, type: TabelaResponseDto })
  @ApiResponse({ status: 404, description: 'Tabela não encontrada' })
  async obterTabela(@Param('nome') nome: string): Promise<TabelaResponseDto> {
    const tabela = await this.obterTabelaUseCase.executar(nome);
    return this.mapearTabela(tabela);
  }

  @Get('tabelas/:nome/campos')
  @ApiOperation({
    summary: 'Listar campos de uma tabela',
    description: 'Retorna lista paginada de campos da tabela.',
  })
  @ApiParam({ name: 'nome', example: 'TGFPAR' })
  @ApiResponse({ status: 200, type: ListaCamposResponseDto })
  async listarCampos(@Param('nome') nome: string, @Query() query: QueryPaginacaoDto): Promise<ListaCamposResponseDto> {
    const resultado = await this.listarCamposUseCase.executar(nome, {
      limite: query.limite,
      offset: query.offset,
    });

    return {
      dados: resultado.dados.map(this.mapearCampo),
      paginacao: resultado.paginacao,
    };
  }

  @Get('tabelas/:nomeTabela/campos/:nomeCampo')
  @ApiOperation({
    summary: 'Obter campo específico com opções',
    description: 'Retorna detalhes de um campo incluindo suas opções (TDDOPC).',
  })
  @ApiParam({ name: 'nomeTabela', example: 'TGFPAR' })
  @ApiParam({ name: 'nomeCampo', example: 'ATIVO' })
  @ApiResponse({ status: 200, type: CampoResponseDto })
  @ApiResponse({ status: 404, description: 'Campo não encontrado' })
  async obterCampo(
    @Param('nomeTabela') nomeTabela: string,
    @Param('nomeCampo') nomeCampo: string,
  ): Promise<CampoResponseDto> {
    const campo = await this.obterCampoUseCase.executar(nomeTabela, nomeCampo);
    return this.mapearCampoCompleto(campo);
  }

  private mapearTabela(tabela: Tabela): TabelaResponseDto {
    return {
      nomeTabela: tabela.nomeTabela,
      descricao: tabela.descricao,
      tipoNumeracao: tabela.tipoNumeracao,
      numeroCampoNumeracao: tabela.numeroCampoNumeracao,
      adicional: tabela.adicional,
    };
  }

  private mapearCampo(campo: Campo): CampoResponseDto {
    return {
      numeroCampo: campo.numeroCampo,
      nomeTabela: campo.nomeTabela,
      nomeCampo: campo.nomeCampo,
      descricao: campo.descricao,
      tipoCampo: campo.tipoCampo,
      tipoLegivel: campo.obterTipoLegivel(),
      tamanho: campo.tamanho,
      permitePesquisa: campo.permitePesquisar(),
      calculado: campo.ehCalculado(),
      ordem: campo.ordem,
    };
  }

  private mapearCampoCompleto(campo: Campo): CampoResponseDto {
    return {
      ...this.mapearCampo(campo),
      opcoes: campo.opcoes.map((o) => ({
        valor: o.valor,
        opcao: o.opcao,
        padrao: o.padrao,
        ordem: o.ordem,
      })),
    };
  }
}
