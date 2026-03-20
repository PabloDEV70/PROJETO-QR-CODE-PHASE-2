import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Body,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';
import { ConstructorService } from '../application/constructor.service';

@ApiTags('Constructor')
@ApiBearerAuth()
@Controller('constructor')
@UseGuards(AuthGuard('jwt'))
export class ConstructorController {
  constructor(
    private readonly constructorService: ConstructorService,
    private readonly logger: StructuredLogger,
  ) {}

  /**
   * GET /constructor/health
   * Health check do serviço (sem autenticação)
   */
  @Get('health')
  @UseGuards() // Sem guards
  @ApiOperation({
    summary: 'Health check',
    description: 'Verifica se o serviço de construtor está funcionando',
  })
  @HttpCode(200)
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'constructor',
    };
  }

  /**
   * GET /constructor/screens
   * Listar telas/instâncias disponíveis
   */
  @Get('screens')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Listar telas disponíveis',
    description: 'Retorna lista de telas/instâncias raiz disponíveis',
  })
  @ApiResponse({ status: 200, description: 'Lista de telas obtida com sucesso' })
  @ApiResponse({ status: 401, description: 'Token inválido ou expirado' })
  async obterTelas(@Query('database') database?: string) {
    try {
      const telas = await this.constructorService.obterTelasDisponiveis();

      return {
        telas,
        total: telas.length,
        bancoDados: database || 'TESTE',
      };
    } catch (erro) {
      this.logger.error('Erro ao listar telas', erro as Error);
      throw new BadRequestException('Erro ao listar telas disponíveis');
    }
  }

  /**
   * GET /constructor/screens/:name
   * Obter definição completa de uma tela
   */
  @Get('screens/:name')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Obter definição de tela',
    description: 'Retorna definição completa da tela com campos, controles, permissões',
  })
  @ApiResponse({ status: 200, description: 'Definição obtida com sucesso' })
  @ApiResponse({ status: 404, description: 'Tela não encontrada' })
  async obterDefinicaoTela(
    @Param('name') name: string,
    @Query('codusu') codusu?: number,
    @Query('database') database?: string,
  ) {
    try {
      const definicao = await this.constructorService.obterDefinicaoTela(name, codusu);

      return {
        ...definicao,
        bancoDados: database || 'TESTE',
      };
    } catch (erro) {
      this.logger.error(`Erro ao obter definição da tela ${name}`, erro as Error);
      throw erro;
    }
  }

  /**
   * GET /constructor/screens/:name/data
   * Obter dados de exemplo da tabela associada à tela
   */
  @Get('screens/:name/data')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Obter dados de exemplo',
    description: 'Retorna dados reais da tabela associada à tela com paginação',
  })
  @ApiResponse({ status: 200, description: 'Dados obtidos com sucesso' })
  async obterDados(
    @Param('name') name: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('database') database?: string,
  ) {
    try {
      // Validar parâmetros
      const limiteNumerado = limit ? parseInt(String(limit), 10) : 10;
      const offsetNumerado = offset ? parseInt(String(offset), 10) : 0;

      if (isNaN(limiteNumerado) || isNaN(offsetNumerado)) {
        throw new BadRequestException('Parâmetros limit e offset devem ser números');
      }

      const resultado = await this.constructorService.obterDadosExemplo(name, limiteNumerado, offsetNumerado);

      return {
        ...resultado,
        bancoDados: database || 'TESTE',
      };
    } catch (erro) {
      this.logger.error(`Erro ao obter dados da tela ${name}`, erro as Error);
      throw erro;
    }
  }

  /**
   * POST /constructor/screens/:screenId/validate-permission
   * Validar permissão de campo para operação
   */
  @Post('screens/:screenId/validate-permission')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Validar permissão de campo',
    description: 'Valida se um usuário pode realizar uma operação em um campo específico',
  })
  async validarPermissao(
    @Param('screenId') screenId: string,
    @Body()
    body: {
      codusuario: number;
      nucontrole: number;
      nomecampo: string;
      operacao: 'read' | 'write' | 'delete';
      database?: string;
    },
  ) {
    try {
      // Validar entrada
      if (!body.codusuario || !body.nucontrole || !body.nomecampo || !body.operacao) {
        throw new BadRequestException('Campos obrigatórios faltando: codusuario, nucontrole, nomecampo, operacao');
      }

      const resultado = await this.constructorService.validarPermissaoCampo(
        body.codusuario,
        body.nucontrole,
        body.nomecampo,
        body.operacao,
      );

      return {
        ...resultado,
        campo: body.nomecampo,
        operacao: body.operacao,
        bancoDados: body.database || 'TESTE',
      };
    } catch (erro) {
      this.logger.error('Erro ao validar permissão', erro as Error);
      throw erro;
    }
  }

  /**
   * POST /constructor/telas
   * Criar nova tela (registra em TDDINS, TDDTAB e opcionalmente cria a tabela de dados)
   */
  @Post('telas')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Criar nova tela',
    description:
      'Cria uma nova tela no construtor do Sankhya. Registra em TDDINS e TDDTAB, e opcionalmente cria a tabela de dados.',
  })
  @ApiResponse({ status: 201, description: 'Tela criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou tela já existe' })
  async criarTela(
    @Body()
    body: {
      nomeInstancia: string;
      descricaoTela: string;
      descricaoTabela: string;
      criarTabela?: boolean;
      colunas?: Array<{ nome: string; tipo: string; tamanho?: number; nulo?: boolean }>;
      database?: string;
    },
  ) {
    try {
      // Validar entrada (nomeTabela é calculado automaticamente pelo service)
      if (!body.nomeInstancia || !body.descricaoTela || !body.descricaoTabela) {
        throw new BadRequestException('Campos obrigatórios faltando: nomeInstancia, descricaoTela, descricaoTabela');
      }

      const resultado = await this.constructorService.criarTela({
        nomeInstancia: body.nomeInstancia,
        descricaoTela: body.descricaoTela,
        descricaoTabela: body.descricaoTabela,
        criarTabela: body.criarTabela ?? true,
        colunas: body.colunas,
        database: body.database || 'TESTE',
      });

      return {
        ...resultado,
        bancoDados: body.database || 'TESTE',
      };
    } catch (erro) {
      this.logger.error('Erro ao criar tela', erro as Error);
      throw erro;
    }
  }

  /**
   * DELETE /constructor/telas/:nomeInstancia
   * Deletar tela (remove de TDDINS, TDDTAB e opcionalmente deleta a tabela)
   */
  @Delete('telas/:nomeInstancia')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Deletar tela',
    description:
      'Deleta uma tela do construtor do Sankhya. Remove de TDDINS e TDDTAB, e opcionalmente deleta a tabela de dados.',
  })
  @ApiResponse({ status: 200, description: 'Tela deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Tela não encontrada' })
  async deletarTela(
    @Param('nomeInstancia') nomeInstancia: string,
    @Query('deletarTabela') deletarTabela?: string | boolean,
    @Query('database') database?: string,
  ) {
    try {
      const resultado = await this.constructorService.deletarTela(
        nomeInstancia,
        deletarTabela === true || deletarTabela === 'true',
        database || 'TESTE',
      );

      return {
        ...resultado,
        bancoDados: database || 'TESTE',
      };
    } catch (erro) {
      this.logger.error(`Erro ao deletar tela ${nomeInstancia}`, erro as Error);
      throw erro;
    }
  }

  /**
   * GET /constructor/telas
   * Listar todas as telas adicionais (ADICIONAL='S')
   */
  @Get('telas')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Listar telas adicionais',
    description: 'Retorna lista de todas as telas adicionais criadas (ADICIONAL=S)',
  })
  @ApiResponse({ status: 200, description: 'Lista de telas obtida com sucesso' })
  async listarTelasAdicionais(@Query('database') database?: string) {
    try {
      const telas = await this.constructorService.obterTelasDisponiveis();

      // Filtrar apenas telas adicionais
      const telasFiltradas = telas.filter((t: any) => t.ADICIONAL === 'S');

      return {
        telas: telasFiltradas,
        total: telasFiltradas.length,
        bancoDados: database || 'TESTE',
      };
    } catch (erro) {
      this.logger.error('Erro ao listar telas adicionais', erro as Error);
      throw new BadRequestException('Erro ao listar telas adicionais');
    }
  }
}
