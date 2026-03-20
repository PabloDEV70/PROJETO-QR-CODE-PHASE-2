/**
 * UseCase: ListarTriggers
 *
 * Lista triggers do banco de dados.
 */
import { Injectable, Inject } from '@nestjs/common';
import { IProvedorTriggers, PROVEDOR_TRIGGERS, OpcoesPaginacao } from '../ports';
import { Trigger } from '../../domain/entities';

@Injectable()
export class ListarTriggersUseCase {
  constructor(
    @Inject(PROVEDOR_TRIGGERS)
    private readonly provedor: IProvedorTriggers,
  ) {}

  async executar(opcoes: OpcoesPaginacao = {}): Promise<Trigger[]> {
    return this.provedor.listarTriggers(opcoes);
  }
}
