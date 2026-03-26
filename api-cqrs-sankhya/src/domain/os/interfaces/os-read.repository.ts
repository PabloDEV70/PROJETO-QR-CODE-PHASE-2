import { DatabaseKey } from '../../../config/database.config';

export interface OsListFilters {
  dataInicio?: string;
  dataFim?: string;
  status?: string;
  manutencao?: string;
  statusGig?: string;
  tipo?: string;
  search?: string;
  codveiculo?: number;
  codusuexec?: number;
  codparcexec?: number;
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface OsListResult {
  items: Record<string, unknown>[];
  total: number;
}

export interface IOsReadRepository {
  listar(filters: OsListFilters, pagination: Pagination, db: DatabaseKey): Promise<OsListResult>;
  ativas(db: DatabaseKey, opts?: { codparcexec?: number; placa?: string }): Promise<Record<string, unknown>[]>;
  porId(nuos: number, db: DatabaseKey): Promise<Record<string, unknown> | null>;
  resumo(filters: OsListFilters, db: DatabaseKey): Promise<Record<string, unknown>>;
  servicos(nuos: number, db: DatabaseKey): Promise<Record<string, unknown>[]>;
  executores(nuos: number, db: DatabaseKey): Promise<Record<string, unknown>[]>;
  compras(nuos: number, db: DatabaseKey): Promise<Record<string, unknown>>;
  timeline(nuos: number, db: DatabaseKey): Promise<Record<string, unknown>[]>;
}

export const OS_READ_REPOSITORY = Symbol('OS_READ_REPOSITORY');
