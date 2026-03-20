import { OsComercial } from './os-comercial';

export interface OsCompleta extends OsComercial {
  nomeParc?: string | null;
  nomeResponsavel?: string | null;
  situacaoLabel?: string | null;
  totalItens?: number;
  totalVeiculos?: number;
}
