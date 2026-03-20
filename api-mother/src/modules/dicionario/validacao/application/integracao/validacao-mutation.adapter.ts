import { Injectable } from '@nestjs/common';
import { ValidacaoService } from '../services/validacao.service';
import { Resultado } from '../../../shared/resultado';

/**
 * Adapter para integração com MutationV2.
 *
 * Valida dados antes de operações de mutação (INSERT, UPDATE, DELETE).
 */
@Injectable()
export class ValidacaoMutationAdapter {
  constructor(private readonly validacaoService: ValidacaoService) {}

  /**
   * Valida dados antes de INSERT.
   *
   * @param nomeTabela - Nome da tabela
   * @param dados - Dados a inserir
   * @returns Resultado da validação
   */
  async validarInsert(nomeTabela: string, dados: Record<string, any>): Promise<Resultado<void>> {
    // Validação completa: todos os campos obrigatórios devem estar presentes
    return this.validacaoService.validarDados(nomeTabela, dados);
  }

  /**
   * Valida dados antes de UPDATE.
   *
   * @param nomeTabela - Nome da tabela
   * @param dados - Dados a atualizar (podem ser parciais)
   * @returns Resultado da validação
   */
  async validarUpdate(nomeTabela: string, dados: Record<string, any>): Promise<Resultado<void>> {
    // Validação parcial: apenas campos fornecidos são validados
    // (não requer todos os campos obrigatórios)
    const schema = await this.validacaoService['provedorSchema'].obterSchema(nomeTabela);

    const erros: string[] = [];

    for (const [nomeCampo, valor] of Object.entries(dados)) {
      const campo = schema.campos.get(nomeCampo.toUpperCase());

      if (!campo) {
        erros.push(`Campo '${nomeCampo}' não existe na tabela ${nomeTabela}`);
        continue;
      }

      const resultadoValidacao = this.validacaoService['validadorCampo'].validarValor(campo, valor);
      if (resultadoValidacao.falhou) {
        erros.push(resultadoValidacao.erro!);
      }
    }

    if (erros.length > 0) {
      return Resultado.falhar(erros.join('; '));
    }

    return Resultado.ok<void>();
  }

  /**
   * Valida chaves primárias para DELETE.
   *
   * @param nomeTabela - Nome da tabela
   * @param chaves - Objeto com chaves primárias
   * @returns Resultado da validação
   */
  async validarDelete(nomeTabela: string, chaves: Record<string, any>): Promise<Resultado<void>> {
    const schema = await this.validacaoService['provedorSchema'].obterSchema(nomeTabela);

    // Verificar se todas as chaves primárias foram fornecidas
    const chavesFaltando: string[] = [];

    for (const chavePK of schema.camposChavePrimaria) {
      if (!(chavePK in chaves) && !(chavePK.toLowerCase() in chaves)) {
        chavesFaltando.push(chavePK);
      }
    }

    if (chavesFaltando.length > 0) {
      return Resultado.falhar(`Chaves primárias ausentes para DELETE: ${chavesFaltando.join(', ')}`);
    }

    // Validar valores das chaves
    for (const [nomeCampo, valor] of Object.entries(chaves)) {
      const campo = schema.campos.get(nomeCampo.toUpperCase());

      if (!campo) {
        return Resultado.falhar(`Campo '${nomeCampo}' não existe na tabela ${nomeTabela}`);
      }

      const resultadoValidacao = this.validacaoService['validadorCampo'].validarValor(campo, valor);
      if (resultadoValidacao.falhou) {
        return resultadoValidacao;
      }
    }

    return Resultado.ok<void>();
  }
}
