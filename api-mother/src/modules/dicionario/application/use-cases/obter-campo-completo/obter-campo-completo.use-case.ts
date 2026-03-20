import { Injectable, Inject } from '@nestjs/common';
import { IRepositorioCampo, REPOSITORIO_CAMPO } from '../../../domain/repositories/campo.repository.interface';
import { CampoMapper } from '../../mappers/campo.mapper';
import { ObterCampoCompletoInput } from './obter-campo-completo.input';
import { ObterCampoCompletoOutput, CampoCompletoDto } from './obter-campo-completo.output';
import { OpcaoCampoDto } from '../obter-opcoes-campo/obter-opcoes-campo.output';
import { PropriedadeCampoDto } from '../obter-propriedades-campo/obter-propriedades-campo.output';

/**
 * Caso de uso para obter um campo com todas as informações.
 *
 * Retorna os dados do campo incluindo opções (TDDOPC) e propriedades (TDDPCO).
 *
 * @module Dicionario
 */
@Injectable()
export class ObterCampoCompletoUseCase {
  constructor(
    @Inject(REPOSITORIO_CAMPO)
    private readonly repositorioCampo: IRepositorioCampo,
    private readonly campoMapper: CampoMapper,
  ) {}

  /**
   * Executa o caso de uso para obter campo completo.
   *
   * @param entrada - Dados de entrada contendo nome da tabela, campo e token
   * @returns Campo com opções e propriedades ou null se não encontrado
   */
  async executar(entrada: ObterCampoCompletoInput): Promise<ObterCampoCompletoOutput> {
    const nomeTabela = entrada.nomeTabela.toUpperCase();
    const nomeCampo = entrada.nomeCampo.toUpperCase();

    // Buscar campo
    const campo = await this.repositorioCampo.buscarPorNome(nomeTabela, nomeCampo, entrada.tokenUsuario);

    if (!campo) {
      return { campo: null };
    }

    // Buscar opções e propriedades em paralelo
    const [opcoes, propriedades] = await Promise.all([
      this.repositorioCampo.buscarOpcoesCampo(nomeTabela, nomeCampo, entrada.tokenUsuario),
      this.repositorioCampo.buscarPropriedadesCampo(nomeTabela, nomeCampo, entrada.tokenUsuario),
    ]);

    // Mapear opções para DTOs
    const opcoesDto: OpcaoCampoDto[] = opcoes.map((opcao) => ({
      nomeTabela: opcao.nomeTabela,
      nomeCampo: opcao.nomeCampo,
      valor: opcao.valor,
      descricao: opcao.descricao,
      ordem: opcao.ordem,
    }));

    // Mapear propriedades para DTOs
    const propriedadesDto: PropriedadeCampoDto[] = propriedades.map((prop) => ({
      nomeTabela: prop.nomeTabela,
      nomeCampo: prop.nomeCampo,
      nomePropriedade: prop.nomePropriedade,
      valorPropriedade: prop.valorPropriedade,
      valorBooleano: prop.obterValorBooleano(),
    }));

    // Mapear para DTO completo
    const campoDto = this.campoMapper.paraDto(campo);
    const campoCompleto: CampoCompletoDto = {
      ...campoDto,
      opcoes: opcoesDto,
      propriedades: propriedadesDto,
      temOpcoes: opcoesDto.length > 0,
      temPropriedades: propriedadesDto.length > 0,
    };

    return { campo: campoCompleto };
  }
}
