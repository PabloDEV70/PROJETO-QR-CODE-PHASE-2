import { Injectable } from '@nestjs/common';
import { IRepositorioCampo } from '../../domain/repositories/campo.repository.interface';
import { Campo } from '../../domain/entities/campo.entity';
import { OpcaoCampo } from '../../domain/entities/opcao-campo.entity';
import { PropriedadeCampo } from '../../domain/entities/propriedade-campo.entity';
import { CampoMapper, CampoCru } from '../../application/mappers/campo.mapper';
import { SqlServerService } from '../../../../database/sqlserver.service';

interface OpcaoCru {
  NOMETAB: string;
  NOMECAMPO: string;
  VALOR: string;
  DESCRICAO: string;
  ORDEM?: number;
}

interface PropriedadeCru {
  NOMETAB: string;
  NOMECAMPO: string;
  NOMEPROPRIEDADE: string;
  VALORPROPRIEDADE: string;
}

@Injectable()
export class SankhyaCampoRepository implements IRepositorioCampo {
  constructor(
    private readonly sqlServer: SqlServerService,
    private readonly mapper: CampoMapper,
  ) {}

  async buscarPorTabela(nomeTabela: string, _tokenUsuario: string): Promise<Campo[]> {
    const sql = `
      SELECT NOMETAB, NOMECAMPO, DESCRICAO, TIPO, TAMANHO, DECIMAIS,
             OBRIGATORIO, CHAVEPRIMARIA, CHAVEESTRANGEIRA, APRESENTACAO, VALORPADRAO
      FROM TDDCAM
      WHERE NOMETAB = @param1
      ORDER BY NOMECAMPO
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [nomeTabela]);
    return (resultado as CampoCru[]).map((r) => this.mapper.paraDominio(r));
  }

  async buscarPorNome(nomeTabela: string, nomeCampo: string, _tokenUsuario: string): Promise<Campo | null> {
    const sql = `
      SELECT NOMETAB, NOMECAMPO, DESCRICAO, TIPO, TAMANHO, DECIMAIS,
             OBRIGATORIO, CHAVEPRIMARIA, CHAVEESTRANGEIRA, APRESENTACAO, VALORPADRAO
      FROM TDDCAM
      WHERE NOMETAB = @param1 AND NOMECAMPO = @param2
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [nomeTabela, nomeCampo]);
    if (!resultado || resultado.length === 0) return null;
    return this.mapper.paraDominio(resultado[0] as CampoCru);
  }

  async buscarChavesPrimarias(nomeTabela: string, _tokenUsuario: string): Promise<Campo[]> {
    const sql = `
      SELECT NOMETAB, NOMECAMPO, DESCRICAO, TIPO, TAMANHO, DECIMAIS,
             OBRIGATORIO, CHAVEPRIMARIA, CHAVEESTRANGEIRA, APRESENTACAO, VALORPADRAO
      FROM TDDCAM
      WHERE NOMETAB = @param1 AND CHAVEPRIMARIA = 'S'
      ORDER BY NOMECAMPO
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [nomeTabela]);
    return (resultado as CampoCru[]).map((r) => this.mapper.paraDominio(r));
  }

  async buscarChavesEstrangeiras(nomeTabela: string, _tokenUsuario: string): Promise<Campo[]> {
    const sql = `
      SELECT NOMETAB, NOMECAMPO, DESCRICAO, TIPO, TAMANHO, DECIMAIS,
             OBRIGATORIO, CHAVEPRIMARIA, CHAVEESTRANGEIRA, APRESENTACAO, VALORPADRAO
      FROM TDDCAM
      WHERE NOMETAB = @param1 AND CHAVEESTRANGEIRA = 'S'
      ORDER BY NOMECAMPO
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [nomeTabela]);
    return (resultado as CampoCru[]).map((r) => this.mapper.paraDominio(r));
  }

  async buscarObrigatorios(nomeTabela: string, _tokenUsuario: string): Promise<Campo[]> {
    const sql = `
      SELECT NOMETAB, NOMECAMPO, DESCRICAO, TIPO, TAMANHO, DECIMAIS,
             OBRIGATORIO, CHAVEPRIMARIA, CHAVEESTRANGEIRA, APRESENTACAO, VALORPADRAO
      FROM TDDCAM
      WHERE NOMETAB = @param1 AND OBRIGATORIO = 'S'
      ORDER BY NOMECAMPO
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [nomeTabela]);
    return (resultado as CampoCru[]).map((r) => this.mapper.paraDominio(r));
  }

  async contarCamposPorTabela(nomeTabela: string, _tokenUsuario: string): Promise<number> {
    const sql = `
      SELECT COUNT(*) as total
      FROM TDDCAM
      WHERE NOMETAB = @param1
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [nomeTabela]);
    return resultado[0]?.total || 0;
  }

  async buscarGlobal(termo: string, _tokenUsuario: string): Promise<Campo[]> {
    const termoLike = `%${termo.toUpperCase()}%`;
    const sql = `
      SELECT c.NOMETAB, c.NOMECAMPO, c.DESCRICAO, c.TIPO, c.TAMANHO, c.DECIMAIS,
             c.OBRIGATORIO, c.CHAVEPRIMARIA, c.CHAVEESTRANGEIRA, c.APRESENTACAO, c.VALORPADRAO
      FROM TDDCAM c
      INNER JOIN TDDTAB t ON c.NOMETAB = t.NOMETAB
      WHERE t.ATIVA = 'S'
        AND (UPPER(c.NOMECAMPO) LIKE @param1 OR UPPER(c.DESCRICAO) LIKE @param1)
      ORDER BY c.NOMETAB, c.NOMECAMPO
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [termoLike]);
    return (resultado as CampoCru[]).map((r) => this.mapper.paraDominio(r));
  }

  async buscarOpcoesCampo(nomeTabela: string, nomeCampo: string, _tokenUsuario: string): Promise<OpcaoCampo[]> {
    const sql = `
      SELECT NOMETAB, NOMECAMPO, VALOR, DESCRICAO, ORDEM
      FROM TDDOPC
      WHERE NOMETAB = @param1 AND NOMECAMPO = @param2
      ORDER BY ORDEM, VALOR
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [nomeTabela, nomeCampo]);
    return (resultado as OpcaoCru[]).map((r) => {
      const opcaoResult = OpcaoCampo.criar({
        nomeTabela: r.NOMETAB,
        nomeCampo: r.NOMECAMPO,
        valor: r.VALOR,
        descricao: r.DESCRICAO,
        ordem: r.ORDEM,
      });
      if (opcaoResult.falhou) {
        throw new Error(`Erro ao mapear opção: ${opcaoResult.erro}`);
      }
      return opcaoResult.obterValor();
    });
  }

  async buscarPropriedadesCampo(
    nomeTabela: string,
    nomeCampo: string,
    _tokenUsuario: string,
  ): Promise<PropriedadeCampo[]> {
    const sql = `
      SELECT NOMETAB, NOMECAMPO, NOMEPROPRIEDADE, VALORPROPRIEDADE
      FROM TDDPCO
      WHERE NOMETAB = @param1 AND NOMECAMPO = @param2
      ORDER BY NOMEPROPRIEDADE
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [nomeTabela, nomeCampo]);
    return (resultado as PropriedadeCru[]).map((r) => {
      const propResult = PropriedadeCampo.criar({
        nomeTabela: r.NOMETAB,
        nomeCampo: r.NOMECAMPO,
        nomePropriedade: r.NOMEPROPRIEDADE,
        valorPropriedade: r.VALORPROPRIEDADE,
      });
      if (propResult.falhou) {
        throw new Error(`Erro ao mapear propriedade: ${propResult.erro}`);
      }
      return propResult.obterValor();
    });
  }
}
