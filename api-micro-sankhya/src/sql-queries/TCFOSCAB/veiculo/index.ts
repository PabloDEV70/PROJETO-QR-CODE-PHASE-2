import { readFileSync } from 'fs';
import { join } from 'path';

function loadSql(filename: string): string {
  return readFileSync(join(__dirname, filename), 'utf-8');
}

export const getVeiculoDashboard = loadSql('get-dashboard.sql');
export const getVeiculoProximaManutencao = loadSql('get-proxima-manutencao.sql');
export const getVeiculoHistorico = loadSql('get-historico.sql');
export const getVeiculoCustos = loadSql('get-custos.sql');
export const getVeiculoAderenciaPlano = loadSql('get-aderencia-plano.sql');
export const getVeiculoRetrabalho = loadSql('get-retrabalho.sql');
export const getFrotaResumo = loadSql('get-frota-resumo.sql');
export const getFrotaStatusPorStatus = loadSql('get-frota-status-por-status.sql');
export const getFrotaVeiculosPorStatus = loadSql('get-frota-veiculos-por-status.sql');
export const getManutencoesUrgentes = loadSql('get-manutencoes-urgentes.sql');
