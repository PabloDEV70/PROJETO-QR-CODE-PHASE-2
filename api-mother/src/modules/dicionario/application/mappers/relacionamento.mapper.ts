import { Injectable } from '@nestjs/common';
import { Relacionamento } from '../../domain/entities/relacionamento.entity';
import { LinkCampo } from '../../domain/entities/link-campo.entity';

/**
 * Interface representando dados crus de relacionamento do banco
 */
export interface RelacionamentoCru {
  NOMEINSTANCIAPAI: string;
  NOMEINSTANCIAFILHO: string;
  TIPOLIGACAO: string;
  ORDEM?: number;
  ATIVO?: string;
}

/**
 * Interface representando dados crus de link de campo do banco
 */
export interface LinkCampoCru {
  NOMEINSTANCIAPAI: string;
  NOMEINSTANCIAFILHO: string;
  CAMPOORIGEM: string;
  CAMPODESTINO: string;
  ORDEM?: number;
}

/**
 * DTO de relacionamento para a camada de apresentação
 */
export interface RelacionamentoDto {
  nomeInstanciaPai: string;
  nomeInstanciaFilho: string;
  tipoLigacao: string;
  tipoLigacaoDescricao: string;
  ordem: number;
  ativo: boolean;
  ehMasterDetail: boolean;
}

/**
 * DTO de link de campo para a camada de apresentação
 */
export interface LinkCampoDto {
  nomeInstanciaPai: string;
  nomeInstanciaFilho: string;
  campoOrigem: string;
  campoDestino: string;
  ordem: number;
  expressaoJoin: string;
}

/**
 * Mapper para conversão entre camadas: DB <-> Domain <-> DTO
 * para as entidades Relacionamento e LinkCampo
 */
@Injectable()
export class RelacionamentoMapper {
  /**
   * Converte entidade de domínio Relacionamento para DTO
   */
  paraDto(entidade: Relacionamento): RelacionamentoDto {
    return {
      nomeInstanciaPai: entidade.nomeInstanciaPai,
      nomeInstanciaFilho: entidade.nomeInstanciaFilho,
      tipoLigacao: entidade.tipoLigacao.valor,
      tipoLigacaoDescricao: entidade.tipoLigacao.obterDescricao(),
      ordem: entidade.ordem,
      ativo: entidade.ativo,
      ehMasterDetail: entidade.ehMasterDetail(),
    };
  }

  /**
   * Converte dados crus do banco para entidade de domínio Relacionamento
   */
  paraDominio(cru: RelacionamentoCru): Relacionamento {
    const resultado = Relacionamento.criar({
      nomeInstanciaPai: cru.NOMEINSTANCIAPAI,
      nomeInstanciaFilho: cru.NOMEINSTANCIAFILHO,
      tipoLigacao: cru.TIPOLIGACAO,
      ordem: cru.ORDEM,
      ativo: cru.ATIVO,
    });

    if (resultado.falhou) {
      throw new Error(`Erro ao mapear relacionamento: ${resultado.erro}`);
    }

    return resultado.obterValor();
  }

  /**
   * Converte lista de entidades para lista de DTOs
   */
  paraListaDto(entidades: Relacionamento[]): RelacionamentoDto[] {
    return entidades.map((e) => this.paraDto(e));
  }

  /**
   * Converte entidade de domínio LinkCampo para DTO
   */
  linkCampoParaDto(entidade: LinkCampo): LinkCampoDto {
    return {
      nomeInstanciaPai: entidade.nomeInstanciaPai,
      nomeInstanciaFilho: entidade.nomeInstanciaFilho,
      campoOrigem: entidade.campoOrigem,
      campoDestino: entidade.campoDestino,
      ordem: entidade.ordem,
      expressaoJoin: entidade.obterExpressaoJoin(),
    };
  }

  /**
   * Converte dados crus do banco para entidade de domínio LinkCampo
   */
  linkCampoParaDominio(cru: LinkCampoCru): LinkCampo {
    const resultado = LinkCampo.criar({
      nomeInstanciaPai: cru.NOMEINSTANCIAPAI,
      nomeInstanciaFilho: cru.NOMEINSTANCIAFILHO,
      campoOrigem: cru.CAMPOORIGEM,
      campoDestino: cru.CAMPODESTINO,
      ordem: cru.ORDEM,
    });

    if (resultado.falhou) {
      throw new Error(`Erro ao mapear link campo: ${resultado.erro}`);
    }

    return resultado.obterValor();
  }

  /**
   * Converte lista de LinkCampo para lista de DTOs
   */
  linkCamposParaListaDto(entidades: LinkCampo[]): LinkCampoDto[] {
    return entidades.map((e) => this.linkCampoParaDto(e));
  }
}
