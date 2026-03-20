import { Injectable, Inject } from '@nestjs/common';
import {
  IRepositorioPermissaoTabela,
  REPOSITORIO_PERMISSAO_TABELA,
} from '../../../../domain/repositories/permissao-tabela.repository.interface';
import { PermissaoTabela, TipoOperacao } from '../../../../domain/entities/permissao-tabela.entity';

export interface ListarPermissoesTabelaEntrada {
  codRole?: number;
  nomeTabela?: string;
}

export interface PermissaoTabelaDto {
  codPermissao: number;
  codRole: number;
  nomeTabela: string;
  operacao: TipoOperacao;
  permitido: boolean;
  condicaoRls?: string;
  camposPermitidos?: string[];
  camposRestritos?: string[];
  dataCriacao?: Date;
  dataAlteracao?: Date;
}

export interface ListarPermissoesTabelaResultado {
  permissoes: PermissaoTabelaDto[];
  total: number;
}

/**
 * Caso de uso para listar permissoes de tabela.
 */
@Injectable()
export class ListarPermissoesTabelaUseCase {
  constructor(
    @Inject(REPOSITORIO_PERMISSAO_TABELA)
    private readonly repositorio: IRepositorioPermissaoTabela,
  ) {}

  async executar(entrada: ListarPermissoesTabelaEntrada): Promise<ListarPermissoesTabelaResultado> {
    let permissoes: PermissaoTabela[];

    if (entrada.codRole) {
      permissoes = await this.repositorio.buscarPorRole(entrada.codRole);
    } else if (entrada.nomeTabela) {
      permissoes = await this.repositorio.buscarPorTabela(entrada.nomeTabela);
    } else {
      permissoes = await this.repositorio.buscarTodas();
    }

    return {
      permissoes: permissoes.map((p) => this.paraDto(p)),
      total: permissoes.length,
    };
  }

  private paraDto(permissao: PermissaoTabela): PermissaoTabelaDto {
    return {
      codPermissao: permissao.codPermissao!,
      codRole: permissao.codRole,
      nomeTabela: permissao.nomeTabela,
      operacao: permissao.operacao,
      permitido: permissao.permitido,
      condicaoRls: permissao.condicaoRls,
      camposPermitidos: permissao.camposPermitidos,
      camposRestritos: permissao.camposRestritos,
      dataCriacao: permissao.dataCriacao,
      dataAlteracao: permissao.dataAlteracao,
    };
  }
}
