import { Injectable, Inject } from '@nestjs/common';
import {
  IRepositorioControleUI,
  REPOSITORIO_CONTROLE_UI,
} from '../../../domain/repositories/controle-ui.repository.interface';

export interface VerificarAcessoControleEntrada {
  codUsuario: number;
  codTela: number;
  nomeControle: string;
  tokenUsuario: string;
}

export interface VerificarAcessoControleResultado {
  codUsuario: number;
  codTela: number;
  nomeControle: string;
  temAcesso: boolean;
}

@Injectable()
export class VerificarAcessoControleUseCase {
  constructor(
    @Inject(REPOSITORIO_CONTROLE_UI)
    private readonly repositorio: IRepositorioControleUI,
  ) {}

  async executar(entrada: VerificarAcessoControleEntrada): Promise<VerificarAcessoControleResultado> {
    const temAcesso = await this.repositorio.verificarAcesso(
      entrada.codUsuario,
      entrada.codTela,
      entrada.nomeControle,
      entrada.tokenUsuario,
    );

    return {
      codUsuario: entrada.codUsuario,
      codTela: entrada.codTela,
      nomeControle: entrada.nomeControle,
      temAcesso,
    };
  }
}
