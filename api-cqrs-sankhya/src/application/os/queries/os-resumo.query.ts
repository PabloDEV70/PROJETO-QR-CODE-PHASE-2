import { QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { OS_READ_REPOSITORY } from '../../../domain/os/interfaces/os-read.repository';
import type { IOsReadRepository, OsListFilters } from '../../../domain/os/interfaces/os-read.repository';
import type { DatabaseKey } from '../../../config/database.config';

export class OsResumoQuery {
  constructor(
    public readonly filters: OsListFilters,
    public readonly database: DatabaseKey,
  ) {}
}

@QueryHandler(OsResumoQuery)
export class OsResumoHandler {
  constructor(
    @Inject(OS_READ_REPOSITORY) private readonly repo: IOsReadRepository,
  ) {}

  async execute(query: OsResumoQuery) {
    return this.repo.resumo(query.filters, query.database);
  }
}
