import { Injectable, Inject, ConflictException, BadRequestException } from '@nestjs/common';
import {
  IRepositorioParametroSistema,
  REPOSITORIO_PARAMETRO_SISTEMA,
} from '../../../../domain/repositories/parametro-sistema.repository.interface';
import { ParametroSistema } from '../../../../domain/entities/parametro-sistema.entity';

export interface CriarParametroEntrada {
  chave: string;
  valor: string;
  descricao?: string;
  tipo: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  ativo?: string;
}

export interface CriarParametroResultado {
  codParametro: number;
  chave: string;
  valor: string;
  valorTipado: string | number | boolean | object;
  descricao?: string;
  tipo: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  ativo: boolean;
  dataCriacao: Date;
}

/**
 * Caso de uso para criar um novo parametro do sistema.
 */
@Injectable()
export class CriarParametroUseCase {
  constructor(
    @Inject(REPOSITORIO_PARAMETRO_SISTEMA)
    private readonly repositorio: IRepositorioParametroSistema,
  ) {}

  async executar(entrada: CriarParametroEntrada): Promise<CriarParametroResultado> {
    // Verificar se ja existe parametro com mesma chave
    const existeParametro = await this.repositorio.existeComChave(entrada.chave);
    if (existeParametro) {
      throw new ConflictException(`Ja existe um parametro com a chave '${entrada.chave}'`);
    }

    // Criar entidade de dominio
    const parametroOuErro = ParametroSistema.criar({
      chave: entrada.chave,
      valor: entrada.valor,
      descricao: entrada.descricao,
      tipo: entrada.tipo,
      ativo: entrada.ativo || 'S',
      dataCriacao: new Date(),
    });

    if (parametroOuErro.falhou) {
      throw new BadRequestException(parametroOuErro.erro);
    }

    // Persistir
    const parametroCriado = await this.repositorio.criar(parametroOuErro.obterValor());

    return {
      codParametro: parametroCriado.codParametro!,
      chave: parametroCriado.chave,
      valor: parametroCriado.valor,
      valorTipado: this.obterValorTipado(parametroCriado),
      descricao: parametroCriado.descricao,
      tipo: parametroCriado.tipo,
      ativo: parametroCriado.ativo,
      dataCriacao: parametroCriado.dataCriacao!,
    };
  }

  private obterValorTipado(parametro: ParametroSistema): string | number | boolean | object {
    try {
      switch (parametro.tipo) {
        case 'NUMBER':
          return parametro.obterValorComoNumero();
        case 'BOOLEAN':
          return parametro.obterValorComoBooleano();
        case 'JSON':
          return parametro.obterValorComoJson();
        default:
          return parametro.valor;
      }
    } catch {
      return parametro.valor;
    }
  }
}
