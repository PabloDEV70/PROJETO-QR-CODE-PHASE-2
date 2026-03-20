/**
 * Use Case: ExportarHistorico
 *
 * Exporta o historico de auditoria em diferentes formatos.
 */

import { Injectable, Inject } from '@nestjs/common';
import { REPOSITORIO_AUDITORIA, IAuditoriaRepository, FiltrosHistorico } from '../../../domain/repositories';
import { TipoOperacao } from '../../../domain/entities';

export type FormatoExportacao = 'json' | 'csv';

export interface ExportarHistoricoInput {
  tabela?: string;
  operacao?: TipoOperacao;
  dataInicio?: Date | string;
  dataFim?: Date | string;
  formato: FormatoExportacao;
  limite?: number;
}

export interface ExportarHistoricoOutput {
  conteudo: string;
  formato: FormatoExportacao;
  nomeArquivo: string;
  totalRegistros: number;
  mimeType: string;
}

@Injectable()
export class ExportarHistoricoUseCase {
  constructor(
    @Inject(REPOSITORIO_AUDITORIA)
    private readonly repositorio: IAuditoriaRepository,
  ) {}

  async executar(input: ExportarHistoricoInput): Promise<ExportarHistoricoOutput> {
    const filtros: FiltrosHistorico = {
      tabela: input.tabela,
      operacao: input.operacao,
      dataInicio: input.dataInicio ? new Date(input.dataInicio) : undefined,
      dataFim: input.dataFim ? new Date(input.dataFim) : undefined,
      limite: input.limite || 1000,
      offset: 0,
    };

    const resultado = await this.repositorio.buscarPorFiltros(filtros);

    const dataExportacao = new Date().toISOString().split('T')[0];
    const nomeBase = input.tabela
      ? `auditoria_${input.tabela.toLowerCase()}_${dataExportacao}`
      : `auditoria_${dataExportacao}`;

    if (input.formato === 'csv') {
      return this.exportarCSV(resultado.dados, nomeBase);
    }

    return this.exportarJSON(resultado.dados, nomeBase);
  }

  private exportarJSON(dados: any[], nomeBase: string): ExportarHistoricoOutput {
    const registrosFormatados = dados.map((reg) => ({
      auditoriaId: reg.auditoriaId,
      codUsuario: reg.codUsuario,
      tabela: reg.tabela,
      operacao: reg.operacao,
      descricaoOperacao: reg.obterDescricaoOperacao(),
      dadosAntigos: reg.obterDadosAntigosParseados(),
      dadosNovos: reg.obterDadosNovosParseados(),
      dataHora: reg.dataHora.toISOString(),
      ip: reg.ip,
      chaveRegistro: reg.chaveRegistro,
      sucesso: reg.foiSucesso(),
      mensagemErro: reg.mensagemErro,
    }));

    return {
      conteudo: JSON.stringify(registrosFormatados, null, 2),
      formato: 'json',
      nomeArquivo: `${nomeBase}.json`,
      totalRegistros: dados.length,
      mimeType: 'application/json',
    };
  }

  private exportarCSV(dados: any[], nomeBase: string): ExportarHistoricoOutput {
    const cabecalho = ['ID', 'Usuario', 'Tabela', 'Operacao', 'Data/Hora', 'IP', 'Chave', 'Sucesso', 'Erro'].join(';');

    const linhas = dados.map((reg) => {
      return [
        reg.auditoriaId || '',
        reg.codUsuario,
        reg.tabela,
        reg.obterDescricaoOperacao(),
        reg.dataHora.toISOString(),
        reg.ip || '',
        reg.chaveRegistro || '',
        reg.foiSucesso() ? 'Sim' : 'Nao',
        (reg.mensagemErro || '').replace(/[;\n\r]/g, ' '),
      ].join(';');
    });

    const conteudo = [cabecalho, ...linhas].join('\n');

    return {
      conteudo,
      formato: 'csv',
      nomeArquivo: `${nomeBase}.csv`,
      totalRegistros: dados.length,
      mimeType: 'text/csv',
    };
  }
}
