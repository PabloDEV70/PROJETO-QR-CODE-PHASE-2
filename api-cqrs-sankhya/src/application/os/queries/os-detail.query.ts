import { QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { OS_READ_REPOSITORY } from '../../../domain/os/interfaces/os-read.repository';
import type { IOsReadRepository } from '../../../domain/os/interfaces/os-read.repository';
import type { DatabaseKey } from '../../../config/database.config';

export class OsPorIdQuery {
  constructor(public readonly nuos: number, public readonly database: DatabaseKey) {}
}

export class OsServicosQuery {
  constructor(public readonly nuos: number, public readonly database: DatabaseKey) {}
}

export class OsExecutoresQuery {
  constructor(public readonly nuos: number, public readonly database: DatabaseKey) {}
}

export class OsComprasQuery {
  constructor(public readonly nuos: number, public readonly database: DatabaseKey) {}
}

export class OsTimelineQuery {
  constructor(public readonly nuos: number, public readonly database: DatabaseKey) {}
}

@QueryHandler(OsPorIdQuery)
export class OsPorIdHandler {
  constructor(@Inject(OS_READ_REPOSITORY) private readonly repo: IOsReadRepository) {}
  async execute(query: OsPorIdQuery) {
    const os = await this.repo.porId(query.nuos, query.database);
    if (!os) throw new NotFoundException(`OS ${query.nuos} not found`);
    return os;
  }
}

@QueryHandler(OsServicosQuery)
export class OsServicosHandler {
  constructor(@Inject(OS_READ_REPOSITORY) private readonly repo: IOsReadRepository) {}
  async execute(query: OsServicosQuery) { return this.repo.servicos(query.nuos, query.database); }
}

@QueryHandler(OsExecutoresQuery)
export class OsExecutoresHandler {
  constructor(@Inject(OS_READ_REPOSITORY) private readonly repo: IOsReadRepository) {}
  async execute(query: OsExecutoresQuery) { return this.repo.executores(query.nuos, query.database); }
}

@QueryHandler(OsComprasQuery)
export class OsComprasHandler {
  constructor(@Inject(OS_READ_REPOSITORY) private readonly repo: IOsReadRepository) {}
  async execute(query: OsComprasQuery) { return this.repo.compras(query.nuos, query.database); }
}

@QueryHandler(OsTimelineQuery)
export class OsTimelineHandler {
  constructor(@Inject(OS_READ_REPOSITORY) private readonly repo: IOsReadRepository) {}
  async execute(query: OsTimelineQuery) { return this.repo.timeline(query.nuos, query.database); }
}
