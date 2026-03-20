import { Injectable } from '@nestjs/common';
import { IRepositorioParametroUsuario } from '../../domain/repositories/parametro-usuario.repository.interface';
import { ParametroUsuario } from '../../domain/entities/parametro-usuario.entity';
import { SqlServerService } from '../../../../database/sqlserver.service';

interface ParametroCru {
  codUsuario: number;
  chave: string;
  valor: string;
  tipo: string;
  descricao: string;
}

@Injectable()
export class SankhyaParametroUsuarioRepository implements IRepositorioParametroUsuario {
  constructor(private readonly sqlServer: SqlServerService) {}

  async buscarPorUsuario(codUsuario: number, _tokenUsuario: string): Promise<ParametroUsuario[]> {
    const sql = `
      SELECT CODUSU as codUsuario, CHAVE as chave, VALOR as valor,
             TIPO as tipo, DESCRICAO as descricao
      FROM TSIPAR
      WHERE CODUSU = @param1
      ORDER BY CHAVE
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [codUsuario]);
    return (resultado as ParametroCru[]).map((r) => this.paraDominio(r));
  }

  async buscarPorChave(codUsuario: number, chave: string, _tokenUsuario: string): Promise<ParametroUsuario | null> {
    const sql = `
      SELECT CODUSU as codUsuario, CHAVE as chave, VALOR as valor,
             TIPO as tipo, DESCRICAO as descricao
      FROM TSIPAR
      WHERE CODUSU = @param1 AND CHAVE = @param2
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [codUsuario, chave]);
    if (!resultado || resultado.length === 0) {
      return null;
    }
    return this.paraDominio(resultado[0] as ParametroCru);
  }

  async buscarParametrosAtivos(codUsuario: number, _tokenUsuario: string): Promise<ParametroUsuario[]> {
    const sql = `
      SELECT CODUSU as codUsuario, CHAVE as chave, VALOR as valor,
             TIPO as tipo, DESCRICAO as descricao
      FROM TSIPAR
      WHERE CODUSU = @param1 AND TIPO = 'B' AND VALOR = 'S'
      ORDER BY CHAVE
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [codUsuario]);
    return (resultado as ParametroCru[]).map((r) => this.paraDominio(r));
  }

  private paraDominio(cru: ParametroCru): ParametroUsuario {
    const resultado = ParametroUsuario.criar({
      codUsuario: cru.codUsuario,
      chave: cru.chave,
      valor: cru.valor,
      tipo: cru.tipo,
      descricao: cru.descricao,
    });
    if (resultado.falhou) {
      throw new Error(`Erro ao mapear parametro: ${resultado.erro}`);
    }
    return resultado.obterValor();
  }
}
