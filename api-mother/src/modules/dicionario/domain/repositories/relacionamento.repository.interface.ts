import { Relacionamento } from '../entities/relacionamento.entity';
import { LinkCampo } from '../entities/link-campo.entity';

export const REPOSITORIO_RELACIONAMENTO = Symbol('IRepositorioRelacionamento');

export interface IRepositorioRelacionamento {
  buscarPorInstanciaPai(nomeInstancia: string, tokenUsuario: string): Promise<Relacionamento[]>;
  buscarPorInstanciaFilho(nomeInstancia: string, tokenUsuario: string): Promise<Relacionamento[]>;
  buscarLinksCampos(nomeInstanciaPai: string, nomeInstanciaFilho: string, tokenUsuario: string): Promise<LinkCampo[]>;
  buscarTodos(tokenUsuario: string): Promise<Relacionamento[]>;
}
