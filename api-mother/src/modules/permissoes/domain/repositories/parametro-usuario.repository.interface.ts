import { ParametroUsuario } from '../entities/parametro-usuario.entity';

export const REPOSITORIO_PARAMETRO_USUARIO = Symbol('IRepositorioParametroUsuario');

export interface IRepositorioParametroUsuario {
  buscarPorUsuario(codUsuario: number, tokenUsuario: string): Promise<ParametroUsuario[]>;
  buscarPorChave(codUsuario: number, chave: string, tokenUsuario: string): Promise<ParametroUsuario | null>;
  buscarParametrosAtivos(codUsuario: number, tokenUsuario: string): Promise<ParametroUsuario[]>;
}
