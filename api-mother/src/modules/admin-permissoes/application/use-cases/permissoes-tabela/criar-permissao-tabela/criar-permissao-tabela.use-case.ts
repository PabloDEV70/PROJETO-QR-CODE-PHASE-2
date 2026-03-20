import { Injectable, Inject, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  IRepositorioPermissaoTabela,
  REPOSITORIO_PERMISSAO_TABELA,
} from '../../../../domain/repositories/permissao-tabela.repository.interface';
import { IRepositorioRole, REPOSITORIO_ROLE } from '../../../../domain/repositories/role.repository.interface';
import { PermissaoTabela, TipoOperacao } from '../../../../domain/entities/permissao-tabela.entity';

export interface CriarPermissaoTabelaEntrada {
  codRole: number;
  nomeTabela: string;
  operacao: TipoOperacao;
  permitido?: string;
  condicaoRls?: string;
  camposPermitidos?: string;
  camposRestritos?: string;
}

export interface CriarPermissaoTabelaResultado {
  codPermissao: number;
  codRole: number;
  nomeTabela: string;
  operacao: TipoOperacao;
  permitido: boolean;
  condicaoRls?: string;
  camposPermitidos?: string[];
  camposRestritos?: string[];
  dataCriacao: Date;
}

/**
 * Caso de uso para criar uma nova permissao de tabela.
 */
@Injectable()
export class CriarPermissaoTabelaUseCase {
  constructor(
    @Inject(REPOSITORIO_PERMISSAO_TABELA)
    private readonly repositorioPermissao: IRepositorioPermissaoTabela,
    @Inject(REPOSITORIO_ROLE)
    private readonly repositorioRole: IRepositorioRole,
  ) {}

  async executar(entrada: CriarPermissaoTabelaEntrada): Promise<CriarPermissaoTabelaResultado> {
    // Verificar se role existe
    const role = await this.repositorioRole.buscarPorCodigo(entrada.codRole);
    if (!role) {
      throw new NotFoundException(`Role com codigo ${entrada.codRole} nao encontrada`);
    }

    // Verificar se ja existe permissao duplicada
    const existePermissao = await this.repositorioPermissao.existePermissao(
      entrada.codRole,
      entrada.nomeTabela,
      entrada.operacao,
    );
    if (existePermissao) {
      throw new ConflictException(
        `Ja existe permissao de ${entrada.operacao} na tabela '${entrada.nomeTabela}' para a role ${entrada.codRole}`,
      );
    }

    // Criar entidade de dominio
    const permissaoOuErro = PermissaoTabela.criar({
      codRole: entrada.codRole,
      nomeTabela: entrada.nomeTabela,
      operacao: entrada.operacao,
      permitido: entrada.permitido || 'S',
      condicaoRls: entrada.condicaoRls,
      camposPermitidos: entrada.camposPermitidos,
      camposRestritos: entrada.camposRestritos,
      dataCriacao: new Date(),
    });

    if (permissaoOuErro.falhou) {
      throw new BadRequestException(permissaoOuErro.erro);
    }

    // Persistir
    const permissaoCriada = await this.repositorioPermissao.criar(permissaoOuErro.obterValor());

    return {
      codPermissao: permissaoCriada.codPermissao!,
      codRole: permissaoCriada.codRole,
      nomeTabela: permissaoCriada.nomeTabela,
      operacao: permissaoCriada.operacao,
      permitido: permissaoCriada.permitido,
      condicaoRls: permissaoCriada.condicaoRls,
      camposPermitidos: permissaoCriada.camposPermitidos,
      camposRestritos: permissaoCriada.camposRestritos,
      dataCriacao: permissaoCriada.dataCriacao!,
    };
  }
}
