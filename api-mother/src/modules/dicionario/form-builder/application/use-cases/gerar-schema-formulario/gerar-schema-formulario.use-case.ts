import { Injectable, Inject } from '@nestjs/common';
import { IRepositorioCampo, REPOSITORIO_CAMPO } from '../../../../domain/repositories/campo.repository.interface';
import { CONSTRUTOR_FORM_SERVICE, IConstrutorFormService } from '../../../domain/services';
import { GerarSchemaFormularioInput } from './gerar-schema-formulario.input';
import { GerarSchemaFormularioOutput } from './gerar-schema-formulario.output';

/**
 * Caso de uso para gerar schema completo de formulário.
 *
 * Busca os campos de uma tabela e constrói um schema de formulário
 * completo com validações, tipos, máscaras e configurações.
 *
 * @module FormBuilder
 */
@Injectable()
export class GerarSchemaFormularioUseCase {
  constructor(
    @Inject(REPOSITORIO_CAMPO)
    private readonly repositorioCampo: IRepositorioCampo,
    @Inject(CONSTRUTOR_FORM_SERVICE)
    private readonly construtorForm: IConstrutorFormService,
  ) {}

  /**
   * Executa o caso de uso para gerar schema de formulário.
   *
   * @param entrada - Dados de entrada contendo nome da tabela e opções
   * @returns Schema do formulário
   * @throws Error se falhar ao buscar campos ou construir schema
   */
  async executar(entrada: GerarSchemaFormularioInput): Promise<GerarSchemaFormularioOutput> {
    const nomeTabela = entrada.nomeTabela.toUpperCase();

    // Buscar campos da tabela
    const campos = await this.repositorioCampo.buscarPorTabela(nomeTabela, entrada.tokenUsuario);

    if (!campos || campos.length === 0) {
      throw new Error(`Nenhum campo encontrado para a tabela ${nomeTabela}`);
    }

    // Construir schema de formulário
    const schemaResult = this.construtorForm.construirSchemaFormulario(nomeTabela, campos, {
      titulo: entrada.titulo,
      descricao: entrada.descricao,
      incluirCamposOcultos: entrada.incluirCamposOcultos,
      incluirChavesPrimarias: entrada.incluirChavesPrimarias,
      excluirCampos: entrada.excluirCampos,
      ordenarAlfabeticamente: entrada.ordenarAlfabeticamente,
    });

    if (schemaResult.falhou) {
      throw new Error(`Erro ao construir schema do formulário: ${schemaResult.erro}`);
    }

    return {
      schema: schemaResult.obterValor(),
    };
  }
}
