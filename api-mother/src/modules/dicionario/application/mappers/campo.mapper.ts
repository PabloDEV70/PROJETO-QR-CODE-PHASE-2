import { Injectable } from '@nestjs/common';
import { Campo } from '../../domain/entities/campo.entity';

export interface CampoCru {
  NOMETAB: string;
  NOMECAMPO: string;
  DESCRICAO?: string;
  TIPO: string;
  TAMANHO?: number;
  DECIMAIS?: number;
  OBRIGATORIO?: string;
  CHAVEPRIMARIA?: string;
  CHAVEESTRANGEIRA?: string;
  APRESENTACAO?: string;
  VALORPADRAO?: string;
}

export interface CampoDto {
  nomeTabela: string;
  nomeCampo: string;
  nomeCompleto: string;
  descricao: string;
  tipo: string;
  tipoDescricao: string;
  tamanho: number;
  decimais: number;
  obrigatorio: boolean;
  chavePrimaria: boolean;
  chaveEstrangeira: boolean;
  ehChave: boolean;
  apresentacao: string | null;
  valorPadrao: string;
  ehVisivel: boolean;
}

@Injectable()
export class CampoMapper {
  paraDto(entidade: Campo): CampoDto {
    return {
      nomeTabela: entidade.nomeTabela,
      nomeCampo: entidade.nomeCampo,
      nomeCompleto: entidade.obterNomeCompleto(),
      descricao: entidade.descricao,
      tipo: entidade.tipo.valor,
      tipoDescricao: entidade.tipo.obterDescricao(),
      tamanho: entidade.tamanho,
      decimais: entidade.decimais,
      obrigatorio: entidade.obrigatorio,
      chavePrimaria: entidade.chavePrimaria,
      chaveEstrangeira: entidade.chaveEstrangeira,
      ehChave: entidade.ehChave(),
      apresentacao: entidade.apresentacao?.valor ?? null,
      valorPadrao: entidade.valorPadrao,
      ehVisivel: entidade.ehVisivel(),
    };
  }

  paraDominio(cru: CampoCru): Campo {
    const resultado = Campo.criar({
      nomeTabela: cru.NOMETAB,
      nomeCampo: cru.NOMECAMPO,
      descricao: cru.DESCRICAO,
      tipo: cru.TIPO,
      tamanho: cru.TAMANHO,
      decimais: cru.DECIMAIS,
      obrigatorio: cru.OBRIGATORIO,
      chavePrimaria: cru.CHAVEPRIMARIA,
      chaveEstrangeira: cru.CHAVEESTRANGEIRA,
      apresentacao: cru.APRESENTACAO,
      valorPadrao: cru.VALORPADRAO,
    });

    if (resultado.falhou) {
      throw new Error(`Erro ao mapear campo: ${resultado.erro}`);
    }

    return resultado.obterValor();
  }

  paraListaDto(entidades: Campo[]): CampoDto[] {
    return entidades.map((e) => this.paraDto(e));
  }
}
