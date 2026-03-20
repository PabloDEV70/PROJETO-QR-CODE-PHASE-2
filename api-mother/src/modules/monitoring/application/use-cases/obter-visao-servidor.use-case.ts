/**
 * UseCase: ObterVisaoServidor
 *
 * Obtém visão geral do servidor SQL Server.
 */
import { Injectable, Inject } from '@nestjs/common';
import { IProvedorVisaoServidor, PROVEDOR_VISAO_SERVIDOR, PermissoesMonitoramento } from '../ports';
import { VisaoServidor } from '../../domain/entities';

@Injectable()
export class ObterVisaoServidorUseCase {
  constructor(
    @Inject(PROVEDOR_VISAO_SERVIDOR)
    private readonly provedor: IProvedorVisaoServidor,
  ) {}

  async executar(): Promise<VisaoServidor> {
    return this.provedor.obterVisaoGeral();
  }

  async verificarPermissoes(): Promise<PermissoesMonitoramento> {
    return this.provedor.verificarPermissoes();
  }
}
