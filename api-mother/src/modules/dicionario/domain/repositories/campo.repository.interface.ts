import { Campo } from '../entities/campo.entity';
import { OpcaoCampo } from '../entities/opcao-campo.entity';
import { PropriedadeCampo } from '../entities/propriedade-campo.entity';

export const REPOSITORIO_CAMPO = Symbol('IRepositorioCampo');

export interface IRepositorioCampo {
  buscarPorTabela(nomeTabela: string, tokenUsuario: string): Promise<Campo[]>;
  buscarPorNome(nomeTabela: string, nomeCampo: string, tokenUsuario: string): Promise<Campo | null>;
  buscarChavesPrimarias(nomeTabela: string, tokenUsuario: string): Promise<Campo[]>;
  buscarChavesEstrangeiras(nomeTabela: string, tokenUsuario: string): Promise<Campo[]>;
  buscarObrigatorios(nomeTabela: string, tokenUsuario: string): Promise<Campo[]>;
  contarCamposPorTabela(nomeTabela: string, tokenUsuario: string): Promise<number>;
  buscarGlobal(termo: string, tokenUsuario: string): Promise<Campo[]>;
  buscarOpcoesCampo(nomeTabela: string, nomeCampo: string, tokenUsuario: string): Promise<OpcaoCampo[]>;
  buscarPropriedadesCampo(nomeTabela: string, nomeCampo: string, tokenUsuario: string): Promise<PropriedadeCampo[]>;
}
