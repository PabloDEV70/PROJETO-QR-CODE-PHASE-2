/**
 * UseCase: ObterSchemaTabela
 *
 * Obtém o schema (colunas) de uma tabela específica.
 */
import { Injectable, Inject } from '@nestjs/common';
import { IProvedorTabelas, PROVEDOR_TABELAS } from '../ports';
import { ColunaTabela } from '../../domain/entities';

@Injectable()
export class ObterSchemaTabelaUseCase {
  constructor(
    @Inject(PROVEDOR_TABELAS)
    private readonly provedor: IProvedorTabelas,
  ) {}

  async executar(nomeTabela: string): Promise<ColunaTabela[]> {
    return this.provedor.obterSchemaTabela(nomeTabela);
  }
}
