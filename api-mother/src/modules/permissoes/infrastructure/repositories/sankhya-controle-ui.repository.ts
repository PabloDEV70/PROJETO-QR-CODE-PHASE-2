import { Injectable } from '@nestjs/common';
import { IRepositorioControleUI } from '../../domain/repositories/controle-ui.repository.interface';
import { ControleUI } from '../../domain/entities/controle-ui.entity';
import { SqlServerService } from '../../../../database/sqlserver.service';

interface ControleUICru {
  codUsuario: number;
  codTela: number;
  nomeControle: string;
  habilitado: string;
  visivel: string;
  obrigatorio: string;
  somenteLeitura: string;
}

@Injectable()
export class SankhyaControleUIRepository implements IRepositorioControleUI {
  constructor(private readonly sqlServer: SqlServerService) {}

  async buscarPorUsuarioETela(codUsuario: number, codTela: number, _tokenUsuario: string): Promise<ControleUI[]> {
    const sql = `
      SELECT CODUSU as codUsuario, CODTELA as codTela, NOMECONTROLE as nomeControle,
             HABILITADO as habilitado, VISIVEL as visivel, OBRIGATORIO as obrigatorio,
             SOMENTELEITURA as somenteLeitura
      FROM TRDCON
      WHERE CODUSU = @param1 AND CODTELA = @param2
      ORDER BY NOMECONTROLE
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [codUsuario, codTela]);
    return (resultado as ControleUICru[]).map((r) => this.paraDominio(r));
  }

  async buscarPorUsuario(codUsuario: number, _tokenUsuario: string): Promise<ControleUI[]> {
    const sql = `
      SELECT CODUSU as codUsuario, CODTELA as codTela, NOMECONTROLE as nomeControle,
             HABILITADO as habilitado, VISIVEL as visivel, OBRIGATORIO as obrigatorio,
             SOMENTELEITURA as somenteLeitura
      FROM TRDCON
      WHERE CODUSU = @param1
      ORDER BY CODTELA, NOMECONTROLE
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [codUsuario]);
    return (resultado as ControleUICru[]).map((r) => this.paraDominio(r));
  }

  async verificarAcesso(
    codUsuario: number,
    codTela: number,
    nomeControle: string,
    _tokenUsuario: string,
  ): Promise<boolean> {
    const sql = `
      SELECT COUNT(*) as total FROM TRDCON
      WHERE CODUSU = @param1 AND CODTELA = @param2
        AND NOMECONTROLE = @param3 AND HABILITADO = 'S' AND VISIVEL = 'S'
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [codUsuario, codTela, nomeControle]);
    return resultado[0]?.total > 0;
  }

  private paraDominio(cru: ControleUICru): ControleUI {
    const resultado = ControleUI.criar({
      codUsuario: cru.codUsuario,
      codTela: cru.codTela,
      nomeControle: cru.nomeControle,
      habilitado: cru.habilitado,
      visivel: cru.visivel,
      obrigatorio: cru.obrigatorio,
      somenteLeitura: cru.somenteLeitura,
    });
    if (resultado.falhou) {
      throw new Error(`Erro ao mapear controle: ${resultado.erro}`);
    }
    return resultado.obterValor();
  }
}
