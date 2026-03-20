import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IRepositorioTabela, REPOSITORIO_TABELA } from '../../../domain/repositories/tabela.repository.interface';
import { IRepositorioCampo, REPOSITORIO_CAMPO } from '../../../domain/repositories/campo.repository.interface';
import { MarkdownTabelaTemplate } from '../../../export/templates';
import { GerarDocTabelaInput } from './gerar-doc-tabela.input';
import { GerarDocTabelaOutput } from './gerar-doc-tabela.output';

/**
 * Caso de uso para gerar documentação de tabela.
 *
 * Gera documentação completa de uma tabela em formato Markdown, HTML ou PDF.
 *
 * @module Dicionario
 */
@Injectable()
export class GerarDocTabelaUseCase {
  constructor(
    @Inject(REPOSITORIO_TABELA)
    private readonly repositorioTabela: IRepositorioTabela,
    @Inject(REPOSITORIO_CAMPO)
    private readonly repositorioCampo: IRepositorioCampo,
  ) {}

  /**
   * Executa o caso de uso para gerar documentação.
   *
   * @param entrada - Dados de entrada
   * @returns Documentação gerada
   */
  async executar(entrada: GerarDocTabelaInput): Promise<GerarDocTabelaOutput> {
    const nomeTabela = entrada.nomeTabela.toUpperCase();

    // Buscar tabela
    const tabela = await this.repositorioTabela.buscarPorNome(nomeTabela, entrada.tokenUsuario);

    if (!tabela) {
      throw new NotFoundException(`Tabela ${nomeTabela} não encontrada`);
    }

    // Buscar campos se solicitado
    let campos: any[] = [];
    if (entrada.incluirCampos !== false) {
      const camposEntidades = await this.repositorioCampo.buscarPorTabela(nomeTabela, entrada.tokenUsuario);
      // Converter entidades para objetos simples
      campos = camposEntidades.map((c) => ({
        nomeCampo: c.nomeCampo,
        descricao: c.descricao,
        tipoCampo: c.tipo?.toString(),
        tamanho: c.tamanho,
        decimais: c.decimais,
        obrigatorio: c.obrigatorio,
        chave: c.ehChave(),
        valorPadrao: c.valorPadrao,
      }));
    }

    // Gerar documentação conforme formato
    let conteudo: string;

    switch (entrada.formato) {
      case 'markdown':
        conteudo = MarkdownTabelaTemplate.gerar(
          {
            nomeTabela: tabela.nomeTabela,
            descricao: tabela.descricao,
            sistema: tabela.ehSistema(),
            instancia: tabela.nomeInstancia,
            tipo: tabela.tipoCrud,
            ativo: tabela.ativa,
          },
          campos,
        );
        break;

      case 'html':
        // TODO: Implementar geração HTML
        conteudo = this.gerarHTML(tabela, campos);
        break;

      case 'pdf':
        // TODO: Implementar geração PDF
        throw new Error('Geração de PDF ainda não implementada');

      default:
        throw new Error(`Formato inválido: ${entrada.formato}`);
    }

    return {
      conteudo,
      formato: entrada.formato,
      nomeTabela,
      geradoEm: new Date(),
    };
  }

  /**
   * Gera documentação em HTML (simplificado).
   */
  private gerarHTML(tabela: any, campos: any[]): string {
    const markdown = MarkdownTabelaTemplate.gerar(tabela, campos);
    // Conversão básica markdown -> HTML (em produção, usar biblioteca como marked)
    return `<html><body><pre>${markdown}</pre></body></html>`;
  }
}
