import { Injectable, Inject, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import {
  IRepositorioParametroSistema,
  REPOSITORIO_PARAMETRO_SISTEMA,
} from '../../../../domain/repositories/parametro-sistema.repository.interface';
import { ParametroSistema } from '../../../../domain/entities/parametro-sistema.entity';

export interface AtualizarParametroEntrada {
  codParametro: number;
  chave?: string;
  valor?: string;
  descricao?: string;
  tipo?: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  ativo?: string;
}

export interface AtualizarParametroResultado {
  codParametro: number;
  chave: string;
  valor: string;
  valorTipado: string | number | boolean | object;
  descricao?: string;
  tipo: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  ativo: boolean;
  dataAlteracao: Date;
}

/**
 * Caso de uso para atualizar um parametro do sistema existente.
 */
@Injectable()
export class AtualizarParametroUseCase {
  constructor(
    @Inject(REPOSITORIO_PARAMETRO_SISTEMA)
    private readonly repositorio: IRepositorioParametroSistema,
  ) {}

  async executar(entrada: AtualizarParametroEntrada): Promise<AtualizarParametroResultado> {
    // Buscar parametro existente
    const parametroExistente = await this.repositorio.buscarPorCodigo(entrada.codParametro);
    if (!parametroExistente) {
      throw new NotFoundException(`Parametro com codigo ${entrada.codParametro} nao encontrado`);
    }

    // Verificar se nova chave ja existe (se foi alterada)
    if (entrada.chave && entrada.chave !== parametroExistente.chave) {
      const existeChave = await this.repositorio.existeComChave(entrada.chave, entrada.codParametro);
      if (existeChave) {
        throw new ConflictException(`Ja existe um parametro com a chave '${entrada.chave}'`);
      }
    }

    // Criar entidade atualizada
    const parametroOuErro = ParametroSistema.criar({
      codParametro: entrada.codParametro,
      chave: entrada.chave || parametroExistente.chave,
      valor: entrada.valor !== undefined ? entrada.valor : parametroExistente.valor,
      descricao: entrada.descricao !== undefined ? entrada.descricao : parametroExistente.descricao,
      tipo: entrada.tipo || parametroExistente.tipo,
      ativo: entrada.ativo !== undefined ? entrada.ativo : parametroExistente.ativo ? 'S' : 'N',
      dataCriacao: parametroExistente.dataCriacao,
      dataAlteracao: new Date(),
    });

    if (parametroOuErro.falhou) {
      throw new BadRequestException(parametroOuErro.erro);
    }

    // Persistir
    const parametroAtualizado = await this.repositorio.atualizar(parametroOuErro.obterValor());

    return {
      codParametro: parametroAtualizado.codParametro!,
      chave: parametroAtualizado.chave,
      valor: parametroAtualizado.valor,
      valorTipado: this.obterValorTipado(parametroAtualizado),
      descricao: parametroAtualizado.descricao,
      tipo: parametroAtualizado.tipo,
      ativo: parametroAtualizado.ativo,
      dataAlteracao: parametroAtualizado.dataAlteracao!,
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
