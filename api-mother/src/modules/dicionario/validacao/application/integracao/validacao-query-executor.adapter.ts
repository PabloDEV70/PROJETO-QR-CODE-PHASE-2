import { Injectable } from '@nestjs/common';
import { ValidacaoService } from '../services/validacao.service';
import { Resultado } from '../../../shared/resultado';

/**
 * Adapter para integração com QueryExecutor.
 *
 * Valida queries dinâmicas contra metadados do dicionário.
 */
@Injectable()
export class ValidacaoQueryExecutorAdapter {
  constructor(private readonly validacaoService: ValidacaoService) {}

  /**
   * Valida se campos existem na tabela antes de executar query.
   *
   * @param nomeTabela - Nome da tabela
   * @param campos - Lista de campos a selecionar/filtrar
   * @returns Resultado da validação
   */
  async validarCamposQuery(nomeTabela: string, campos: string[]): Promise<Resultado<void>> {
    const schema = await this.validacaoService['provedorSchema'].obterSchema(nomeTabela);

    const camposInvalidos: string[] = [];

    for (const campo of campos) {
      const campoNormalizado = campo.toUpperCase().trim();

      // Ignorar agregações (COUNT, SUM, etc)
      if (this.ehAgregacao(campoNormalizado)) {
        continue;
      }

      // Extrair nome do campo (remover aliases)
      const nomeCampo = this.extrairNomeCampo(campoNormalizado);

      if (!schema.campos.has(nomeCampo)) {
        camposInvalidos.push(campo);
      }
    }

    if (camposInvalidos.length > 0) {
      return Resultado.falhar(`Campos inválidos na tabela ${nomeTabela}: ${camposInvalidos.join(', ')}`);
    }

    return Resultado.ok<void>();
  }

  /**
   * Valida parâmetros de filtro (WHERE).
   *
   * @param nomeTabela - Nome da tabela
   * @param filtros - Objeto com filtros {campo: valor}
   * @returns Resultado da validação
   */
  async validarFiltros(nomeTabela: string, filtros: Record<string, any>): Promise<Resultado<void>> {
    return this.validacaoService.validarDados(nomeTabela, filtros);
  }

  /**
   * Verifica se string é uma agregação SQL.
   */
  private ehAgregacao(campo: string): boolean {
    const agregaroes = ['COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'DISTINCT'];
    return agregaroes.some((ag) => campo.startsWith(ag + '('));
  }

  /**
   * Extrai nome do campo (sem alias).
   */
  private extrairNomeCampo(campo: string): string {
    // Remove alias (campo AS alias ou campo alias)
    let nome = campo.split(' AS ')[0].split(' ')[0];

    // Remove prefixo de tabela (TABELA.CAMPO)
    if (nome.includes('.')) {
      nome = nome.split('.')[1];
    }

    return nome.trim();
  }
}
