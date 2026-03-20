/**
 * Controller: DicionarioController
 *
 * Endpoints para consulta do dicionário de dados Sankhya.
 * Disponibiliza informações sobre tabelas, campos, instâncias e relacionamentos.
 *
 * Rotas base: /dicionario
 */
import { Controller, Get, Param, Query, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

// Use Cases
import { ObterTabelasAtivasUseCase } from '../../application/use-cases/obter-tabelas-ativas';
import { ObterTabelaPorNomeUseCase } from '../../application/use-cases/obter-tabela-por-nome';
import { ObterCamposTabelaUseCase } from '../../application/use-cases/obter-campos-tabela';
import { ObterInstanciasTabelaUseCase } from '../../application/use-cases/obter-instancias-tabela';
import { ObterRelacionamentosTabelaUseCase } from '../../application/use-cases/obter-relacionamentos-tabela';
import { PesquisarDicionarioUseCase } from '../../application/use-cases/pesquisar-dicionario';

// DTOs
import { TabelaRespostaDto, ListaTabelasRespostaDto } from '../dto/tabela-resposta.dto';
import { ListaCamposRespostaDto } from '../dto/campo-resposta.dto';
import { ListaInstanciasRespostaDto } from '../dto/instancia-resposta.dto';
import { ListaRelacionamentosRespostaDto } from '../dto/relacionamento-resposta.dto';
import { ResultadoPesquisaRespostaDto, PesquisaDicionarioDto } from '../dto/resultado-pesquisa.dto';

@ApiTags('Dictionary')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('dicionario')
export class DicionarioController {
  constructor(
    private readonly obterTabelasAtivasUseCase: ObterTabelasAtivasUseCase,
    private readonly obterTabelaPorNomeUseCase: ObterTabelaPorNomeUseCase,
    private readonly obterCamposTabelaUseCase: ObterCamposTabelaUseCase,
    private readonly obterInstanciasTabelaUseCase: ObterInstanciasTabelaUseCase,
    private readonly obterRelacionamentosTabelaUseCase: ObterRelacionamentosTabelaUseCase,
    private readonly pesquisarDicionarioUseCase: PesquisarDicionarioUseCase,
  ) {}

  // ==================== TABELAS ====================

  @Get('tabelas')
  @ApiOperation({
    summary: 'List active dictionary tables',
    description: 'Returns a list of all active tables from the Sankhya data dictionary (TDDTAB).',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tabelas ativas',
    type: ListaTabelasRespostaDto,
  })
  async listarTabelas(@Request() req): Promise<ListaTabelasRespostaDto> {
    const tokenUsuario = this.extrairToken(req);

    const resultado = await this.obterTabelasAtivasUseCase.executar({
      tokenUsuario,
    });

    return {
      tabelas: resultado.tabelas.map((t) => this.mapearTabelaDto(t)),
      total: resultado.total,
    };
  }

  @Get('tabelas/:nome')
  @ApiOperation({
    summary: 'Get table by name',
    description: 'Returns details of a specific table from the data dictionary.',
  })
  @ApiParam({
    name: 'nome',
    description: 'Nome da tabela',
    example: 'TGFPAR',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da tabela',
    type: TabelaRespostaDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tabela não encontrada',
  })
  async buscarTabelaPorNome(@Param('nome') nome: string, @Request() req): Promise<TabelaRespostaDto> {
    const tokenUsuario = this.extrairToken(req);
    const nomeUpperCase = nome.toUpperCase();

    const resultado = await this.obterTabelaPorNomeUseCase.executar({
      nomeTabela: nomeUpperCase,
      tokenUsuario,
    });

    if (!resultado.tabela) {
      throw new NotFoundException(`Tabela '${nomeUpperCase}' não encontrada no dicionário`);
    }

    return this.mapearTabelaDto(resultado.tabela);
  }

  // ==================== CAMPOS ====================

  @Get('tabelas/:nome/campos')
  @ApiOperation({
    summary: 'List table fields',
    description: 'Returns all fields of a specific table from the data dictionary.',
  })
  @ApiParam({
    name: 'nome',
    description: 'Nome da tabela',
    example: 'TGFPAR',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de campos da tabela',
    type: ListaCamposRespostaDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tabela não encontrada',
  })
  async listarCamposTabela(@Param('nome') nome: string, @Request() req): Promise<ListaCamposRespostaDto> {
    const tokenUsuario = this.extrairToken(req);
    const nomeUpperCase = nome.toUpperCase();

    // Verificar se a tabela existe primeiro
    const tabelaResultado = await this.obterTabelaPorNomeUseCase.executar({
      nomeTabela: nomeUpperCase,
      tokenUsuario,
    });

    if (!tabelaResultado.tabela) {
      throw new NotFoundException(`Tabela '${nomeUpperCase}' não encontrada no dicionário`);
    }

    const resultado = await this.obterCamposTabelaUseCase.executar({
      nomeTabela: nomeUpperCase,
      tokenUsuario,
    });

    return {
      campos: resultado.campos.map((c) => ({
        nomeTabela: c.nomeTabela,
        nomeCampo: c.nomeCampo,
        nomeCompleto: c.nomeCompleto,
        descricao: c.descricao,
        tipo: c.tipo,
        tipoDescricao: c.tipoDescricao,
        tamanho: c.tamanho,
        decimais: c.decimais,
        obrigatorio: c.obrigatorio,
        chavePrimaria: c.chavePrimaria,
        chaveEstrangeira: c.chaveEstrangeira,
        ehChave: c.ehChave,
        apresentacao: c.apresentacao,
        valorPadrao: c.valorPadrao,
        ehVisivel: c.ehVisivel,
      })),
      total: resultado.total,
    };
  }

  // ==================== INSTÂNCIAS ====================

  @Get('tabelas/:nome/instancias')
  @ApiOperation({
    summary: 'List table instances',
    description: 'Returns all instances associated with a specific table.',
  })
  @ApiParam({
    name: 'nome',
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
  async listarInstanciasTabela(@Param('nome') nome: string, @Request() req): Promise<ListaInstanciasRespostaDto> {
    const tokenUsuario = this.extrairToken(req);
    const nomeUpperCase = nome.toUpperCase();

    // Verificar se a tabela existe primeiro
    const tabelaResultado = await this.obterTabelaPorNomeUseCase.executar({
      nomeTabela: nomeUpperCase,
      tokenUsuario,
    });

    if (!tabelaResultado.tabela) {
      throw new NotFoundException(`Tabela '${nomeUpperCase}' não encontrada no dicionário`);
    }

    const resultado = await this.obterInstanciasTabelaUseCase.executar({
      nomeTabela: nomeUpperCase,
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

  // ==================== RELACIONAMENTOS ====================

  @Get('tabelas/:nome/relacionamentos')
  @ApiOperation({
    summary: 'List table relationships',
    description: 'Returns all relationships where the table is involved (as parent or child).',
  })
  @ApiParam({
    name: 'nome',
    description: 'Nome da tabela',
    example: 'TGFPAR',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de relacionamentos da tabela',
    type: ListaRelacionamentosRespostaDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tabela não encontrada',
  })
  async listarRelacionamentosTabela(
    @Param('nome') nome: string,
    @Request() req,
  ): Promise<ListaRelacionamentosRespostaDto> {
    const tokenUsuario = this.extrairToken(req);
    const nomeUpperCase = nome.toUpperCase();

    // Verificar se a tabela existe primeiro
    const tabelaResultado = await this.obterTabelaPorNomeUseCase.executar({
      nomeTabela: nomeUpperCase,
      tokenUsuario,
    });

    if (!tabelaResultado.tabela) {
      throw new NotFoundException(`Tabela '${nomeUpperCase}' não encontrada no dicionário`);
    }

    const resultado = await this.obterRelacionamentosTabelaUseCase.executar({
      nomeTabela: nomeUpperCase,
      tokenUsuario,
    });

    return {
      relacionamentos: resultado.relacionamentos.map((r) => ({
        nomeInstanciaPai: r.nomeInstanciaPai,
        nomeInstanciaFilho: r.nomeInstanciaFilho,
        tipoLigacao: r.tipoLigacao,
        tipoLigacaoDescricao: r.tipoLigacaoDescricao,
        ordem: r.ordem,
        ativo: r.ativo,
        ehMasterDetail: r.ehMasterDetail,
      })),
      total: resultado.total,
    };
  }

  // ==================== PESQUISA GLOBAL ====================

  @Get('pesquisar')
  @ApiOperation({
    summary: 'Global dictionary search',
    description: 'Searches tables and fields by a term. Returns matching tables and fields.',
  })
  @ApiQuery({
    name: 'termo',
    description: 'Termo de busca (mínimo 2 caracteres)',
    example: 'PARC',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado da pesquisa',
    type: ResultadoPesquisaRespostaDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Termo de busca muito curto',
  })
  async pesquisarDicionario(
    @Query() query: PesquisaDicionarioDto,
    @Request() req,
  ): Promise<ResultadoPesquisaRespostaDto> {
    const tokenUsuario = this.extrairToken(req);

    const resultado = await this.pesquisarDicionarioUseCase.executar({
      termo: query.termo,
      tokenUsuario,
    });

    // Separar resultados por tipo
    const tabelas = resultado.resultados
      .filter((r) => r.tipo === 'tabela')
      .map((r) => ({
        nomeTabela: r.nomeTabela!,
        descricao: r.descricao!,
        ativa: true, // Tabelas retornadas são sempre ativas (buscamos apenas ativas)
      }));

    const campos = resultado.resultados
      .filter((r) => r.tipo === 'campo')
      .map((r) => ({
        nomeTabela: r.nomeTabela!,
        nomeCampo: r.nomeCampo!,
        descricao: r.descricao!,
        tipo: '', // Não disponível no resultado simplificado
      }));

    return {
      termo: query.termo,
      tabelas,
      campos,
      totalTabelas: tabelas.length,
      totalCampos: campos.length,
      totalGeral: resultado.total,
    };
  }

  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * Extrai o token JWT do header Authorization da requisição.
   */
  private extrairToken(req: any): string {
    const authHeader = req.headers?.authorization;
    if (!authHeader) {
      return '';
    }
    return authHeader.replace('Bearer ', '');
  }

  /**
   * Mapeia um DTO de tabela do use case para o DTO de resposta do controller.
   */
  private mapearTabelaDto(tabela: any): TabelaRespostaDto {
    return {
      nomeTabela: tabela.nomeTabela,
      descricao: tabela.descricao,
      nomeInstancia: tabela.nomeInstancia,
      modulo: tabela.modulo,
      ativa: tabela.ativa,
      tipoCrud: tabela.tipoCrud,
      ehSistema: tabela.ehSistema,
    };
  }
}
