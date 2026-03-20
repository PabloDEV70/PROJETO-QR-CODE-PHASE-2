import { Injectable, Inject, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import {
  IRepositorioPermissaoTabela,
  REPOSITORIO_PERMISSAO_TABELA,
} from '../../../../domain/repositories/permissao-tabela.repository.interface';
import { PermissaoTabela, TipoOperacao } from '../../../../domain/entities/permissao-tabela.entity';

export interface AtualizarPermissaoTabelaEntrada {
  codPermissao: number;
  codRole?: number;
  nomeTabela?: string;
  operacao?: TipoOperacao;
  permitido?: string;
  condicaoRls?: string;
  camposPermitidos?: string;
  camposRestritos?: string;
}

export interface AtualizarPermissaoTabelaResultado {
  codPermissao: number;
  codRole: number;
  nomeTabela: string;
  operacao: TipoOperacao;
  permitido: boolean;
  condicaoRls?: string;
  camposPermitidos?: string[];
  camposRestritos?: string[];
  dataAlteracao: Date;
}

/**
 * Caso de uso para atualizar uma permissao de tabela existente.
 */
@Injectable()
export class AtualizarPermissaoTabelaUseCase {
  constructor(
    @Inject(REPOSITORIO_PERMISSAO_TABELA)
    private readonly repositorio: IRepositorioPermissaoTabela,
  ) {}

  async executar(entrada: AtualizarPermissaoTabelaEntrada): Promise<AtualizarPermissaoTabelaResultado> {
    // Buscar permissao existente
    const permissaoExistente = await this.repositorio.buscarPorCodigo(entrada.codPermissao);
    if (!permissaoExistente) {
      throw new NotFoundException(`Permissao com codigo ${entrada.codPermissao} nao encontrada`);
    }

    // Verificar duplicidade se mudou role, tabela ou operacao
    const novoRole = entrada.codRole || permissaoExistente.codRole;
    const novaTabela = entrada.nomeTabela || permissaoExistente.nomeTabela;
    const novaOperacao = entrada.operacao || permissaoExistente.operacao;

    if (
      novoRole !== permissaoExistente.codRole ||
      novaTabela !== permissaoExistente.nomeTabela ||
      novaOperacao !== permissaoExistente.operacao
    ) {
      const existePermissao = await this.repositorio.existePermissao(
        novoRole,
        novaTabela,
        novaOperacao,
        entrada.codPermissao,
      );
      if (existePermissao) {
        throw new ConflictException(
          `Ja existe permissao de ${novaOperacao} na tabela '${novaTabela}' para a role ${novoRole}`,
        );
      }
    }

    // Criar entidade atualizada
    const permissaoOuErro = PermissaoTabela.criar({
      codPermissao: entrada.codPermissao,
      codRole: novoRole,
      nomeTabela: novaTabela,
      operacao: novaOperacao,
      permitido: entrada.permitido !== undefined ? entrada.permitido : permissaoExistente.permitido ? 'S' : 'N',
      condicaoRls: entrada.condicaoRls !== undefined ? entrada.condicaoRls : permissaoExistente.condicaoRls,
      camposPermitidos:
        entrada.camposPermitidos !== undefined
          ? entrada.camposPermitidos
          : permissaoExistente.camposPermitidos?.join(','),
      camposRestritos:
        entrada.camposRestritos !== undefined ? entrada.camposRestritos : permissaoExistente.camposRestritos?.join(','),
      dataCriacao: permissaoExistente.dataCriacao,
      dataAlteracao: new Date(),
    });

    if (permissaoOuErro.falhou) {
      throw new BadRequestException(permissaoOuErro.erro);
    }

    // Persistir
    const permissaoAtualizada = await this.repositorio.atualizar(permissaoOuErro.obterValor());

    return {
      codPermissao: permissaoAtualizada.codPermissao!,
      codRole: permissaoAtualizada.codRole,
      nomeTabela: permissaoAtualizada.nomeTabela,
      operacao: permissaoAtualizada.operacao,
      permitido: permissaoAtualizada.permitido,
      condicaoRls: permissaoAtualizada.condicaoRls,
      camposPermitidos: permissaoAtualizada.camposPermitidos,
      camposRestritos: permissaoAtualizada.camposRestritos,
      dataAlteracao: permissaoAtualizada.dataAlteracao!,
    };
  }
}
