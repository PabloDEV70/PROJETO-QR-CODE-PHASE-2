import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { TsiAnexo } from '../../types/TSIANX';
import { env } from '../../config/env';
import * as Q from '../../sql-queries/TSIANX';

/**
 * Registry of known Sankhya module attachment configurations.
 * nomeInstancia = TSIANX.NOMEINSTANCIA values
 * pkFormat = how to build the PKREGISTRO LIKE pattern from the entity PK
 */
interface ModuleConfig {
  instancias: string[];
  pkPattern: (pk: string) => string;
}

const MODULES: Record<string, ModuleConfig> = {
  COMADM: {
    instancias: ['COMADM', 'COMADM1'],
    pkPattern: (pk) => `${pk}[_]%`,
  },
  TCFOSCAB: {
    instancias: ['TCFOSCAB'],
    pkPattern: (pk) => `${pk}[_]%`,
  },
  TGFPAR: {
    instancias: ['TGFPAR'],
    pkPattern: (pk) => `${pk}[_]%`,
  },
  TGFPRO: {
    instancias: ['TGFPRO'],
    pkPattern: (pk) => `${pk}[_]%`,
  },
};

export class AnexosService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async getAnexos(modulo: string, pk: string | number): Promise<TsiAnexo[]> {
    const config = MODULES[modulo.toUpperCase()];
    if (!config) {
      throw new Error(`Modulo '${modulo}' nao configurado para anexos`);
    }

    const instancias = config.instancias.map((i) => `'${i}'`).join(',');
    const pattern = config.pkPattern(String(pk));

    const sql = Q.getByInstancia
      .replace('@INSTANCIAS', instancias)
      .replace('@PK_PATTERN', `'${pattern}'`);

    const rows = await this.qe.executeQuery<TsiAnexo>(sql);
    return rows.map((r) => ({
      ...r,
      DOWNLOAD_URL: this.buildDownloadUrl(r),
    }));
  }

  private buildDownloadUrl(anexo: TsiAnexo): string | null {
    if (anexo.LINK) return anexo.LINK;
    if (!anexo.CHAVEARQUIVO || !env.SANKHYA_MGE_URL) return null;
    return `${env.SANKHYA_MGE_URL}/visualizadorArquivos.mge?chaveArquivo=ARQUIVOANEXO${anexo.CHAVEARQUIVO.toUpperCase()}&forcarDownload=S`;
  }

  getModulosDisponiveis(): string[] {
    return Object.keys(MODULES);
  }
}
