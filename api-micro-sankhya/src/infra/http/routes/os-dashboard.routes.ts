import { FastifyInstance } from 'fastify';
import { OsDashboardService } from '../../../domain/services/os-dashboard.service';

export async function osDashboardRoutes(app: FastifyInstance) {
  const service = new OsDashboardService();

  app.get('/os/dashboard', async () => {
    return service.getDashboard();
  });
}
