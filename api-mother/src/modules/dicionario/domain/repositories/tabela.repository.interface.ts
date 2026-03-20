import { Tabela } from '../entities/tabela.entity';

export const REPOSITORIO_TABELA = Symbol('IRepositorioTabela');

export interface PaginacaoParametros {
  page: number;
  limit: number;
}

export interface ResultadoPaginado<T> {
  dados: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IRepositorioTabela {
  buscarPorNome(nomeTabela: string, tokenUsuario: string): Promise<Tabela | null>;
  buscarTodas(tokenUsuario: string): Promise<Tabela[]>;
  buscarAtivas(tokenUsuario: string): Promise<Tabela[]>;
  buscarPorModulo(modulo: string, tokenUsuario: string): Promise<Tabela[]>;
  existeTabela(nomeTabela: string, tokenUsuario: string): Promise<boolean>;
  buscarAtivasPaginado(paginacao: PaginacaoParametros, tokenUsuario: string): Promise<ResultadoPaginado<Tabela>>;
  buscarPorTermo(termo: string, tokenUsuario: string): Promise<Tabela[]>;
}
