import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {
  IRepositorioInstancia,
  REPOSITORIO_INSTANCIA,
} from '../../../domain/repositories/instancia.repository.interface';
import {
  IRepositorioRelacionamento,
  REPOSITORIO_RELACIONAMENTO,
} from '../../../domain/repositories/relacionamento.repository.interface';
import { RelacionamentoMapper } from '../../mappers/relacionamento.mapper';
import { Relacionamento } from '../../../domain/entities/relacionamento.entity';
import { ListarRelacionamentosInput } from './listar-relacionamentos.input';
import { ListarRelacionamentosOutput } from './listar-relacionamentos.output';

/**
 * D4-T05: Use Case para listar relacionamentos de uma tabela
 *
 * Busca todos os relacionamentos das instâncias associadas a uma tabela,
 * categorizando-os em relacionamentos pai e filho.
 */
@Injectable()
export class ListarRelacionamentosUseCase {
  constructor(
    @Inject(REPOSITORIO_INSTANCIA)
    private readonly repositorioInstancia: IRepositorioInstancia,
    @Inject(REPOSITORIO_RELACIONAMENTO)
    private readonly repositorioRelacionamento: IRepositorioRelacionamento,
    private readonly mapper: RelacionamentoMapper,
  ) {}

  /**
   * Executa o caso de uso
   *
   * @param entrada - Parâmetros de entrada
   * @returns Relacionamentos categorizados da tabela
   * @throws BadRequestException se parâmetros inválidos
   */
  async executar(entrada: ListarRelacionamentosInput): Promise<ListarRelacionamentosOutput> {
    // Validar entrada
    if (!entrada.nomeTabela || entrada.nomeTabela.trim().length === 0) {
      throw new BadRequestException('Nome da tabela é obrigatório');
    }

    if (!entrada.tokenUsuario || entrada.tokenUsuario.trim().length === 0) {
      throw new BadRequestException('Token de usuário é obrigatório');
    }

    const nomeTabela = entrada.nomeTabela.toUpperCase().trim();
    const apenasAtivos = entrada.apenasAtivos ?? true;

    // Buscar instâncias da tabela
    const instancias = await this.repositorioInstancia.buscarPorTabela(nomeTabela, entrada.tokenUsuario);

    if (instancias.length === 0) {
      return {
        relacionamentosPai: [],
        relacionamentosFilho: [],
        relacionamentos: [],
        total: 0,
        totalComoPai: 0,
        totalComoFilho: 0,
      };
    }

    // Mapas para evitar duplicatas
    const relacionamentosPaiMap = new Map<string, Relacionamento>();
    const relacionamentosFilhoMap = new Map<string, Relacionamento>();
    const todosRelacionamentosMap = new Map<string, Relacionamento>();

    // Para cada instância, buscar relacionamentos
    for (const instancia of instancias) {
      // Relacionamentos onde esta instância é pai
      const relsPai = await this.repositorioRelacionamento.buscarPorInstanciaPai(
        instancia.nomeInstancia,
        entrada.tokenUsuario,
      );

      for (const rel of relsPai) {
        if (!apenasAtivos || rel.ativo) {
          const chave = `${rel.nomeInstanciaPai}|${rel.nomeInstanciaFilho}`;
          relacionamentosPaiMap.set(chave, rel);
          todosRelacionamentosMap.set(chave, rel);
        }
      }

      // Relacionamentos onde esta instância é filha
      const relsFilho = await this.repositorioRelacionamento.buscarPorInstanciaFilho(
        instancia.nomeInstancia,
        entrada.tokenUsuario,
      );

      for (const rel of relsFilho) {
        if (!apenasAtivos || rel.ativo) {
          const chave = `${rel.nomeInstanciaPai}|${rel.nomeInstanciaFilho}`;
          relacionamentosFilhoMap.set(chave, rel);
          todosRelacionamentosMap.set(chave, rel);
        }
      }
    }

    // Converter para arrays e ordenar por ordem
    const relacionamentosPai = Array.from(relacionamentosPaiMap.values()).sort((a, b) => a.ordem - b.ordem);
    const relacionamentosFilho = Array.from(relacionamentosFilhoMap.values()).sort((a, b) => a.ordem - b.ordem);
    const todosRelacionamentos = Array.from(todosRelacionamentosMap.values()).sort((a, b) => a.ordem - b.ordem);

    // Mapear para DTOs
    return {
      relacionamentosPai: this.mapper.paraListaDto(relacionamentosPai),
      relacionamentosFilho: this.mapper.paraListaDto(relacionamentosFilho),
      relacionamentos: this.mapper.paraListaDto(todosRelacionamentos),
      total: todosRelacionamentos.length,
      totalComoPai: relacionamentosPai.length,
      totalComoFilho: relacionamentosFilho.length,
    };
  }
}
