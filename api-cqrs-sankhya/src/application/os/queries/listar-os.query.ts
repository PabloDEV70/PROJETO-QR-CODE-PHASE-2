import { QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { OS_READ_REPOSITORY } from '../../../domain/os/interfaces/os-read.repository';
import type { IOsReadRepository, OsListFilters, Pagination } from '../../../domain/os/interfaces/os-read.repository';
import type { DatabaseKey } from '../../../config/database.config';

export class ListarOsQuery {
  constructor(
    public readonly filters: OsListFilters,
    public readonly pagination: Pagination,
    public readonly database: DatabaseKey,
  ) {}
}

@QueryHandler(ListarOsQuery)
export class ListarOsHandler {
  constructor(
    @Inject(OS_READ_REPOSITORY) private readonly repo: IOsReadRepository,
  ) {}

  async execute(query: ListarOsQuery) {
    const { items, total } = await this.repo.listar(query.filters, query.pagination, query.database);
    return {
      data: items,
      pagination: {
        page: query.pagination.page,
        limit: query.pagination.limit,
        total,
        totalPages: Math.ceil(total / query.pagination.limit),
      },
    };
  }
}
