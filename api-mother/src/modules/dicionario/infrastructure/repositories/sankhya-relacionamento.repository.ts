import { Injectable } from '@nestjs/common';
import { IRepositorioRelacionamento } from '../../domain/repositories/relacionamento.repository.interface';
import { Relacionamento } from '../../domain/entities/relacionamento.entity';
import { LinkCampo } from '../../domain/entities/link-campo.entity';
import { SqlServerService } from '../../../../database/sqlserver.service';

interface RelacionamentoCru {
  NOMEINSTANCIAPAI: string;
  NOMEINSTANCIAFILHO: string;
  TIPOLIGACAO: string;
  ORDEM: number;
  ATIVO: string;
}

interface LinkCampoCru {
  NOMEINSTANCIAPAI: string;
  NOMEINSTANCIAFILHO: string;
  CAMPOORIGEM: string;
  CAMPODESTINO: string;
  ORDEM: number;
}

@Injectable()
export class SankhyaRelacionamentoRepository implements IRepositorioRelacionamento {
  constructor(private readonly sqlServer: SqlServerService) {}

  async buscarPorInstanciaPai(nomeInstancia: string, _tokenUsuario: string): Promise<Relacionamento[]> {
    const sql = `
      SELECT NOMEINSTANCIAPAI, NOMEINSTANCIAFILHO, TIPOLIGACAO, ORDEM, ATIVO
      FROM TDDLIG WHERE NOMEINSTANCIAPAI = @param1 ORDER BY ORDEM
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [nomeInstancia]);
    return (resultado as RelacionamentoCru[]).map((r) => this.paraDominioRelacionamento(r));
  }

  async buscarPorInstanciaFilho(nomeInstancia: string, _tokenUsuario: string): Promise<Relacionamento[]> {
    const sql = `
      SELECT NOMEINSTANCIAPAI, NOMEINSTANCIAFILHO, TIPOLIGACAO, ORDEM, ATIVO
      FROM TDDLIG WHERE NOMEINSTANCIAFILHO = @param1 ORDER BY ORDEM
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [nomeInstancia]);
    return (resultado as RelacionamentoCru[]).map((r) => this.paraDominioRelacionamento(r));
  }

  async buscarLinksCampos(
    nomeInstanciaPai: string,
    nomeInstanciaFilho: string,
    _tokenUsuario: string,
  ): Promise<LinkCampo[]> {
    const sql = `
      SELECT NOMEINSTANCIAPAI, NOMEINSTANCIAFILHO, CAMPOORIGEM, CAMPODESTINO, ORDEM
      FROM TDDLGC WHERE NOMEINSTANCIAPAI = @param1 AND NOMEINSTANCIAFILHO = @param2 ORDER BY ORDEM
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [nomeInstanciaPai, nomeInstanciaFilho]);
    return (resultado as LinkCampoCru[]).map((r) => this.paraDominioLinkCampo(r));
  }

  async buscarTodos(_tokenUsuario: string): Promise<Relacionamento[]> {
    const sql = `
      SELECT NOMEINSTANCIAPAI, NOMEINSTANCIAFILHO, TIPOLIGACAO, ORDEM, ATIVO
      FROM TDDLIG ORDER BY NOMEINSTANCIAPAI, ORDEM
    `;
    const resultado = await this.sqlServer.executeSQL(sql, []);
    return (resultado as RelacionamentoCru[]).map((r) => this.paraDominioRelacionamento(r));
  }

  private paraDominioRelacionamento(cru: RelacionamentoCru): Relacionamento {
    const resultado = Relacionamento.criar({
      nomeInstanciaPai: cru.NOMEINSTANCIAPAI,
      nomeInstanciaFilho: cru.NOMEINSTANCIAFILHO,
      tipoLigacao: cru.TIPOLIGACAO,
      ordem: cru.ORDEM,
      ativo: cru.ATIVO,
    });
    if (resultado.falhou) throw new Error(`Erro ao mapear relacionamento: ${resultado.erro}`);
    return resultado.obterValor();
  }

  private paraDominioLinkCampo(cru: LinkCampoCru): LinkCampo {
    const resultado = LinkCampo.criar({
      nomeInstanciaPai: cru.NOMEINSTANCIAPAI,
      nomeInstanciaFilho: cru.NOMEINSTANCIAFILHO,
      campoOrigem: cru.CAMPOORIGEM,
      campoDestino: cru.CAMPODESTINO,
      ordem: cru.ORDEM,
    });
    if (resultado.falhou) throw new Error(`Erro ao mapear link campo: ${resultado.erro}`);
    return resultado.obterValor();
  }
}
