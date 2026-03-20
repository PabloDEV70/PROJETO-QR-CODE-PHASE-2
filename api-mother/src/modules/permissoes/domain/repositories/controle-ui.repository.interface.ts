import { ControleUI } from '../entities/controle-ui.entity';

export const REPOSITORIO_CONTROLE_UI = Symbol('IRepositorioControleUI');

export interface IRepositorioControleUI {
  buscarPorUsuarioETela(codUsuario: number, codTela: number, tokenUsuario: string): Promise<ControleUI[]>;
  buscarPorUsuario(codUsuario: number, tokenUsuario: string): Promise<ControleUI[]>;
  verificarAcesso(codUsuario: number, codTela: number, nomeControle: string, tokenUsuario: string): Promise<boolean>;
}
