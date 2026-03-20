/**
 * UseCase: ListarEstatisticasEspera
 *
 * Lista estatísticas de espera do servidor.
 */
import { Injectable, Inject } from '@nestjs/common';
import { IProvedorEstatisticasEspera, PROVEDOR_ESTATISTICAS_ESPERA } from '../ports';
import { EstatisticaEspera } from '../../domain/entities';

@Injectable()
export class ListarEstatisticasEsperaUseCase {
  constructor(
    @Inject(PROVEDOR_ESTATISTICAS_ESPERA)
    private readonly provedor: IProvedorEstatisticasEspera,
  ) {}

  async executar(limite = 20): Promise<EstatisticaEspera[]> {
    return this.provedor.obterEstatisticasEspera(limite);
  }
}
