import { QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { OS_READ_REPOSITORY } from '../../../domain/os/interfaces/os-read.repository';
import type { IOsReadRepository } from '../../../domain/os/interfaces/os-read.repository';
import type { DatabaseKey } from '../../../config/database.config';

export class OsAtivasQuery {
  constructor(
    public readonly database: DatabaseKey,
    public readonly codparcexec?: number,
    public readonly placa?: string,
  ) {}
}

@QueryHandler(OsAtivasQuery)
export class OsAtivasHandler {
  constructor(
    @Inject(OS_READ_REPOSITORY) private readonly repo: IOsReadRepository,
  ) {}

  async execute(query: OsAtivasQuery) {
    return this.repo.ativas(query.database, {
      codparcexec: query.codparcexec,
      placa: query.placa,
    });
  }
}
