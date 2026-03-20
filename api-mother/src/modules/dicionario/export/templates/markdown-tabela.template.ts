/**
 * Template Markdown para documentação de tabela.
 *
 * @module Dicionario/Export
 */
export class MarkdownTabelaTemplate {
  /**
   * Gera documentação Markdown para uma tabela.
   *
   * @param tabela - Dados da tabela
   * @param campos - Lista de campos da tabela
   * @returns Documento Markdown
   */
  static gerar(tabela: any, campos: any[]): string {
    const linhas: string[] = [];

    // Cabeçalho
    linhas.push(`# ${tabela.nomeTabela}`);
    linhas.push('');

    // Descrição
    if (tabela.descricao) {
      linhas.push(`**Descrição:** ${tabela.descricao}`);
      linhas.push('');
    }

    // Metadados
    linhas.push('## Informações');
    linhas.push('');
    linhas.push(`- **Sistema:** ${tabela.sistema || 'N/A'}`);
    linhas.push(`- **Instância:** ${tabela.instancia || 'N/A'}`);
    linhas.push(`- **Tipo:** ${tabela.tipo || 'N/A'}`);
    linhas.push(`- **Status:** ${tabela.ativo === 'S' ? 'Ativa' : 'Inativa'}`);
    linhas.push('');

    // Campos
    linhas.push('## Campos');
    linhas.push('');

    if (campos.length === 0) {
      linhas.push('*Nenhum campo definido.*');
    } else {
      // Tabela de campos
      linhas.push('| Campo | Descrição | Tipo | Tamanho | Obrigatório | Chave |');
      linhas.push('|-------|-----------|------|---------|-------------|-------|');

      for (const campo of campos) {
        const descricao = campo.descricao || '-';
        const tipo = campo.tipoCampo || '-';
        const tamanho = campo.tamanho ? campo.tamanho.toString() : '-';
        const obrigatorio = campo.obrigatorio === 'S' ? 'Sim' : 'Não';
        const chave = campo.chave === 'PRI' ? 'PK' : campo.chave === 'MUL' ? 'FK' : '-';

        linhas.push(`| ${campo.nomeCampo} | ${descricao} | ${tipo} | ${tamanho} | ${obrigatorio} | ${chave} |`);
      }
    }

    linhas.push('');

    // Rodapé
    linhas.push('---');
    linhas.push(`*Gerado automaticamente em ${new Date().toISOString()}*`);

    return linhas.join('\n');
  }
}
