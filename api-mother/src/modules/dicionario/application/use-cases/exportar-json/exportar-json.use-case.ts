import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { IRepositorioTabela, REPOSITORIO_TABELA } from '../../../domain/repositories/tabela.repository.interface';
import { IRepositorioCampo, REPOSITORIO_CAMPO } from '../../../domain/repositories/campo.repository.interface';
import { TabelaMapper } from '../../mappers/tabela.mapper';
import { CampoMapper } from '../../mappers/campo.mapper';
import { ExportarJSONInput } from './exportar-json.input';
import { ExportarJSONOutput } from './exportar-json.output';

/**
 * Caso de uso para exportar dicionário em JSON.
 *
 * Permite exportar tabelas, campos ou todo o dicionário em formato JSON.
 *
 * @module Dicionario
 */
@Injectable()
export class ExportarJSONUseCase {
  constructor(
    @Inject(REPOSITORIO_TABELA)
    private readonly repositorioTabela: IRepositorioTabela,
    @Inject(REPOSITORIO_CAMPO)
    private readonly repositorioCampo: IRepositorioCampo,
    private readonly tabelaMapper: TabelaMapper,
    private readonly campoMapper: CampoMapper,
  ) {}

  /**
   * Executa o caso de uso para exportar JSON.
   *
   * @param entrada - Dados de entrada
   * @returns Dados exportados em JSON
   */
  async executar(entrada: ExportarJSONInput): Promise<ExportarJSONOutput> {
    let dados: any;
    let total = 0;

    switch (entrada.tipo) {
      case 'tabela':
        if (!entrada.nomeTabela) {
          throw new BadRequestException('Nome da tabela é obrigatório');
        }
        dados = await this.exportarTabela(entrada.nomeTabela, entrada.tokenUsuario);
        total = 1;
        break;

      case 'campo':
        if (!entrada.nomeTabela || !entrada.nomeCampo) {
          throw new BadRequestException('Nome da tabela e campo são obrigatórios');
        }
        dados = await this.exportarCampo(entrada.nomeTabela, entrada.nomeCampo, entrada.tokenUsuario);
        total = 1;
        break;

      case 'dicionario-completo':
        dados = await this.exportarDicionarioCompleto(entrada.tokenUsuario);
        total = dados.tabelas?.length || 0;
        break;

      default:
        throw new BadRequestException(`Tipo de export inválido: ${entrada.tipo}`);
    }

    const output: ExportarJSONOutput = {
      dados,
      tipo: entrada.tipo,
      exportadoEm: new Date(),
    };

    if (entrada.incluirMetadados) {
      output.metadados = {
        versao: '1.0',
        total,
      };
    }

    return output;
  }

  /**
   * Exporta uma tabela específica.
   */
  private async exportarTabela(nomeTabela: string, tokenUsuario: string): Promise<any> {
    const nome = nomeTabela.toUpperCase();

    const tabela = await this.repositorioTabela.buscarPorNome(nome, tokenUsuario);
    if (!tabela) {
      throw new NotFoundException(`Tabela ${nome} não encontrada`);
    }

    const campos = await this.repositorioCampo.buscarPorTabela(nome, tokenUsuario);

    return {
      tabela: this.tabelaMapper.paraDto(tabela),
      campos: campos.map((c) => this.campoMapper.paraDto(c)),
    };
  }

  /**
   * Exporta um campo específico.
   */
  private async exportarCampo(nomeTabela: string, nomeCampo: string, tokenUsuario: string): Promise<any> {
    const campo = await this.repositorioCampo.buscarPorNome(
      nomeTabela.toUpperCase(),
      nomeCampo.toUpperCase(),
      tokenUsuario,
    );

    if (!campo) {
      throw new NotFoundException(`Campo ${nomeTabela}.${nomeCampo} não encontrado`);
    }

    return this.campoMapper.paraDto(campo);
  }

  /**
   * Exporta todo o dicionário.
   */
  private async exportarDicionarioCompleto(tokenUsuario: string): Promise<any> {
    const tabelas = await this.repositorioTabela.buscarTodas(tokenUsuario);

    const tabelasComCampos = await Promise.all(
      tabelas.map(async (tabela) => {
        const campos = await this.repositorioCampo.buscarPorTabela(tabela.nomeTabela, tokenUsuario);

        return {
          tabela: this.tabelaMapper.paraDto(tabela),
          campos: campos.map((c) => this.campoMapper.paraDto(c)),
        };
      }),
    );

    return {
      tabelas: tabelasComCampos,
      totalTabelas: tabelas.length,
    };
  }
}
