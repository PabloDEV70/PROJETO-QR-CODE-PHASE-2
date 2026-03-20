/**
 * UseCase: ObterDetalheView
 *
 * Obtém detalhes de uma view específica.
 */
import { Injectable, Inject } from '@nestjs/common';
import { IProvedorViews, PROVEDOR_VIEWS } from '../ports';
import { ViewDetalhe } from '../../domain/entities';

@Injectable()
export class ObterDetalheViewUseCase {
  constructor(
    @Inject(PROVEDOR_VIEWS)
    private readonly provedor: IProvedorViews,
  ) {}

  async executar(schema: string, nome: string, truncar = false): Promise<ViewDetalhe> {
    return this.provedor.obterDetalheView(schema, nome, truncar);
  }
}
