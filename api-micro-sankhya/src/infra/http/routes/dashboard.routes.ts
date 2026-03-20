import { FastifyInstance } from 'fastify';
import { DashboardService } from '../../../domain/services/dashboard.service';

export async function dashboardRoutes(app: FastifyInstance) {
  const dashboardService = new DashboardService();

  app.get('/dashboard', async () => {
    return dashboardService.getVisaoGeral();
  });

  app.get('/dashboard/os-pendentes', async () => {
    return dashboardService.getOsPendentes();
  });

  app.get('/dashboard/atividade-recente', async () => {
    return dashboardService.getAtividadeRecente();
  });

  app.get('/dashboard/indicadores', async () => {
    return dashboardService.getIndicadores();
  });
}
