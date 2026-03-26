import { Controller, Get, Param, Query, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { ApiKeyGuard, ApiDomain } from '../../auth/api-key.guard';
import { ListarOsQuery } from '../../../application/os/queries/listar-os.query';
import { OsAtivasQuery } from '../../../application/os/queries/os-ativas.query';
import { OsResumoQuery } from '../../../application/os/queries/os-resumo.query';
import {
  OsPorIdQuery, OsServicosQuery, OsExecutoresQuery,
  OsComprasQuery, OsTimelineQuery,
} from '../../../application/os/queries/os-detail.query';
import { DatabaseKey } from '../../../config/database.config';

function getDb(req: any): DatabaseKey {
  return req.user?.database ?? req.headers['x-database'] ?? 'TESTE';
}

@ApiTags('Ordens de Servico')
@ApiBearerAuth()
@ApiSecurity('api-key')
@ApiDomain('os')
@UseGuards(ApiKeyGuard, AuthGuard('jwt'))
@Controller('os')
export class OsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('list')
  list(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('status') status?: string,
    @Query('manutencao') manutencao?: string,
    @Query('statusGig') statusGig?: string,
    @Query('tipo') tipo?: string,
    @Query('search') search?: string,
    @Req() req?: any,
  ) {
    return this.queryBus.execute(
      new ListarOsQuery(
        { dataInicio, dataFim, status, manutencao, statusGig, tipo, search },
        { page: Number(page), limit: Number(limit) },
        getDb(req),
      ),
    );
  }

  @Get('ativas')
  ativas(
    @Query('codparcexec') codparcexec?: string,
    @Query('placa') placa?: string,
    @Req() req?: any,
  ) {
    return this.queryBus.execute(
      new OsAtivasQuery(getDb(req), codparcexec ? Number(codparcexec) : undefined, placa),
    );
  }

  @Get('resumo')
  resumo(
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('status') status?: string,
    @Query('manutencao') manutencao?: string,
    @Req() req?: any,
  ) {
    return this.queryBus.execute(
      new OsResumoQuery({ dataInicio, dataFim, status, manutencao }, getDb(req)),
    );
  }

  @Get(':nuos')
  porId(@Param('nuos', ParseIntPipe) nuos: number, @Req() req: any) {
    return this.queryBus.execute(new OsPorIdQuery(nuos, getDb(req)));
  }

  @Get(':nuos/servicos')
  servicos(@Param('nuos', ParseIntPipe) nuos: number, @Req() req: any) {
    return this.queryBus.execute(new OsServicosQuery(nuos, getDb(req)));
  }

  @Get(':nuos/executores')
  executores(@Param('nuos', ParseIntPipe) nuos: number, @Req() req: any) {
    return this.queryBus.execute(new OsExecutoresQuery(nuos, getDb(req)));
  }

  @Get(':nuos/compras')
  compras(@Param('nuos', ParseIntPipe) nuos: number, @Req() req: any) {
    return this.queryBus.execute(new OsComprasQuery(nuos, getDb(req)));
  }

  @Get(':nuos/timeline')
  timeline(@Param('nuos', ParseIntPipe) nuos: number, @Req() req: any) {
    return this.queryBus.execute(new OsTimelineQuery(nuos, getDb(req)));
  }
}
