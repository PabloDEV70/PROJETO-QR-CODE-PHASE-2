/**
 * UseCase: ListarSessoes
 *
 * Lista sessões ativas no servidor.
 */
import { Injectable, Inject } from '@nestjs/common';
import { IProvedorSessoes, PROVEDOR_SESSOES } from '../ports';
import { SessaoAtiva } from '../../domain/entities';

@Injectable()
export class ListarSessoesUseCase {
  constructor(
    @Inject(PROVEDOR_SESSOES)
    private readonly provedor: IProvedorSessoes,
  ) {}

  async executar(): Promise<SessaoAtiva[]> {
    return this.provedor.obterSessoesAtivas();
  }

  async obterDetalhes(): Promise<SessaoAtiva[]> {
    return this.provedor.obterDetalhesSessoes();
  }
}
