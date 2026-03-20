/**
 * Template Markdown para documentação de campo.
 *
 * @module Dicionario/Export
 */
export class MarkdownCampoTemplate {
  /**
   * Gera documentação Markdown para um campo.
   *
   * @param campo - Dados do campo
   * @param opcoes - Opções do campo (se aplicável)
   * @returns Documento Markdown
   */
  static gerar(campo: any, opcoes?: any[]): string {
    const linhas: string[] = [];

    // Cabeçalho
    linhas.push(`# ${campo.nomeTabela}.${campo.nomeCampo}`);
    linhas.push('');

    // Descrição
    if (campo.descricao) {
      linhas.push(`**Descrição:** ${campo.descricao}`);
      linhas.push('');
    }

    // Propriedades
    linhas.push('## Propriedades');
    linhas.push('');
    linhas.push(`- **Tipo:** ${campo.tipoCampo || 'N/A'}`);
    linhas.push(`- **Tamanho:** ${campo.tamanho || 'N/A'}`);
    linhas.push(`- **Decimais:** ${campo.decimais || 'N/A'}`);
    linhas.push(`- **Obrigatório:** ${campo.obrigatorio === 'S' ? 'Sim' : 'Não'}`);
    linhas.push(`- **Chave:** ${campo.chave || 'N/A'}`);
    linhas.push(`- **Valor Padrão:** ${campo.valorPadrao || 'N/A'}`);
    linhas.push('');

    // Opções (se houver)
    if (opcoes && opcoes.length > 0) {
      linhas.push('## Opções Válidas');
      linhas.push('');
      linhas.push('| Código | Descrição |');
      linhas.push('|--------|-----------|');

      for (const opcao of opcoes) {
        linhas.push(`| ${opcao.codigo} | ${opcao.descricao || '-'} |`);
      }

      linhas.push('');
    }

    // Rodapé
    linhas.push('---');
    linhas.push(`*Gerado automaticamente em ${new Date().toISOString()}*`);

    return linhas.join('\n');
  }
}
