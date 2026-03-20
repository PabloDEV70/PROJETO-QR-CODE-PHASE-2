import { Injectable } from '@nestjs/common';
import { Campo } from '../../../domain/entities/campo.entity';

/**
 * Serviço para mensagens de erro amigáveis em português.
 *
 * Formata mensagens de validação de forma legível para usuários.
 */
@Injectable()
export class MensagensErroService {
  /**
   * Formata erro de tipo inválido.
   */
  erroTipoInvalido(campo: Campo, valorRecebido: any): string {
    const tipoEsperado = this.obterNomeTipoAmigavel(campo.tipo.valor);
    const tipoRecebido = typeof valorRecebido;

    return `O campo '${campo.descricao || campo.nomeCampo}' deve ser do tipo ${tipoEsperado}, mas foi enviado como ${tipoRecebido}`;
  }

  /**
   * Formata erro de tamanho excedido.
   */
  erroTamanhoExcedido(campo: Campo, tamanhoAtual: number): string {
    return `O campo '${campo.descricao || campo.nomeCampo}' excede o tamanho máximo permitido de ${campo.tamanho} caracteres (enviado: ${tamanhoAtual})`;
  }

  /**
   * Formata erro de campo obrigatório.
   */
  erroCampoObrigatorio(campo: Campo): string {
    return `O campo '${campo.descricao || campo.nomeCampo}' é obrigatório e não foi informado`;
  }

  /**
   * Formata erro de formato inválido.
   */
  erroFormatoInvalido(campo: Campo, detalhes?: string): string {
    let mensagem = `O campo '${campo.descricao || campo.nomeCampo}' está em formato inválido`;

    if (detalhes) {
      mensagem += `: ${detalhes}`;
    }

    return mensagem;
  }

  /**
   * Formata erro de campo inexistente.
   */
  erroCampoInexistente(nomeCampo: string, nomeTabela: string): string {
    return `O campo '${nomeCampo}' não existe na tabela ${nomeTabela}`;
  }

  /**
   * Formata erro de chave primária ausente.
   */
  erroChavePrimariaAusente(chavesAusentes: string[], nomeTabela: string): string {
    const campos = chavesAusentes.join(', ');
    return `As seguintes chaves primárias da tabela ${nomeTabela} são obrigatórias: ${campos}`;
  }

  /**
   * Obtém nome amigável do tipo de campo.
   */
  private obterNomeTipoAmigavel(tipoCodigo: string): string {
    const tipos: Record<string, string> = {
      C: 'texto',
      I: 'número inteiro',
      N: 'número decimal',
      D: 'data',
      L: 'sim/não (S ou N)',
    };

    return tipos[tipoCodigo] || tipoCodigo;
  }

  /**
   * Agrupa múltiplos erros em mensagem única.
   */
  agruparErros(erros: string[]): string {
    if (erros.length === 0) {
      return '';
    }

    if (erros.length === 1) {
      return erros[0];
    }

    return `Foram encontrados ${erros.length} erros de validação:\n${erros.map((e, i) => `${i + 1}. ${e}`).join('\n')}`;
  }
}
