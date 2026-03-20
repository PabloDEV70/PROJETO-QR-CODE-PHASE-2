import { HstVeiRaw } from './hstvei-raw';
import { PainelPessoa } from './hstvei-painel';

export interface HstVeiEnriched extends HstVeiRaw {
  // Veículo (TGFVEI)
  placa: string | null;
  marcaModelo: string | null;
  veiculoTag: string | null;
  veiculoTipo: string | null;
  veiculoCapacidade: string | null;
  veiculoFabricante: string | null;
  veiculoAtivo: string | null;

  // Situação (AD_ADHSTVEISIT)
  situacaoDescricao: string;
  situacaoCoddep: number;
  departamentoNome: string | null;

  // Prioridade (AD_ADHSTVEIPRI)
  prioridadeSigla: string | null;
  prioridadeDescricao: string | null;

  // Parceiro (TGFPAR)
  nomeParc: string | null;

  // Usuários (TSIUSU)
  nomeUsuInc: string | null;
  nomeUsuAlt: string | null;

  // OS Manutenção (TCFOSCAB)
  osStatus: string | null;
  osStatusGig: string | null;
  osTipo: string | null;
  osManutencao: string | null;
  osKm: number | null;
  osHorimetro: number | null;
  osLocalManutencao: string | null;
  osBloqueios: string | null;
  osDtAbertura: string | null;

  // OS Comercial (TCSOSE)
  mosCliente: string | null;
  mosSituacao: string | null;
  mosContrato: number | null;
  mosAtendente: string | null;
  mosDtPrevista: string | null;

  // Pessoas resolvidas (enrichment via TSIUSU)
  operadores?: PainelPessoa[];
  mecanicos?: PainelPessoa[];
  criadoPor?: PainelPessoa;
}
