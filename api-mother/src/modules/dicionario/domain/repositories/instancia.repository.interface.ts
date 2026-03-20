import { Instancia } from '../entities/instancia.entity';

export const REPOSITORIO_INSTANCIA = Symbol('IRepositorioInstancia');

export interface IRepositorioInstancia {
  buscarPorNome(nomeInstancia: string, tokenUsuario: string): Promise<Instancia | null>;
  buscarPorTabela(nomeTabela: string, tokenUsuario: string): Promise<Instancia[]>;
  buscarTodas(tokenUsuario: string): Promise<Instancia[]>;
  buscarAtivas(tokenUsuario: string): Promise<Instancia[]>;
}
