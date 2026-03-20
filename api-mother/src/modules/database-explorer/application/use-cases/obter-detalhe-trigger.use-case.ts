/**
 * UseCase: ObterDetalheTrigger
 *
 * Obtém detalhes de um trigger específico.
 */
import { Injectable, Inject } from '@nestjs/common';
import { IProvedorTriggers, PROVEDOR_TRIGGERS } from '../ports';
import { TriggerDetalhe } from '../../domain/entities';

@Injectable()
export class ObterDetalheTriggerUseCase {
  constructor(
    @Inject(PROVEDOR_TRIGGERS)
    private readonly provedor: IProvedorTriggers,
  ) {}

  async executar(schema: string, nome: string, truncar = false): Promise<TriggerDetalhe> {
    return this.provedor.obterDetalheTrigger(schema, nome, truncar);
  }
}
