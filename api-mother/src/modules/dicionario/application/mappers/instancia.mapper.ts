import { Injectable } from '@nestjs/common';
import { Instancia } from '../../domain/entities/instancia.entity';

export interface InstanciaCru {
  NOMEINSTANCIA: string;
  NOMETAB: string;
  DESCRICAO?: string;
  ORDEM?: number;
  ATIVA?: string;
}

export interface InstanciaDto {
  nomeInstancia: string;
  nomeTabela: string;
  descricao: string;
  ordem: number;
  ativa: boolean;
}

@Injectable()
export class InstanciaMapper {
  paraDto(entidade: Instancia): InstanciaDto {
    return {
      nomeInstancia: entidade.nomeInstancia,
      nomeTabela: entidade.nomeTabela,
      descricao: entidade.descricao,
      ordem: entidade.ordem,
      ativa: entidade.ativa,
    };
  }

  paraDominio(cru: InstanciaCru): Instancia {
    const resultado = Instancia.criar({
      nomeInstancia: cru.NOMEINSTANCIA,
      nomeTabela: cru.NOMETAB,
      descricao: cru.DESCRICAO,
      ordem: cru.ORDEM,
      ativa: cru.ATIVA,
    });

    if (resultado.falhou) {
      throw new Error(`Erro ao mapear instância: ${resultado.erro}`);
    }

    return resultado.obterValor();
  }

  paraListaDto(entidades: Instancia[]): InstanciaDto[] {
    return entidades.map((e) => this.paraDto(e));
  }
}
