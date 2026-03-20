import { Controller, Get, Query, Req } from '@nestjs/common';
import { GerarSchemaFormularioUseCase } from '../../application/use-cases/gerar-schema-formulario';
import { GerarSchemaGridUseCase } from '../../application/use-cases/gerar-schema-grid';
import { FormSchemaDto } from '../dto/form-schema.dto';
import { GridSchemaDto } from '../dto/grid-schema.dto';

/**
 * Controller para geração de schemas de formulário e grid.
 *
 * @module FormBuilder
 */
@Controller('dicionario/form-builder')
export class FormBuilderController {
  constructor(
    private readonly gerarSchemaFormularioUseCase: GerarSchemaFormularioUseCase,
    private readonly gerarSchemaGridUseCase: GerarSchemaGridUseCase,
  ) {}

  /**
   * GET /dicionario/form-builder/schema/form/:tabela
   *
   * Gera schema de formulário para uma tabela.
   */
  @Get('schema/form')
  async gerarSchemaFormulario(
    @Query('tabela') nomeTabela: string,
    @Query('titulo') titulo?: string,
    @Query('descricao') descricao?: string,
    @Query('incluirOcultos') incluirOcultos?: boolean,
    @Query('incluirPKs') incluirPKs?: boolean,
    @Req() req?: any,
  ): Promise<FormSchemaDto> {
    const resultado = await this.gerarSchemaFormularioUseCase.executar({
      tokenUsuario: this.extrairToken(req),
      nomeTabela,
      titulo,
      descricao,
      incluirCamposOcultos: incluirOcultos === true,
      incluirChavesPrimarias: incluirPKs === true,
    });

    return resultado.schema as FormSchemaDto;
  }

  /**
   * GET /dicionario/form-builder/schema/grid/:tabela
   *
   * Gera schema de grid para uma tabela.
   */
  @Get('schema/grid')
  async gerarSchemaGrid(
    @Query('tabela') nomeTabela: string,
    @Query('titulo') titulo?: string,
    @Query('descricao') descricao?: string,
    @Req() req?: any,
  ): Promise<GridSchemaDto> {
    const resultado = await this.gerarSchemaGridUseCase.executar({
      tokenUsuario: this.extrairToken(req),
      nomeTabela,
      titulo,
      descricao,
    });

    return resultado.schema as GridSchemaDto;
  }

  private extrairToken(req: any): string {
    return req?.headers?.authorization?.replace('Bearer ', '') || '';
  }
}
