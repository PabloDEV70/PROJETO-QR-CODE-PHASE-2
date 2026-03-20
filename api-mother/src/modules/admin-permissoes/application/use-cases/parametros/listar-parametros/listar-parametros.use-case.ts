import { Injectable, Inject } from '@nestjs/common';
import {
  IRepositorioParametroSistema,
  REPOSITORIO_PARAMETRO_SISTEMA,
} from '../../../../domain/repositories/parametro-sistema.repository.interface';
import { ParametroSistema } from '../../../../domain/entities/parametro-sistema.entity';

export interface ListarParametrosEntrada {
  apenasAtivos?: boolean;
}

export interface ParametroDto {
  codParametro: number;
  chave: string;
  valor: string;
  valorTipado: string | number | boolean | object;
  descricao?: string;
  tipo: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  ativo: boolean;
  dataCriacao?: Date;
  dataAlteracao?: Date;
}

export interface ListarParametrosResultado {
  parametros: ParametroDto[];
  total: number;
}

/**
 * Caso de uso para listar parametros do sistema.
 */
@Injectable()
export class ListarParametrosUseCase {
  constructor(
    @Inject(REPOSITORIO_PARAMETRO_SISTEMA)
    private readonly repositorio: IRepositorioParametroSistema,
  ) {}

  async executar(entrada: ListarParametrosEntrada): Promise<ListarParametrosResultado> {
    let parametros: ParametroSistema[];

    if (entrada.apenasAtivos) {
      parametros = await this.repositorio.buscarAtivos();
    } else {
      parametros = await this.repositorio.buscarTodos();
    }

    return {
      parametros: parametros.map((p) => this.paraDto(p)),
      total: parametros.length,
    };
  }

  private paraDto(parametro: ParametroSistema): ParametroDto {
    let valorTipado: string | number | boolean | object = parametro.valor;

    try {
      switch (parametro.tipo) {
        case 'NUMBER':
          valorTipado = parametro.obterValorComoNumero();
          break;
        case 'BOOLEAN':
          valorTipado = parametro.obterValorComoBooleano();
          break;
        case 'JSON':
          valorTipado = parametro.obterValorComoJson();
          break;
      }
    } catch {
      // Se falhar a conversao, manter como string
      valorTipado = parametro.valor;
    }

    return {
      codParametro: parametro.codParametro!,
      chave: parametro.chave,
      valor: parametro.valor,
      valorTipado,
      descricao: parametro.descricao,
      tipo: parametro.tipo,
      ativo: parametro.ativo,
      dataCriacao: parametro.dataCriacao,
      dataAlteracao: parametro.dataAlteracao,
    };
  }
}
