import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OsController } from '../infrastructure/http/controllers/os.controller';
import { MssqlOsReadRepository } from '../infrastructure/database/repositories/mssql-os-read.repository';
import { OS_READ_REPOSITORY } from '../domain/os/interfaces/os-read.repository';
import { ListarOsHandler } from '../application/os/queries/listar-os.query';
import { OsAtivasHandler } from '../application/os/queries/os-ativas.query';
import { OsResumoHandler } from '../application/os/queries/os-resumo.query';
import {
  OsPorIdHandler, OsServicosHandler, OsExecutoresHandler,
  OsComprasHandler, OsTimelineHandler,
} from '../application/os/queries/os-detail.query';

const queryHandlers = [
  ListarOsHandler,
  OsAtivasHandler,
  OsResumoHandler,
  OsPorIdHandler,
  OsServicosHandler,
  OsExecutoresHandler,
  OsComprasHandler,
  OsTimelineHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [OsController],
  providers: [
    { provide: OS_READ_REPOSITORY, useClass: MssqlOsReadRepository },
    ...queryHandlers,
  ],
})
export class OsModule {}
