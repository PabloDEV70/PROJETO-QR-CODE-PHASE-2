import { Injectable, Inject } from '@nestjs/common';
import {
  IRepositorioParametroUsuario,
  REPOSITORIO_PARAMETRO_USUARIO,
} from '../../../domain/repositories/parametro-usuario.repository.interface';
import { ParametroUsuario } from '../../../domain/entities/parametro-usuario.entity';

export interface ObterParametrosUsuarioEntrada {
  codUsuario: number;
  tokenUsuario: string;
  apenasAtivos?: boolean;
}

export interface ParametroDto {
  chave: string;
  valor: string;
  tipo: string;
  descricao: string | undefined;
  valorBooleano: boolean;
  valorNumerico: number;
}

export interface ObterParametrosUsuarioResultado {
  codUsuario: number;
  parametros: ParametroDto[];
  total: number;
}

@Injectable()
export class ObterParametrosUsuarioUseCase {
  constructor(
    @Inject(REPOSITORIO_PARAMETRO_USUARIO)
    private readonly repositorio: IRepositorioParametroUsuario,
  ) {}

  async executar(entrada: ObterParametrosUsuarioEntrada): Promise<ObterParametrosUsuarioResultado> {
    const parametros = entrada.apenasAtivos
      ? await this.repositorio.buscarParametrosAtivos(entrada.codUsuario, entrada.tokenUsuario)
      : await this.repositorio.buscarPorUsuario(entrada.codUsuario, entrada.tokenUsuario);

    return {
      codUsuario: entrada.codUsuario,
      parametros: parametros.map((p) => this.paraDto(p)),
      total: parametros.length,
    };
  }

  private paraDto(parametro: ParametroUsuario): ParametroDto {
    return {
      chave: parametro.chave,
      valor: parametro.valor,
      tipo: parametro.tipo,
      descricao: parametro.descricao,
      valorBooleano: parametro.obterValorBooleano(),
      valorNumerico: parametro.obterValorNumerico(),
    };
  }
}
