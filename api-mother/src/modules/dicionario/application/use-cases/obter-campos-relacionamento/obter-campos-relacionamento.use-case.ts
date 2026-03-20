import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {
  IRepositorioRelacionamento,
  REPOSITORIO_RELACIONAMENTO,
} from '../../../domain/repositories/relacionamento.repository.interface';
import { RelacionamentoMapper } from '../../mappers/relacionamento.mapper';
import { ObterCamposRelacionamentoInput } from './obter-campos-relacionamento.input';
import { ObterCamposRelacionamentoOutput } from './obter-campos-relacionamento.output';

/**
 * D4-T06: Use Case para obter campos de ligação de um relacionamento
 *
 * Busca os campos que conectam duas instâncias (tabela TDDLGC).
 * Esses campos definem como as tabelas se relacionam (JOINs).
 */
@Injectable()
export class ObterCamposRelacionamentoUseCase {
  constructor(
    @Inject(REPOSITORIO_RELACIONAMENTO)
    private readonly repositorioRelacionamento: IRepositorioRelacionamento,
    private readonly mapper: RelacionamentoMapper,
  ) {}

  /**
   * Executa o caso de uso
   *
   * @param entrada - Parâmetros de entrada
   * @returns Campos de ligação do relacionamento
   * @throws BadRequestException se parâmetros inválidos
   */
  async executar(entrada: ObterCamposRelacionamentoInput): Promise<ObterCamposRelacionamentoOutput> {
    // Validar entrada
    if (!entrada.nomeInstanciaPai || entrada.nomeInstanciaPai.trim().length === 0) {
      throw new BadRequestException('Nome da instância pai é obrigatório');
    }

    if (!entrada.nomeInstanciaFilho || entrada.nomeInstanciaFilho.trim().length === 0) {
      throw new BadRequestException('Nome da instância filho é obrigatório');
    }

    if (!entrada.tokenUsuario || entrada.tokenUsuario.trim().length === 0) {
      throw new BadRequestException('Token de usuário é obrigatório');
    }

    const nomeInstanciaPai = entrada.nomeInstanciaPai.trim();
    const nomeInstanciaFilho = entrada.nomeInstanciaFilho.trim();

    // Buscar o relacionamento
    const relacionamentos = await this.repositorioRelacionamento.buscarPorInstanciaPai(
      nomeInstanciaPai,
      entrada.tokenUsuario,
    );

    const relacionamento = relacionamentos.find((r) => r.nomeInstanciaFilho === nomeInstanciaFilho);

    // Buscar campos de ligação
    const camposLigacao = await this.repositorioRelacionamento.buscarLinksCampos(
      nomeInstanciaPai,
      nomeInstanciaFilho,
      entrada.tokenUsuario,
    );

    // Gerar expressão JOIN completa
    const expressaoJoin = this.gerarExpressaoJoin(nomeInstanciaPai, nomeInstanciaFilho, camposLigacao);

    // Mapear para DTOs
    const relacionamentoDto = relacionamento ? this.mapper.paraDto(relacionamento) : null;
    const camposLigacaoDto = this.mapper.linkCamposParaListaDto(camposLigacao);

    return {
      relacionamento: relacionamentoDto,
      camposLigacao: camposLigacaoDto,
      expressaoJoin,
      total: camposLigacao.length,
    };
  }

  /**
   * Gera expressão JOIN a partir dos campos de ligação
   */
  private gerarExpressaoJoin(
    nomeInstanciaPai: string,
    nomeInstanciaFilho: string,
    camposLigacao: { obterExpressaoJoin(): string }[],
  ): string {
    if (camposLigacao.length === 0) {
      return '';
    }

    const condicoes = camposLigacao.map((c) => c.obterExpressaoJoin());

    return `${nomeInstanciaPai} JOIN ${nomeInstanciaFilho} ON ${condicoes.join(' AND ')}`;
  }
}
