import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { getConfig } from '../../sql-queries/AD_RDOMOTIVOS';
import {
  MotivoConfigRow,
  MotivoConfigItem,
  MotivoConfigMap,
} from '../../types/AD_RDOMOTIVOS';
import { cache, CACHE_TTL } from '../../shared/cache';

function toConfigItem(row: MotivoConfigRow): MotivoConfigItem {
  return {
    rdomotivocod: row.RDOMOTIVOCOD,
    produtivo: row.PRODUTIVO === 'S',
    toleranciaMin: row.TOLERANCIA ?? 0,
    penalidadeMin: row.PENALIDADE ?? 0,
    wtCategoria: row.WTCATEGORIA ?? 'externos',
  };
}

export class MotivoConfigService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async getConfigMap(): Promise<MotivoConfigMap> {
    const key = 'motivos:config-map';
    const cached = cache.get<MotivoConfigMap>(key);
    if (cached) return cached;

    const rows = await this.qe.executeQuery<MotivoConfigRow>(getConfig);
    const map: MotivoConfigMap = new Map();
    for (const row of rows) {
      map.set(row.RDOMOTIVOCOD, toConfigItem(row));
    }
    cache.set(key, map, CACHE_TTL.MOTIVOS);
    return map;
  }

  async getConfigArray(): Promise<MotivoConfigItem[]> {
    const map = await this.getConfigMap();
    return Array.from(map.values());
  }
}
