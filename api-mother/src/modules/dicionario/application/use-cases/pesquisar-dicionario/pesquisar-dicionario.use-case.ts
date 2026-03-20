import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { IRepositorioTabela, REPOSITORIO_TABELA } from '../../../domain/repositories/tabela.repository.interface';
import { IRepositorioCampo, REPOSITORIO_CAMPO } from '../../../domain/repositories/campo.repository.interface';
import { Tabela } from '../../../domain/entities/tabela.entity';
import { Campo } from '../../../domain/entities/campo.entity';
import { PesquisarDicionarioInput, TipoElementoDicionario } from './pesquisar-dicionario.input';
import { PesquisarDicionarioOutput, ResultadoPesquisaDto } from './pesquisar-dicionario.output';

/**
 * Use Case: PesquisarDicionarioUseCase
 *
 * Realiza pesquisa unificada no dicionário de dados, buscando em tabelas,
 * campos e opções. Retorna resultados ordenados por relevância.
 */
@Injectable()
export class PesquisarDicionarioUseCase {
  constructor(
    @Inject(REPOSITORIO_TABELA)
    private readonly repositorioTabela: IRepositorioTabela,
    @Inject(REPOSITORIO_CAMPO)
    private readonly repositorioCampo: IRepositorioCampo,
  ) {}

  /**
   * Executa o caso de uso
   *
   * @param entrada - Parâmetros de entrada contendo termo, token e tipos opcionais
   * @returns Lista de resultados ordenados por relevância
   * @throws BadRequestException se o termo for inválido
   */
  async executar(entrada: PesquisarDicionarioInput): Promise<PesquisarDicionarioOutput> {
    // Validar entrada
    if (!entrada.termo || entrada.termo.trim().length === 0) {
      throw new BadRequestException('Termo de busca é obrigatório');
    }

    if (!entrada.tokenUsuario || entrada.tokenUsuario.trim().length === 0) {
      throw new BadRequestException('Token de usuário é obrigatório');
    }

    // Termo mínimo de 2 caracteres
    const termo = entrada.termo.trim().toUpperCase();
    if (termo.length < 2) {
      throw new BadRequestException('Termo de busca deve ter pelo menos 2 caracteres');
    }

    // Determinar tipos a serem pesquisados
    const tipos: TipoElementoDicionario[] =
      entrada.tipos && entrada.tipos.length > 0 ? entrada.tipos : ['tabela', 'campo', 'opcao'];

    const resultados: ResultadoPesquisaDto[] = [];

    // Pesquisar tabelas
    if (tipos.includes('tabela')) {
      const resultadosTabela = await this.pesquisarTabelas(termo, entrada.tokenUsuario);
      resultados.push(...resultadosTabela);
    }

    // Pesquisar campos
    if (tipos.includes('campo')) {
      const resultadosCampo = await this.pesquisarCampos(termo, entrada.tokenUsuario);
      resultados.push(...resultadosCampo);
    }

    // Nota: A pesquisa por 'opcao' pode ser implementada quando houver
    // repositório de opções de campo (TDDOPC)

    // Ordenar por relevância (maior primeiro)
    resultados.sort((a, b) => b.relevancia - a.relevancia);

    return {
      resultados,
      total: resultados.length,
    };
  }

  /**
   * Pesquisa em tabelas pelo termo
   */
  private async pesquisarTabelas(termo: string, tokenUsuario: string): Promise<ResultadoPesquisaDto[]> {
    const tabelas = await this.repositorioTabela.buscarTodas(tokenUsuario);
    const resultados: ResultadoPesquisaDto[] = [];

    for (const tabela of tabelas) {
      const match = this.verificarMatch(tabela, termo);
      if (match) {
        resultados.push({
          tipo: 'tabela',
          nomeTabela: tabela.nomeTabela,
          descricao: tabela.descricao,
          matchTexto: match.texto,
          relevancia: match.relevancia,
        });
      }
    }

    return resultados;
  }

  /**
   * Pesquisa em campos pelo termo
   */
  private async pesquisarCampos(termo: string, tokenUsuario: string): Promise<ResultadoPesquisaDto[]> {
    // Primeiro obter todas as tabelas para buscar seus campos
    const tabelas = await this.repositorioTabela.buscarTodas(tokenUsuario);
    const resultados: ResultadoPesquisaDto[] = [];

    // Limitar busca para evitar sobrecarga
    const tabelasParaBuscar = tabelas.slice(0, 100);

    for (const tabela of tabelasParaBuscar) {
      try {
        const campos = await this.repositorioCampo.buscarPorTabela(tabela.nomeTabela, tokenUsuario);

        for (const campo of campos) {
          const match = this.verificarMatchCampo(campo, termo);
          if (match) {
            resultados.push({
              tipo: 'campo',
              nomeTabela: campo.nomeTabela,
              nomeCampo: campo.nomeCampo,
              descricao: campo.descricao,
              matchTexto: match.texto,
              relevancia: match.relevancia,
            });
          }
        }
      } catch {
        // Ignora erros em tabelas individuais
        continue;
      }
    }

    return resultados;
  }

  /**
   * Verifica se uma tabela corresponde ao termo de busca
   */
  private verificarMatch(tabela: Tabela, termo: string): { texto: string; relevancia: number } | null {
    const nomeTabela = tabela.nomeTabela.toUpperCase();
    const descricao = tabela.descricao.toUpperCase();

    // Match exato no nome (maior relevância)
    if (nomeTabela === termo) {
      return { texto: tabela.nomeTabela, relevancia: 100 };
    }

    // Match no início do nome
    if (nomeTabela.startsWith(termo)) {
      return { texto: tabela.nomeTabela, relevancia: 80 };
    }

    // Match parcial no nome
    if (nomeTabela.includes(termo)) {
      return { texto: tabela.nomeTabela, relevancia: 60 };
    }

    // Match na descrição
    if (descricao.includes(termo)) {
      return { texto: tabela.descricao, relevancia: 40 };
    }

    return null;
  }

  /**
   * Verifica se um campo corresponde ao termo de busca
   */
  private verificarMatchCampo(campo: Campo, termo: string): { texto: string; relevancia: number } | null {
    const nomeCampo = campo.nomeCampo.toUpperCase();
    const descricao = campo.descricao.toUpperCase();
    const nomeCompleto = campo.obterNomeCompleto().toUpperCase();

    // Match exato no nome do campo
    if (nomeCampo === termo) {
      return { texto: campo.nomeCampo, relevancia: 90 };
    }

    // Match no início do nome do campo
    if (nomeCampo.startsWith(termo)) {
      return { texto: campo.nomeCampo, relevancia: 70 };
    }

    // Match parcial no nome do campo
    if (nomeCampo.includes(termo)) {
      return { texto: campo.nomeCampo, relevancia: 50 };
    }

    // Match no nome completo (TABELA.CAMPO)
    if (nomeCompleto.includes(termo)) {
      return { texto: campo.obterNomeCompleto(), relevancia: 45 };
    }

    // Match na descrição
    if (descricao.includes(termo)) {
      return { texto: campo.descricao, relevancia: 30 };
    }

    return null;
  }
}
