import { Injectable } from '@nestjs/common';
import { Tabela } from '../../domain/entities/tabela.entity';

export interface TabelaCru {
  NOMETAB: string;
  DESCRICAO?: string;
  NOMEINSTANCIA?: string;
  MODULO?: string;
  ATIVA?: string;
  TIPOCRUD?: string;
}

export interface TabelaDto {
  nomeTabela: string;
  descricao: string;
  nomeInstancia: string;
  modulo: string;
  ativa: boolean;
  tipoCrud: string;
  ehSistema: boolean;
}

@Injectable()
export class TabelaMapper {
  paraDto(entidade: Tabela): TabelaDto {
    return {
      nomeTabela: entidade.nomeTabela,
      descricao: entidade.descricao,
      nomeInstancia: entidade.nomeInstancia,
      modulo: entidade.modulo,
      ativa: entidade.ativa,
      tipoCrud: entidade.tipoCrud,
      ehSistema: entidade.ehSistema(),
    };
  }

  paraDominio(cru: TabelaCru): Tabela {
    const resultado = Tabela.criar({
      nomeTabela: cru.NOMETAB,
      descricao: cru.DESCRICAO,
      nomeInstancia: cru.NOMEINSTANCIA,
      modulo: cru.MODULO,
      ativa: cru.ATIVA,
      tipoCrud: cru.TIPOCRUD,
    });

    if (resultado.falhou) {
      throw new Error(`Erro ao mapear tabela: ${resultado.erro}`);
    }

    return resultado.obterValor();
  }

  paraListaDto(entidades: Tabela[]): TabelaDto[] {
    return entidades.map((e) => this.paraDto(e));
  }
}
