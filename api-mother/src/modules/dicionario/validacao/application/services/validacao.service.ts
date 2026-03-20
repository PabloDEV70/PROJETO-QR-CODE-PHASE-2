import { Injectable, Inject } from '@nestjs/common';
import { Resultado } from '../../../shared/resultado';
import { IValidadorCampo, VALIDADOR_CAMPO } from '../../domain/interfaces/validador-campo.interface';
import {
  IProvedorSchemaTabela,
  PROVEDOR_SCHEMA_TABELA,
  SchemaTabela,
} from '../../domain/interfaces/schema-tabela.interface';

/**
 * Serviço central de validação via dicionário.
 *
 * Orquestra validação de dados contra metadados do dicionário Sankhya.
 */
@Injectable()
export class ValidacaoService {
  constructor(
    @Inject(VALIDADOR_CAMPO)
    private readonly validadorCampo: IValidadorCampo,
    @Inject(PROVEDOR_SCHEMA_TABELA)
    private readonly provedorSchema: IProvedorSchemaTabela,
  ) {}

  /**
   * Valida objeto completo contra schema da tabela.
   *
   * @param nomeTabela - Nome da tabela
   * @param dados - Objeto com dados a validar
   * @returns Resultado com erros de validação (se houver)
   */
  async validarDados(nomeTabela: string, dados: Record<string, any>): Promise<Resultado<void>> {
    // 1. Obter schema da tabela
    const schema = await this.provedorSchema.obterSchema(nomeTabela);

    // 2. Validar cada campo presente
    const erros: string[] = [];

    for (const [nomeCampo, valor] of Object.entries(dados)) {
      const campo = schema.campos.get(nomeCampo.toUpperCase());

      if (!campo) {
        // Campo não existe no dicionário
        erros.push(`Campo '${nomeCampo}' não existe na tabela ${nomeTabela}`);
        continue;
      }

      // Validar valor do campo
      const resultadoValidacao = this.validadorCampo.validarValor(campo, valor);
      if (resultadoValidacao.falhou) {
        erros.push(resultadoValidacao.erro!);
      }
    }

    // 3. Validar campos obrigatórios
    const resultadoObrigatorios = this.validarCamposObrigatorios(schema, dados);
    if (resultadoObrigatorios.falhou) {
      erros.push(resultadoObrigatorios.erro!);
    }

    // 4. Retornar resultado
    if (erros.length > 0) {
      return Resultado.falhar(erros.join('; '));
    }

    return Resultado.ok<void>();
  }

  /**
   * Valida apenas campos obrigatórios.
   *
   * @param schema - Schema da tabela
   * @param dados - Dados fornecidos
   */
  private validarCamposObrigatorios(schema: SchemaTabela, dados: Record<string, any>): Resultado<void> {
    const camposFaltando: string[] = [];

    for (const nomeCampo of schema.camposObrigatorios) {
      if (!(nomeCampo in dados) && !(nomeCampo.toLowerCase() in dados)) {
        camposFaltando.push(nomeCampo);
      }
    }

    if (camposFaltando.length > 0) {
      return Resultado.falhar(`Campos obrigatórios ausentes: ${camposFaltando.join(', ')}`);
    }

    return Resultado.ok<void>();
  }

  /**
   * Valida campo individual.
   *
   * @param nomeTabela - Nome da tabela
   * @param nomeCampo - Nome do campo
   * @param valor - Valor a validar
   */
  async validarCampo(nomeTabela: string, nomeCampo: string, valor: any): Promise<Resultado<void>> {
    const schema = await this.provedorSchema.obterSchema(nomeTabela);
    const campo = schema.campos.get(nomeCampo.toUpperCase());

    if (!campo) {
      return Resultado.falhar(`Campo '${nomeCampo}' não existe na tabela ${nomeTabela}`);
    }

    return this.validadorCampo.validarValor(campo, valor);
  }

  /**
   * Limpa cache de schemas (útil após atualizações no dicionário).
   *
   * @param nomeTabela - Tabela específica ou todas se omitido
   */
  limparCacheSchemas(nomeTabela?: string): void {
    this.provedorSchema.limparCache(nomeTabela);
  }
}
