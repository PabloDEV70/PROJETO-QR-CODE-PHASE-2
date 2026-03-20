import { Injectable, Inject } from '@nestjs/common';
import {
  IRepositorioControleUI,
  REPOSITORIO_CONTROLE_UI,
} from '../../../domain/repositories/controle-ui.repository.interface';
import { ControleUI } from '../../../domain/entities/controle-ui.entity';

export interface ObterPermissoesTelaEntrada {
  codUsuario: number;
  codTela: number;
  tokenUsuario: string;
}

export interface ControlePermissaoDto {
  nomeControle: string;
  habilitado: boolean;
  visivel: boolean;
  obrigatorio: boolean;
  somenteLeitura: boolean;
  acessivel: boolean;
  permiteEdicao: boolean;
}

export interface ObterPermissoesTelaResultado {
  codUsuario: number;
  codTela: number;
  controles: ControlePermissaoDto[];
  total: number;
}

@Injectable()
export class ObterPermissoesTelaUseCase {
  constructor(
    @Inject(REPOSITORIO_CONTROLE_UI)
    private readonly repositorio: IRepositorioControleUI,
  ) {}

  async executar(entrada: ObterPermissoesTelaEntrada): Promise<ObterPermissoesTelaResultado> {
    const controles = await this.repositorio.buscarPorUsuarioETela(
      entrada.codUsuario,
      entrada.codTela,
      entrada.tokenUsuario,
    );

    return {
      codUsuario: entrada.codUsuario,
      codTela: entrada.codTela,
      controles: controles.map((c) => this.paraDto(c)),
      total: controles.length,
    };
  }

  private paraDto(controle: ControleUI): ControlePermissaoDto {
    return {
      nomeControle: controle.nomeControle,
      habilitado: controle.habilitado,
      visivel: controle.visivel,
      obrigatorio: controle.obrigatorio,
      somenteLeitura: controle.somenteLeitura,
      acessivel: controle.estaAcessivel(),
      permiteEdicao: controle.permiteEdicao(),
    };
  }
}
