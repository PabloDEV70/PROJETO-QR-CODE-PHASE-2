import { Injectable } from '@nestjs/common';
import { Resultado } from '../../../shared/resultado';
import { Campo } from '../../../domain/entities/campo.entity';
import { TipoCampo } from '../../../domain/value-objects/tipo-campo.vo';
import { ICampoFormSchema, IFormSchema, IValidationRule } from '../interfaces';

/**
 * Token de injeção de dependência do serviço ConstrutorForm.
 */
export const CONSTRUTOR_FORM_SERVICE = Symbol('ConstrutorFormService');

/**
 * Interface do serviço ConstrutorForm.
 */
export interface IConstrutorFormService {
  construirSchemaFormulario(nomeTabela: string, campos: Campo[], opcoes?: OpcoesFormulario): Resultado<IFormSchema>;

  construirSchemaCampo(campo: Campo, ordem: number): Resultado<ICampoFormSchema>;

  construirValidacoes(campo: Campo): IValidationRule[];
}

/**
 * Opções para construção de formulário.
 */
export interface OpcoesFormulario {
  /**
   * Título do formulário (padrão: nome da tabela).
   */
  titulo?: string;

  /**
   * Descrição do formulário.
   */
  descricao?: string;

  /**
   * Se deve incluir campos ocultos.
   */
  incluirCamposOcultos?: boolean;

  /**
   * Se deve incluir chaves primárias.
   */
  incluirChavesPrimarias?: boolean;

  /**
   * Campos a serem excluídos.
   */
  excluirCampos?: string[];

  /**
   * Se deve ordenar campos alfabeticamente.
   */
  ordenarAlfabeticamente?: boolean;
}

/**
 * Serviço de domínio para construir schemas de formulário.
 *
 * Constrói schemas de formulário a partir de metadados de campos do dicionário.
 *
 * @module FormBuilder
 */
@Injectable()
export class ConstrutorFormService implements IConstrutorFormService {
  /**
   * Constrói schema completo de formulário a partir de lista de campos.
   *
   * @param nomeTabela - Nome da tabela
   * @param campos - Lista de campos da tabela
   * @param opcoes - Opções de construção
   * @returns Schema de formulário
   */
  construirSchemaFormulario(
    nomeTabela: string,
    campos: Campo[],
    opcoes: OpcoesFormulario = {},
  ): Resultado<IFormSchema> {
    if (!nomeTabela || nomeTabela.trim().length === 0) {
      return Resultado.falhar('Nome da tabela não pode ser vazio');
    }

    if (!campos || campos.length === 0) {
      return Resultado.falhar('Lista de campos não pode ser vazia');
    }

    // Filtrar campos
    let camposFiltrados = this.filtrarCampos(campos, opcoes);

    // Ordenar campos
    if (opcoes.ordenarAlfabeticamente) {
      camposFiltrados = camposFiltrados.sort((a, b) => a.nomeCampo.localeCompare(b.nomeCampo));
    }

    // Construir schemas de campos
    const camposSchema: ICampoFormSchema[] = [];
    let ordem = 0;

    for (const campo of camposFiltrados) {
      const schemaResult = this.construirSchemaCampo(campo, ordem++);
      if (schemaResult.falhou) {
        return Resultado.falhar(`Erro ao construir schema do campo ${campo.nomeCampo}: ${schemaResult.erro}`);
      }
      camposSchema.push(schemaResult.obterValor());
    }

    // Identificar metadados
    const chavePrimaria = campos.find((c) => c.chavePrimaria)?.nomeCampo;
    const chavesEstrangeiras = campos.filter((c) => c.chaveEstrangeira).map((c) => c.nomeCampo);
    const camposObrigatorios = campos.filter((c) => c.obrigatorio).map((c) => c.nomeCampo);

    const schema: IFormSchema = {
      tableName: nomeTabela,
      title: opcoes.titulo || this.formatarTitulo(nomeTabela),
      description: opcoes.descricao,
      fields: camposSchema,
      metadata: {
        primaryKey: chavePrimaria,
        foreignKeys: chavesEstrangeiras,
        requiredFields: camposObrigatorios,
      },
    };

    return Resultado.ok(schema);
  }

  /**
   * Constrói schema de campo individual.
   *
   * @param campo - Campo do dicionário
   * @param ordem - Ordem de exibição
   * @returns Schema do campo
   */
  construirSchemaCampo(campo: Campo, ordem: number): Resultado<ICampoFormSchema> {
    const tipo = this.mapearTipoParaFormulario(campo.tipo);
    const validacoes = this.construirValidacoes(campo);

    const schema: ICampoFormSchema = {
      name: campo.nomeCampo,
      label: this.formatarLabel(campo.descricao || campo.nomeCampo),
      type: tipo,
      tipoSankhya: campo.tipo.valor,
      required: campo.obrigatorio,
      readonly: campo.chavePrimaria, // PKs geralmente são readonly
      defaultValue: this.obterValorPadrao(campo),
      placeholder: this.gerarPlaceholder(campo),
      helpText: this.gerarHelpText(campo),
      mask: this.gerarMascara(campo),
      validations: validacoes,
      maxLength: campo.tamanho > 0 ? campo.tamanho : undefined,
      decimals: campo.decimais > 0 ? campo.decimais : undefined,
      order: ordem,
      visible: campo.ehVisivel(),
      isPrimaryKey: campo.chavePrimaria,
      isForeignKey: campo.chaveEstrangeira,
    };

    return Resultado.ok(schema);
  }

  /**
   * Constrói lista de regras de validação para um campo.
   *
   * @param campo - Campo do dicionário
   * @returns Lista de regras de validação
   */
  construirValidacoes(campo: Campo): IValidationRule[] {
    const regras: IValidationRule[] = [];

    // Obrigatório
    if (campo.obrigatorio) {
      regras.push({
        type: 'required',
        message: `${this.formatarLabel(campo.descricao || campo.nomeCampo)} é obrigatório`,
      });
    }

    // Tamanho máximo (strings)
    if (campo.tipo.ehTexto() && campo.tamanho > 0) {
      regras.push({
        type: 'maxLength',
        value: campo.tamanho,
        message: `Máximo de ${campo.tamanho} caracteres`,
      });
    }

    // Padrão numérico
    if (campo.tipo.ehNumerico()) {
      regras.push({
        type: 'number',
        message: 'Deve ser um número válido',
      });

      if (campo.decimais > 0) {
        regras.push({
          type: 'decimal',
          value: campo.decimais,
          message: `Deve ter no máximo ${campo.decimais} casas decimais`,
        });
      }
    }

    // Padrão de data
    if (campo.tipo.ehData()) {
      regras.push({
        type: 'date',
        message: 'Deve ser uma data válida',
      });
    }

    // Padrão de hora
    if (campo.tipo.ehHora()) {
      regras.push({
        type: 'time',
        message: 'Deve ser uma hora válida (HH:mm)',
      });
    }

    return regras;
  }

  // Métodos auxiliares privados

  private filtrarCampos(campos: Campo[], opcoes: OpcoesFormulario): Campo[] {
    return campos.filter((campo) => {
      // Excluir campos específicos
      if (opcoes.excluirCampos?.includes(campo.nomeCampo)) {
        return false;
      }

      // Excluir campos ocultos
      if (!opcoes.incluirCamposOcultos && !campo.ehVisivel()) {
        return false;
      }

      // Excluir chaves primárias
      if (!opcoes.incluirChavesPrimarias && campo.chavePrimaria) {
        return false;
      }

      return true;
    });
  }

  private mapearTipoParaFormulario(tipo: TipoCampo): ICampoFormSchema['type'] {
    if (tipo.ehTexto()) {
      return 'text';
    }
    if (tipo.ehNumerico()) {
      return 'number';
    }
    if (tipo.ehData()) {
      return 'date';
    }
    if (tipo.ehHora()) {
      return 'time';
    }
    if (tipo.ehBooleano()) {
      return 'boolean';
    }
    return 'text';
  }

  private obterValorPadrao(campo: Campo): any {
    if (!campo.valorPadrao) {
      return undefined;
    }

    if (campo.tipo.ehNumerico()) {
      return parseFloat(campo.valorPadrao);
    }

    if (campo.tipo.ehBooleano()) {
      return campo.valorPadrao.toUpperCase() === 'S';
    }

    return campo.valorPadrao;
  }

  private formatarLabel(texto: string): string {
    if (!texto) {
      return '';
    }

    // Capitalizar primeira letra de cada palavra
    return texto
      .toLowerCase()
      .split(' ')
      .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  }

  private formatarTitulo(nomeTabela: string): string {
    // Remove prefixos comuns (TGF, TCF, TSI, etc)
    const semPrefixo = nomeTabela.replace(/^(TGF|TCF|TSI|AD_)/, '');
    return this.formatarLabel(semPrefixo);
  }

  private gerarPlaceholder(campo: Campo): string {
    if (campo.tipo.ehData()) {
      return 'dd/mm/aaaa';
    }
    if (campo.tipo.ehHora()) {
      return 'HH:mm';
    }
    if (campo.tipo.ehNumerico()) {
      return `Digite ${campo.descricao?.toLowerCase() || 'o valor'}`;
    }
    return `Digite ${campo.descricao?.toLowerCase() || campo.nomeCampo.toLowerCase()}`;
  }

  private gerarHelpText(campo: Campo): string | undefined {
    if (campo.tipo.ehTexto() && campo.tamanho > 0) {
      return `Máximo ${campo.tamanho} caracteres`;
    }
    if (campo.tipo.ehNumerico() && campo.decimais > 0) {
      return `Número com até ${campo.decimais} casas decimais`;
    }
    return undefined;
  }

  private gerarMascara(campo: Campo): string | undefined {
    const nomeCampo = campo.nomeCampo.toUpperCase();

    // Máscaras específicas por nome de campo
    if (nomeCampo.includes('CPF')) {
      return '000.000.000-00';
    }
    if (nomeCampo.includes('CNPJ')) {
      return '00.000.000/0000-00';
    }
    if (nomeCampo.includes('CEP')) {
      return '00000-000';
    }
    if (nomeCampo.includes('TELEFONE') || nomeCampo.includes('FONE')) {
      return '(00) 00000-0000';
    }
    if (nomeCampo.includes('PLACA')) {
      return 'AAA-0000';
    }

    return undefined;
  }
}
