import { Injectable } from '@nestjs/common';
import { IRepositorioInstancia } from '../../domain/repositories/instancia.repository.interface';
import { Instancia } from '../../domain/entities/instancia.entity';
import { InstanciaMapper, InstanciaCru } from '../../application/mappers/instancia.mapper';
import { SqlServerService } from '../../../../database/sqlserver.service';

@Injectable()
export class SankhyaInstanciaRepository implements IRepositorioInstancia {
  constructor(
    private readonly sqlServer: SqlServerService,
    private readonly mapper: InstanciaMapper,
  ) {}

  async buscarPorNome(nomeInstancia: string, _tokenUsuario: string): Promise<Instancia | null> {
    const sql = `
      SELECT NOMEINSTANCIA, NOMETAB, DESCRICAO, ORDEM, ATIVA
      FROM TDDINS WHERE NOMEINSTANCIA = @param1
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [nomeInstancia]);
    if (!resultado || resultado.length === 0) return null;
    return this.mapper.paraDominio(resultado[0] as InstanciaCru);
  }

  async buscarPorTabela(nomeTabela: string, _tokenUsuario: string): Promise<Instancia[]> {
    const sql = `
      SELECT NOMEINSTANCIA, NOMETAB, DESCRICAO, ORDEM, ATIVA
      FROM TDDINS WHERE NOMETAB = @param1 ORDER BY ORDEM
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [nomeTabela]);
    return (resultado as InstanciaCru[]).map((r) => this.mapper.paraDominio(r));
  }

  async buscarTodas(_tokenUsuario: string): Promise<Instancia[]> {
    const sql = `
      SELECT NOMEINSTANCIA, NOMETAB, DESCRICAO, ORDEM, ATIVA
      FROM TDDINS ORDER BY NOMETAB, ORDEM
    `;
    const resultado = await this.sqlServer.executeSQL(sql, []);
    return (resultado as InstanciaCru[]).map((r) => this.mapper.paraDominio(r));
  }

  async buscarAtivas(_tokenUsuario: string): Promise<Instancia[]> {
    const sql = `
      SELECT NOMEINSTANCIA, NOMETAB, DESCRICAO, ORDEM, ATIVA
      FROM TDDINS WHERE ATIVA = 'S' ORDER BY NOMETAB, ORDEM
    `;
    const resultado = await this.sqlServer.executeSQL(sql, []);
    return (resultado as InstanciaCru[]).map((r) => this.mapper.paraDominio(r));
  }
}
