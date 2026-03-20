/**
 * DTOs para o modulo de Cache de Permissoes.
 *
 * @module M6 - Cache de Permissoes
 */

import { IsNumber, IsString, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Enums
export enum TipoInvalidacaoDto {
  USUARIO = 'usuario',
  TELA = 'tela',
  GRUPO = 'grupo',
  EMPRESA = 'empresa',
  GLOBAL = 'global',
}

// Request DTOs

export class InvalidarCacheUsuarioDto {
  @ApiProperty({ description: 'Codigo do usuario', example: 123 })
  @IsNumber()
  codUsuario: number;

  @ApiPropertyOptional({ description: 'Motivo da invalidacao' })
  @IsOptional()
  @IsString()
  motivo?: string;
}

export class InvalidarCacheTelaDto {
  @ApiProperty({ description: 'Codigo da tela', example: 456 })
  @IsNumber()
  codTela: number;

  @ApiPropertyOptional({ description: 'Motivo da invalidacao' })
  @IsOptional()
  @IsString()
  motivo?: string;
}

export class InvalidarCacheGrupoDto {
  @ApiProperty({ description: 'Codigo do grupo', example: 10 })
  @IsNumber()
  codGrupo: number;

  @ApiPropertyOptional({ description: 'Motivo da invalidacao' })
  @IsOptional()
  @IsString()
  motivo?: string;
}

export class InvalidarCacheGlobalDto {
  @ApiProperty({ description: 'Motivo da invalidacao global' })
  @IsString()
  motivo: string;

  @ApiPropertyOptional({ description: 'Confirmacao de seguranca', example: true })
  @IsBoolean()
  confirmar: boolean;
}

export class AtualizarConfigLimpezaDto {
  @ApiPropertyOptional({ description: 'Intervalo em minutos', example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1440)
  intervaloMinutos?: number;

  @ApiPropertyOptional({ description: 'Habilitar limpeza automatica' })
  @IsOptional()
  @IsBoolean()
  habilitado?: boolean;

  @ApiPropertyOptional({ description: 'Limite de ocupacao em porcentagem', example: 85 })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(100)
  limiteOcupacaoPercent?: number;
}

// Response DTOs

export class MetricasCacheRespostaDto {
  @ApiProperty()
  providerAtivo: string;

  @ApiProperty()
  metricas: {
    hits: number;
    misses: number;
    evictions: number;
    totalRequisicoes: number;
    taxaHit: string;
    taxaMiss: string;
    tamanhoAtual: number;
    tamanhoMaximo: number;
    percentualOcupacao: string;
    tempoAtivo: string;
  };

  @ApiProperty()
  distribuicao: {
    permissoes: number;
    contextos: number;
    parametros: number;
    controles: number;
  };

  @ApiProperty()
  ultimaAtualizacao: string;
}

export class ResultadoInvalidacaoRespostaDto {
  @ApiProperty({ enum: TipoInvalidacaoDto })
  tipo: string;

  @ApiProperty()
  entradasRemovidas: number;

  @ApiProperty()
  duracaoMs: number;

  @ApiProperty()
  sucesso: boolean;

  @ApiPropertyOptional()
  erro?: string;
}

export class SaudeCacheRespostaDto {
  @ApiProperty({ enum: ['saudavel', 'atencao', 'critico'] })
  status: string;

  @ApiProperty({ type: [String] })
  problemas: string[];

  @ApiProperty({ type: [String] })
  recomendacoes: string[];
}

export class TendenciasCacheRespostaDto {
  @ApiProperty({ enum: ['crescendo', 'estavel', 'decrescendo'] })
  tendenciaHitRate: string;

  @ApiProperty()
  mediaUltimaHora: number;

  @ApiProperty()
  mediaUltimas24h: number;

  @ApiProperty()
  variacaoPercentual: number;
}

export class ConfiguracaoLimpezaRespostaDto {
  @ApiProperty()
  intervaloMinutos: number;

  @ApiProperty()
  habilitado: boolean;

  @ApiProperty()
  limiteOcupacaoPercent: number;

  @ApiProperty()
  limiteIdadeHoras: number;
}

export class ResultadoLimpezaRespostaDto {
  @ApiProperty()
  executadoEm: Date;

  @ApiProperty()
  entradasAntes: number;

  @ApiProperty()
  entradasDepois: number;

  @ApiProperty()
  entradasRemovidas: number;

  @ApiProperty()
  duracaoMs: number;

  @ApiProperty({ enum: ['agendado', 'limite_ocupacao', 'manual'] })
  motivo: string;
}

export class EstatisticasMonitoramentoRespostaDto {
  @ApiProperty()
  totalEventos: number;

  @ApiProperty()
  eventosUltimaHora: number;

  @ApiProperty()
  ultimaVerificacao: Date;

  @ApiProperty()
  estaAtivo: boolean;

  @ApiProperty({ type: [String] })
  tabelasMonitoradas: string[];
}
