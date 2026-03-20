/**
 * Configurações centralizadas para portões de acesso
 * Remove hard-coded values dos arquivos SQL
 */

export interface PortaoConfig {
  ip: string;
  descricao: string;
  codigo?: string;
}

export const PORTOES_CONFIG: Record<string, PortaoConfig> = {
  '1': {
    ip: '192.168.3.93',
    descricao: 'PORTA RH, COMERCIAL, DIRETORIA',
    codigo: '1',
  },
  '2': {
    ip: '192.168.3.92',
    descricao: 'ALMOXARIFADO PATIO 1',
    codigo: '2',
  },
  '3': {
    ip: '192.168.3.91',
    descricao: 'PORTAO MENINO JESUS DE PRAGA',
    codigo: '3',
  },
  '4': {
    ip: '192.168.3.90',
    descricao: 'ALMOXARIFADO PATIO 2',
    codigo: '4',
  },
};

// Helper para gerar CASE statement SQL dinamicamente
export function gerarCaseStatementPortoes(alias = 'HIK'): string {
  const cases = Object.values(PORTOES_CONFIG)
    .map((portao) => `WHEN ${alias}.ip = '${portao.ip}' THEN '${portao.descricao}'`)
    .join('\n        ');

  return `CASE\n        ${cases}\n        ELSE ${alias}.ip\n    END AS Portao`;
}

// Helper para gerar filtro WHERE de portões
export function gerarFiltroPortoes(alias = 'HIK', paramAlias = '@param1'): string {
  const conditions = Object.entries(PORTOES_CONFIG)
    .map(([codigo, portao]) => `OR (${paramAlias} = '${codigo}' AND ${alias}.ip = '${portao.ip}')`)
    .join('\n        ');

  return `(
        ${paramAlias} IS NULL
        OR ${paramAlias} = ''
        ${conditions}
        OR (${alias}.ip = ${paramAlias})
    )`;
}

// Helper para obter IP por código
export function getIpPorCodigo(codigo: string): string | null {
  const portao = PORTOES_CONFIG[codigo];
  return portao ? portao.ip : null;
}

// Helper para obter descrição por IP
export function getDescricaoPorIp(ip: string): string {
  const portao = Object.values(PORTOES_CONFIG).find((p) => p.ip === ip);
  return portao ? portao.descricao : ip;
}

// Helper para listar todos os IPs
export function getAllIps(): string[] {
  return Object.values(PORTOES_CONFIG).map((portao) => portao.ip);
}
