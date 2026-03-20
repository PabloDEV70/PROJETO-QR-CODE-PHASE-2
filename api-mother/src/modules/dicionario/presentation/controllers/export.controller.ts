import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { GerarDocTabelaUseCase } from '../../application/use-cases/gerar-doc-tabela';
import { ExportarJSONUseCase } from '../../application/use-cases/exportar-json';

/**
 * Controller para export de documentação do dicionário.
 *
 * @module Dicionario/Presentation
 */
@Controller('dicionario/export')
@ApiTags('Dicionário - Export')
@ApiBearerAuth()
export class ExportController {
  constructor(
    private readonly gerarDocTabelaUseCase: GerarDocTabelaUseCase,
    private readonly exportarJSONUseCase: ExportarJSONUseCase,
  ) {}

  /**
   * GET /dicionario/export/tabela/:nomeTabela/doc
   *
   * Gera documentação de uma tabela.
   */
  @Get('tabela/:nomeTabela/doc')
  @ApiOperation({ summary: 'Gerar documentação de tabela' })
  @ApiQuery({ name: 'formato', enum: ['markdown', 'html', 'pdf'], required: false })
  @ApiQuery({ name: 'incluirCampos', type: Boolean, required: false })
  @ApiResponse({ status: 200, description: 'Documentação gerada' })
  async gerarDocTabela(
    @Query('nomeTabela') nomeTabela: string,
    @Query('formato') formato: 'markdown' | 'html' | 'pdf' = 'markdown',
    @Query('incluirCampos') incluirCampos: boolean = true,
    @Query('tokenUsuario') tokenUsuario: string,
    @Res() res: Response,
  ) {
    const resultado = await this.gerarDocTabelaUseCase.executar({
      tokenUsuario: tokenUsuario || 'mock-token',
      nomeTabela,
      formato,
      incluirCampos,
    });

    // Definir content-type baseado no formato
    const contentType = formato === 'markdown' ? 'text/markdown' : formato === 'html' ? 'text/html' : 'application/pdf';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${nomeTabela}.${formato}"`);

    return res.send(resultado.conteudo);
  }

  /**
   * GET /dicionario/export/json
   *
   * Exporta dicionário em JSON.
   */
  @Get('json')
  @ApiOperation({ summary: 'Exportar dicionário em JSON' })
  @ApiQuery({ name: 'tipo', enum: ['tabela', 'campo', 'dicionario-completo'], required: true })
  @ApiQuery({ name: 'nomeTabela', required: false })
  @ApiQuery({ name: 'nomeCampo', required: false })
  @ApiQuery({ name: 'incluirMetadados', type: Boolean, required: false })
  @ApiResponse({ status: 200, description: 'Dados exportados em JSON' })
  async exportarJSON(
    @Query('tipo') tipo: 'tabela' | 'campo' | 'dicionario-completo',
    @Query('nomeTabela') nomeTabela: string,
    @Query('nomeCampo') nomeCampo: string,
    @Query('incluirMetadados') incluirMetadados: boolean,
    @Query('tokenUsuario') tokenUsuario: string,
  ) {
    const resultado = await this.exportarJSONUseCase.executar({
      tokenUsuario: tokenUsuario || 'mock-token',
      tipo,
      nomeTabela,
      nomeCampo,
      incluirMetadados,
    });

    return resultado;
  }
}
