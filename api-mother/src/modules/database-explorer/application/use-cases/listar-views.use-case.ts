/**
 * UseCase: ListarViews
 *
 * Lista views do banco de dados.
 */
import { Injectable, Inject } from '@nestjs/common';
import { IProvedorViews, PROVEDOR_VIEWS, OpcoesPaginacao } from '../ports';
import { View } from '../../domain/entities';

@Injectable()
export class ListarViewsUseCase {
  constructor(
    @Inject(PROVEDOR_VIEWS)
    private readonly provedor: IProvedorViews,
  ) {}

  async executar(opcoes: OpcoesPaginacao = {}): Promise<View[]> {
    return this.provedor.listarViews(opcoes);
  }
}
