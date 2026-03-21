// ── STATUSOS (6 valores reais do dicionario Sankhya) ──
export type StatusOS = 'MA' | 'AN' | 'AV' | 'SN' | 'AI' | 'SI';

export const STATUS_OS_LABELS: Record<StatusOS, string> = {
  MA: 'Manutencao',
  AV: 'Avaliacao',
  AI: 'Ag. Pecas (Imped.)',
  AN: 'Ag. Pecas (N/ Imped.)',
  SI: 'Servico (Imped.)',
  SN: 'Serv. Terceiros (N/ Imped.)',
};

export const STATUS_OS_COLORS: Record<StatusOS, 'warning' | 'info' | 'success' | 'default' | 'error'> = {
  MA: 'warning',
  AV: 'info',
  AI: 'error',
  AN: 'warning',
  SI: 'error',
  SN: 'default',
};

// ── Tipos de servico com subcategorias do dicionario Sankhya ──
export const TIPO_BORRCHARIA_OPTIONS = [
  { value: 'LV', label: 'Lavador' },
  { value: 'PN', label: 'Pneu' },
] as const;

export const TIPO_ELETRICA_OPTIONS = [
  { value: 'AR', label: 'Ar Condicionado / Climatizador' },
  { value: 'EL', label: 'Eletronico' },
  { value: 'GR', label: 'Geral' },
] as const;

export const TIPO_FUNILARIA_OPTIONS = [
  { value: 'FN', label: 'Funilaria' },
  { value: 'IF', label: 'Insufilme' },
  { value: 'PN', label: 'Pintura' },
] as const;

export const TIPO_MECANICA_OPTIONS = [
  { value: 'GR', label: 'Geral' },
  { value: 'HD', label: 'Hidraulica' },
] as const;

export const TIPO_CALDEIRARIA_OPTIONS = [
  { value: '1', label: 'Geral' },
  { value: '2', label: 'Trinca' },
] as const;

export const TIPO_SERVICO_MAP: Record<string, { label: string; options: readonly { value: string; label: string }[] }> = {
  BORRCHARIA: { label: 'Borracharia', options: TIPO_BORRCHARIA_OPTIONS },
  ELETRICA: { label: 'Eletrica', options: TIPO_ELETRICA_OPTIONS },
  FUNILARIA: { label: 'Funilaria', options: TIPO_FUNILARIA_OPTIONS },
  MECANICA: { label: 'Mecanica', options: TIPO_MECANICA_OPTIONS },
  CALDEIRARIA: { label: 'Caldeiraria', options: TIPO_CALDEIRARIA_OPTIONS },
};

export interface ApontamentoListItem {
  CODIGO: number;
  CODVEICULO: number | null;
  CODUSU: number | null;
  KM: number | null;
  HORIMETRO: number | null;
  DTINCLUSAO: string | null;
  DTPROGRAMACAO: string | null;
  NUOS: number | null;
  TAG: string | null;
  STATUSOS: StatusOS | null;
  PLACA: string | null;
  MARCAMODELO: string | null;
  TIPOEQPTO: string | null;
  FABRICANTE: string | null;
  NOMEUSU: string | null;
  CODPARCUSU: number | null;
  BORRCHARIA: string | null;
  ELETRICA: string | null;
  FUNILARIA: string | null;
  MECANICA: string | null;
  CALDEIRARIA: string | null;
  OBS: string | null;
  OSEXTERNA: string | null;
  OPEXTERNO: string | null;
  totalServicos: number;
  STATUSGERAL: string | null;
}

export interface ApontamentoFormData {
  codveiculo: number | null;
  km: number | null;
  horimetro: number | null;
  tag: string;
  obs: string;
  borrcharia: string;
  eletrica: string;
  funilaria: string;
  mecanica: string;
  caldeiraria: string;
  osExterna: string;
  opExterno: string;
  dtProgramacao: string;
  statusOs: string;
}

export interface ServicoApontamento {
  CODIGO: number;
  SEQ: number;
  DESCRITIVO: string | null;
  CODPROD: number | null;
  DESCRPROD: string | null;
  QTD: number | null;
  GERAOS: string | null;
  NUOS: number | null;
  HR: number | null;
  KM: number | null;
  DTPROGRAMACAO: string | null;
  CODGRUPOPROD: number | null;
  DESCRGRUPOPROD: string | null;
  STATUSOS: string | null;
}

export interface ServicoFormData {
  descritivo: string;
  codprod: number | null;
  qtd: number | null;
  geraOs: boolean;
  hr: number | null;
  km: number | null;
  dtProgramacao: string;
}

export interface ApontamentoListParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
  statusOs?: string;
  codveiculo?: number;
  dtInicio?: string;
  dtFim?: string;
  search?: string;
}

export interface ApontamentoListResponse {
  data: ApontamentoListItem[];
  meta: {
    page: number;
    limit: number;
    totalRegistros: number;
  };
}
